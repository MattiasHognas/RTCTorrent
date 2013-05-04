RTCTorrent
==========

This is an attempt to create a browser based "BitTorrent -like" P2P client and server.

Basic idea:
Let the server provide the visitor with a client as a webbased UI.
Let the client have all its data stored localy.
let the server only provide the client with information on peers.
Let all data communication be P2P over the webbased UI.

Techniques used:
WebRTC APIs (Such as PeerConnection, DataChannel)
http://www.w3.org/TR/webrtc/
File API (Such as Blob, FileWriter).
http://www.w3.org/TR/FileAPI/

Libraries used:
jQuery - easy access to DOM
SignalR - client-server communication
knockout.js - client UI bidnings
JSON.NET - easy serialization

The project relies on C# on the server and TypeScript on the client.

This project is under development, check back later for a working version.
