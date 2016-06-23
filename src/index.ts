import * as Promise from 'bluebird';
import * as rp from 'request-promise';

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
}

export interface MessengerResponse {
  recipient_id: string,
  message_id: string,
}

export default class FBMessenger {
  private token: string;
  constructor(token: string) {
    this.token = token;
  }

  public sendToFB(id:string, message:MessengerMessage): Promise<MessengerResponse> {
    if (process.env.FYND_ENV === 'local') {
      console.log(`[${id}] ${JSON.stringify(message)}`);
      return Promise.resolve(null);
    }

    const payload = {
      url: process.env.FB_GRAPHURL,
      qs: { access_token: this.token },
      method: 'POST',
      json: {
        recipient: { id },
        message,
      },
    };

    return rp(payload)
      .then((body) => {
        if (body.error) {
          console.error('Error (messageData):', message, body.error);
          throw new Error(body.error);
        }
        return body;
      })
  }

  public sendGenericMessage(id: string, elements: Array<MessengerItem>) {
    const messageData: MessengerMessage = {
      'attachment': {
        'type': 'template',
        'payload': {
          'template_type': 'generic',
          elements,
        },
      },
    };
    return this.sendToFB(id, messageData);
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
    return this.sendToFB(id, messageData);
  }

  public sendTextMessage(id: string, text: string) {
    const messageData: MessengerMessage = {
      text,
    };

    return this.sendToFB(id, messageData);
  }
}
