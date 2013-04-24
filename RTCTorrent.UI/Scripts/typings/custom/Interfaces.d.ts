/// <reference path='../webrtc/RTCPeerConnection.d.ts' />
/// <reference path='../knockout/knockout.d.ts' />

declare var Bencode: any;

interface Window {
    PERSISTENT: any;
    webkitStorageInfo: storageInfo;
    webkitRequestFileSystem: (type: any, grantedBytes: any, quotaGranted: (e: any) => void , quotaError: (e: any) => void ) => void;
    mozRequestFileSystem: (type: any, grantedBytes: any, quotaGranted: (e: any) => void , quotaError: (e: any) => void ) => void;
}

interface ProgressEvent {
    readyState: number;
}

interface storageInfo {
    requestQuota: (type: any, byteSize: any, quotaGranted: (e: any) => void , quotaError: (e: any) => void ) => void;
}

declare var FileError: {
    QUOTA_EXCEEDED_ERR: any;
    NOT_FOUND_ERR: any;
    SECURITY_ERR: any;
    INVALID_MODIFICATION_ERR: any;
    INVALID_STATE_ERR: any;
}

interface SignalR {
    torrentHub: any;
}

interface Navigator {
    webkitGetUserMedia: any;
    mozGetUserMedia: any;
}

interface Window {
    webkitRTCPeerConnection: (pcConfig: RTCPeerConnectionConfig, pcConstraints: MediaConstraints) => any;
    mozRTCPeerConnection: (pcConfig: RTCPeerConnectionConfig, pcConstraints: MediaConstraints) => any;
    webkitSpeechRecognition(): any;
}

interface RTCPeerConnection {
    connectDataConnection: (localId: string, remoteId: string) => void;
}

interface RTCPeerConnection {
    onconnection: () => void;
}

interface IConfiguration {
    requestFileSystem: (type: any, grantedBytes: any, quotaGranted: (e: any) => void, quotaError: (e: any) => void) => void;
    createPeerConnection: (handleConnection: () => void ) => RTCPeerConnection;
    getUserMedia: (constraints: MediaStreamConstraints, successCallback: (stream: LocalMediaStream) => void , errorCallback: (error: Error) => void ) => any;
    attachMediaStream: (root: any, stream: any) => void;
    reattachMediaStream: (to: any, from: KnockoutObservableString) => void;
    webRTCSupport: bool;
    setRemoteDescription: (handleConnection: () => void , localId: string, remoteId: string, pc: RTCPeerConnection, message: any) => void;
    addIceCandidate: (pc: RTCPeerConnection, message: any) => void;
    pieceSize: number;
}

interface IClient extends IUser {
    sessionReady: KnockoutObservableBool;
    torrents: KnockoutObservableArray;
    configuration: IConfiguration;
    socket: any;
    findOrCreatePeer: (id: string, torrentId: string) => IPeer;
    removePeer: (id: string, torrentId: string) => void;
    findTorrent: (torrentId: string) => ITorrent;
}

interface IUser {
    id: KnockoutObservableString;
}

interface ITorrent {
    client: IClient;
    id: KnockoutObservableString;
    name: KnockoutObservableString;
    size: KnockoutObservableNumber;
    peers: KnockoutObservableArray;
    files: KnockoutObservableArray;
    readyToServe: KnockoutObservableBool;
    fs: any;
    createPeer: (id: string) => void;
    findPeer: (id: string) => IPeer;
    removePeer: (id: string) => void;
}

interface IPeer extends IUser {
    channel: RTCDataChannel;
    channelOpened: bool;
    torrent: ITorrent;
    onJsepOffer: (message: any) => void;
    onJsepAnswer: (message: any) => void;
    onJsepCandidate: (message: any) => void;
    start: () => void;
    answer: () => void;
}

interface IFileContent {
}

interface IFilePiece {
}