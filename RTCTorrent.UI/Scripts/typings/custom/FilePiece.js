var RtcTorrent;
(function (RtcTorrent) {
    'use strict';
    var FilePiece = (function () {
        function FilePiece(fileContent, entry, i, startByte, endByte) {
            this.fileContent = fileContent;
            this.entry = entry;
            this.pieceNumber = i;
            this.pieceStartByte = startByte;
            this.pieceEndByte = endByte;
            if(!this.gotPiece()) {
                this.requestPiece();
            } else {
                this.reportPiece();
            }
        }
        FilePiece.prototype.gotPiece = function () {
            return true;
        };
        FilePiece.prototype.reportPiece = function () {
            var gotPiece = this.gotPiece();
        };
        FilePiece.prototype.requestPiece = function () {
        };
        FilePiece.prototype.writePiece = function (bytes) {
            this.reportPiece();
        };
        return FilePiece;
    })();
    RtcTorrent.FilePiece = FilePiece;    
})(RtcTorrent || (RtcTorrent = {}));
