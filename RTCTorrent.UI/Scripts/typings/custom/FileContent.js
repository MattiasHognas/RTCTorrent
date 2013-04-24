var RtcTorrent;
(function (RtcTorrent) {
    'use strict';
    var FileContent = (function () {
        function FileContent(torrent, entry) {
            this.torrent = torrent;
            this.entry = entry;
            this.pieces = ko.observableArray([]);
            this.createPieces();
        }
        FileContent.prototype.createPieces = function () {
            var pieceSize = this.torrent.client.configuration.pieceSize;
            var numberOfPieces = Math.ceil(this.torrent.size() / (pieceSize));
            for(var i = 0; i < numberOfPieces; i++) {
                var endByte = (pieceSize * (i + 1) <= this.torrent.size()) ? (pieceSize * (i + 1)) - 1 : this.torrent.size();
                var startByte = this.torrent.size() * i;
                this.pieces.push(new RtcTorrent.FilePiece(this, this.entry, i, startByte, endByte));
            }
        };
        return FileContent;
    })();
    RtcTorrent.FileContent = FileContent;    
})(RtcTorrent || (RtcTorrent = {}));
