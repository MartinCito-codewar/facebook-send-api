import * as Promise from 'bluebird';
import * as rp from 'request-promise';
import * as util from 'util';
import * as FBTypes from 'facebook-sendapi-types';
const DefaultFBGraphURL = process.env.FBGRAPHURL || 'https://graph.facebook.com/v2.6';

export class FBMessage {
  protected platform: FBPlatform;
  protected id: string;
  protected messageTitle: string;
  protected messageSubTitle: string;
  protected buttons: Array<FBTypes.MessengerButton>;
  protected image_url: string;
  protected elements: Array<FBTypes.MessengerItem>;

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

  public element(anElement: FBTypes.MessengerItem | FBElement) {
    let theElement:FBTypes.MessengerItem = anElement as FBTypes.MessengerItem;
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
  public create():FBTypes.MessengerItem  {
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
  public export(): FBTypes.MessengerPayload {
    return {
      recipient: {
        id: this.id,
      },
      message: {
        text: this.messageTitle,
      },
    };
  }
}

export class FBButton extends FBMessage {
  public create():Array<FBTypes.MessengerButton> {
    return this.buttons;
  }
}

export class FBQuickReplies extends FBMessage {
  public send() {
    const postbackButtons: Array<FBTypes.MessengerButton> = this.buttons.filter(button => button.type === 'postback');
    const quickReplies: Array<FBTypes.MessengerQuickReply> = postbackButtons.map(button => {
      return this.platform.createQuickReply(button.title, button.payload);
    });
    return this.platform.sendQuickReplies(this.id, this.messageTitle, quickReplies);
  }
}

export type LoggerFunction = (payload: FBTypes.MessengerPayload) => Promise<void>;

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

  public wrapMessage(id: string, message: FBTypes.MessengerMessage, notification_type: FBTypes.NotificationType): FBTypes.MessengerPayload {
    const mesengerPayload: FBTypes.MessengerPayload = {
      recipient: { id: id.toString() },
      message,
      notification_type,
    };
    return mesengerPayload;
  }

  private sendToFB(payload: FBTypes.MessengerPayload | FBTypes.MessengerSettings, path: string): Promise<FBTypes.MessengerResponse> {
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
      .catch(err => {
        console.log('requstPayload', util.inspect(requstPayload, { depth: null }));
        throw err;
      });
  }

  public sendMessageToFB(id: string, message: FBTypes.MessengerMessage, notification_type: FBTypes.NotificationType = 'REGULAR') {
    const mesengerPayload = this.wrapMessage(id, message, notification_type);
    let promise = Promise.resolve(null);
    if (this.loggingFunction) {
      promise = this.loggingFunction(mesengerPayload);
    }

    return promise.then(() => this.sendToFB(mesengerPayload, '/messages'));
  }

  public createGenericMessage(id: string): FBGenericMessage {
    return new FBGenericMessage(this, id);
  }

  static exportGenericMessage(elements: Array<FBTypes.MessengerItem>, maxElements: number = 10): FBTypes.MessengerMessage {
    const messageData: FBTypes.MessengerMessage = {
      'attachment': {
        'type': 'template',
        'payload': {
          'template_type': 'generic',
          elements: elements.slice(0, maxElements),
        },
      },
    };
    return messageData;
  }

  public sendGenericMessage(id: string, elements: Array<FBTypes.MessengerItem>) {
    if (elements.length > this.maxElements && this.validateLimits) {
      throw new Error(`Sending too many elements, max is ${this.maxElements}, tried sending ${elements.length}`);
    }
    //title has length max of 80
    //subtitle has length max of 80
    //buttons is limited to 3

    return this.sendMessageToFB(id, FBPlatform.exportGenericMessage(elements, this.maxElements));
  }

  public createButtonMessage(id: string): FBButtonMessage {
    return new FBButtonMessage(this, id);
  }

  static exportButtonMessage(text: string, buttons: Array<FBTypes.MessengerButton> | FBButton, maxButtons: number = 3): FBTypes.MessengerMessage {
    let theButtons:Array<FBTypes.MessengerButton> = null;

    console.log('buttons:', typeof buttons);
    if (typeof buttons === typeof FBButton) {
      const asAButton: FBButton = buttons as FBButton;
      theButtons = asAButton.create();
    } else {
      theButtons = buttons as Array<FBTypes.MessengerButton>;
    }

    if (theButtons.length > maxButtons) {
      throw new Error(`Sending too many buttons, max is $maxButtons}, tried sending ${theButtons.length}`);
    }

    const messageData: FBTypes.MessengerMessage = {
      'attachment': {
        'type': 'template',
        'payload': {
          'template_type': 'button',
          text,
          buttons: theButtons.slice(0, maxButtons),
        },
      },
    };
    return messageData;
  }

  public sendButtonMessage(id: string, text: string, buttons: Array<FBTypes.MessengerButton> | FBButton) {
    return this.sendMessageToFB(id, FBPlatform.exportButtonMessage(text, buttons, this.maxButtons));
  }

  public createTextMessage(id: string): FBTextMessage {
    return new FBTextMessage(this, id);
  }

  static exportTextMessage(text: string): FBTypes.MessengerMessage {
    const messageData: FBTypes.MessengerMessage = {
      text,
    };
    return messageData;
  }

  public sendTextMessage(id: string, text: string) {
    return this.sendMessageToFB(id, FBPlatform.exportTextMessage(text));
  }

  public createQuickReplies(id: string) {
    return new FBQuickReplies(this, id);
  }

  static exportQuickReplies(text: string, quickReplies: Array<FBTypes.MessengerQuickReply>, maxQuickReplies: number = 10): FBTypes.MessengerMessage {
    const messageData: FBTypes.MessengerMessage = {
      text,
      quick_replies: quickReplies.slice(0, maxQuickReplies),
    };
    return messageData;
  }

  public sendQuickReplies(id: string, text: string, quickReplies: Array<FBTypes.MessengerQuickReply>) {
    if (quickReplies.length > this.maxQuickReplies && this.validateLimits) {
      throw new Error(`Quick replies limited to ${this.maxQuickReplies}, tried sending ${quickReplies.length}`);
    }

    return this.sendMessageToFB(id, FBPlatform.exportQuickReplies(text, quickReplies, this.maxQuickReplies));
  }

  public sendSenderAction(id: string, senderAction: FBTypes.SenderAction) {
    const payload: FBTypes.MessengerPayload = {
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

  private sendSettingsToFB(payload: FBTypes.MessengerSettings) {
    return this.sendToFB(payload, '/thread_settings');
  }

  public setGetStartedPostback(payload: string) {
    const Messengerpayload: FBTypes.MessengerSettings = {
      setting_type: 'call_to_actions',
      thread_state: 'new_thread',
      call_to_actions:  [{
        payload,
      }]
    };

    return this.sendSettingsToFB(Messengerpayload);
  }

  public setPersistentMenu(buttons: Array<FBTypes.MessengerButton>) {
    const MessengerPayload: FBTypes.GeneralThreadSettings = {
      setting_type: 'call_to_actions',
      thread_state: 'existing_thread',
      call_to_actions: buttons,
    };

    return this.sendSettingsToFB(MessengerPayload);
  }

  public setGreetingText(text: string) {
    const MessengerPayload: FBTypes.GeneralThreadSettings = {
      setting_type: 'greeting',
      greeting: {
        text,
      },
    };

    return this.sendSettingsToFB(MessengerPayload);
  }

  public createPostbackButton(title: string, payload: string): FBTypes.MessengerButton {
    const button: FBTypes.MessengerButton = {
      type: 'postback',
      title,
      payload,
    }
    return button;
  }

  public createWebButton(title: string, url: string): FBTypes.MessengerButton {
    const button: FBTypes.MessengerButton = {
      type: 'web_url',
      title,
      url,
    };
    return button;
  }

  public createQuickReply(title: string, payload: string): FBTypes.MessengerQuickReply {
    const button: FBTypes.MessengerQuickReply = {
      content_type: 'text',
      title,
      payload,
    }
    return button;
  }

  public getUserProfile(id: string): Promise<FBTypes.FacebookUser> {
    return rp(`${this.FBGraphURL}/${id}?fields=first_name,last_name,profile_pic,locale,timezone,gender&access_token=${this.token}`)
      .then((response: string) => JSON.parse(response) as FBTypes.FacebookUser);
  }
}
