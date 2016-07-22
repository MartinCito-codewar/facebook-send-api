"use strict";
var __extends = (this && this.__extends) || function (d, b) {
    for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p];
    function __() { this.constructor = d; }
    d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
};
var Promise = require('bluebird');
var rp = require('request-promise');
var FBGraphURL = 'https://graph.facebook.com/v2.6/me';
var FBMessage = (function () {
    function FBMessage(platform, id) {
        this.platform = platform;
        this.id = id;
        this.buttons = [];
        this.elements = [];
        return this;
    }
    FBMessage.prototype.title = function (title) {
        this.messageTitle = title;
        return this;
    };
    FBMessage.prototype.text = function (text) {
        this.messageTitle = text;
        return this;
    };
    FBMessage.prototype.subtitle = function (sutitle) {
        this.messageSubTitle = sutitle;
        return this;
    };
    FBMessage.prototype.postbackButton = function (text, postback) {
        this.buttons = this.buttons.concat(this.platform.createPostbackButton(text, postback));
        return this;
    };
    FBMessage.prototype.webButton = function (text, url) {
        this.buttons = this.buttons.concat(this.platform.createWebButton(text, url));
        return this;
    };
    FBMessage.prototype.image = function (url) {
        this.image_url = url;
        return this;
    };
    FBMessage.prototype.element = function (anElement) {
        var theElement = anElement;
        if (typeof anElement === 'FBElement') {
            var elementAsClass = anElement;
            theElement = elementAsClass.create();
        }
        this.elements = this.elements.concat(theElement);
        return this;
    };
    return FBMessage;
}());
exports.FBMessage = FBMessage;
var FBElement = (function (_super) {
    __extends(FBElement, _super);
    function FBElement(platform) {
        if (platform === void 0) { platform = new FBPlatform(null); }
        _super.call(this, platform, null);
        return this;
    }
    FBElement.prototype.create = function () {
        var element = {};
        if (this.messageTitle)
            element.title = this.messageTitle;
        if (this.messageSubTitle)
            element.subtitle = this.messageSubTitle;
        if (this.image_url)
            element.image_url = this.image_url;
        if (this.buttons.length > 0)
            element.buttons = this.buttons;
        return element;
    };
    return FBElement;
}(FBMessage));
exports.FBElement = FBElement;
var FBButtonMessage = (function (_super) {
    __extends(FBButtonMessage, _super);
    function FBButtonMessage() {
        _super.apply(this, arguments);
    }
    FBButtonMessage.prototype.send = function () {
        return this.platform.sendButtonMessage(this.id, this.messageTitle, this.buttons);
    };
    return FBButtonMessage;
}(FBMessage));
exports.FBButtonMessage = FBButtonMessage;
var FBGenericMessage = (function (_super) {
    __extends(FBGenericMessage, _super);
    function FBGenericMessage() {
        _super.apply(this, arguments);
    }
    FBGenericMessage.prototype.send = function () {
        return this.platform.sendGenericMessage(this.id, this.elements);
    };
    return FBGenericMessage;
}(FBMessage));
exports.FBGenericMessage = FBGenericMessage;
var FBTextMessage = (function (_super) {
    __extends(FBTextMessage, _super);
    function FBTextMessage() {
        _super.apply(this, arguments);
    }
    FBTextMessage.prototype.send = function () {
        return this.platform.sendTextMessage(this.id, this.messageTitle);
    };
    return FBTextMessage;
}(FBMessage));
exports.FBTextMessage = FBTextMessage;
var FBButton = (function (_super) {
    __extends(FBButton, _super);
    function FBButton() {
        _super.apply(this, arguments);
    }
    FBButton.prototype.create = function () {
        return this.buttons;
    };
    return FBButton;
}(FBMessage));
exports.FBButton = FBButton;
var FBQuickReplies = (function (_super) {
    __extends(FBQuickReplies, _super);
    function FBQuickReplies() {
        _super.apply(this, arguments);
    }
    FBQuickReplies.prototype.send = function () {
        var _this = this;
        var postbackButtons = this.buttons.filter(function (button) { return button.type === 'postback'; });
        var quickReplies = postbackButtons.map(function (button) {
            return _this.platform.createQuickReply(button.title, button.payload);
        });
        return this.platform.sendQuickReplies(this.id, this.messageTitle, quickReplies);
    };
    return FBQuickReplies;
}(FBMessage));
exports.FBQuickReplies = FBQuickReplies;
var FBPlatform = (function () {
    function FBPlatform(token) {
        this.token = token;
        this.sendInDevelopment = false;
        this.validateLimits = false;
    }
    FBPlatform.prototype.turnOnSendingInDevelopment = function (state) {
        if (state === void 0) { state = true; }
        this.sendInDevelopment = state;
        return this;
    };
    FBPlatform.prototype.turnOnValidation = function (state) {
        if (state === void 0) { state = true; }
        this.validateLimits = state;
        return this;
    };
    FBPlatform.prototype.sendToFB = function (payload, path) {
        if (process.env.NODE_ENV === 'development' && this.sendInDevelopment === false) {
            console.log("" + JSON.stringify(payload));
            return Promise.resolve({
                recipient_id: '0',
                message_id: '0',
            });
        }
        var requstPayload = {
            url: "" + FBGraphURL + path,
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
    FBPlatform.prototype.sendMessageToFB = function (id, message) {
        var mesengerPayload = {
            recipient: { id: id },
            message: message,
        };
        return this.sendToFB(mesengerPayload, '/messages');
    };
    FBPlatform.prototype.createGenericMessage = function (id) {
        return new FBGenericMessage(this, id);
    };
    FBPlatform.prototype.sendGenericMessage = function (id, elements) {
        var maxElements = 10;
        if (elements.length > maxElements && this.validateLimits) {
            throw new Error("Sending too many elements, max is " + maxElements + ", tried sending " + elements.length);
        }
        //title has length max of 80
        //subtitle has length max of 80
        //buttons is limited to 3
        var messageData = {
            'attachment': {
                'type': 'template',
                'payload': {
                    'template_type': 'generic',
                    elements: elements.slice(0, maxElements),
                },
            },
        };
        return this.sendMessageToFB(id, messageData);
    };
    FBPlatform.prototype.createButtonMessage = function (id) {
        return new FBButtonMessage(this, id);
    };
    FBPlatform.prototype.sendButtonMessage = function (id, text, buttons) {
        var theButtons = null;
        console.log('buttons:', typeof buttons);
        if (typeof buttons === typeof FBButton) {
            var asAButton = buttons;
            theButtons = asAButton.create();
        }
        else {
            theButtons = buttons;
        }
        var maxButtons = 3;
        if (theButtons.length > maxButtons && this.validateLimits) {
            throw new Error("Sending too many buttons, max is " + maxButtons + ", tried sending " + theButtons.length);
        }
        var messageData = {
            'attachment': {
                'type': 'template',
                'payload': {
                    'template_type': 'button',
                    text: text,
                    buttons: theButtons.slice(0, maxButtons),
                },
            },
        };
        return this.sendMessageToFB(id, messageData);
    };
    FBPlatform.prototype.createTextMessage = function (id) {
        return new FBTextMessage(this, id);
    };
    FBPlatform.prototype.sendTextMessage = function (id, text) {
        var messageData = {
            text: text,
        };
        return this.sendMessageToFB(id, messageData);
    };
    FBPlatform.prototype.createQuickReplies = function (id) {
        return new FBQuickReplies(this, id);
    };
    FBPlatform.prototype.sendQuickReplies = function (id, text, quickReplies) {
        var maxQuickReplies = 10;
        if (quickReplies.length > maxQuickReplies && this.validateLimits) {
            throw new Error("Quick replies limited to " + maxQuickReplies + ", tried sending " + quickReplies.length);
        }
        var messageData = {
            text: text,
            quick_replies: quickReplies.slice(0, maxQuickReplies),
        };
        return this.sendMessageToFB(id, messageData);
    };
    FBPlatform.prototype.sendSenderAction = function (id, senderAction) {
        var payload = {
            recipient: {
                id: id,
            },
            sender_action: senderAction,
        };
        return this.sendToFB(payload, '/messages');
    };
    FBPlatform.prototype.sendTypingIndicators = function (id) {
        return this.sendSenderAction(id, 'typing_on');
    };
    FBPlatform.prototype.sendCancelTypingIndicators = function (id) {
        return this.sendSenderAction(id, 'typing_off');
    };
    FBPlatform.prototype.sendReadReceipt = function (id) {
        return this.sendSenderAction(id, 'mark_seen');
    };
    FBPlatform.prototype.sendSettingsToFB = function (payload) {
        return this.sendToFB(payload, '/thread_settings');
    };
    FBPlatform.prototype.setGetStartedPostback = function (payload) {
        var messengerpayload = {
            setting_type: 'call_to_actions',
            thread_state: 'new_thread',
            call_to_actions: [{
                    payload: payload,
                }]
        };
        return this.sendSettingsToFB(messengerpayload);
    };
    FBPlatform.prototype.setPersistentMenu = function (buttons) {
        var messengerPayload = {
            setting_type: 'call_to_actions',
            thread_state: 'existing_thread',
            call_to_actions: buttons,
        };
        return this.sendSettingsToFB(messengerPayload);
    };
    FBPlatform.prototype.setGreetingText = function (text) {
        var messengerPayload = {
            setting_type: 'greeting',
            greeting: {
                text: text,
            },
        };
        return this.sendSettingsToFB(messengerPayload);
    };
    FBPlatform.prototype.createPostbackButton = function (title, payload) {
        var button = {
            type: 'postback',
            title: title,
            payload: payload,
        };
        return button;
    };
    FBPlatform.prototype.createWebButton = function (title, url) {
        var button = {
            type: 'web_url',
            title: title,
            url: url,
        };
        return button;
    };
    FBPlatform.prototype.createQuickReply = function (title, payload) {
        var button = {
            content_type: 'text',
            title: title,
            payload: payload,
        };
        return button;
    };
    return FBPlatform;
}());
Object.defineProperty(exports, "__esModule", { value: true });
exports.default = FBPlatform;
