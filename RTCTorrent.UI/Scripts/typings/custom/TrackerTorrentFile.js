var RtcTorrent;
(function (RtcTorrent) {
    'use strict';
    var TrackerTorrentFile = (function () {
        function TrackerTorrentFile(fullPath, size, pieces) {
            this.fullPath = ko.observable(fullPath);
            this.size = ko.observable(size);
            this.pieces = ko.observableArray(pieces);
        }
        return TrackerTorrentFile;
    })();
    RtcTorrent.TrackerTorrentFile = TrackerTorrentFile;    
})(RtcTorrent || (RtcTorrent = {}));
