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
}
export interface MessengerPayload {
    recipient: {
        id: string;
    };
    message?: MessengerMessage;
    sender_action?: string;
}
export interface MessengerResponse {
    recipient_id: string;
    message_id: string;
}
export default class FBMessenger {
    private token;
    constructor(token: string);
    sendToFB(id: string, payload: MessengerPayload): Promise<MessengerResponse>;
    sendMessageToFB(id: string, message: MessengerMessage): Promise<MessengerResponse>;
    sendGenericMessage(id: string, elements: Array<MessengerItem>): Promise<MessengerResponse>;
    sendButtonMessage(id: string, text: string, buttons: Array<MessengerButton>): Promise<MessengerResponse>;
    sendTextMessage(id: string, text: string): Promise<MessengerResponse>;
    sendQuickReplies(id: string, text: string, quickReplies: Array<MessengerQuickReply>): Promise<MessengerResponse>;
    sendSenderAction(id: string, senderAction: string): Promise<MessengerResponse>;
}
