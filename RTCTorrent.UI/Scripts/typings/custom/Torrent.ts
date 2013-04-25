/// <reference path="../jquery/jquery.d.ts" />
/// <reference path="../knockout/knockout.d.ts" />
/// <reference path="Interfaces.d.ts" />
/// <reference path="Peer.ts" />
/// <reference path="FileContent.ts" />

module RtcTorrent {
    'use strict';
    export class Torrent implements ITorrent {
        public client: IClient;
        public id: KnockoutObservableString;
        public name: KnockoutObservableString;
        public peers: KnockoutObservableArray;
        public files: KnockoutObservableArray;
        public readyToServe: KnockoutObservableBool;
        public fs: any = null;
        public size: KnockoutObservableNumber;
        constructor(id: string, name: string, size: number, client: IClient) {
            this.client = client;
            this.id = ko.observable(id);
            this.name = ko.observable(name);
            this.size = ko.observable(size);
            this.peers = ko.observableArray([]);
            this.files = ko.observableArray([]);
            this.readyToServe = ko.observable(false);
            this.loadFiles();
            //TODO: Report to server when seeding/leeching
        }
        private quotaError(e: any) {
            var msg = '';
            switch (e.code) {
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
            console.log('Error: ' + msg);
        }
        private loadFiles() {
            var _this = this;
            _this.client.configuration.requestFileSystem(window.PERSISTENT, _this.size, function (fs) {
                _this.fs = fs;
                _this.fs.root.getDirectory(_this.id(), {}, function (dirEntry) {
                    var reader = dirEntry.createReader();
                    for (var file in _this.files())
                        _this.files.push(new FileContent(_this, reader, file));
                    //var readEntries = function () {
                    //    reader.readEntries(function (results) {
                    //        if (!results.length) {
                    //            _this.readyToServe(true);
                    //        } else {
                    //            for (var i = 0; i < results.length; i++) {
                    //                var entry = results[i];
                    //                if (entry.isDirectory) {
                    //                    console.log('Directory: ' + entry.fullPath);
                    //                }
                    //                else if (entry.isFile) {
                    //                    console.log('File: ' + entry.fullPath);
                    //                    _this.files.push(new FileContent(_this, entry));
                    //                }
                    //            }
                    //            readEntries();
                    //        }
                    //    }, function (e) { console.log('readEntries error', e) });
                    //};
                    //readEntries();
                }, function (e) { console.log('getDictionary error', e) });
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