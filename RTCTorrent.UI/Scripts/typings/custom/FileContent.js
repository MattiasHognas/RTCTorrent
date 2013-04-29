var RtcTorrent;
(function (RtcTorrent) {
    'use strict';
    var FileContent = (function () {
        function FileContent(torrent, reader, fullPath, size, hashes) {
            this.torrent = torrent;
            this.reader = reader;
            this.fullPath = fullPath;
            this.size = size;
            this.hashes = hashes;
        }
        FileContent.prototype.reportPiece = function (startByte, stopByte) {
        };
        FileContent.prototype.requestPiece = function () {
        };
        FileContent.prototype.writePiece = function (data, startByte) {
            var _this = this;
            try  {
                this.torrent.fs.root.getFile(this.fullPath, {
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
            var currentSize = entry.size;
            var byteArray = new Uint8Array(data.length);
            for(var i = 0; i < data.length; i++) {
                byteArray[i] = data.charCodeAt(i) & 0xff;
            }
            var blobBuilder = new this.torrent.client.configuration.blobBuilder();
            blobBuilder.append(byteArray.buffer);
            var fw = entry.createWriter();
            var minSize = startByte + data.length;
            if(currentSize < minSize) {
                fw.truncate(minSize);
            }
            fw.seek(startByte);
            fw.write(blobBuilder.getBlob());
        };
        return FileContent;
    })();
    RtcTorrent.FileContent = FileContent;    
})(RtcTorrent || (RtcTorrent = {}));
