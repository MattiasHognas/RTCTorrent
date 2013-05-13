/// <reference path="Interfaces.d.ts" />

module RtcTorrent {
    'use strict';
    export class TrackerTorrentFilePiece implements ITrackerTorrentFilePiece {
        public hash: KnockoutObservableString;
        public size: KnockoutObservableNumber;
        public startByte: KnockoutObservableNumber;
        constructor(hash: string, size: number, startByte: number) {
            this.hash = ko.observable(hash);
            this.size = ko.observable(size);
            this.startByte = ko.observable(startByte);
        }
    }
}