var __extends = this.__extends || function (d, b) {
    function __() { this.constructor = d; }
    __.prototype = b.prototype;
    d.prototype = new __();
};
var RtcTorrent;
(function (RtcTorrent) {
    'use strict';
    var Client = (function (_super) {
        __extends(Client, _super);
        function Client() {
                _super.call(this);
            this.configuration = null;
            this.socket = null;
            this.sessionReady = ko.observable(false);
            this.torrents = ko.observableArray([]);
            this.configuration = new RtcTorrent.Configuration();
            this.init();
        }
        Client.prototype.dropTorrent = function (file) {
            var fileContent = new RtcTorrent.FileContent();
            fileContent.read(file, function (data) {
                this.loadTorrent(data);
            });
        };
        Client.prototype.loadTorrent = function (content) {
            console.log('Loading torrent');
            if(this.sessionReady) {
                var torrent = new RtcTorrent.Torrent(content, this);
                this.torrents.push(torrent);
                this.socket.server.joinRoom({
                    SessionId: this.id(),
                    RoomId: torrent.id()
                });
            }
        };
        Client.prototype.removeTorrent = function (id) {
            console.log('Removing torrent');
            var torrent = this.findTorrent(id);
            if(torrent) {
                this.socket.server.leaveRoom({
                    SessionId: this.id(),
                    RoomId: torrent.id()
                });
                this.torrents.remove(torrent);
            }
        };
        Client.prototype.init = function () {
            if(!this.configuration.webRTCSupport) {
                console.error('Your browser doesn\'t seem to support WebRTC');
            } else {
                var _this = this;
                this.socket = $.connection.roomHub;
                $.connection.hub.logging = false;
                $.connection.hub.start({
                    transport: 'auto'
                }).done(function () {
                    console.log('Connection done', $.connection.hub.id);
                    _this.id($.connection.hub.id);
                    _this.sessionReady(true);
                }).fail(function (e) {
                    var message = 'Unable to connect to SignalR Hubs: ' + e;
                    console.log(message);
                });
                this.socket.client.onJsepOffer = function (message) {
                    console.log('got JSEP offer', message);
                    var peer = _this.findOrCreatePeer(message.FromSessionId, message.RoomId);
                    peer.onJsepOffer(message);
                };
                this.socket.client.onJsepAnswer = function (message) {
                    console.log('got JSEP answer', message);
                    var peer = _this.findOrCreatePeer(message.FromSessionId, message.RoomId);
                    peer.onJsepAnswer(message);
                };
                this.socket.client.onJsepCandidate = function (message) {
                    console.log('got JSEP candidate', message);
                    var peer = _this.findOrCreatePeer(message.FromSessionId, message.RoomId);
                    peer.onJsepCandidate(message);
                };
                this.socket.client.onJoinedRoom = function (message) {
                    console.log('another user joined', message);
                    var peer = _this.findOrCreatePeer(message.SessionId, message.RoomId);
                    peer.start();
                };
                this.socket.client.onLeftRoom = function (message) {
                    console.log('another user left', message);
                    _this.removePeer(message.SessionId, message.RoomId);
                };
            }
        };
        Client.prototype.findOrCreatePeer = function (id, torrentId) {
            var torrent = this.findTorrent(torrentId);
            if(torrent) {
                var peer = torrent.findPeer(id);
                if(!peer) {
                    torrent.createPeer(id);
                }
                return peer;
            }
            return null;
        };
        Client.prototype.removePeer = function (id, torrentId) {
            var torrent = ko.utils.arrayFirst(this.torrents(), function (torrent) {
                return torrentId === torrent.id();
            });
            if(torrent) {
                var peer = torrent.findPeer(id);
                if(peer) {
                    torrent.peers.remove(peer);
                }
            }
        };
        Client.prototype.findTorrent = function (torrentId) {
            var match = ko.utils.arrayFirst(this.torrents(), function (torrent) {
                return torrentId === torrent.id();
            });
            return match;
        };
        return Client;
    })(RtcTorrent.User);
    RtcTorrent.Client = Client;    
})(RtcTorrent || (RtcTorrent = {}));
