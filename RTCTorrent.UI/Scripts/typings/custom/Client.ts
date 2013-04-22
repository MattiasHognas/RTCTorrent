/// <reference path='../jquery/jquery.d.ts' />
/// <reference path='../signalr/signalr.d.ts' />
/// <reference path='../knockout/knockout.d.ts' />
/// <reference path='Configuration.ts' />
/// <reference path="User.ts" />
/// <reference path="Torrent.ts" />
/// <reference path="FileContent.ts" />

module RtcTorrent {
    'use strict';
    export class Client implements IClient extends User {
        public sessionReady: KnockoutObservableBool;
        public torrents: KnockoutObservableArray;
        public trackerFiles: KnockoutObservableArray;
        public configuration: IConfiguration = null;
        public socket: any = null;
        constructor() {
            super();
            this.sessionReady = ko.observable(false);
            this.torrents = ko.observableArray([]);
            this.trackerFiles = ko.observableArray([]);
            this.configuration = new Configuration();
            if (!this.configuration.webRTCSupport) {
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
        loadTorrent(id: string) {
            console.log('Loading torrent');
            if (this.sessionReady) {
                var torrent: ITorrent = new Torrent(id, this);
                this.torrents.push(torrent);
                this.socket.server.joinTorrent({ SessionId: this.id(), TorrentId: torrent.id() });
            }
        }
        removeTorrent(id: string) {
            console.log('Removing torrent');
            var torrent: ITorrent = this.findTorrent(id);
            if (torrent) {
                this.socket.server.leaveTorrent({ SessionId: this.id(), TorrentId: torrent.id() });
                this.torrents.remove(torrent);
            }
        }
        findOrCreatePeer(id: string, torrentId: string) {
            var torrent: ITorrent = this.findTorrent(torrentId);
            if (torrent) {
                var peer: IPeer = torrent.findPeer(id);
                if (!peer) {
                    torrent.createPeer(id);
                }
                return peer;
            }
            return null;
        }
        removePeer(id: string, torrentId: string) {
            var torrent: ITorrent = ko.utils.arrayFirst(this.torrents(), function (torrent: ITorrent) {
                return torrentId === torrent.id();
            });
            if (torrent) {
                var peer: IPeer = torrent.findPeer(id);
                if (peer) {
                    torrent.peers.remove(peer);
                }
            }
        }
        findTorrent(torrentId: string) {
            var match: ITorrent = ko.utils.arrayFirst(this.torrents(), function (torrent: ITorrent) {
                return torrentId === torrent.id();
            });
            return match;
        }
    }
}