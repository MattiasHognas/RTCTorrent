var Bencode;
var RtcTorrent;
(function (RtcTorrent) {
    'use strict';
    var User = (function () {
        function User(id) {
            this.id = ko.observable(id);
        }
        return User;
    })();
    RtcTorrent.User = User;    
})(RtcTorrent || (RtcTorrent = {}));
