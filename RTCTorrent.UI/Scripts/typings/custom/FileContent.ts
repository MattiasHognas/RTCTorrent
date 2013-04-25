/// <reference path="Interfaces.d.ts" />
/// <reference path="FilePiece.ts" />

module RtcTorrent {
    'use strict';
    export class FileContent implements IFileContent {
        public torrent: ITorrent;
        public reader: any;
        public file: string;
        constructor(torrent: ITorrent, reader: any, file: string)
        {
            this.torrent = torrent;
            this.reader = reader;
            this.file = file;
        }
        reportPiece(startByte: number, stopByte: number) {
            // TODO: Send if current piece exists to torrent channel
            // TODO: Go trough ITorrent to evaluate seeding / leeching / %
        }
        requestPiece() {
            // TODO: Request missing pieces from torrent listeners in channel
        }
        // TODO: call from ITorrent
        writePiece(data: string, startByte: number) {
            var _this = this;
            try {
                this.torrent.fs.root.getFile(
                    this.file, 
                    {create: false, exclusive: false}, 
                    function(entry) {
                        _this.write(data, startByte, entry);
                    }, 
                    function(e) { console.log('error', e) });

            } catch (e) {
                console.log('error', e);
            }
        }
        private write(data: string, startByte: number, entry: any) {
            var size = entry.size;
            var byteArray = new Uint8Array(data.length);
            for (var i = 0; i < data.length; i++) {
                byteArray[i] = data.charCodeAt(i) & 0xff;
            }
            var blobBuilder = null; // TODO: new webkitBlobBuilder();
            blobBuilder.append(byteArray.buffer);
            var fw = entry.createWriter();
            if (size < startByte + data.length)
                fw.truncate(startByte + data.length);
            fw.seek(startByte);
            fw.write(blobBuilder.getBlob())
        }
    }
}