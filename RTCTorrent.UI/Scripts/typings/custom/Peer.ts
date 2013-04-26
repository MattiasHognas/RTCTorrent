/// <reference path='../signalr/signalr.d.ts' />
/// <reference path='../webrtc/RTCPeerConnection.d.ts' />
/// <reference path='../knockout/knockout.d.ts' />
/// <reference path='Configuration.ts' />
/// <reference path='Client.ts' />

module RtcTorrent {
    'use strict';
    export class Peer implements IPeer extends User {
        public channel: RTCDataChannel;
        public channelOpened: bool;
        private mediaConstraints: MediaConstraints = {
            mandatory: {
                OfferToReceiveAudio: true,
                OfferToReceiveVideo: true
            }
        };
        public torrent: ITorrent = null;
        private pc: RTCPeerConnection = null;
        constructor(id: string, torrent: ITorrent) {
            super(id);
            var _this = this;
            this.torrent = torrent;
            this.pc = this.torrent.client.configuration.createPeerConnection(this.handleConnection);
            this.handleConnection();
            this.pc.onicecandidate = this.onIceCandidate.bind(this);
            //this.pc.onaddstream = this.handleRemoteStreamAdded.bind(this);
            //this.pc.onremovestream = this.handleStreamRemoved.bind(this);
        }
        onJsepOffer(message) {
            console.log('got JSEP offer');
            this.torrent.client.configuration.setRemoteDescription(this.handleConnection, this.torrent.client.id(), this.id(), this.pc, message);
            this.answer();
        }
        onJsepAnswer(message) {
            console.log('got JSEP answer');
            this.torrent.client.configuration.setRemoteDescription(this.handleConnection, this.torrent.client.id(), this.id(), this.pc, message);
            console.log('End of candidates');
        }
        onJsepCandidate(message) {
            console.log('got JSEP candidate');
            this.torrent.client.configuration.addIceCandidate(this.pc, message);
        }
        onIceCandidate(event) {
            console.log('got ICE candidate');
            if (event.candidate) {
                this.torrent.client.socket.server.jsepCandidate({
                    FromSessionId: this.torrent.client.id(),
                    ToSessionId: this.id(),
                    TorrentId: this.torrent.trackerTorrent.id(),
                    Message: JSON.stringify({
                        label: event.candidate.sdpMLineIndex,
                        id: event.candidate.sdpMid,
                        candidate: event.candidate.candidate
                    })
                });
            } else {
                console.log('End of candidates');
            }
        }
        start() {
            var _this = this;
            console.log('creating offer');
            this.pc.createOffer(function (sessionDescription) {
                console.log('setting local description');
                _this.pc.setLocalDescription(sessionDescription);
                var message = { FromSessionId: _this.torrent.client.id(), ToSessionId: _this.id(), TorrentId: _this.torrent.trackerTorrent.id(), Message: JSON.stringify(sessionDescription) };
                console.log('sending offer', message);
                _this.torrent.client.socket.server.jsepOffer(message);
            }, null, _this.mediaConstraints);
        }
        answer() {
            var _this = this;
            console.log('creating answer');
            this.pc.createAnswer(function (sessionDescription) {
                console.log('setting local description');
                _this.pc.setLocalDescription(sessionDescription);
                var message = { FromSessionId: _this.torrent.client.id(), ToSessionId: _this.id(), TorrentId: _this.torrent.trackerTorrent.id(), Message: JSON.stringify(sessionDescription) };
                console.log('sending answer', message);
                _this.torrent.client.socket.server.jsepAnswer(message);
            }, null, _this.mediaConstraints);
        }
        //handleRemoteStreamAdded(event: any) {
        //    console.log('handleRemoteStreamAdded');
        //    this.torrent.client.configuration.attachMediaStream(this, event.stream);
        //}
        //handleStreamRemoved() {
        //    console.log('handleStreamRemoved');
        //    this.torrent.removePeer(this.id());
        //}
        handleDataChannel(event: RTCDataChannelEvent) {
            console.log('handleDataChannel');
            this.addDataChannelEvents(event.channel);
        }
        addDataChannelEvents(channel: RTCDataChannel) {
            console.log('addDataChannelEvents');
            var _self = this;
            this.channel = channel;
            //this.channel.binaryType = 'blob';
            this.channel.onmessage = function (event: any) {
                if (event.data instanceof ArrayBuffer) {
                    console.log('incomming arrayBuffer: ' + event.data);
                } else if (event.data instanceof Blob) {
                    console.log('incomming Blob: ' + event.data + ', length=' + event.data.size);
                } else {
                    console.log('incomming message: ' + event.data);
                }
            };
            this.channel.onopen = function (event: Event) {
                console.log('dataChannel onopen', event);
                _self.channelOpened = true;
            };
            this.channel.onclose = function (event: Event) {
                console.log('dataChannel onclose', event);
                _self.channelOpened = false;
            };
            this.channel.onerror = function (event: Event) {
                console.log('dataChannel onerror', event)
            };
            console.log('handleDataChannel');
            //console.log('DataChannel state:' + this.dataChannel.readyState);
        }
        handleConnection() {
            console.log("handleConnection");
            var dataChannelDictionary: RTCDataChannelInit = {
                reliable: false
            };
            var channel = this.pc.createDataChannel('datachannel', dataChannelDictionary); // reliable (TCP-like)
            //this.dataChannel = this.pc.createDataChannel(channelId,{outOfOrderAllowed: true, maxRetransmitNum: 0}); // unreliable (UDP-like)
            this.addDataChannelEvents(channel);
        }
    }
}