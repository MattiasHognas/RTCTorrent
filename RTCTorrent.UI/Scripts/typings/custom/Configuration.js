var RtcTorrent;
(function (RtcTorrent) {
    'use strict';
    var Configuration = (function () {
        function Configuration() {
            this.webRTCSupport = true;
            var _this = this;
            var pcConfig = {
                'iceServers': [
                    {
                        'url': 'stun:stun.l.google.com:19302'
                    }
                ]
            };
            var pcConstraints = {
                mandatory: {
                    OfferToReceiveAudio: false,
                    OfferToReceiveVideo: false
                },
                optional: [
                    {
                        RtpDataChannels: true
                    }
                ]
            };
            if(navigator.mozGetUserMedia) {
                this.createPeerConnection = function (handleConnection) {
                    var pc = new window.mozRTCPeerConnection(pcConfig, pcConstraints);
                    return pc;
                };
                this.getUserMedia = navigator.mozGetUserMedia.bind(navigator);
                this.attachMediaStream = function (root, stream) {
                    root.src(URL.createObjectURL(stream));
                };
                this.reattachMediaStream = function (to, from) {
                    to.src(from());
                };
                this.setRemoteDescription = function (handleConnection, localId, remoteId, pc, message) {
                    var handleConnection = handleConnection;
                    var pc = pc;
                    var localId = localId;
                    var remoteId = remoteId;
                    var successCallback = function () {
                        pc.connectDataConnection('datachannel' + localId, 'datachannel' + remoteId);
                        pc.onconnection = handleConnection.bind(this);
                        console.log('setRemoteDescription successCallback');
                    };
                    var failureCallback = function () {
                        console.log('setRemoteDescription failureCallback');
                    };
                    var sessionDescription = JSON.parse(message.Message);
                    pc.setRemoteDescription(sessionDescription, successCallback, failureCallback);
                };
                this.addIceCandidate = function (pc, message) {
                    var successCallback = function () {
                        console.log('addIceCandidate successCallback');
                    };
                    var failureCallback = function () {
                        console.log('addIceCandidate failureCallback');
                    };
                    var outputMessage = {
                        sdpMLineIndex: JSON.parse(message.Message).label,
                        candidate: JSON.parse(message.Message).candidate
                    };
                    var candidate = outputMessage;
                    pc.addIceCandidate(candidate);
                };
            } else if(navigator.webkitGetUserMedia) {
                this.createPeerConnection = function (handleConnection) {
                    var pc = new window.webkitRTCPeerConnection(pcConfig, pcConstraints);
                    pc.onconnection = handleConnection.bind(this);
                    return pc;
                };
                this.getUserMedia = navigator.webkitGetUserMedia.bind(navigator);
                this.attachMediaStream = function (root, stream) {
                    root.src(webkitURL.createObjectURL(stream));
                };
                this.reattachMediaStream = function (to, from) {
                    to.src(from());
                };
                this.setRemoteDescription = function (handleConnection, localId, remoteId, pc, message) {
                    var pc = pc;
                    var localId = localId;
                    var remoteId = remoteId;
                    var successCallback = function () {
                        console.log('setRemoteDescription successCallback');
                    };
                    var failureCallback = function () {
                        console.log('setRemoteDescription failureCallback');
                    };
                    var sessionDescription = JSON.parse(message.Message);
                    pc.setRemoteDescription(new RTCSessionDescription(sessionDescription), successCallback, failureCallback);
                };
                this.addIceCandidate = function (pc, message) {
                    var successCallback = function () {
                        console.log('addIceCandidate successCallback');
                    };
                    var failureCallback = function () {
                        console.log('addIceCandidate failureCallback');
                    };
                    var outputMessage = {
                        sdpMLineIndex: JSON.parse(message.Message).label,
                        candidate: JSON.parse(message.Message).candidate
                    };
                    var candidate = new RTCIceCandidate(outputMessage);
                    pc.addIceCandidate(candidate);
                };
            } else {
                this.webRTCSupport = false;
            }
        }
        return Configuration;
    })();
    RtcTorrent.Configuration = Configuration;    
})(RtcTorrent || (RtcTorrent = {}));
