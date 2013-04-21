/// <reference path="Interfaces.d.ts" />

module RtcTorrent {
    'use strict';
    export class Speech {
        public textSource: (str: string) => void;
        public textDone: () => void;
        static langs = 'sv-SE';
        //static langs: any = [['Afrikaans', ['af-ZA', '']],
        //        ['Bahasa Indonesia', ['id-ID', '']],
        //        ['Bahasa Melayu', ['ms-MY', '']],
        //        ['Català', ['ca-ES', '']],
        //        ['Čeština', ['cs-CZ', '']],
        //        ['Deutsch', ['de-DE', '']],
        //        ['English', ['en-AU', 'Australia'],
        //            ['en-CA', 'Canada'],
        //            ['en-IN', 'India'],
        //            ['en-NZ', 'New Zealand'],
        //            ['en-ZA', 'South Africa'],
        //            ['en-GB', 'United Kingdom'],
        //            ['en-US', 'United States']],
        //        ['Español', ['es-AR', 'Argentina'],
        //            ['es-BO', 'Bolivia'],
        //            ['es-CL', 'Chile'],
        //            ['es-CO', 'Colombia'],
        //            ['es-CR', 'Costa Rica'],
        //            ['es-EC', 'Ecuador'],
        //            ['es-SV', 'El Salvador'],
        //            ['es-ES', 'España'],
        //            ['es-US', 'Estados Unidos'],
        //            ['es-GT', 'Guatemala'],
        //            ['es-HN', 'Honduras'],
        //            ['es-MX', 'México'],
        //            ['es-NI', 'Nicaragua'],
        //            ['es-PA', 'Panamá'],
        //            ['es-PY', 'Paraguay'],
        //            ['es-PE', 'Perú'],
        //            ['es-PR', 'Puerto Rico'],
        //            ['es-DO', 'República Dominicana'],
        //            ['es-UY', 'Uruguay'],
        //            ['es-VE', 'Venezuela']],
        //        ['Euskara', ['eu-ES', '']],
        //        ['Français', ['fr-FR', '']],
        //        ['Galego', ['gl-ES', '']],
        //        ['Hrvatski', ['hr_HR', '']],
        //        ['IsiZulu', ['zu-ZA', '']],
        //        ['Íslenska', ['is-IS', '']],
        //        ['Italiano', ['it-IT', 'Italia'],
        //            ['it-CH', 'Svizzera']],
        //        ['Magyar', ['hu-HU', '']],
        //        ['Nederlands', ['nl-NL', '']],
        //        ['Norsk bokmål', ['nb-NO', '']],
        //        ['Polski', ['pl-PL', '']],
        //        ['Português', ['pt-BR', 'Brasil'],
        //            ['pt-PT', 'Portugal']],
        //        ['Română', ['ro-RO', '']],
        //        ['Slovenčina', ['sk-SK', '']],
        //        ['Suomi', ['fi-FI', '']],
        //        ['Svenska', ['sv-SE', '']],
        //        ['Türkçe', ['tr-TR', '']],
        //        ['български', ['bg-BG', '']],
        //        ['Pусский', ['ru-RU', '']],
        //        ['Српски', ['sr-RS', '']],
        //        ['한국어', ['ko-KR', '']],
        //        ['中文', ['cmn-Hans-CN', '普通话 (中国大陆)'],
        //            ['cmn-Hans-HK', '普通话 (香港)'],
        //            ['cmn-Hant-TW', '中文 (台灣)'],
        //            ['yue-Hant-HK', '粵語 (香港)']],
        //        ['日本語', ['ja-JP', '']],
        //        ['Lingua latīna', ['la', '']]];
        private finalTranscript = '';
        private recognizing = false;
        private ignoreOnend;
        //var startTimestamp;
        private recognition;
        private twoLine = /\n\n/g;
        private oneLine = /\n/g;
        private firstChar = /\S/;
        constructor() {
            if ('webkitSpeechRecognition' in window) {
                this.createApi();
            }
        }
        createApi() {
            this.recognition = new window.webkitSpeechRecognition();
            this.recognition.continuous = true;
            this.recognition.interimResults = true;
            this.recognition.onstart = function () {
                this.recognizing = true;
            };
            this.recognition.onerror = function (event) {
                if (event.error == 'no-speech') {
                    // no speech
                    this.ignoreOnend = true;
                }
                if (event.error == 'audio-capture') {
                    // no microphone
                    this.ignoreOnend = true;
                }
                if (event.error == 'not-allowed') {
                    // blocked or denied
                    this.ignoreOnend = true;
                    //setTimeout(this.start(), 1000);
                }
            };
            this.recognition.onend = function () {
                this.recognizing = false;
                if (this.ignoreOnend) {
                    return;
                }
                if (!this.finalTranscript) {
                    return;
                }
            };
            this.recognition.onresult = function (event) {
                var interimTranscript = '';
                if (typeof (event.results) == 'undefined') {
                    this.recognition.onend = null;
                    this.recognition.stop();
                    return;
                }
                for (var i = event.resultIndex; i < event.results.length; ++i) {
                    if (event.results[i].isFinal) {
                        interimTranscript = '';
                        this.finalTranscript = event.results[i][0].transcript;
                    } else {
                        this.finalTranscript = '';
                        interimTranscript = event.results[i][0].transcript;
                    }
                }
                this.finalTranscript = this.capitalize(this.finalTranscript);
                if (this.finalTranscript == '') {
                    if (interimTranscript == '')
                        return;
                    this.textSource(this.linebreak(interimTranscript));
                } else {
                    this.textSource(this.linebreak(this.finalTranscript));
                    this.textDone();
                }
            };
        }
        linebreak(s) {
            return s.replace(this.twoLine, '<p></p>').replace(this.oneLine, '<br>');
        }
        capitalize(s) {
            return s.replace(this.firstChar, function (m) { return m.toUpperCase(); });
        }
        stop() {
            if (this.recognizing) {
                this.recognizing = false;
                this.recognition.stop();
            }
        }
        start(lang) {
            if (this.recognizing) {
                this.recognition.stop();
                return;
            }
            this.finalTranscript = '';
            if (this.recognition != null) {
                this.createApi();
                this.recognition.lang = lang;
                this.recognition.start();
            }
            this.ignoreOnend = false;
            this.textSource('');
        }
    }
}