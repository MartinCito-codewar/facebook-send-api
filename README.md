# facebook-send-api
Typescript &amp; promise based module for facebook's [messenger send api](https://developers.facebook.com/docs/messenger-platform/send-api-reference). 

Currently used in production by [fynd.me](https://fynd.me) for [fyndbot](https://m.me/shopfynd).

# Installation
````bash
npm install --save facebook-send-api
````

# Thread Settings
````typescript
const token = 'xxx';
import fb from 'facebook-send-api';
const FBPlatform = new fb(token);
const GET_STARTED_POSTBACK = 'GET_STARTED';
const FIRST = 'FIRST';
const SECOND = 'SECOND';
const THIRD = 'THIRD';

FBPlatform.setGreetingText('hello');
FBPlatform.setGetStartedPostback(GET_STARTED_POSTBACK);
FBPlatform.setPersistentMenu([  
    {
        type: 'postback',   // create a button yourself
        title: '1'),
        payload: FIRST,
    },
    FBPlatform.createPostbackButton('2', SECOND),   //or use the libraries helper function
    FBPlatform.createPostbackButton('3', THIRD),
]);
````

# Singular usage
````typescript
const token = 'xxx';
import fb from 'facebook-send-api';
const FBPlatform = new fb(token);
const RESET_SEARCH = 'RESET';
const RESET_CANCEL = 'CANCEL';
const sender = { id: '0' };

// a simple text message of 'hello'
FBPlatform.sendTextMessage(sender.id, 'hello')
    .then(() => {
        console.log('message sent');
    })
    .catch(() => {
        return FBPlatform.sendTextMessage('uh oh, bot error');
    });

// a button message with 3 buttons using both an object and the libraries helper functions
FBPlatform.sendButtonMessage(sender.id, 'title', [{
    type: 'postback',
    title: 'reset'),
    payload: RESET_SEARCH,
  },
  FBPlatform.createPostbackButton('cancel', RESET_CANEL),
  FBPlatform.createWebButton('url', 'https://www.com'),
]);

//a generic template message
FBPlatform.sendGenericMessage(sender.id, [
    { title: '1', subtitle: 'first' },
    { title: '2', subtitle: 'second' },
    { title: '3', subtitle: 'third' },
    { title: '4', subtitle: 'fourth' },
    { title: '5', subtitle: 'fifth' },
]);

// a set of quick reply buttons
FBPlatform.sendQuickReplies(sender.id, 'Which of these?', [
    { 'content_type': 'text', title: '1', payload: '1' },
    FBPlatform.createQuickReply('2', '2'),
]);

// sender actions
FBPlatform.sendSenderAction(sender.id, 'mark_seen');
FBPlatform.sendReadReceipt(sender.id);
FBPlatform.sendTypingIndicators(sender.id);
FBPlatform.sendCancelTypingIndicators(sender.id);
````

# Chained usage
````typescript
const token = 'xxx';
import fb from 'facebook-send-api';
import { FBElement } from 'facebook-send-api';
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
    
FBPlatform.createGenericMessage(sender.id)
    .element(new FBElement().title('1').subtitle('first').image('https://www.com/1.jpg'))
    .element(new FBElement().title('2').subtitle('second').image('https://www.com/2.jpg'))
    .send();
````

# FAQ
## On my local machine, nothing is being sent to Facebook
By default if NODE_ENV is set to 'development', the library will log the request and return a dummy response so as not to spam the FB messenger platform. You can enable sending in development mode using the `turnOnSendingInDevelopment()` method.

## Some of my arrays are being truncated
The library automatically truncates arrays to match the limits of the facebook platform as of July 26, 2016. If you want to change these you can set the class variables `maxElements`, `maxButtons`, `maxQuickReplies` to the new maximumums or do a pull request! You can enable throwing an error instead of truncating using the `turnOnValidation()` method.
