var RtcTorrent;
(function (RtcTorrent) {
    'use strict';
    var TrackerTorrentFilePiece = (function () {
        function TrackerTorrentFilePiece(hash, size, startByte) {
            this.hash = ko.observable(hash);
            this.size = ko.observable(size);
            this.startByte = ko.observable(startByte);
        }
        return TrackerTorrentFilePiece;
    })();
    RtcTorrent.TrackerTorrentFilePiece = TrackerTorrentFilePiece;    
})(RtcTorrent || (RtcTorrent = {}));
