/// <reference path="Interfaces.d.ts" />
/// <reference path="FilePiece.ts" />

module RtcTorrent {
    'use strict';
    export class FileContent implements IFileContent {
        public torrent: ITorrent;
        public entry: any;
        public pieces: KnockoutObservableArray;
        constructor(torrent: ITorrent, entry: any)
        {
            this.torrent = torrent;
            this.entry = entry;
            this.pieces = ko.observableArray([]);
            this.createPieces();
        }
        createPieces() {
            var pieceSize: number = this.torrent.client.configuration.pieceSize;
            var numberOfPieces: number = Math.ceil(this.torrent.size() / (pieceSize));
            for (var i: number = 0; i < numberOfPieces; i++) {
                var endByte: number = (pieceSize * (i + 1) <= this.torrent.size())
                    ? (pieceSize * (i + 1)) - 1
                    : this.torrent.size();
                var startByte: number = this.torrent.size() * i;
                this.pieces.push(new FilePiece(this, this.entry, i, startByte, endByte));
            }
        }
    }
}