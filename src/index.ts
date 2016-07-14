import * as Promise from 'bluebird';
import * as rp from 'request-promise';

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

const FBGraphURL = 'https://graph.facebook.com/v2.6/me';

export class FBMessage {
  public platform: FBPlatform;
  public id: string;
  public messageTitle: string;
  public messageSubTitle: string;
  public buttons: Array<MessengerButton>;
  public image_url: string;
  public elements: Array<MessengerItem>;

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

export default class FBPlatform {
  private token: string;
  constructor(token: string) {
    this.token = token;
  }

  private sendToFB(payload: MessengerPayload | MessengerSettings, path: string) {
    if (process.env.NODE_ENV === 'development') {
      console.log(`${JSON.stringify(payload)}`);
      return Promise.resolve(null);
    }

    const requstPayload = {
      url: `${FBGraphURL}/messages`,
      qs: { access_token: this.token },
      method: 'POST',
      json: payload,
    };

    return rp(requstPayload)
      .then((body) => {
        if (body.error) {
          console.error('Error (messageData):', payload, body.error);
          throw new Error(body.error);
        }
        return body;
      })
  }

  public sendMessageToFB(id: string, message:MessengerMessage) {
    const mesengerPayload: MessengerPayload = {
      recipient: { id },
      message,
    };

    return this.sendToFB(mesengerPayload, '/messages');
  }

  public sendGenericMessage(id: string, elements: Array<MessengerItem>) {
    const maxElements = 10;
    if (elements.length > maxElements) {
      throw new Error('Too many elements');
    }

    //title has length max of 80
    //subtitle has length max of 80
    //buttons is limited to 3

    const messageData: MessengerMessage = {
      'attachment': {
        'type': 'template',
        'payload': {
          'template_type': 'generic',
          elements: elements.slice(0, maxElements),
        },
      },
    };
    return this.sendMessageToFB(id, messageData);
  }

  public sendButtonMessage(id: string, text: string, buttons: Array<MessengerButton>): Promise<MessengerResponse> | FBButtonMessage {
    if (typeof text === 'undefined' || typeof buttons === 'undefined') {
      return new FBButtonMessage(this, id);
    }

    let mebuttons = buttons;
    if (typeof buttons === typeof FBButton) {

    }

    const maxButtons = 3;
    if (buttons.length > maxButtons) {
      throw new Error('Too many buttons');
    }

    const messageData: MessengerMessage = {
      'attachment': {
        'type': 'template',
        'payload': {
          'template_type': 'button',
          text,
          buttons: buttons.slice(0, maxButtons),
        },
      },
    };
    return this.sendMessageToFB(id, messageData);
  }

  public sendTextMessage(id: string, text: string) {
    const messageData: MessengerMessage = {
      text,
    };

    return this.sendMessageToFB(id, messageData);
  }

  public sendQuickReplies(id: string, text: string, quickReplies: Array<MessengerQuickReply>) {
    if (quickReplies.length > 10) {
      throw new Error('Quick replies limited to 10');
    }

    const messageData: MessengerMessage = {
      text,
      quick_replies: quickReplies,
    }

    return this.sendMessageToFB(id, messageData);
  }

  public sendSenderAction(id: string, senderAction: string) {
    const payload: MessengerPayload = {
      recipient: {
        id,
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
}
