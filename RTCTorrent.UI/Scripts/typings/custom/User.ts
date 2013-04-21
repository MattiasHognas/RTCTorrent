/// <reference path='Interfaces.d.ts' />
/// <reference path='Client.ts' />
/// <reference path='FileContent.ts' />

var Bencode: any;

module RtcTorrent {
    'use strict';
    export class User implements IUser {
        public id: KnockoutObservableString;
        constructor(id?: string) {
            var _this = this;
            this.id = ko.observable(id);
        }
    }
}