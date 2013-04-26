/// <reference path="Interfaces.d.ts" />

module RtcTorrent {
    'use strict';
    export class FileContent implements IFileContent {
        public torrent: ITorrent;
        public reader: any;
        public fullPath: string;
        public size: number;
        public pieces: bool[];
        constructor(torrent: ITorrent, reader: any, fullPath: string, size: number)
        {
            this.torrent = torrent;
            this.reader = reader;
            this.fullPath = fullPath;
            this.size = size;
            this.pieces = new bool[];
            for (var i = 0; i < Math.ceil(size / this.torrent.client.configuration.pieceSize); i++)
                this.pieces.push(false);
            // TODO: call requestPiece for each piece that is false in this.pieces
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
                    this.fullPath,
                    {create: false, exclusive: false}, 
                    function(entry) {
                        _this.write(data, startByte, entry);
                    }, 
                    function(e) { console.log('error', e) });
            } catch (e) {
                console.log('error', e);
            }
        }
        // TODO: needs testing
        private write(data: string, startByte: number, entry: any) {
            var currentSize: number = entry.size;
            var byteArray: Uint8Array = new Uint8Array(data.length);
            for (var i = 0; i < data.length; i++)
                byteArray[i] = data.charCodeAt(i) & 0xff;
            var blobBuilder = new this.torrent.client.configuration.blobBuilder();
            blobBuilder.append(byteArray.buffer);
            var fw = entry.createWriter();
            var minSize: number = startByte + data.length;
            if (currentSize < minSize)
                fw.truncate(minSize);
            fw.seek(startByte);
            fw.write(blobBuilder.getBlob())
        }
    }
}