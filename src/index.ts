import * as Promise from 'bluebird';
import * as rp from 'request-promise';
import * as util from 'util';

export interface MessengerQuickReply {
  content_type: string,
  title: string,
  payload: string,
}

export interface MessengerButton {
  type: string,
  title: string,
  payload?: string,
  url?: string,
}

export interface MessengerItem {
  title: string,
  subtitle?: string,
  image_url?: string,
  buttons?: Array<MessengerButton>,
}

export interface MessengerTextMessage {
  text: string,
}

export interface MessengerGenericPayload {
  template_type: string,
  elements: Array<MessengerItem>,
}

export interface MessengerButtonPayload {
  template_type: string,
  text: string,
  buttons: Array<MessengerButton>,
}

export interface MessengerAttachement {
  type: string,
  payload: MessengerGenericPayload | MessengerButtonPayload,
}

export interface MessengerMessage {
  attachment?: MessengerAttachement,
  text?: string,
  quick_replies?: Array<MessengerQuickReply>,
  metadata?: string,
}

export interface MessengerPayload {
  recipient: {
    id?: string,
    phone_number?: string,
  },
  message?: MessengerMessage,
  sender_action?: string,
  notification_type?: string,
}

export interface MessengerResponse {
  recipient_id: string,
  message_id: string,
}

export interface MessengerError {
  error: {
    message: string,
    type: string,
    code: Number,
    fbtrace_id: string,
  },
}

export interface FacebookUser {
  first_name: string;
  last_name: string;
  profile_pic: string;
  locale: string;
  timezone: number;
  gender: string;
}

interface MessengerPostback {
  payload: string,
}

interface MessengerSettings {
  setting_type: string,
  thread_state?: string,
  call_to_actions?: Array<MessengerPostback> | Array<MessengerButton>,
  greeting?: {
    text: string,
  },
}

const DefaultFBGraphURL = process.env.FBGRAPHURL || 'https://graph.facebook.com/v2.6';

export class FBMessage {
  protected platform: FBPlatform;
  protected id: string;
  protected messageTitle: string;
  protected messageSubTitle: string;
  protected buttons: Array<MessengerButton>;
  protected image_url: string;
  protected elements: Array<MessengerItem>;

  constructor(platform: FBPlatform, id: string) {
    this.platform = platform;
    this.id = id;
    this.buttons = [];
    this.elements = [];
    return this;
  }

  public title(title: string) {
    this.messageTitle = title;
    return this;
  }

  public text(text: string) {
    this.messageTitle = text;
    return this;
  }

  public subtitle(sutitle: string) {
    this.messageSubTitle = sutitle;
    return this;
  }

  public postbackButton(text: string, postback: string) {
    this.buttons = this.buttons.concat(this.platform.createPostbackButton(text, postback));
    return this;
  }

  public webButton(text: string, url: string) {
    this.buttons = this.buttons.concat(this.platform.createWebButton(text, url));
    return this;
  }

  public image(url: string) {
    this.image_url = url;
    return this;
  }

  public element(anElement: MessengerItem | FBElement) {
    let theElement:MessengerItem = anElement as MessengerItem;
    if (typeof anElement === 'FBElement') {
      const elementAsClass = anElement as FBElement;
      theElement = elementAsClass.create();
    }
    this.elements = this.elements.concat(theElement);
    return this;
  }
}

export class FBElement extends FBMessage {
  constructor(platform: FBPlatform = new FBPlatform(null)) {
    super(platform, null);
    return this;
  }
  public create():MessengerItem  {
    let element:any = {};
    if (this.messageTitle) element.title = this.messageTitle;
    if (this.messageSubTitle) element.subtitle = this.messageSubTitle;
    if (this.image_url) element.image_url = this.image_url;
    if (this.buttons.length > 0) element.buttons = this.buttons;
    return element;
  }
}

export class FBButtonMessage extends FBMessage {
  public send() {
    return this.platform.sendButtonMessage(this.id, this.messageTitle, this.buttons);
  }
}

