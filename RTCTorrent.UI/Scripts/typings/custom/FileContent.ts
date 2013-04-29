/// <reference path="Interfaces.d.ts" />

module RtcTorrent {
    'use strict';
    export class FileContent implements IFileContent {
        public torrent: ITorrent;
        public reader: any;
        public fullPath: string;
        public size: number;
        public hashes: string[];
        constructor(torrent: ITorrent, reader: any, fullPath: string, size: number, hashes: string[])
        {
            this.torrent = torrent;
            this.reader = reader;
            this.fullPath = fullPath;
            this.size = size;
            this.hashes = hashes;
            // TODO: Read pieces of file on disk if exists and piece start position <= size.
            // TODO: Add SHA1 library.
            // TODO: Where SHA1.hex(str) != to the corresponding this.hashes piece: call requestPiece
        }
        reportPiece(startByte: number, stopByte: number) {
            // TODO: Send info on current piece existance to the torrent channel
            // TODO: Go trough ITorrent to evaluate seeding / leeching / %
        }
        requestPiece() {
            // TODO: Request piece from torrent listeners in channel
        }
        // TODO: Call from ITorrent
        // TODO: When got full piece, call reportPiece
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
        // TODO: Needs alot of work..
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