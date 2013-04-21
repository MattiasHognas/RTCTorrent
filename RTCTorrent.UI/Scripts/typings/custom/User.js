var Bencode;
var RtcTorrent;
(function (RtcTorrent) {
    'use strict';
    var User = (function () {
        function User(id) {
            var _this = this;
            this.id = ko.observable(id);
        }
        return User;
    })();
    RtcTorrent.User = User;    
})(RtcTorrent || (RtcTorrent = {}));
