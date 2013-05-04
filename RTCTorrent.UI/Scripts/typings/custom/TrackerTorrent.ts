/// <reference path="Interfaces.d.ts" />
/// <reference path="TrackerTorrentFile.ts" />

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
            var _this: ITrackerTorrent = this;
            ko.utils.arrayForEach(files, function (file) {
                _this.files.push(new TrackerTorrentFile(file.fullPath, file.size, file.pieces));
            });
        }
    }
}