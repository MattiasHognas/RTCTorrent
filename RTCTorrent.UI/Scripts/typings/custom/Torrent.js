var RtcTorrent;
(function (RtcTorrent) {
    'use strict';
    var Torrent = (function () {
        function Torrent(content, client) {
            this.client = client;
            var parsedContent = Bencode.parse(content);
            this.name = Bencode.torrentInfo(parsedContent, 'name');
            this.fileNames = Bencode.torrentInfo(parsedContent, 'file-names');
            this.announceList = Bencode.torrentInfo(parsedContent, 'announce-list');
            console.log(this.name, this.fileNames, this.announceList);
            this.peers = ko.observableArray([]);
            this.id = ko.observable(name);
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
    })();
    RtcTorrent.Torrent = Torrent;    
})(RtcTorrent || (RtcTorrent = {}));
