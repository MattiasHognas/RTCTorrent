/// <reference path="Interfaces.d.ts" />

module RtcTorrent {
    'use strict';
    export class FileContent implements IFileContent {
        constructor()
        {
        }
        quotaGranted(e: any, bytes: any, path: string, name: string)
        {
            // TODO
        }
        quotaError(e: any)
        {
            var msg = '';
            switch (e.code) {
                case FileError.QUOTA_EXCEEDED_ERR:
                    msg = 'QUOTA_EXCEEDED_ERR';
                    break;
                case FileError.NOT_FOUND_ERR:
                    msg = 'NOT_FOUND_ERR';
                    break;
                case FileError.SECURITY_ERR:
                    msg = 'SECURITY_ERR';
                    break;
                case FileError.INVALID_MODIFICATION_ERR:
                    msg = 'INVALID_MODIFICATION_ERR';
                    break;
                case FileError.INVALID_STATE_ERR:
                    msg = 'INVALID_STATE_ERR';
                    break;
                default:
                    msg = 'Unknown Error';
                    break;
            };
            console.log('Error: ' + msg);
        }
        save(bytes: any, path: string, name: string, byteSize: number) {
            var _this = this;
            window.webkitStorageInfo.requestQuota(window.PERSISTENT, byteSize, function (grantedBytes) {
                window.requestFileSystem(window.PERSISTENT, grantedBytes, function(e: any) {_this.quotaGranted(e, bytes, path, name)}, _this.quotaError);
            }, function (e) {
                console.log('Error', e);
            });
        }
        read(file: File, ready: (data: string) => void)
        {
            var _this = this;
            var start: number = 0;
            var stop: number = file.size - 1;
            var reader: FileReader = new FileReader();
            reader.onloadend = function (evt: ProgressEvent)
            {
                if (evt.readyState == FileReader.prototype.DONE)
                {
                    var chars = new Uint16Array(reader.result);
                    var data:string = String.fromCharCode.apply(null, chars);
                    //var size = file.size;
                    ready(data);
                }
            };
            var blob = file.slice(start, stop + 1);
            reader.readAsArrayBuffer(blob);
        }
    }
}