/// <reference path="Interfaces.d.ts" />

module RtcTorrent {
    'use strict';
    export class FileContent implements IFileContent {
        public torrent: ITorrent;
        public entry: any;
        constructor(torrent: ITorrent, entry: any)
        {
            this.torrent = torrent;
            this.entry = entry;
            // TODO: Locate pieces missing in file and request them.
            // TODO: Add method to return requested pieces to peers requesting them.
        }

        // TODO: This below is still here to remind us what functions are available.
        // TODO: It will be removed when FileContent is ready!
        //private writeFile(entry, fullPath, data) {
        //    var _this = this;
        //    entry.getFile(fullPath, { create: true, exclusive: false }, function (fileEntry) {
        //        fileEntry.createWriter(function (writer) {
        //            //var blobBuilder = new webkitBlobBuilder();
        //            //blobBuilder.append(byteArray.buffer);
        //            //writer.seek(writer.length);
        //            writer.onwriteend = function (evt) {
        //                console.log("onwriteend");
        //            };
        //            writer.write(data);
        //            writer.abort();
        //        }, function (e) { console.log('error', e) });
        //    }, function (e) { console.log('error', e) });
        //}
        //save(fileSystem: any, directory: string, file: string, data: string) {
        //    var _this = this;
        //    fileSystem.root.getDirectory(directory, {create: true}, function(entry){
        //        console.log('getDirectory success');
        //        _this.writeFile(entry, directory + "/" + file, data);
        //    } ,function (e) { console.log('error', e) });
        //}
        //private quotaError(e: any)
        //{
        //    var msg = '';
        //    switch (e.code) {
        //        case FileError.QUOTA_EXCEEDED_ERR:
        //            msg = 'QUOTA_EXCEEDED_ERR';
        //            break;
        //        case FileError.NOT_FOUND_ERR:
        //            msg = 'NOT_FOUND_ERR';
        //            break;
        //        case FileError.SECURITY_ERR:
        //            msg = 'SECURITY_ERR';
        //            break;
        //        case FileError.INVALID_MODIFICATION_ERR:
        //            msg = 'INVALID_MODIFICATION_ERR';
        //            break;
        //        case FileError.INVALID_STATE_ERR:
        //            msg = 'INVALID_STATE_ERR';
        //            break;
        //        default:
        //            msg = 'Unknown Error';
        //            break;
        //    };
        //    console.log('Error: ' + msg);
        //}
        //requestQuota(byteSize: number, ready: (e: any) => void , error: (e: any) => void) {
        //    var _this = this;
        //    window.webkitStorageInfo.requestQuota(
        //        window.PERSISTENT,
        //        byteSize,
        //        function (grantedBytes) {
        //            window.requestFileSystem(
        //                window.PERSISTENT,
        //                grantedBytes,
        //                function (e: any) {
        //                    ready(e);
        //                },
        //                function (e: any) {
        //                    error(_this.quotaError(e));
        //                });
        //        }, function (e) {
        //            error(e);
        //            console.log('Error', e);
        //        }
        //    );
        //}
        //read(file: File, ready: (data: string) => void)
        //{
        //    var _this = this;
        //    var start: number = 0;
        //    var stop: number = file.size - 1;
        //    var reader: FileReader = new FileReader();
        //    reader.onloadend = function (evt: ProgressEvent)
        //    {
        //        if (evt.readyState == FileReader.prototype.DONE)
        //        {
        //            var chars = new Uint16Array(reader.result);
        //            var data:string = String.fromCharCode.apply(null, chars);
        //            //var size = file.size;
        //            ready(data);
        //        }
        //    };
        //    var blob = file.slice(start, stop + 1);
        //    reader.readAsArrayBuffer(blob);
        //}
    }
}