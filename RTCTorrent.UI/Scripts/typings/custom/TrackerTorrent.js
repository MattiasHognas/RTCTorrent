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
            var _this = this;
            ko.utils.arrayForEach(files, function (file) {
                _this.files.push(new RtcTorrent.TrackerTorrentFile(file.fullPath, file.size, file.pieces));
            });
        }
        return TrackerTorrent;
    })();
    RtcTorrent.TrackerTorrent = TrackerTorrent;    
})(RtcTorrent || (RtcTorrent = {}));
