/// <reference path="../jquery/jquery.d.ts" />
/// <reference path="../knockout/knockout.d.ts" />
/// <reference path="Interfaces.d.ts" />
/// <reference path="Peer.ts" />
/// <reference path="FileContent.ts" />

var observableArray: any;

module RtcTorrent {
    'use strict';
    export class TrackerTorrent implements ITrackerTorrent {
        public id: KnockoutObservableString = ko.observable();
        public name: KnockoutObservableString = ko.observable();
        public size: KnockoutObservableNumber = ko.observable();
        public seeders: KnockoutObservableNumber = ko.observable();
        public leechers: KnockoutObservableNumber = ko.observable();
        public files: KnockoutObservableArray = ko.observableArray();
        constructor(id: string,
                    name: string,
                    seeders: number,
                    leechers: number,
                    size: number,
                    files: any) {
            this.id(id);
            this.name(name);
            this.seeders(seeders);
            this.leechers(leechers);
            this.size(size);
            for (var i = 0; i < files.length; i++)
                this.files.push(new TrackerTorrentFile(files[i].fullPath, files[i].size));
        }
    }
    export class TrackerTorrentFile implements ITrackerTorrentFile {
        public fullPath: KnockoutObservableString = ko.observable();
        public size: KnockoutObservableNumber = ko.observable();
        constructor(fullPath: string, size: number) {
            this.fullPath(fullPath);
            this.size(size);
        }
    }
    export class Torrent implements ITorrent {
        public client: IClient;
        public trackerTorrent: ITrackerTorrent;
        public peers: KnockoutObservableArray;
        public files: KnockoutObservableArray;
        public readyToServe: KnockoutObservableBool;
        public fs: any = null;
        constructor(client: IClient, trackerTorrent: ITrackerTorrent) {
            this.client = client;
            this.trackerTorrent = trackerTorrent;
            this.peers = ko.observableArray([]);
            this.files = ko.observableArray([]);
            this.readyToServe = ko.observable(false);
            this.loadFiles(trackerTorrent);
            //TODO: Report to server when seeding/leeching
        }
        private quotaError(e: any) {
            var msg = '';
            switch (e.code) {
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
            };
            console.log('Error: ' + msg, e);
        }
        private loadFiles(trackerTorrent: ITrackerTorrent) {
            var _this = this;
            _this.client.configuration.requestQuota(window.PERSISTENT, trackerTorrent.size(), function (availableBytes) {
                console.log("Quota is available. Quota size: " + availableBytes);
                _this.client.configuration.requestFileSystem(window.PERSISTENT, _this.trackerTorrent.size(), function (fs) {
                    _this.fs = fs;
                    _this.fs.root.getDirectory(trackerTorrent.id(), { create: true }, function (dirEntry) {
                        var reader = dirEntry.createReader();
                        for (var i = 0; i < trackerTorrent.files().length; i++)
                            _this.files.push(new FileContent(_this, reader, trackerTorrent.files()[i].fullPath(), trackerTorrent.files()[i].size()));
                    }, function (e) { console.log('getDictionary error', e) });
                }, _this.quotaError);
            }, _this.quotaError);
        }
        sendMessage(message: string, id: string) {
            this.findPeer(id).channel.send(message);
        }
        createPeer(id: string) {
            var peer: IPeer = new Peer(id, this);
            this.peers.push(peer);
        }
        findPeer(id: string): IPeer {
            var peer = ko.utils.arrayFirst(this.peers(), function (peer: IPeer) {
                return id === peer.id();
            });
            return peer;
        }
        removePeer(id: string) {
            var peer = ko.utils.arrayFirst(this.peers(), function (peer: IPeer) {
                return id === peer.id();
            });
            if (peer)
                this.peers.remove(peer);
        }
    }
}