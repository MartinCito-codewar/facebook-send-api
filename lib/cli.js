"use strict";
var facebook_send_api_1 = require('facebook-send-api');
var program = require('commander');
var FBPlatform = null;
program
    .version('1.0.0')
    .option('-t, --token [access token]', 'Change greeting text')
    .option('-g, --greeting [text]', 'Change greeting text')
    .option('-p, --postback [string]', 'Change getting started postback')
    .parse(process.argv);
if (program.token) {
    FBPlatform = new facebook_send_api_1.default(program.token);
}
else {
    throw new Error('Need FB token');
}
if (program.greeting)
    FBPlatform.setGreetingText(program.greeting);
if (program.postback)
    FBPlatform.setGetStartedPostback(program.postback);
