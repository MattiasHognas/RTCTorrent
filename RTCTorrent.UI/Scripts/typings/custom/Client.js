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
            var _this = this;
            this.sessionReady = ko.observable(false);
            this.torrents = ko.observableArray([]);
            this.trackerFiles = ko.observableArray([]);
            this.configuration = new RtcTorrent.Configuration();
            this.loadTorrent = function (trackerTorrent) {
                console.log('Loading torrent', trackerTorrent);
                if(_this.sessionReady()) {
                    var torrent = new RtcTorrent.Torrent(_this, trackerTorrent);
                    _this.torrents.push(torrent);
                    _this.socket.server.joinTorrent({
                        SessionId: _this.id(),
                        TorrentId: torrent.trackerTorrent.id()
                    });
                }
            };
            this.removeTorrent = function (trackerTorrent) {
                console.log('Removing torrent', trackerTorrent);
                var torrent = _this.findTorrent(trackerTorrent.id);
                if(torrent) {
                    _this.socket.server.leaveTorrent({
                        SessionId: _this.id(),
                        TorrentId: torrent.trackerTorrent.id()
                    });
                    _this.torrents.remove(torrent);
                }
            };
            if(!this.configuration.webRTCSupport) {
                console.error('Your browser doesn\'t seem to support WebRTC');
            } else {
                var _this = this;
                this.socket = $.connection.torrentHub;
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
                    var peer = _this.findOrCreatePeer(message.FromSessionId, message.TorrentId);
                    peer.onJsepOffer(message);
                };
                this.socket.client.onJsepAnswer = function (message) {
                    console.log('got JSEP answer', message);
                    var peer = _this.findOrCreatePeer(message.FromSessionId, message.TorrentId);
                    peer.onJsepAnswer(message);
                };
                this.socket.client.onJsepCandidate = function (message) {
                    console.log('got JSEP candidate', message);
                    var peer = _this.findOrCreatePeer(message.FromSessionId, message.TorrentId);
                    peer.onJsepCandidate(message);
                };
                this.socket.client.onJoinedTorrent = function (message) {
                    console.log('another user joined', message);
                    var peer = _this.findOrCreatePeer(message.SessionId, message.TorrentId);
                    peer.start();
                };
                this.socket.client.onLeftTorrent = function (message) {
                    console.log('another user left', message);
                    _this.removePeer(message.SessionId, message.TorrentId);
                };
            }
        }
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
                return torrentId === torrent.trackerTorrent.id();
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
                return torrentId === torrent.trackerTorrent.id();
            });
            return match;
        };
        return Client;
    })(RtcTorrent.User);
    RtcTorrent.Client = Client;    
})(RtcTorrent || (RtcTorrent = {}));
