/// <reference path="Interfaces.d.ts" />
/// <reference path="Peer.ts" />

module RtcTorrent {
    'use strict';
    export class Torrent {
        public client: IClient;
        public name: string;
        public fileNames: string[];
        public announceList: string[];
        public peers: KnockoutObservableArray;
        public id: KnockoutObservableString;
        constructor(content: string, client: IClient) {
            this.client = client;
            var parsedContent = Bencode.parse(content);
            this.name = Bencode.torrentInfo(parsedContent, 'name');
            this.fileNames = Bencode.torrentInfo(parsedContent, 'file-names');
            this.announceList = Bencode.torrentInfo(parsedContent, 'announce-list');
            console.log(this.name, this.fileNames, this.announceList);
            this.peers = ko.observableArray([]);
            this.id = ko.observable(name);
        }
        // TODO
        //sendMessage(message: string) {
        //    ko.utils.arrayForEach(this.peers(), function (item) {
        //        return item.dataChannel.send(message);
        //    });
        //}
        createPeer(id: string) {
            var peer: IPeer = new Peer(id, this);
            this.peers.push(peer);
        }
        findPeer(id: string) {
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