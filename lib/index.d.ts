import * as Promise from 'bluebird';
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
}
export interface MessengerResponse {
    recipient_id: string;
    message_id: string;
}
export default class FBMessenger {
    private token;
    constructor(token: string);
    sendToFB(id: string, message: MessengerMessage): Promise<MessengerResponse>;
    sendGenericMessage(id: string, elements: Array<MessengerItem>): Promise<MessengerResponse>;
    sendButtonMessage(id: string, text: string, buttons: Array<MessengerButton>): Promise<MessengerResponse>;
    sendTextMessage(id: string, text: string): Promise<MessengerResponse>;
}
