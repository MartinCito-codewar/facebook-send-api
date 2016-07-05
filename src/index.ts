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

const FBGraphURL = 'https://graph.facebook.com/v2.6/me/';

export default class FBMessenger {
  private token: string;
  constructor(token: string) {
    this.token = token;
  }

  private sendToFB(id:string, payload:MessengerPayload): Promise<MessengerResponse> {
    if (process.env.FYND_ENV === 'local') {
      console.log(`[${id}] ${JSON.stringify(payload)}`);
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

    return this.sendToFB(id, mesengerPayload);
  }

  public sendGenericMessage(id: string, elements: Array<MessengerItem>) {
    if (elements.length > 10) {
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
          elements,
        },
      },
    };
    return this.sendMessageToFB(id, messageData);
  }

  public sendButtonMessage(id: string, text: string, buttons: Array<MessengerButton>) {
    const messageData: MessengerMessage = {
      'attachment': {
        'type': 'template',
        'payload': {
          'template_type': 'button',
          text,
          buttons,
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

    return this.sendToFB(id, payload);
  }

  public sendTypingIndicators(id: string) {
    return this.sendSenderAction(id, 'typing_on');
  }

  public sendReadReceipt(id: string) {
    return this.sendSenderAction(id, 'mark_seen');
  }

  private sendSettingsToFB(payload: MessengerSettings) {
    const requstPayload = {
      url: `${FBGraphURL}/thread_settings`,
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
}
