var RtcTorrent;
(function (RtcTorrent) {
    'use strict';
    var Torrent = (function () {
        function Torrent(id, name, size, client) {
            this.fs = null;
            this.client = client;
            this.id = ko.observable(id);
            this.name = ko.observable(name);
            this.size = ko.observable(size);
            this.peers = ko.observableArray([]);
            this.files = ko.observableArray([]);
            this.readyToServe = ko.observable(false);
            this.loadFiles();
        }
        Torrent.prototype.quotaError = function (e) {
            var msg = '';
            switch(e.code) {
                case FileError.QUOTA_EXCEEDED_ERR:
                    msg = 'QUOTA_EXCEEDED_ERR';
                    break;
                case FileError.NOT_FOUND_ERR:
                    msg = 'NOT_FOUND_ERR';
                    break;
                case FileError.SECURITY_ERR:
                    msg = 'SECURITY_ERR';
                    break;
                case FileError.INVALID_MODIFICATION_ERR:
                    msg = 'INVALID_MODIFICATION_ERR';
                    break;
                case FileError.INVALID_STATE_ERR:
                    msg = 'INVALID_STATE_ERR';
                    break;
                default:
                    msg = 'Unknown Error';
                    break;
            }
            ;
            console.log('Error: ' + msg);
        };
        Torrent.prototype.loadFiles = function () {
            var _this = this;
            _this.client.configuration.requestFileSystem(window.PERSISTENT, _this.size, function (fs) {
                _this.fs = fs;
                _this.fs.root.getDirectory(_this.id(), {
                }, function (dirEntry) {
                    var reader = dirEntry.createReader();
                    for(var file in _this.files()) {
                        _this.files.push(new RtcTorrent.FileContent(_this, reader, file));
                    }
                }, function (e) {
                    console.log('getDictionary error', e);
                });
            }, _this.quotaError);
        };
        Torrent.prototype.sendMessage = function (message, id) {
            this.findPeer(id).channel.send(message);
        };
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
