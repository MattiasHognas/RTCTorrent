var RtcTorrent;
(function (RtcTorrent) {
    'use strict';
    var TrackerTorrentFile = (function () {
        function TrackerTorrentFile(fullPath, size, pieces) {
            this.fullPath = ko.observable(fullPath);
            this.size = ko.observable(size);
            var _this = this;
            ko.utils.arrayForEach(pieces, function (piece) {
                _this.pieces.push(new RtcTorrent.TrackerTorrentFilePiece(piece.hash, piece.size, piece.startByte));
            });
        }
        return TrackerTorrentFile;
    })();
    RtcTorrent.TrackerTorrentFile = TrackerTorrentFile;    
})(RtcTorrent || (RtcTorrent = {}));
