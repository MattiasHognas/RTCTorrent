var __extends = this.__extends || function (d, b) {
    function __() { this.constructor = d; }
    __.prototype = b.prototype;
    d.prototype = new __();
};
var RtcTorrent;
(function (RtcTorrent) {
    'use strict';
    var Peer = (function (_super) {
        __extends(Peer, _super);
        function Peer(id, torrent) {
                _super.call(this, id);
            this.mediaConstraints = {
                mandatory: {
                    OfferToReceiveAudio: true,
                    OfferToReceiveVideo: true
                }
            };
            this.torrent = null;
            this.pc = null;
            var _this = this;
            this.torrent = torrent;
            this.pc = this.torrent.client.configuration.createPeerConnection(this.handleConnection);
            this.handleConnection();
            this.pc.onicecandidate = this.onIceCandidate.bind(this);
            this.pc.onaddstream = this.handleRemoteStreamAdded.bind(this);
            this.pc.onremovestream = this.handleStreamRemoved.bind(this);
        }
        Peer.prototype.onJsepOffer = function (message) {
            console.log('got JSEP offer');
            this.torrent.client.configuration.setRemoteDescription(this.handleConnection, this.torrent.client.id(), this.id(), this.pc, message);
            this.answer();
        };
        Peer.prototype.onJsepAnswer = function (message) {
            console.log('got JSEP answer');
            this.torrent.client.configuration.setRemoteDescription(this.handleConnection, this.torrent.client.id(), this.id(), this.pc, message);
            console.log('End of candidates');
        };
        Peer.prototype.onJsepCandidate = function (message) {
            console.log('got JSEP candidate');
            this.torrent.client.configuration.addIceCandidate(this.pc, message);
        };
        Peer.prototype.onIceCandidate = function (event) {
            console.log('got ICE candidate');
            if(event.candidate) {
                this.torrent.client.socket.server.jsepCandidate({
                    FromSessionId: this.torrent.client.id(),
                    ToSessionId: this.id(),
                    RoomId: this.torrent.id(),
                    Message: JSON.stringify({
                        label: event.candidate.sdpMLineIndex,
                        id: event.candidate.sdpMid,
                        candidate: event.candidate.candidate
                    })
                });
            } else {
                console.log('End of candidates');
            }
        };
        Peer.prototype.start = function () {
            var _this = this;
            console.log('creating offer');
            this.pc.createOffer(function (sessionDescription) {
                console.log('setting local description');
                _this.pc.setLocalDescription(sessionDescription);
                var message = {
                    FromSessionId: _this.torrent.client.id(),
                    ToSessionId: _this.id(),
                    RoomId: _this.torrent.id(),
                    Message: JSON.stringify(sessionDescription)
                };
                console.log('sending offer', message);
                _this.torrent.client.socket.server.jsepOffer(message);
            }, null, _this.mediaConstraints);
        };
        Peer.prototype.answer = function () {
            var _this = this;
            console.log('creating answer');
            this.pc.createAnswer(function (sessionDescription) {
                console.log('setting local description');
                _this.pc.setLocalDescription(sessionDescription);
                var message = {
                    FromSessionId: _this.torrent.client.id(),
                    ToSessionId: _this.id(),
                    RoomId: _this.torrent.id(),
                    Message: JSON.stringify(sessionDescription)
                };
                console.log('sending answer', message);
                _this.torrent.client.socket.server.jsepAnswer(message);
            }, null, _this.mediaConstraints);
        };
        Peer.prototype.handleRemoteStreamAdded = function (event) {
            console.log('handleRemoteStreamAdded');
            this.torrent.client.configuration.attachMediaStream(this, event.stream);
        };
        Peer.prototype.handleStreamRemoved = function () {
            console.log('handleStreamRemoved');
            this.torrent.removePeer(this.id());
        };
        Peer.prototype.handleDataChannel = function (event) {
            console.log('handleDataChannel');
            this.addDataChannelEvents(event.channel);
        };
        Peer.prototype.addDataChannelEvents = function (channel) {
            console.log('addDataChannelEvents');
            var _self = this;
            this.channel = channel;
            this.channel.onmessage = function (event) {
                if(event.data instanceof ArrayBuffer) {
                    console.log('incomming arrayBuffer: ' + event.data);
                } else if(event.data instanceof Blob) {
                    console.log('incomming Blob: ' + event.data + ', length=' + event.data.size);
                } else {
                    console.log('incomming message: ' + event.data);
                }
            };
            this.channel.onopen = function (event) {
                console.log('dataChannel onopen', event);
                _self.channelOpened = true;
            };
            this.channel.onclose = function (event) {
                console.log('dataChannel onclose', event);
                _self.channelOpened = false;
            };
            this.channel.onerror = function (event) {
                console.log('dataChannel onerror', event);
            };
            console.log('handleDataChannel');
        };
        Peer.prototype.handleConnection = function () {
            console.log("handleConnection");
            var dataChannelDictionary = {
                reliable: false
            };
            var channel = this.pc.createDataChannel('datachannel', dataChannelDictionary);
            this.addDataChannelEvents(channel);
        };
        return Peer;
    })(RtcTorrent.User);
    RtcTorrent.Peer = Peer;    
})(RtcTorrent || (RtcTorrent = {}));
