var RtcTorrent;
(function (RtcTorrent) {
    'use strict';
    var Speech = (function () {
        function Speech() {
            this.finalTranscript = '';
            this.recognizing = false;
            this.twoLine = /\n\n/g;
            this.oneLine = /\n/g;
            this.firstChar = /\S/;
            if('webkitSpeechRecognition' in window) {
                this.createApi();
            }
        }
        Speech.langs = 'sv-SE';
        Speech.prototype.createApi = function () {
            this.recognition = new window.webkitSpeechRecognition();
            this.recognition.continuous = true;
            this.recognition.interimResults = true;
            this.recognition.onstart = function () {
                this.recognizing = true;
            };
            this.recognition.onerror = function (event) {
                if(event.error == 'no-speech') {
                    this.ignoreOnend = true;
                }
                if(event.error == 'audio-capture') {
                    this.ignoreOnend = true;
                }
                if(event.error == 'not-allowed') {
                    this.ignoreOnend = true;
                }
            };
            this.recognition.onend = function () {
                this.recognizing = false;
                if(this.ignoreOnend) {
                    return;
                }
                if(!this.finalTranscript) {
                    return;
                }
            };
            this.recognition.onresult = function (event) {
                var interimTranscript = '';
                if(typeof (event.results) == 'undefined') {
                    this.recognition.onend = null;
                    this.recognition.stop();
                    return;
                }
                for(var i = event.resultIndex; i < event.results.length; ++i) {
                    if(event.results[i].isFinal) {
                        interimTranscript = '';
                        this.finalTranscript = event.results[i][0].transcript;
                    } else {
                        this.finalTranscript = '';
                        interimTranscript = event.results[i][0].transcript;
                    }
                }
                this.finalTranscript = this.capitalize(this.finalTranscript);
                if(this.finalTranscript == '') {
                    if(interimTranscript == '') {
                        return;
                    }
                    this.textSource(this.linebreak(interimTranscript));
                } else {
                    this.textSource(this.linebreak(this.finalTranscript));
                    this.textDone();
                }
            };
        };
        Speech.prototype.linebreak = function (s) {
            return s.replace(this.twoLine, '<p></p>').replace(this.oneLine, '<br>');
        };
        Speech.prototype.capitalize = function (s) {
            return s.replace(this.firstChar, function (m) {
                return m.toUpperCase();
            });
        };
        Speech.prototype.stop = function () {
            if(this.recognizing) {
                this.recognizing = false;
                this.recognition.stop();
            }
        };
        Speech.prototype.start = function (lang) {
            if(this.recognizing) {
                this.recognition.stop();
                return;
            }
            this.finalTranscript = '';
            if(this.recognition != null) {
                this.createApi();
                this.recognition.lang = lang;
                this.recognition.start();
            }
            this.ignoreOnend = false;
            this.textSource('');
        };
        return Speech;
    })();
    RtcTorrent.Speech = Speech;    
})(RtcTorrent || (RtcTorrent = {}));
