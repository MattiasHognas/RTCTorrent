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
    [HubName("roomHub")]
    public class RoomHub : Hub
    {
        #region Singleton

        private static readonly Lazy<RoomHub> instance = new Lazy<RoomHub>(() => new RoomHub());

        public static RoomHub Instance
        {
            get
            {
                return instance.Value;
            }
        }

        #endregion

        #region Fields and Properties

        private static readonly ConcurrentDictionary<Guid, Tuple<string, SessionModel>> sessionToConnection = new ConcurrentDictionary<Guid, Tuple<string, SessionModel>>();
        private static readonly ConcurrentDictionary<string, List<Guid>> rooms = new ConcurrentDictionary<string, List<Guid>>();

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
                sessionToConnection[session.SessionId] = Tuple.Create(Context.ConnectionId, session);
            }
            lock (rooms)
            {
                if (!rooms.ContainsKey(session.RoomId))
                    rooms[session.RoomId] = new List<Guid>();
                rooms[session.RoomId].Add(session.SessionId);
            }

            NotifyRoom(session.SessionId, (cs, roomId) => cs.onJoinedRoom(session), session.RoomId);
        }

        /// <summary>
        /// Unregisters a user from the room in question.  
        /// </summary>
        /// <remarks>No exception is thrown if the room or session does not exist.</remarks>
        /// <param name="sessionId">The sessionId to be removed from the room.</param>
        public void LeaveRoom(Guid sessionId)
        {
            NotifyRoom(sessionId, (cs, roomId) => cs.onLeftRoom(new SessionModel { SessionId = sessionId, RoomId = roomId }));

            // Remove the communication session from the cache.
            lock (sessionToConnection)
            {
                Tuple<string, SessionModel> connection;
                if (sessionToConnection.TryGetValue(sessionId, out connection))
                {
                    Tuple<string, SessionModel> oldconnection;
                    sessionToConnection.TryRemove(sessionId, out oldconnection);
                }
            }
            lock (rooms)
            {
                foreach (var room in rooms)
                {
                    List<Guid> oldRoom;
                    room.Value.Remove(sessionId);
                    if (!room.Value.Any())
                        rooms.TryRemove(room.Key, out oldRoom);
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
                var sessionId = sessionToConnection.FirstOrDefault(kvp => kvp.Value.Item1 == Context.ConnectionId).Key;
                if (sessionId != default(Guid))
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
            SendMessage(signalMessage.ToSessionId, (cs, roomId) => cs.onJsepOffer(signalMessage));
        }

        /// <summary>
        /// Sends a JSEP answer from the responder to the initiator
        /// </summary>
        /// <param name="signalMessage">The signal message</param>
        public void JsepAnswer(SignalStateModel signalMessage)
        {
            Debug.WriteLine("Client making JSEP answer");
            SendMessage(signalMessage.ToSessionId, (cs, roomId) => cs.onJsepAnswer(signalMessage));
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
            SendMessage(candidateMessage.ToSessionId, (cs, roomId) => cs.onJsepCandidate(candidateMessage));
        }

        #endregion

        #region Utility methods

        private static void NotifyRoom(Guid sessionId, Action<dynamic, string> action, string roomId = default(string))
        {
            try
            {
                if (roomId == default(string))
                {
                    foreach (var room in rooms)
                    {
                        NotifyClients(sessionId, room.Value.Where(e => e != sessionId).ToList(), room.Key, action);
                    }
                }
                else
                {
                    NotifyClients(sessionId, rooms[roomId].Where(e => e != sessionId).ToList(), roomId, action);
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
        /// <param name="roomId">Reciever room Id</param>
        private static void NotifyClients(Guid sessionId, List<Guid> sessionsIds, string roomId, Action<dynamic, string> action)
        {
            try
            {
                Debug.WriteLine("Received request to notify {0} participants about an update to session {1}.", sessionsIds.Count(), sessionId);
                foreach (var session in sessionsIds)
                {
                    SendMessage(session, action, roomId);
                }
            }
            catch (Exception ex)
            {
                Debug.WriteLine(ex);
                throw;
            }
        }

        private static void SendMessage(Guid sessionId, Action<dynamic, string> action, string roomId = default (string))
        {
            SendMessageToSession(sessionId, action, roomId);
        }

        private static void SendMessageToSession(Guid sessionId, Action<dynamic, string> action, string roomId = default (string))
        {
            var context = GlobalHost.ConnectionManager.GetHubContext<RoomHub>();
            Tuple<string, SessionModel> connection;
            if (sessionToConnection.TryGetValue(sessionId, out connection))
            {
                try
                {
                    Debug.WriteLine("Sending message to client session {0} associated with comm session {1}", sessionId, connection.Item1);

                    action(context.Clients.Client(connection.Item1), roomId);
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