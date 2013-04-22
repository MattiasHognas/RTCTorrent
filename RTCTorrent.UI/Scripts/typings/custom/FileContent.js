var RtcTorrent;
(function (RtcTorrent) {
    'use strict';
    var FileContent = (function () {
        function FileContent() {
            this.fs = null;
        }
        FileContent.prototype.writeFile = function (entry, fullPath, data) {
            var _this = this;
            entry.getFile(fullPath, {
                create: true,
                exclusive: false
            }, function (fileEntry) {
                fileEntry.createWriter(function (writer) {
                    writer.onwriteend = function (evt) {
                        console.log("onwriteend");
                    };
                    writer.write(data);
                    writer.abort();
                }, function (e) {
                    console.log('error', e);
                });
            }, function (e) {
                console.log('error', e);
            });
        };
        FileContent.prototype.save = function (fileSystem, directory, file, data) {
            var _this = this;
            fileSystem.root.getDirectory(directory, {
                create: true
            }, function (entry) {
                console.log('getDirectory success');
                _this.writeFile(entry, directory + "/" + file, data);
            }, function (e) {
                console.log('error', e);
            });
        };
        FileContent.prototype.quotaError = function (e) {
            var msg = '';
            switch(e.code) {
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
            }
            ;
            console.log('Error: ' + msg);
        };
        FileContent.prototype.requestQuota = function (byteSize, ready, error) {
            var _this = this;
            window.webkitStorageInfo.requestQuota(window.PERSISTENT, byteSize, function (grantedBytes) {
                window.requestFileSystem(window.PERSISTENT, grantedBytes, function (e) {
                    ready(e);
                }, function (e) {
                    error(_this.quotaError(e));
                });
            }, function (e) {
                error(e);
                console.log('Error', e);
            });
        };
        FileContent.prototype.read = function (file, ready) {
            var _this = this;
            var start = 0;
            var stop = file.size - 1;
            var reader = new FileReader();
            reader.onloadend = function (evt) {
                if(evt.readyState == FileReader.prototype.DONE) {
                    var chars = new Uint16Array(reader.result);
                    var data = String.fromCharCode.apply(null, chars);
                    ready(data);
                }
            };
            var blob = file.slice(start, stop + 1);
            reader.readAsArrayBuffer(blob);
        };
        return FileContent;
    })();
    RtcTorrent.FileContent = FileContent;    
})(RtcTorrent || (RtcTorrent = {}));
