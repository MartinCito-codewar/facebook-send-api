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
export default class FBMessenger {
    private token;
    constructor(token: string);
    private sendToFB(id, payload);
    sendMessageToFB(id: string, message: MessengerMessage): Promise<MessengerResponse>;
    sendGenericMessage(id: string, elements: Array<MessengerItem>): Promise<MessengerResponse>;
    sendButtonMessage(id: string, text: string, buttons: Array<MessengerButton>): Promise<MessengerResponse>;
    sendTextMessage(id: string, text: string): Promise<MessengerResponse>;
    sendQuickReplies(id: string, text: string, quickReplies: Array<MessengerQuickReply>): Promise<MessengerResponse>;
    sendSenderAction(id: string, senderAction: string): Promise<MessengerResponse>;
    sendTypingIndicators(id: string): Promise<MessengerResponse>;
    sendReadReceipt(id: string): Promise<MessengerResponse>;
    private sendSettingsToFB(payload);
    setGetStartedPostback(payload: string): Promise<any>;
    setPersistentMenu(buttons: Array<MessengerButton>): Promise<any>;
    setGreetingText(text: string): Promise<any>;
    createPostbackButton(title: string, payload: string): MessengerButton;
    createWebButton(title: string, url: string): MessengerButton;
}
