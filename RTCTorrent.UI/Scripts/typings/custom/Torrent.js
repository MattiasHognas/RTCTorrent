var observableArray;
var RtcTorrent;
(function (RtcTorrent) {
    'use strict';
    var TrackerTorrent = (function () {
        function TrackerTorrent(id, name, seeders, leechers, size, files) {
            this.id = ko.observable();
            this.name = ko.observable();
            this.size = ko.observable();
            this.seeders = ko.observable();
            this.leechers = ko.observable();
            this.files = ko.observableArray();
            this.id(id);
            this.name(name);
            this.seeders(seeders);
            this.leechers(leechers);
            this.size(size);
            for(var i = 0; i < files.length; i++) {
                this.files.push(new TrackerTorrentFile(files[i].fullPath, files[i].size));
            }
        }
        return TrackerTorrent;
    })();
    RtcTorrent.TrackerTorrent = TrackerTorrent;    
    var TrackerTorrentFile = (function () {
        function TrackerTorrentFile(fullPath, size) {
            this.fullPath = ko.observable();
            this.size = ko.observable();
            this.fullPath(fullPath);
            this.size(size);
        }
        return TrackerTorrentFile;
    })();
    RtcTorrent.TrackerTorrentFile = TrackerTorrentFile;    
    var Torrent = (function () {
        function Torrent(client, trackerTorrent) {
            this.fs = null;
            this.client = client;
            this.trackerTorrent = trackerTorrent;
            this.peers = ko.observableArray([]);
            this.files = ko.observableArray([]);
            this.readyToServe = ko.observable(false);
            this.loadFiles(trackerTorrent);
        }
        Torrent.prototype.quotaError = function (e) {
            var msg = '';
            switch(e.code) {
                case 10:
                    msg = 'INVALID_STATE_ERR';
                    break;
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
            console.log('Error: ' + msg, e);
        };
        Torrent.prototype.loadFiles = function (trackerTorrent) {
            var _this = this;
            _this.client.configuration.requestQuota(window.PERSISTENT, trackerTorrent.size(), function (availableBytes) {
                console.log("Quota is available. Quota size: " + availableBytes);
                _this.client.configuration.requestFileSystem(window.PERSISTENT, _this.trackerTorrent.size(), function (fs) {
                    _this.fs = fs;
                    _this.fs.root.getDirectory(trackerTorrent.id(), {
                        create: true
                    }, function (dirEntry) {
                        var reader = dirEntry.createReader();
                        for(var i = 0; i < trackerTorrent.files().length; i++) {
                            _this.files.push(new RtcTorrent.FileContent(_this, reader, trackerTorrent.files()[i].fullPath(), trackerTorrent.files()[i].size()));
                        }
                    }, function (e) {
                        console.log('getDictionary error', e);
                    });
                }, _this.quotaError);
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
