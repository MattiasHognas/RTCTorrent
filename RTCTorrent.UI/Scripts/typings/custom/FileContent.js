var RtcTorrent;
(function (RtcTorrent) {
    'use strict';
    var FileContent = (function () {
        function FileContent(torrent, reader, file) {
            this.torrent = torrent;
            this.reader = reader;
            this.file = file;
        }
        FileContent.prototype.reportPiece = function (startByte, stopByte) {
        };
        FileContent.prototype.requestPiece = function () {
        };
        FileContent.prototype.writePiece = function (data, startByte) {
            var _this = this;
            try  {
                this.torrent.fs.root.getFile(this.file, {
                    create: false,
                    exclusive: false
                }, function (entry) {
                    _this.write(data, startByte, entry);
                }, function (e) {
                    console.log('error', e);
                });
            } catch (e) {
                console.log('error', e);
            }
        };
        FileContent.prototype.write = function (data, startByte, entry) {
            var size = entry.size;
            var byteArray = new Uint8Array(data.length);
            for(var i = 0; i < data.length; i++) {
                byteArray[i] = data.charCodeAt(i) & 0xff;
            }
            var blobBuilder = null;
            blobBuilder.append(byteArray.buffer);
            var fw = entry.createWriter();
            if(size < startByte + data.length) {
                fw.truncate(startByte + data.length);
            }
            fw.seek(startByte);
            fw.write(blobBuilder.getBlob());
        };
        return FileContent;
    })();
    RtcTorrent.FileContent = FileContent;    
})(RtcTorrent || (RtcTorrent = {}));
