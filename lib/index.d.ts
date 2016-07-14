import * as Promise from 'bluebird';
export interface MessengerQuickReply {
    content_type: string;
    title: string;
    payload: string;
}
export interface MessengerButton {
    type: string;
    title: string;
    payload?: string;
    url?: string;
}
export interface MessengerItem {
    title: string;
    subtitle?: string;
    image_url?: string;
    buttons?: Array<MessengerButton>;
}
export interface MessengerTextMessage {
    text: string;
}
export interface MessengerGenericPayload {
    template_type: string;
    elements: Array<MessengerItem>;
}
export interface MessengerButtonPayload {
    template_type: string;
    text: string;
    buttons: Array<MessengerButton>;
}
export interface MessengerAttachement {
    type: string;
    payload: MessengerGenericPayload | MessengerButtonPayload;
}
export interface MessengerMessage {
    attachment?: MessengerAttachement;
    text?: string;
    quick_replies?: Array<MessengerQuickReply>;
    metadata?: string;
}
export interface MessengerPayload {
    recipient: {
        id?: string;
        phone_number?: string;
    };
    message?: MessengerMessage;
    sender_action?: string;
    notification_type?: string;
}
export interface MessengerResponse {
    recipient_id: string;
    message_id: string;
}
export interface MessengerError {
    error: {
        message: string;
        type: string;
        code: Number;
        fbtrace_id: string;
    };
}
export declare class FBMessage {
    platform: FBPlatform;
    id: string;
    messageTitle: string;
    messageSubTitle: string;
    buttons: Array<MessengerButton>;
    image_url: string;
    elements: Array<MessengerItem>;
    constructor(platform: FBPlatform, id: string);
    title(title: string): this;
    subtitle(sutitle: string): this;
    postbackButton(text: string, postback: string): this;
    webButton(text: string, url: string): this;
    image(url: string): this;
    element(anElement: MessengerItem | FBElement): this;
}
export declare class FBElement extends FBMessage {
    create(): MessengerItem;
}
export declare class FBButtonMessage extends FBMessage {
    send(): Promise<MessengerResponse> | FBButtonMessage;
}
export declare class FBGenericMessage extends FBMessage {
    send(): Promise<any>;
}
export declare class FBTextMessage extends FBMessage {
    send(): Promise<any>;
}
export declare class FBButton extends FBMessage {
    create(): Array<MessengerButton>;
}
export default class FBPlatform {
    private token;
    constructor(token: string);
    private sendToFB(payload, path);
    sendMessageToFB(id: string, message: MessengerMessage): Promise<any>;
    sendGenericMessage(id: string, elements: Array<MessengerItem>): Promise<any>;
    sendButtonMessage(id: string, text: string, buttons: Array<MessengerButton>): Promise<MessengerResponse> | FBButtonMessage;
    sendTextMessage(id: string, text: string): Promise<any>;
    sendQuickReplies(id: string, text: string, quickReplies: Array<MessengerQuickReply>): Promise<any>;
    sendSenderAction(id: string, senderAction: string): Promise<any>;
    sendTypingIndicators(id: string): Promise<any>;
    sendCancelTypingIndicators(id: string): Promise<any>;
    sendReadReceipt(id: string): Promise<any>;
    private sendSettingsToFB(payload);
    setGetStartedPostback(payload: string): Promise<any>;
    setPersistentMenu(buttons: Array<MessengerButton>): Promise<any>;
    setGreetingText(text: string): Promise<any>;
    createPostbackButton(title: string, payload: string): MessengerButton;
    createWebButton(title: string, url: string): MessengerButton;
}
