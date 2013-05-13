/// <reference path="Interfaces.d.ts" />
/// <reference path="TrackerTorrentFilePiece.ts" />

module RtcTorrent {
    'use strict';
    export class TrackerTorrentFile implements ITrackerTorrentFile {
        public fullPath: KnockoutObservableString;
        public size: KnockoutObservableNumber;
        public pieces: KnockoutObservableArray;
        constructor(fullPath: string, size: number, pieces: any[]) {
            this.fullPath = ko.observable(fullPath);
            this.size = ko.observable(size);
            var _this: ITrackerTorrentFile = this;
            ko.utils.arrayForEach(pieces, function (piece) {
                _this.pieces.push(new TrackerTorrentFilePiece(piece.hash, piece.size, piece.startByte));
            });
        }
    }
}