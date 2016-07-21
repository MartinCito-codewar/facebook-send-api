# facebook-send-api
Typescript &amp; promise based module for facebook's [messenger send api](https://developers.facebook.com/docs/messenger-platform/send-api-reference). 

Currently used in production by [fynd.me](https://fynd.me) for [fyndbot](https://m.me/shopfynd).

# Installation
````bash
npm install --save facebook-send-api
````

# Singular usage
````typescript
const token = 'xxx';
import fb from 'facebook-send-api';
const FBPlatform = new fb(token);
const RESET_SEARCH = 'RESET';
const RESET_CANCEL = 'CANCEL';

FBPlatform.sendTextMessage(sender.id, 'hello');
FBPlatform.sendButtonMessage(sender.id, 'title', [{
    type: 'postback',
    title: 'reset'),
    payload: RESET_SEARCH,
  },
  {
    type: 'postback',
    title: 'cancel'),
    payload: RESET_CANEL,
  }]);
````

# Chained usage
````typescript
const token = 'xxx';
import fb from 'facebook-send-api';
const FBPlatform = new fb(token);
const RESET_SEARCH = 'RESET';
const RESET_CANCEL = 'CANCEL';

FBPlatform.createTextMessage(sender.id)
    .text('hello')
    .send();

FBPlatform.createButtonMessage(sender.id)
    .title('title');
    .postbackButton('reset', RESET_SEARCH)
    .postbackButton('cancel', RESET_CANEL)
    .send();
````
