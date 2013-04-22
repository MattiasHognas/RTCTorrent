using System;
using System.Collections.Concurrent;
using System.Collections.Generic;
using System.Diagnostics;
using System.Linq;
using System.Threading.Tasks;
using Microsoft.AspNet.SignalR;
using Microsoft.AspNet.SignalR.Hubs;
using RTCTorrent.UI.Models;

namespace RTCTorrent.UI.Hubs
{
    [HubName("torrentHub")]
    public class TorrentHub : Hub
    {
        #region Singleton

        private static readonly Lazy<TorrentHub> instance = new Lazy<TorrentHub>(() => new TorrentHub());

        public static TorrentHub Instance
        {
            get
            {
                return instance.Value;
            }
        }

        #endregion

        #region Fields and Properties

        public readonly ConcurrentDictionary<Guid, Tuple<string, SessionModel>> SessionToConnection = new ConcurrentDictionary<Guid, Tuple<string, SessionModel>>();
        // item1 = leechers
        // item2 = seeders
        public readonly ConcurrentDictionary<string,  Tuple<List<Guid>, List<Guid>>> Torrents = new ConcurrentDictionary<string, Tuple<List<Guid>, List<Guid>>>();

        #endregion

        #region Torrent Methods

        /// <summary>
        /// Creates a session on the Torrent object and joins the user to that session.
        /// </summary>
        public void JoinTorrent(SessionModel session)
        {
            // Store everything in the cache
            lock (SessionToConnection)
            {
                SessionToConnection[session.SessionId] = Tuple.Create(Context.ConnectionId, session);
            }
            lock (Torrents)
            {
                if (!Torrents.ContainsKey(session.TorrentId))
                    Torrents[session.TorrentId] = Tuple.Create(new List<Guid>(), new List<Guid>());
                Torrents[session.TorrentId].Item1.Add(session.SessionId);
            }

            NotifyTorrent(session.SessionId, (cs, torrentId) => cs.onJoinedTorrent(session), session.TorrentId);
        }

        /// <summary>
        /// Unregisters a user from the torrent in question.  
        /// </summary>
        /// <remarks>No exception is thrown if the torrent or session does not exist.</remarks>
        /// <param name="sessionId">The sessionId to be removed from the torrent.</param>
        public void LeaveTorrent(Guid sessionId)
        {
            NotifyTorrent(sessionId, (cs, torrentId) => cs.onLeftTorrent(new SessionModel { SessionId = sessionId, TorrentId = torrentId }));

            // Remove the communication session from the cache.
            lock (SessionToConnection)
            {
                Tuple<string, SessionModel> connection;
                if (SessionToConnection.TryGetValue(sessionId, out connection))
                {
                    Tuple<string, SessionModel> oldconnection;
                    SessionToConnection.TryRemove(sessionId, out oldconnection);
                }
            }
            lock (Torrents)
            {
                foreach (var torrent in Torrents)
                {
                    Tuple<List<Guid>, List<Guid>> oldTorrent;
                    torrent.Value.Item1.Remove(sessionId);
                    torrent.Value.Item2.Remove(sessionId);
                    if (!torrent.Value.Item1.Any() && !torrent.Value.Item2.Any())
                        Torrents.TryRemove(torrent.Key, out oldTorrent);
                }
            }
        }

        #endregion

        #region Connection events

        public override Task OnConnected()
        {
            Debug.WriteLine("Connecting: " + Context.ConnectionId);
            return base.OnConnected();
        }

        public override Task OnDisconnected()
        {
            try
            {
                var sessionId = SessionToConnection.FirstOrDefault(kvp => kvp.Value.Item1 == Context.ConnectionId).Key;
                if (sessionId != default(Guid))
                {
                    LeaveTorrent(sessionId);
                }
            }
            catch (Exception ex)
            {
                Debug.WriteLine("Error processing OnDisconnected event: " + ex);
            }
            return base.OnDisconnected();
        }

        #endregion

        #region JSEP Signaling Methods

