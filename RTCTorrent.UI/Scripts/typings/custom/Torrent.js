var __extends = this.__extends || function (d, b) {
    function __() { this.constructor = d; }
    __.prototype = b.prototype;
    d.prototype = new __();
};
var RtcTorrent;
(function (RtcTorrent) {
    'use strict';
    var Torrent = (function (_super) {
        __extends(Torrent, _super);
        function Torrent(id, client) {
                _super.call(this);
            this.client = client;
            this.peers = ko.observableArray([]);
            this.id = ko.observable(id);
        }
        Torrent.prototype.createPeer = function (id) {
            var peer = new RtcTorrent.Peer(id, this);
            this.peers.push(peer);
        };
        Torrent.prototype.findPeer = function (id) {
            var peer = ko.utils.arrayFirst(this.peers(), function (peer) {
                return id === peer.id();
            });
            return peer;
        };
        Torrent.prototype.removePeer = function (id) {
            var peer = ko.utils.arrayFirst(this.peers(), function (peer) {
                return id === peer.id();
            });
            if(peer) {
                this.peers.remove(peer);
            }
        };
        return Torrent;
    })(RtcTorrent.FileContent);
    RtcTorrent.Torrent = Torrent;    
})(RtcTorrent || (RtcTorrent = {}));
