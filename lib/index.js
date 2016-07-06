"use strict";
var Promise = require('bluebird');
var rp = require('request-promise');
var FBGraphURL = 'https://graph.facebook.com/v2.6/me';
var FBMessenger = (function () {
    function FBMessenger(token) {
        this.token = token;
    }
    FBMessenger.prototype.sendToFB = function (id, payload) {
        if (process.env.FYND_ENV === 'local') {
            console.log("[" + id + "] " + JSON.stringify(payload));
            return Promise.resolve(null);
        }
        var requstPayload = {
            url: FBGraphURL + "/messages",
            qs: { access_token: this.token },
            method: 'POST',
            json: payload,
        };
        return rp(requstPayload)
            .then(function (body) {
            if (body.error) {
                console.error('Error (messageData):', payload, body.error);
                throw new Error(body.error);
            }
            return body;
        });
    };
    FBMessenger.prototype.sendMessageToFB = function (id, message) {
        var mesengerPayload = {
            recipient: { id: id },
            message: message,
        };
        return this.sendToFB(id, mesengerPayload);
    };
    FBMessenger.prototype.sendGenericMessage = function (id, elements) {
        if (elements.length > 10) {
            throw new Error('Too many elements');
        }
        var messageData = {
            'attachment': {
                'type': 'template',
                'payload': {
                    'template_type': 'generic',
                    elements: elements,
                },
            },
        };
        return this.sendMessageToFB(id, messageData);
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
        return this.sendMessageToFB(id, messageData);
    };
    FBMessenger.prototype.sendTextMessage = function (id, text) {
        var messageData = {
            text: text,
        };
        return this.sendMessageToFB(id, messageData);
    };
    FBMessenger.prototype.sendQuickReplies = function (id, text, quickReplies) {
        if (quickReplies.length > 10) {
            throw new Error('Quick replies limited to 10');
        }
        var messageData = {
            text: text,
            quick_replies: quickReplies,
        };
        return this.sendMessageToFB(id, messageData);
    };
    FBMessenger.prototype.sendSenderAction = function (id, senderAction) {
        var payload = {
            recipient: {
                id: id,
            },
            sender_action: senderAction,
        };
        return this.sendToFB(id, payload);
    };
    FBMessenger.prototype.sendTypingIndicators = function (id) {
        return this.sendSenderAction(id, 'typing_on');
    };
    FBMessenger.prototype.sendCancelTypingIndicators = function (id) {
        return this.sendSenderAction(id, 'typing_off');
    };
    FBMessenger.prototype.sendReadReceipt = function (id) {
        return this.sendSenderAction(id, 'mark_seen');
    };
    FBMessenger.prototype.sendSettingsToFB = function (payload) {
        var requstPayload = {
            url: FBGraphURL + "/thread_settings",
            qs: { access_token: this.token },
            method: 'POST',
            json: payload,
        };
        return rp(requstPayload)
            .then(function (body) {
            if (body.error) {
                console.error('Error (messageData):', payload, body.error);
                throw new Error(body.error);
            }
            return body;
        });
    };
    FBMessenger.prototype.setGetStartedPostback = function (payload) {
        var messengerpayload = {
            setting_type: 'call_to_actions',
            thread_state: 'new_thread',
            call_to_actions: [{
                    payload: payload,
                }]
        };
        return this.sendSettingsToFB(messengerpayload);
    };
    FBMessenger.prototype.setPersistentMenu = function (buttons) {
        var messengerPayload = {
            setting_type: 'call_to_actions',
            thread_state: 'existing_thread',
            call_to_actions: buttons,
        };
        return this.sendSettingsToFB(messengerPayload);
    };
    FBMessenger.prototype.setGreetingText = function (text) {
        var messengerPayload = {
            setting_type: 'greeting',
            greeting: {
                text: text,
            },
        };
        return this.sendSettingsToFB(messengerPayload);
    };
    FBMessenger.prototype.createPostbackButton = function (title, payload) {
        var button = {
            type: 'postback',
            title: title,
            payload: payload,
        };
        return button;
    };
    FBMessenger.prototype.createWebButton = function (title, url) {
        var button = {
            type: 'web_url',
            title: title,
            url: url,
        };
        return button;
    };
    return FBMessenger;
}());
Object.defineProperty(exports, "__esModule", { value: true });
exports.default = FBMessenger;
