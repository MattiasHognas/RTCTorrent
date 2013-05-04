# RTCTorrent

This is an attempt to create a browser based "BitTorrent -like" P2P client and server.

## Basic idea
* Let the server provide the visitor with a webbased client.
* Let the client have all its data stored localy.
* let the server only provide the client with information on peers.
* Let the client handle all data communication over P2P.

## Main techniques used
- [WebRTC APIs (Such as PeerConnection, DataChannel)](http://www.w3.org/TR/webrtc/)
- [File APIs (Such as Blob, FileWriter)](http://www.w3.org/TR/FileAPI/)

## Main libraries used
- [jQuery (easy access to DOM)](http://jquery.com/)
- [SignalR (client-server communication](http://signalr.net/)
- [knockout.js (client UI bidnings](http://knockoutjs.com/)

The project relies on C# on the server and TypeScript on the client.

### This project is under development, check back later for a working version.