export class FBGenericMessage extends FBMessage {
  public send() {
    return this.platform.sendGenericMessage(this.id, this.elements);
  }
}

export class FBTextMessage extends FBMessage {
  public send() {
    return this.platform.sendTextMessage(this.id, this.messageTitle);
  }
}

export class FBButton extends FBMessage {
  public create():Array<MessengerButton> {
    return this.buttons;
  }
}

export class FBQuickReplies extends FBMessage {
  public send() {
    const postbackButtons: Array<MessengerButton> = this.buttons.filter(button => button.type === 'postback');
    const quickReplies: Array<MessengerQuickReply> = postbackButtons.map(button => {
      return this.platform.createQuickReply(button.title, button.payload);
    });
    return this.platform.sendQuickReplies(this.id, this.messageTitle, quickReplies);
  }
}

export type LoggerFunction = (payload: MessengerPayload) => Promise<void>;

export default class FBPlatform {
  protected token: string;
  protected sendInDevelopment: boolean = false;
  protected validateLimits: boolean = false
  public maxElements: number = 10;
  public maxButtons: number = 3;
  public maxQuickReplies: number = 10;
  public loggingFunction: LoggerFunction = null;
  private FBGraphURL: string;

  constructor(token: string, graphURL: string = DefaultFBGraphURL) {
    this.token = token;
    this.FBGraphURL = graphURL;
  }

  public setGraphURL(graphURL: string) {
    this.FBGraphURL = graphURL;
  }

  public turnOnSendingInDevelopment(state: boolean = true) {
    this.sendInDevelopment = state;
    return this;
  }

  public turnOnValidation(state: boolean = true) {
    this.validateLimits = state;
    return this;
  }

  private sendToFB(payload: MessengerPayload | MessengerSettings, path: string): Promise<MessengerResponse> {
    if (process.env.NODE_ENV === 'development' && this.sendInDevelopment === false) {
      console.log(`${JSON.stringify(payload)}`);
      return Promise.resolve({
        recipient_id: '0',
        message_id: '0',
      });
    }

    const requstPayload = {
      url: `${this.FBGraphURL}/me${path}`,
      qs: { access_token: this.token },
      method: 'POST',
      json: payload,
    };

    // console.log('requstPayload', util.inspect(requstPayload, { depth: null }));

    return rp(requstPayload)
      .then((body) => {
        if (body.error) {
          console.error('Error (messageData):', payload, body.error);
          throw new Error(body.error);
        }
        return body;
      })
  }

  public sendMessageToFB(id: string, message: MessengerMessage, notification_type: string = 'REGULAR') {
    const mesengerPayload: MessengerPayload = {
      recipient: { id: id.toString() },
      message,
      notification_type,
    };

    let promise = Promise.resolve(null);
    if (this.loggingFunction) {
      promise = this.loggingFunction(mesengerPayload);
    }

    return promise.then(() => this.sendToFB(mesengerPayload, '/messages'));
  }

  public createGenericMessage(id: string): FBGenericMessage {
    return new FBGenericMessage(this, id);
  }

  public sendGenericMessage(id: string, elements: Array<MessengerItem>) {
    if (elements.length > this.maxElements && this.validateLimits) {
      throw new Error(`Sending too many elements, max is ${this.maxElements}, tried sending ${elements.length}`);
    }

    //title has length max of 80
    //subtitle has length max of 80
    //buttons is limited to 3

    const messageData: MessengerMessage = {
      'attachment': {
        'type': 'template',
        'payload': {
          'template_type': 'generic',
          elements: elements.slice(0, this.maxElements),
        },
      },
    };
    return this.sendMessageToFB(id, messageData);
  }

  public createButtonMessage(id: string): FBButtonMessage {
    return new FBButtonMessage(this, id);
  }

