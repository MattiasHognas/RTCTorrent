using System;
using System.Collections.Concurrent;
using System.Diagnostics;
using System.Linq;
using System.Threading.Tasks;
using Microsoft.AspNet.SignalR;
using Microsoft.AspNet.SignalR.Hubs;
using RTCTorrent.UI.Models;

namespace RTCTorrent.UI.Hubs
{
    [HubName("singleHub")]
    public class SingleHub : Hub
    {
        #region Singleton

        private static readonly Lazy<SingleHub> instance = new Lazy<SingleHub>(() => new SingleHub());

        public static SingleHub Instance
        {
            get
            {
                return instance.Value;
            }
        }

        #endregion

        #region Fields and Properties

        private static readonly ConcurrentDictionary<Guid, string> sessionToConnection = new ConcurrentDictionary<Guid, string>();
        private static readonly ConcurrentDictionary<string, Guid> connectionToSession = new ConcurrentDictionary<string, Guid>();
        private static readonly ConcurrentDictionary<Guid, SessionModel> sessions = new ConcurrentDictionary<Guid, SessionModel>();

        #endregion

        #region Room Methods

        /// <summary>
        /// Creates a session on the Room object and joins the user to that session.
        /// </summary>
        public void JoinRoom(SessionModel session)
        {
            // Store everything in the cache
            lock (sessionToConnection)
            {
                sessionToConnection[session.SessionId] = Context.ConnectionId;
            }
            lock (connectionToSession)
            {
                connectionToSession[Context.ConnectionId] = session.SessionId;
            }
            lock (sessions)
            {
                sessions[session.SessionId] = session;
            }

            NotifyClients(session.SessionId, cs => cs.onJoinedRoom(session));
            //return Sessions.Values.ToList();
        }

        /// <summary>
        /// Unregisters a user from the room in question.  
        /// </summary>
        /// <remarks>No exception is thrown if the room or session does not exist.</remarks>
        /// <param name="sessionId">The sessionId to be removed from the room.</param>
        public void LeaveRoom(Guid sessionId)
        {
            NotifyClients(sessionId, cs => cs.onLeftRoom(new SessionModel { SessionId = sessionId }));

            // Remove the communication session from the cache.
            lock (sessionToConnection)
            {
                string connectionId;
                if (sessionToConnection.TryGetValue(sessionId, out connectionId))
                {
                    string oldconnectionId;
                    sessionToConnection.TryRemove(sessionId, out oldconnectionId);
                    lock (connectionToSession)
                    {
                        Guid oldSessionId;
                        connectionToSession.TryRemove(connectionId, out oldSessionId);
                    }
                }
            }
            lock (sessions)
            {
                SessionModel oldSessionModel;
                sessions.TryRemove(sessionId, out oldSessionModel);
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
                Guid sessionId;
                if (connectionToSession.TryGetValue(Context.ConnectionId, out sessionId))
                {
                    LeaveRoom(sessionId);
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
            SendMessageToSession(signalMessage.ToSessionId, cs => cs.onJsepOffer(signalMessage));
        }

        /// <summary>
        /// Sends a JSEP answer from the responder to the initiator
        /// </summary>
        /// <param name="signalMessage">The signal message</param>
        public void JsepAnswer(SignalStateModel signalMessage)
        {
            Debug.WriteLine("Client making JSEP answer");
            SendMessageToSession(signalMessage.ToSessionId, cs => cs.onJsepAnswer(signalMessage));
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
            SendMessageToSession(candidateMessage.ToSessionId, cs => cs.onJsepCandidate(candidateMessage));
        }

        #endregion

        #region Utility methods

        /// <summary>
        /// Notify sessions about something
        /// </summary>
        /// <param name="sessionId">Sender session Id</param>
        /// <param name="action">Delegate of action</param>
        private static void NotifyClients(Guid sessionId, Action<dynamic> action)
        {
            try
            {
                Debug.WriteLine("Received request to notify {0} participants about an update to session {1}.", sessions.Count(), sessionId);
                var otherSessions = sessions.Values.Where(s => s.SessionId != sessionId).ToList();
                foreach (var session in otherSessions)
                {
                    SendMessageToSession(session.SessionId, action);
                }
            }
            catch (Exception ex)
            {
                Debug.WriteLine(ex);
                throw;
            }
        }

        private static void SendMessageToSession(Guid sessionId, Action<dynamic> action)
        {
            string connectionId;
            if (sessionToConnection.TryGetValue(sessionId, out connectionId))
            {
                try
                {
                    Debug.WriteLine("Sending message to client session {0} associated with comm session {1}", sessionId, connectionId);
                    var context = GlobalHost.ConnectionManager.GetHubContext<RoomHub>();
                    action(context.Clients.Client(connectionId));
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