        /// <summary>
        /// Sends a JSEP offer from the initiator to the responder
        /// </summary>
        /// <param name="signalMessage">The signal message</param>
        public void JsepOffer(SignalStateModel signalMessage)
        {
            Debug.WriteLine("Client making JSEP offer");
            SendMessage(signalMessage.ToSessionId, (cs, torrentId) => cs.onJsepOffer(signalMessage));
        }

        /// <summary>
        /// Sends a JSEP answer from the responder to the initiator
        /// </summary>
        /// <param name="signalMessage">The signal message</param>
        public void JsepAnswer(SignalStateModel signalMessage)
        {
            Debug.WriteLine("Client making JSEP answer");
            SendMessage(signalMessage.ToSessionId, (cs, torrentId) => cs.onJsepAnswer(signalMessage));
        }

        /// <summary>
        /// Sends a JSEP ICE candidate one at a time as they are discovered.
        /// Note: The ICE candidates are sent from both the initiating and the responding machines,
        /// with both trying to connect over the various possibilities,
        /// until one is successful and a connection is established.
        /// </summary>
        /// <param name="candidateMessage">The candidate message</param>
        public void JsepCandidate(SignalStateModel candidateMessage)
        {
            Debug.WriteLine("Client proposing JSEP ICE candidate");
            SendMessage(candidateMessage.ToSessionId, (cs, torrentId) => cs.onJsepCandidate(candidateMessage));
        }

        #endregion

        #region Utility methods

        private void NotifyTorrent(Guid sessionId, Action<dynamic, string> action, string torrentId = default(string))
        {
            try
            {
                if (torrentId == default(string))
                {
                    foreach (var torrent in Torrents)
                    {
                        var leechers = torrent.Value.Item1.Where(e => e != sessionId);
                        var seeders = torrent.Value.Item2.Where(e => e != sessionId);
                        var allUsers = leechers.Concat(seeders);
                        NotifyClients(sessionId, allUsers.ToList(), torrent.Key, action);
                    }
                }
                else
                {
                    var leechers = Torrents[torrentId].Item1.Where(e => e != sessionId);
                    var seeders = Torrents[torrentId].Item2.Where(e => e != sessionId);
                    var allUsers = leechers.Concat(seeders);
                    NotifyClients(sessionId, allUsers.ToList(), torrentId, action);
                }
            }
            catch (Exception ex)
            {
                Debug.WriteLine(ex);
                throw;
            }
        }

        /// <summary>
        /// Notify sessions about something
        /// </summary>
        /// <param name="sessionId">Sender session Id</param>
        /// <param name="sessionsIds">Reciever session Ids</param>
        /// <param name="action">Delegate of action</param>
        /// <param name="torrentId">Reciever torrent Id</param>
        private void NotifyClients(Guid sessionId, List<Guid> sessionsIds, string torrentId, Action<dynamic, string> action)
        {
            try
            {
                Debug.WriteLine("Received request to notify {0} participants about an update to session {1}.", sessionsIds.Count(), sessionId);
                foreach (var session in sessionsIds)
                {
                    SendMessage(session, action, torrentId);
                }
            }
            catch (Exception ex)
            {
                Debug.WriteLine(ex);
                throw;
            }
        }

        private void SendMessage(Guid sessionId, Action<dynamic, string> action, string torrentId = default (string))
        {
            SendMessageToSession(sessionId, action, torrentId);
        }

        private void SendMessageToSession(Guid sessionId, Action<dynamic, string> action, string torrentId = default (string))
        {
            var context = GlobalHost.ConnectionManager.GetHubContext<TorrentHub>();
            Tuple<string, SessionModel> connection;
            if (SessionToConnection.TryGetValue(sessionId, out connection))
            {
                try
                {
                    Debug.WriteLine("Sending message to client session {0} associated with comm session {1}", sessionId, connection.Item1);

                    action(context.Clients.Client(connection.Item1), torrentId);
                }
                catch (Exception ex)
                {
                    Debug.WriteLine(ex);
                }
            }
            else
            {
                Debug.WriteLine("Communication session {0} for notify client was not found", sessionId);
            }
        }

        #endregion
    }
}