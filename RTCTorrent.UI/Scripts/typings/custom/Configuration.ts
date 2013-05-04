/// <reference path='../jquery/jquery.d.ts' />
/// <reference path='../webrtc/RTCPeerConnection.d.ts' />
/// <reference path='../knockout/knockout.d.ts' />
/// <reference path="Interfaces.d.ts" />

module RtcTorrent {
    'use strict';
    export class Configuration implements IConfiguration {
        public requestQuota: (type: any, byteSize: number, quotaGranted: (availableBytes) => void , quotaError: (availableBytes) => void) => void;
        public blobBuilder: () => any;
        public requestFileSystem: (type: any, grantedBytes: any, quotaGranted: (e: any) => void, quotaError: (e: any) => void) => void;
        public createPeerConnection: (handleConnection: () => void ) => RTCPeerConnection;
        public getUserMedia: (constraints: MediaStreamConstraints, successCallback: (stream: LocalMediaStream) => void , errorCallback: (error: Error) => void ) => any;
        public attachMediaStream: (root: any, stream: any) => void;
        public reattachMediaStream: (to: any, from: KnockoutObservableString) => void;
        public webRTCSupport: bool = true;
        public setRemoteDescription: (handleConnection: () => void , localId: string, remoteId: string, pc: RTCPeerConnection, message: any) => void;
        public addIceCandidate: (pc: RTCPeerConnection, message: any) => void;
        constructor() {
            var pcConfig: RTCPeerConnectionConfig = {
                'iceServers': [
                    {
                        'url': 'stun:stun.l.google.com:19302'
                    }
                ]
            };
            var pcConstraints: MediaConstraints = {
                mandatory: {
                    OfferToReceiveAudio: false,
                    OfferToReceiveVideo: false
                },
                optional: [
                    {
                        //DtlsSrtpKeyAgreement: true,
                        RtpDataChannels: true
                    }
                ]
            };
            if (navigator.mozGetUserMedia) {
                this.requestQuota = function (type: any, byteSize: number, quotaGranted: (availableBytes) => void , quotaError: (availableBytes) => void) {
                    return window.mozStorageInfo.requestQuota(type, byteSize, quotaGranted, quotaError);
                }
                this.blobBuilder = function () {
                    return new window.mozBlobBuilder();
                }
                this.requestFileSystem = function (type: any, grantedBytes: any, quotaGranted: (e: any) => void, quotaError: (e: any) => void) {
                    return window.mozRequestFileSystem(type, grantedBytes, quotaGranted, quotaError);
                };
                this.createPeerConnection = function (handleConnection: () => void ) {
                    var pc = new window.mozRTCPeerConnection(pcConfig, pcConstraints);
                    return pc;
                }
                this.getUserMedia = navigator.mozGetUserMedia.bind(navigator);
                this.attachMediaStream = function (root: any, stream: any) {
                    root.src(URL.createObjectURL(stream));
                };
                this.reattachMediaStream = function (to: any, from: KnockoutObservableString) {
                    to.src(from());
                };
                this.setRemoteDescription = function (handleConnection: () => void , localId: string, remoteId: string, pc: RTCPeerConnection, message: any) {
                    var handleConnection: any = handleConnection;
                    var pc: RTCPeerConnection = pc;
                    var localId: string = localId;
                    var remoteId: string = remoteId;
                    var successCallback: RTCVoidCallback = function () {
                        pc.connectDataConnection('datachannel' + localId, 'datachannel' + remoteId);
                        pc.onconnection = handleConnection.bind(this);
                        console.log('setRemoteDescription successCallback');
                    };
                    var failureCallback: RTCVoidCallback = function () {
                        console.log('setRemoteDescription failureCallback');
                    };
                    var sessionDescription = JSON.parse(message.Message);
                    pc.setRemoteDescription(sessionDescription, successCallback, failureCallback);
                }
                this.addIceCandidate = function (pc: RTCPeerConnection, message: any) {
                    var successCallback: RTCVoidCallback = function () {
                        console.log('addIceCandidate successCallback');
                    };
                    var failureCallback: RTCVoidCallback = function () {
                        console.log('addIceCandidate failureCallback');
                    };
                    var outputMessage: RTCIceCandidate = {
                        sdpMLineIndex: JSON.parse(message.Message).label,
                        candidate: JSON.parse(message.Message).candidate
                    };
                    var candidate: RTCIceCandidate = outputMessage;
                    pc.addIceCandidate(candidate);
                }
            } else if (navigator.webkitGetUserMedia) {
                this.requestQuota = function (type: any, byteSize: number, quotaGranted: (availableBytes) => void , quotaError: (availableBytes) => void ) {
                    return window.webkitStorageInfo.requestQuota(type, byteSize, quotaGranted, quotaError);
                }
                this.blobBuilder = function () {
                    return new window.webkitBlobBuilder();
                }
                this.requestFileSystem = function (type: any, grantedBytes: any, quotaGranted: (e: any) => void, quotaError: (e: any) => void) {
                    return window.webkitRequestFileSystem(type, grantedBytes, quotaGranted, quotaError);
                };
                this.createPeerConnection = function (handleConnection: () => void ) {
                    var pc = new window.webkitRTCPeerConnection(pcConfig, pcConstraints);
                    pc.onconnection = handleConnection.bind(this);
                    return pc;
                }
                this.getUserMedia = navigator.webkitGetUserMedia.bind(navigator);
                this.attachMediaStream = function (root: any, stream: any) {
                    root.src(webkitURL.createObjectURL(stream));
                };
                this.reattachMediaStream = function (to: any, from: KnockoutObservableString) {
                    to.src(from());
                };
                this.setRemoteDescription = function (handleConnection: () => void , localId: string, remoteId: string, pc: RTCPeerConnection, message: any) {
                    var pc: RTCPeerConnection = pc;
                    var localId: string = localId;
                    var remoteId: string = remoteId;
                    var successCallback: RTCVoidCallback = function () {
                        console.log('setRemoteDescription successCallback');
                    };
                    var failureCallback: RTCVoidCallback = function () {
                        console.log('setRemoteDescription failureCallback');
                    };
                    var sessionDescription = JSON.parse(message.Message);
                    pc.setRemoteDescription(new RTCSessionDescription(sessionDescription), successCallback, failureCallback);
                };
                this.addIceCandidate = function (pc: RTCPeerConnection, message: any) {
                    var successCallback: RTCVoidCallback = function () {
                        console.log('addIceCandidate successCallback');
                    };
                    var failureCallback: RTCVoidCallback = function () {
                        console.log('addIceCandidate failureCallback');
                    };
                    var outputMessage: RTCIceCandidate = {
                        sdpMLineIndex: JSON.parse(message.Message).label,
                        candidate: JSON.parse(message.Message).candidate
                    };
                    var candidate: RTCIceCandidate = new RTCIceCandidate(outputMessage);
                    pc.addIceCandidate(candidate);
                };
            } else {
                this.webRTCSupport = false;
            }
        }
    }
}