  public sendButtonMessage(id: string, text: string, buttons: Array<MessengerButton> | FBButton) {
    let theButtons:Array<MessengerButton> = null;

    console.log('buttons:', typeof buttons);
    if (typeof buttons === typeof FBButton) {
      const asAButton: FBButton = buttons as FBButton;
      theButtons = asAButton.create();
    } else {
      theButtons = buttons as Array<MessengerButton>;
    }

    if (theButtons.length > this.maxButtons && this.validateLimits) {
      throw new Error(`Sending too many buttons, max is ${this.maxButtons}, tried sending ${theButtons.length}`);
    }

    const messageData: MessengerMessage = {
      'attachment': {
        'type': 'template',
        'payload': {
          'template_type': 'button',
          text,
          buttons: theButtons.slice(0, this.maxButtons),
        },
      },
    };
    return this.sendMessageToFB(id, messageData);
  }

  public createTextMessage(id: string): FBTextMessage {
    return new FBTextMessage(this, id);
  }

  public sendTextMessage(id: string, text: string) {
    const messageData: MessengerMessage = {
      text,
    };

    return this.sendMessageToFB(id, messageData);
  }

  public createQuickReplies(id: string) {
    return new FBQuickReplies(this, id);
  }

  public sendQuickReplies(id: string, text: string, quickReplies: Array<MessengerQuickReply>) {
    if (quickReplies.length > this.maxQuickReplies && this.validateLimits) {
      throw new Error(`Quick replies limited to ${this.maxQuickReplies}, tried sending ${quickReplies.length}`);
    }

    const messageData: MessengerMessage = {
      text,
      quick_replies: quickReplies.slice(0, this.maxQuickReplies),
    }

    return this.sendMessageToFB(id, messageData);
  }

  public sendSenderAction(id: string, senderAction: string) {
    const payload: MessengerPayload = {
      recipient: {
        id: id.toString(),
      },
      sender_action: senderAction,
    }

    return this.sendToFB(payload, '/messages');
  }

  public sendTypingIndicators(id: string) {
    return this.sendSenderAction(id, 'typing_on');
  }

  public sendCancelTypingIndicators(id: string) {
    return this.sendSenderAction(id, 'typing_off');
  }

  public sendReadReceipt(id: string) {
    return this.sendSenderAction(id, 'mark_seen');
  }

  private sendSettingsToFB(payload: MessengerSettings) {
    return this.sendToFB(payload, '/thread_settings');
  }

  public setGetStartedPostback(payload: string) {
    const messengerpayload: MessengerSettings = {
      setting_type: 'call_to_actions',
      thread_state: 'new_thread',
      call_to_actions:  [{
        payload,
      }]
    };

    return this.sendSettingsToFB(messengerpayload);
  }

  public setPersistentMenu(buttons: Array<MessengerButton>) {
    const messengerPayload: MessengerSettings = {
      setting_type: 'call_to_actions',
      thread_state: 'existing_thread',
      call_to_actions: buttons,
    };

    return this.sendSettingsToFB(messengerPayload);
  }

  public setGreetingText(text: string) {
    const messengerPayload: MessengerSettings = {
      setting_type: 'greeting',
      greeting: {
        text,
      },
    };

    return this.sendSettingsToFB(messengerPayload);
  }

  public createPostbackButton(title: string, payload: string): MessengerButton {
    const button: MessengerButton = {
      type: 'postback',
      title,
      payload,
    }
    return button;
  }

  public createWebButton(title: string, url: string): MessengerButton {
    const button: MessengerButton = {
      type: 'web_url',
      title,
      url,
    };
    return button;
  }

  public createQuickReply(title: string, payload: string): MessengerQuickReply{
    const button: MessengerQuickReply = {
      content_type: 'text',
      title,
      payload,
    }
    return button;
  }

  public getUserProfile(id: string): Promise<FacebookUser> {
    return rp(`${this.FBGraphURL}/${id}?fields=first_name,last_name,profile_pic,locale,timezone,gender&access_token=${this.token}`)
      .then((response: string) => JSON.parse(response) as FacebookUser);
  }
}
