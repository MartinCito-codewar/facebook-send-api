# facebook-send-api
typescript &amp; promise based modile for facebook's messenger send api

# installation
````bash
npm install --save facebook-send-api
````

# usage
````typescript
const token = 'xxx';
import fb from 'facebook-send-api';
const FBPlatform = new fb(token);

FBPlatform.sendTextMessage(sender.id, 'hello');
FBPlatform.sendButtonMessage((sender.id, 'title', [{
    type: 'postback',
    title: 'reset'),
    payload: RESET_SEARCH,
  },
  {
    type: 'postback',
    title: 'cancel'),
    payload: RESET_CANEL,
  }]);
FBPlatform.sendGenericMessage(sender.id, elements))
````
