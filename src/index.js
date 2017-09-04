'use strict';
const Alexa = require('alexa-sdk');
const https = require('https');

//Replace with your app ID (OPTIONAL).  You can find this value at the top of your skill's page on http://developer.amazon.com.
//Make sure to enclose your value in quotes, like this: var APP_ID = 'amzn1.ask.skill.bb4045e6-b3e8-4133-b650-72923c5980f1';
const APP_ID = undefined;

const SKILL_NAME = 'Chuck Norris Facts';
const GET_FACT_MESSAGE = 'Here\'s your fact: ';
const HELP_MESSAGE = 'You can say tell me a Chuck Norris fact, or, you can say exit... What can I help you with?';
const HELP_REPROMPT = 'What can I help you with?';
const STOP_MESSAGE = 'Goodbye!';

exports.handler = function (event, context) {
  const alexa = Alexa.handler(event, context);
  alexa.APP_ID = APP_ID;
  alexa.registerHandlers(handlers);
  alexa.execute();
};

const handlers = {
  'LaunchRequest': function () {
    this.emit('GetNewFactIntent');
  },
  'GetNewChuckNorrisFactIntent': function () {
    httpGet(undefined, (myResult) => {
      console.log('received : ' + myResult);
      console.log('received value: ' + JSON.parse(myResult).value);
      const speechOutput = GET_FACT_MESSAGE + JSON.parse(myResult).value;
      this.emit(':tellWithCard', speechOutput, SKILL_NAME);
      //this.emit(':tell', myResult.value);
    });
  },
  'GetNewChuckNorrisFactAboutIntent': function () {
    const factType = this.event.request.intent.slots.factType.value;
    httpGet(factType, (myResult) => {
      console.log('received : ' + myResult);
      const speechOutput = GET_FACT_MESSAGE + JSON.parse(myResult).value;
      this.emit(':tellWithCard', speechOutput, SKILL_NAME);
      //this.emit(':tell', myResult.value);
    });
  },
  'AMAZON.HelpIntent': function () {
    this.emit(':ask', HELP_MESSAGE, HELP_REPROMPT);
  },
  'AMAZON.CancelIntent': function () {
    this.emit(':tell', STOP_MESSAGE);
  },
  'AMAZON.StopIntent': function () {
    this.emit(':tell', STOP_MESSAGE);
  }
};

// https is a default part of Node.JS.  Read the developer doc:  https://nodejs.org/api/https.html
// try other APIs such as the current bitcoin price : https://btc-e.com/api/2/btc_usd/ticker  returns ticker.last

function httpGet(category, callback) {
  console.log('got to the http function');
  // GET is a web service request that is fully defined by a URL string
  // Try GET in your browser:
  // http://numbersapi.com/42

  // Update these options with the details of the web service you would like to call
  const options = {
    host: 'api.chucknorris.io',
    protocol: 'https:',
    path: (category ? `/jokes/random?category=${encodeURIComponent(category)}` : '/jokes/random'),
    method: 'GET',
  };

  const req = https.request(options, (res) => {
    res.setEncoding('utf8');
    let returnData = '';

    res.on('data', (chunk) => {
      returnData = returnData + chunk;
    });

    res.on('end', () => {
      // we have now received the raw return data in the returnData variable.
      // We can see it in the log output via:
      // console.log(JSON.stringify(returnData))
      // we may need to parse through it to extract the needed data
      console.log(returnData);
      callback(returnData);  // this will execute whatever function the caller defined, with one argument
    });
  });
  req.end();
}
