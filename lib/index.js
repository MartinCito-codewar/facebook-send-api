"use strict";
var Promise = require('bluebird');
var rp = require('request-promise');
var FBMessenger = (function () {
    function FBMessenger(token) {
        this.token = token;
    }
    FBMessenger.prototype.sendToFB = function (id, message) {
        if (process.env.FYND_ENV === 'local') {
            console.log("[" + id + "] " + JSON.stringify(message));
            return Promise.resolve(null);
        }
        var payload = {
            url: process.env.FB_GRAPHURL,
            qs: { access_token: this.token },
            method: 'POST',
            json: {
                recipient: { id: id },
                message: message,
            },
        };
        return rp(payload)
            .then(function (body) {
            if (body.error) {
                console.error('Error (messageData):', message, body.error);
                throw new Error(body.error);
            }
            return body;
        });
    };
    FBMessenger.prototype.sendGenericMessage = function (id, elements) {
        var messageData = {
            'attachment': {
                'type': 'template',
                'payload': {
                    'template_type': 'generic',
                    elements: elements,
                },
            },
        };
        return this.sendToFB(id, messageData);
    };
    FBMessenger.prototype.sendButtonMessage = function (id, text, buttons) {
        var messageData = {
            'attachment': {
                'type': 'template',
                'payload': {
                    'template_type': 'button',
                    text: text,
                    buttons: buttons,
                },
            },
        };
        return this.sendToFB(id, messageData);
    };
    FBMessenger.prototype.sendTextMessage = function (id, text) {
        var messageData = {
            text: text,
        };
        return this.sendToFB(id, messageData);
    };
    return FBMessenger;
}());
Object.defineProperty(exports, "__esModule", { value: true });
exports.default = FBMessenger;
