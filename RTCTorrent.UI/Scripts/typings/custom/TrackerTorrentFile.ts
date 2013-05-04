/// <reference path="Interfaces.d.ts" />

module RtcTorrent {
    'use strict';
    export class TrackerTorrentFile implements ITrackerTorrentFile {
        public fullPath: KnockoutObservableString;
        public pieces: KnockoutObservableArray;
        public size: KnockoutObservableNumber;
        constructor(fullPath: string, size: number, pieces: number[]) {
            this.fullPath = ko.observable(fullPath);
            this.size = ko.observable(size);
            this.pieces = ko.observableArray(pieces);
        }
    }
}