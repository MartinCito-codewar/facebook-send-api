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
    protected platform: FBPlatform;
    protected id: string;
    protected messageTitle: string;
    protected messageSubTitle: string;
    protected buttons: Array<MessengerButton>;
    protected image_url: string;
    protected elements: Array<MessengerItem>;
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
    send(): Promise<MessengerResponse>;
}
export declare class FBGenericMessage extends FBMessage {
    text(text: string): this;
    send(): Promise<MessengerResponse>;
}
export declare class FBTextMessage extends FBMessage {
    send(): Promise<MessengerResponse>;
}
export declare class FBButton extends FBMessage {
    create(): Array<MessengerButton>;
}
export declare class FBQuickReplies extends FBMessage {
    send(): Promise<MessengerResponse>;
}
export default class FBPlatform {
    protected token: string;
    protected sendInDevelopment: boolean;
    constructor(token: string);
    turnOnSendingInDevelopment(state?: boolean): this;
    private sendToFB(payload, path);
    sendMessageToFB(id: string, message: MessengerMessage): Promise<MessengerResponse>;
    createGenericMessage(id: string): FBGenericMessage;
    sendGenericMessage(id: string, elements: Array<MessengerItem>): Promise<MessengerResponse>;
    createButtonMessage(id: string): FBButtonMessage;
    sendButtonMessage(id: string, text: string, buttons: Array<MessengerButton> | FBButton): Promise<MessengerResponse>;
    createTextMessage(id: string): FBTextMessage;
    sendTextMessage(id: string, text: string): Promise<MessengerResponse>;
    createQuickReplies(id: string): FBQuickReplies;
    sendQuickReplies(id: string, text: string, quickReplies: Array<MessengerQuickReply>): Promise<MessengerResponse>;
    sendSenderAction(id: string, senderAction: string): Promise<MessengerResponse>;
    sendTypingIndicators(id: string): Promise<MessengerResponse>;
    sendCancelTypingIndicators(id: string): Promise<MessengerResponse>;
    sendReadReceipt(id: string): Promise<MessengerResponse>;
    private sendSettingsToFB(payload);
    setGetStartedPostback(payload: string): Promise<MessengerResponse>;
    setPersistentMenu(buttons: Array<MessengerButton>): Promise<MessengerResponse>;
    setGreetingText(text: string): Promise<MessengerResponse>;
    createPostbackButton(title: string, payload: string): MessengerButton;
    createWebButton(title: string, url: string): MessengerButton;
    createQuickReply(title: string, payload: string): MessengerQuickReply;
}
