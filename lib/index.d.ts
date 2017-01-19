/// <reference types="bluebird" />
import * as Promise from 'bluebird';
import * as FBTypes from 'facebook-sendapi-types';
export declare class FBMessage {
    protected platform: FBPlatform;
    protected id: string;
    protected messageTitle: string;
    protected messageSubTitle: string;
    protected buttons: Array<FBTypes.MessengerButton>;
    protected image_url: string;
    protected elements: Array<FBTypes.MessengerItem>;
    constructor(platform: FBPlatform, id: string);
    title(title: string): this;
    text(text: string): this;
    subtitle(sutitle: string): this;
    postbackButton(text: string, postback: string): this;
    webButton(text: string, url: string): this;
    image(url: string): this;
    element(anElement: FBTypes.MessengerItem | FBElement): this;
}
export declare class FBElement extends FBMessage {
    constructor(platform?: FBPlatform);
    create(): FBTypes.MessengerItem;
}
export declare class FBButtonMessage extends FBMessage {
    send(): Promise<FBTypes.MessengerResponse>;
}
export declare class FBGenericMessage extends FBMessage {
    send(): Promise<FBTypes.MessengerResponse>;
}
export declare class FBTextMessage extends FBMessage {
    send(): Promise<FBTypes.MessengerResponse>;
    export(): FBTypes.MessengerPayload;
}
export declare class FBButton extends FBMessage {
    create(): Array<FBTypes.MessengerButton>;
}
export declare class FBQuickReplies extends FBMessage {
    send(): Promise<FBTypes.MessengerResponse>;
}
export declare type LoggerFunction = (payload: FBTypes.MessengerPayload) => Promise<void>;
export default class FBPlatform {
    protected token: string;
    protected sendInDevelopment: boolean;
    protected validateLimits: boolean;
    maxElements: number;
    maxButtons: number;
    maxQuickReplies: number;
    loggingFunction: LoggerFunction;
    private FBGraphURL;
    constructor(token: string, graphURL?: string);
    setGraphURL(graphURL: string): void;
    turnOnSendingInDevelopment(state?: boolean): this;
    turnOnValidation(state?: boolean): this;
    wrapMessage(id: string, message: FBTypes.MessengerMessage, notification_type: FBTypes.NotificationType): FBTypes.MessengerPayload;
    private sendToFB(payload, path);
    sendMessageToFB(id: string, message: FBTypes.MessengerMessage, notification_type?: FBTypes.NotificationType): Promise<FBTypes.MessengerResponse>;
    createGenericMessage(id: string): FBGenericMessage;
    static exportGenericMessage(elements: Array<FBTypes.MessengerItem>, maxElements?: number): FBTypes.MessengerMessage;
    sendGenericMessage(id: string, elements: Array<FBTypes.MessengerItem>): Promise<FBTypes.MessengerResponse>;
    createButtonMessage(id: string): FBButtonMessage;
    static exportButtonMessage(text: string, buttons: Array<FBTypes.MessengerButton> | FBButton, maxButtons?: number): FBTypes.MessengerMessage;
    sendButtonMessage(id: string, text: string, buttons: Array<FBTypes.MessengerButton> | FBButton): Promise<FBTypes.MessengerResponse>;
    createTextMessage(id: string): FBTextMessage;
    static exportTextMessage(text: string): FBTypes.MessengerMessage;
    sendTextMessage(id: string, text: string): Promise<FBTypes.MessengerResponse>;
    createQuickReplies(id: string): FBQuickReplies;
    static exportQuickReplies(text: string, quickReplies: Array<FBTypes.MessengerQuickReply>, maxQuickReplies?: number): FBTypes.MessengerMessage;
    sendQuickReplies(id: string, text: string, quickReplies: Array<FBTypes.MessengerQuickReply>): Promise<FBTypes.MessengerResponse>;
    sendSenderAction(id: string, senderAction: FBTypes.SenderAction): Promise<FBTypes.MessengerResponse>;
    sendTypingIndicators(id: string): Promise<FBTypes.MessengerResponse>;
    sendCancelTypingIndicators(id: string): Promise<FBTypes.MessengerResponse>;
    sendReadReceipt(id: string): Promise<FBTypes.MessengerResponse>;
    private sendSettingsToFB(payload);
    setGetStartedPostback(payload: string): Promise<FBTypes.MessengerResponse>;
    setPersistentMenu(buttons: Array<FBTypes.MessengerButton>): Promise<FBTypes.MessengerResponse>;
    setGreetingText(text: string): Promise<FBTypes.MessengerResponse>;
    createPostbackButton(title: string, payload: string): FBTypes.MessengerButton;
    createWebButton(title: string, url: string): FBTypes.MessengerButton;
    createQuickReply(title: string, payload: string): FBTypes.MessengerQuickReply;
    getUserProfile(id: string): Promise<FBTypes.FacebookUser>;
}
