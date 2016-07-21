# facebook-send-api
typescript &amp; promise based modile for facebook's messenger send api

# installation
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
