/// <reference path="Interfaces.d.ts" />

module RtcTorrent {
    'use strict';
    export class FileContent implements IFileContent {
        public torrent: ITorrent;
        public reader: any;
        public fullPath: string;
        public size: number;
        public pieces: ITrackerTorrentFilePiece[];
        constructor(torrent: ITorrent, reader: any, fullPath: string, size: number, pieces: ITrackerTorrentFilePiece[])
        {
            this.torrent = torrent;
            this.reader = reader;
            this.fullPath = fullPath;
            this.size = size;
            this.pieces = pieces;
            this.index();
        }
        index() {
            var _this: IFileContent = this;
            console.log(_this.torrent.fs.root.toURL());
            _this.torrent.fs.root.getFile(_this.fullPath, { create: true, exclusive: false }, function (fileEntry) {
                fileEntry.file(
                    function (file) {
                        fileEntry.createWriter(
                            function (fileWriter) {
                                fileWriter.onwriteend = function (e) {
                                    fileWriter.onwriteend = null;
                                    _this.loadPieces(file);
                                };
                                fileWriter.seek(file.size);
                                if (file.size < _this.size)
                                    fileWriter.truncate(_this.size);
                                else
                                    _this.loadPieces(file);
                            },
                            function (e) { console.log('error', e) });
                    },
                    function (e) { console.log('error', e) });
            });
        }
        loadPieces(file: File) {
            var _this: IFileContent = this;
            var reader: FileReader = new FileReader();
            reader.onloadend = function (evt) {
                if (reader.readyState == 2) {
                    var bytes: ArrayBuffer = reader.result;
                    var currentByte: number = 1;
                    for (var i = 0; i < _this.pieces.length; i++) {
                        var startByte = currentByte - 1;
                        var stopByte = startByte + _this.pieces[i].size() - 1;
                        var byte = bytes[startByte];
                        if (byte === undefined) { // TODO: Shouldn't this be 0x00 as zerobyte?
                            _this.requestPiece(startByte, stopByte);
                        } else {
                            _this.announcePiece(startByte, stopByte);
                        }
                        currentByte = stopByte + 2;
                    }
                }
            };
            reader.readAsArrayBuffer(file);
        }
        announcePiece(startByte: number, stopByte: number) {
            console.log('announcePiece', startByte, stopByte);
            // TODO: Send info on current piece existance to the torrent channel (send to this.torrent.peers)
            // TODO: Go trough ITorrent to evaluate seeding / leeching / %
        }
        // TODO: Implement libtorrents piece picker somehow
        // https://code.google.com/p/libtorrent/source/browse/include/libtorrent/piece_picker.hpp?name=libtorrent_0_16_5
        requestPiece(startByte: number, stopByte: number) {
            console.log('requestPiece', startByte, stopByte);
            // TODO: Request piece from torrent listeners in channel (send to this.torrent.peers)
        }
        // TODO: Call from ITorrent
        readPiece(startByte: string, stopByte: number, result: (result: ArrayBuffer) => void ) {
            var _this: IFileContent = this;
            _this.torrent.fs.root.getFile(_this.fullPath, { create: true, exclusive: false }, function (fileEntry) {
                fileEntry.file(
                    function (file) {
                        var reader = new FileReader();
                        reader.onloadend = function (evt) {
                            if (reader.readyState == 2)
                                result(reader.result);
                        };
                        var blob = file.slice(startByte, stopByte + 1);
                        reader.readAsArrayBuffer(blob);
                    },
                    function (e) { console.log('error', e) });
            });
        }
        // TODO: Call from ITorrent
        writePiece(data: ArrayBuffer, startByte: number) {
            var piece: ITrackerTorrentFilePiece = ko.utils.arrayFirst(this.pieces, function (piece: ITrackerTorrentFilePiece) {
                return piece.startByte == piece.startByte;
            });
            if (piece != null) {
                var hash = this.torrent.client.configuration.crypto.hex_sha1(this.arraybuffer2string(data));
                if (hash != piece.hash())
                    this.requestPiece(piece.startByte(), piece.size() + piece.startByte());
                else {
                    var _this: IFileContent = this;
                    _this.torrent.fs.root.getFile(
                        _this.fullPath,
                        { create: true, exclusive: false },
                        function (entry) {
                            _this.write(data, startByte, entry)
                        },
                        function (e) { console.log('error', e) });
                }
            }
        }
        write(data: ArrayBuffer, startByte: number, fileEntry: any) {
            var _this: IFileContent = this;
            var currentSize: number = fileEntry.size;
            var blobBuilder = new this.torrent.client.configuration.blobBuilder();
            blobBuilder.append(data);
            var fileWriter = fileEntry.createWriter();
            fileWriter.onwriteend = function (e) {
                fileWriter.onwriteend = null;
                _this.announcePiece(startByte, startByte + data.byteLength)
            }
            fileWriter.seek(startByte);
            fileWriter.write(blobBuilder.getBlob())
        }
        // TODO: Move to some sort of util class/namespace together with Crypto.
        arraybuffer2string(buf) {
            return String.fromCharCode.apply(null, new Uint16Array(buf));
        }
        // TODO: Move to some sort of util class/namespace together with Crypto.
        string2arraybuffer(str) {
            var buf = new ArrayBuffer(str.length * 2);
            var bufView = new Uint16Array(buf);
            for (var i = 0, strLen = str.length; i < strLen; i++) {
                bufView[i] = str.charCodeAt(i);
            }
            return buf;
        }
    }
}