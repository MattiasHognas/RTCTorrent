/// <reference path="../jquery/jquery.d.ts" />
/// <reference path="Interfaces.d.ts" />
/// <reference path="Peer.ts" />

module RtcTorrent {
    'use strict';
    export class Torrent extends FileContent {
        public client: IClient;
        public peers: KnockoutObservableArray;
        public id: KnockoutObservableString;
        public fileContent: IFileContent;
        constructor(id: string, client: IClient) {
            super();
            this.client = client;
            this.peers = ko.observableArray([]);
            this.id = ko.observable(id);
            //TODO: report to server when seeding/leeching
        }
        // TODO
        //sendMessage(message: string, id: string) {
        //    this.findPeer(id).dataChannel.send(message);
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