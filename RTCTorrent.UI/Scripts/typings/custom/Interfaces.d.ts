/// <reference path='../webrtc/RTCPeerConnection.d.ts' />
/// <reference path='../knockout/knockout.d.ts' />

declare var Bencode: any;

interface Window {
    PERSISTENT: any;
    mozRequestFileSystem: (type: any, grantedBytes: any, quotaGranted: (e: any) => void , quotaError: (e: any) => void ) => void;
    mozBlobBuilder: () => any;
    mozStorageInfo: storageInfo;
    webkitStorageInfo: storageInfo;
    webkitRequestFileSystem: (type: any, grantedBytes: any, quotaGranted: (e: any) => void , quotaError: (e: any) => void ) => void;
    webkitBlobBuilder: () => any;
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
    mozRTCPeerConnection: (pcConfig: RTCPeerConnectionConfig, pcConstraints: MediaConstraints) => any;
    webkitRTCPeerConnection: (pcConfig: RTCPeerConnectionConfig, pcConstraints: MediaConstraints) => any;
    webkitSpeechRecognition(): any;
}

interface RTCPeerConnection {
    connectDataConnection: (localId: string, remoteId: string) => void;
}

interface RTCPeerConnection {
    onconnection: () => void;
}

interface IConfiguration {
    blobBuilder: () => any;
    requestFileSystem: (type: any, grantedBytes: any, quotaGranted: (e: any) => void, quotaError: (e: any) => void) => void;
    createPeerConnection: (handleConnection: () => void ) => RTCPeerConnection;
    getUserMedia: (constraints: MediaStreamConstraints, successCallback: (stream: LocalMediaStream) => void , errorCallback: (error: Error) => void ) => any;
    attachMediaStream: (root: any, stream: any) => void;
    reattachMediaStream: (to: any, from: KnockoutObservableString) => void;
    webRTCSupport: bool;
    setRemoteDescription: (handleConnection: () => void , localId: string, remoteId: string, pc: RTCPeerConnection, message: any) => void;
    addIceCandidate: (pc: RTCPeerConnection, message: any) => void;
    requestQuota: (type: any, grantedBytes: any, quotaGranted: (e: any) => void , quotaError: (e: any) => void ) => void;
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

interface ITrackerTorrent {
    id: KnockoutObservableString;
    name: KnockoutObservableString;
    size: KnockoutObservableNumber;
    seeders: KnockoutObservableNumber;
    leechers: KnockoutObservableNumber;
    files: KnockoutObservableArray;
}

interface ITrackerTorrentFile {
    fullPath: KnockoutObservableString;
    size: KnockoutObservableNumber;
    pieces: KnockoutObservableArray;
}

interface ITorrent {
    client: IClient;
    trackerTorrent: ITrackerTorrent;
    peers: KnockoutObservableArray;
    files: KnockoutObservableArray;
    readyToServe: KnockoutObservableBool;
    fs: any;
    quotaError: (e: any) => void;
    createPeer: (id: string) => void;
    findPeer: (id: string) => IPeer;
    removePeer: (id: string) => void;
}

interface IPeer extends IUser {
    channel: RTCDataChannel;
    channelOpened: bool;
    mediaConstraints: MediaConstraints;
    torrent: ITorrent;
    pc: RTCPeerConnection;
    onJsepOffer: (message: any) => void;
    onJsepAnswer: (message: any) => void;
    onJsepCandidate: (message: any) => void;
    start: () => void;
    answer: () => void;
}

interface IFileContent {
    torrent: ITorrent;
    reader: any;
    fullPath: string;
    size: number;
    pieces: number[];
    index: () => void;
    loadPieces: (file: File) => void;
    requestPiece: (startByte: number, stopByte: number) => void;
    announcePiece: (startByte: number, stopByte: number) => void;
    readPiece: (startByte: string, stopByte: number, result: (result: ArrayBuffer) => void) => void;
    writePiece: (data: ArrayBuffer, startByte: number) => void;
    write: (data: ArrayBuffer, startByte: number, fileEntry: any) => void;
}