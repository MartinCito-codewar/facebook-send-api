import fb from './index';
const program = require('commander');
let FBPlatform = null;

program
  .version('1.0.0')
  .option('-t, --token [access token]', 'Change greeting text')
  .option('-g, --greeting [text]', 'Change greeting text')
  .option('-p, --postback [string]', 'Change getting started postback')
  .parse(process.argv);

if (program.token) {
  FBPlatform = new fb(program.token);
} else {
  throw new Error('Need FB token');
}

if (program.greeting) FBPlatform.setGreetingText(program.greeting)
if (program.postback) FBPlatform.setGetStartedPostback(program.postback)
