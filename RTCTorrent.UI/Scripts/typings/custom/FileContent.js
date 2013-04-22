var RtcTorrent;
(function (RtcTorrent) {
    'use strict';
    var FileContent = (function () {
        function FileContent(torrent, entry) {
            this.torrent = torrent;
            this.entry = entry;
        }
        return FileContent;
    })();
    RtcTorrent.FileContent = FileContent;    
})(RtcTorrent || (RtcTorrent = {}));
