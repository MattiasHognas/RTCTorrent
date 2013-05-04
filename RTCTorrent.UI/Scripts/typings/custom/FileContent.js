var RtcTorrent;
(function (RtcTorrent) {
    'use strict';
    var FileContent = (function () {
        function FileContent(torrent, reader, fullPath, size, pieces) {
            this.torrent = torrent;
            this.reader = reader;
            this.fullPath = fullPath;
            this.size = size;
            this.pieces = pieces;
            this.index();
        }
        FileContent.prototype.index = function () {
            var _this = this;
            _this.torrent.fs.root.getFile(_this.fullPath, {
                create: true,
                exclusive: false
            }, function (fileEntry) {
                fileEntry.file(function (file) {
                    fileEntry.createWriter(function (fileWriter) {
                        fileWriter.onwriteend = function (e) {
                            fileWriter.onwriteend = null;
                            _this.loadPieces(file);
                        };
                        fileWriter.seek(file.size);
                        if(file.size < _this.size) {
                            fileWriter.truncate(_this.size);
                        } else {
                            _this.loadPieces(file);
                        }
                    }, function (e) {
                        console.log('error', e);
                    });
                }, function (e) {
                    console.log('error', e);
                });
            });
        };
        FileContent.prototype.loadPieces = function (file) {
            var _this = this;
            var reader = new FileReader();
            reader.onloadend = function (evt) {
                if(reader.readyState == 2) {
                    var bytes = reader.result;
                    var currentByte = 1;
                    for(var i = 0; i < _this.pieces.length; i++) {
                        var startByte = currentByte - 1;
                        var stopByte = startByte + _this.pieces[i] - 1;
                        var byte = bytes[startByte];
                        if(byte === undefined) {
                            _this.requestPiece(startByte, stopByte);
                        } else {
                            _this.announcePiece(startByte, stopByte);
                        }
                        currentByte = stopByte + 2;
                    }
                }
            };
            reader.readAsArrayBuffer(file);
        };
        FileContent.prototype.announcePiece = function (startByte, stopByte) {
            console.log('announcePiece', startByte, stopByte);
        };
        FileContent.prototype.requestPiece = function (startByte, stopByte) {
            console.log('requestPiece', startByte, stopByte);
        };
        FileContent.prototype.readPiece = function (startByte, stopByte, result) {
            var _this = this;
            _this.torrent.fs.root.getFile(_this.fullPath, {
                create: true,
                exclusive: false
            }, function (fileEntry) {
                fileEntry.file(function (file) {
                    var reader = new FileReader();
                    reader.onloadend = function (evt) {
                        if(reader.readyState == 2) {
                            result(reader.result);
                        }
                    };
                    var blob = file.slice(startByte, stopByte + 1);
                    reader.readAsArrayBuffer(blob);
                }, function (e) {
                    console.log('error', e);
                });
            });
        };
        FileContent.prototype.writePiece = function (data, startByte) {
            var _this = this;
            _this.torrent.fs.root.getFile(_this.fullPath, {
                create: true,
                exclusive: false
            }, function (entry) {
                _this.write(data, startByte, entry);
            }, function (e) {
                console.log('error', e);
            });
        };
        FileContent.prototype.write = function (data, startByte, fileEntry) {
            var _this = this;
            var currentSize = fileEntry.size;
            var blobBuilder = new this.torrent.client.configuration.blobBuilder();
            blobBuilder.append(data);
            var fileWriter = fileEntry.createWriter();
            fileWriter.onwriteend = function (e) {
                fileWriter.onwriteend = null;
                _this.announcePiece(startByte, startByte + data.byteLength);
            };
            fileWriter.seek(startByte);
            fileWriter.write(blobBuilder.getBlob());
        };
        return FileContent;
    })();
    RtcTorrent.FileContent = FileContent;    
})(RtcTorrent || (RtcTorrent = {}));
