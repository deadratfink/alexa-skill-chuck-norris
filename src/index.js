/* eslint-disable import/no-commonjs, no-console, object-shorthand, prefer-destructuring, func-names */
const Alexa = require('alexa-sdk');
const https = require('https');

/**
 * Configured application ID.
 * @type {string}
 * @private
 */
const APP_ID = process.env.APP_ID;

/**
 * The skill name.
 * @type {string}
 * @private
 */
const SKILL_NAME = 'Chuck Norris';

/**
 * Prefix for joke answer.
 * @type {string}
 * @private
 */
const GET_JOKE_MESSAGE_PREFIX = 'Here\'s the joke: ';

/**
 * I18n resources.
 * @type {Object}
 * @private
 */
const I18N = {
  'en-GB': {
    translation: {
      HELP_MESSAGE: 'You can say tell me a Chuck Norris joke, or, you can say exit... What can I help you with?',
      HELP_REPROMPT: 'What can I help you with?',
      STOP_MESSAGE: 'Goodbye!',
    }
  },
  'en-US': {
    translation: {
      HELP_MESSAGE: 'You can say tell me a Chuck Norris joke, or, you can say exit... What can I help you with?',
      HELP_REPROMPT: 'What can I help you with?',
      STOP_MESSAGE: 'Goodbye!',
    }
  },
  'de-DE': {
    translation: {
      HELP_MESSAGE: 'Du kannst mir sagen frage Chuck Norris nach einem Witz, oder Du kannst Stop sagen... ' +
        'Wie kann ich Dir helfen?',
      HELP_REPROMPT: 'Wie kann ich Dir helfen?',
      STOP_MESSAGE: 'Auf Wiedersehen!',
    }
  }
};

/**
 * A locale pattern used to match the language part.
 * @type {RegExp}
 * @private
 */
const LOCALE_PATTERN = /^([a-z]{2})(?:[-_]([A-Z]{2})?)$/;

/**
 * Microsoft Translator API function.
 *
 * @param {string} speechOutput - The speech to translate.
 * @param {string} language     - ISO language code.
 * @param {Function} callback   - Done callback which takes the API result as argument.
 */
function translate(speechOutput, language, callback) {
  console.log('MS translate function');

  /**
   * Clean the speech output from SSML tags before translation!
   * @type {string}
   * @private
   */
  const strippedSpeechOutput = speechOutput
    .replace('<speak>', '')
    .replace('</speak>', '')
    .trim();

  console.log('strippedSpeechOutput: ' + strippedSpeechOutput);

  /**
   * Request options for MS Translation API.
   * @type {Object}
   * @private
   */
  const options = {
    host: 'api.microsofttranslator.com',
    protocol: 'https:',
    // eslint-disable-next-line max-len
    path: `/V2/Http.svc/Translate?text=${encodeURIComponent(strippedSpeechOutput)}&from=en&to=${language}&contentType=text/plain`,
    method: 'GET',
    headers: { 'Ocp-Apim-Subscription-Key': process.env.MS_OCP_APIM_SUBSCRIPTION_KEY },
  };

  /**
   * Request translation.
   * @private
   */
  const req = https.request(options, (res) => {
    console.log(`STATUS: ${res.statusCode}`);
    if (res.statusCode !== 200) {
      console.error(`An error occured while translating the Chuck Norris joke, error code: ${res.statusCode}.`);
      callback(`An error occurred while translating the Chuck Norris joke, error code: ${res.statusCode}.`);
      return;
    }

    const contentType = res.headers['content-type'];
    if (!/^application\/xml/.test(contentType)) {
      console.error(`An error occured while translating the Chuck Norris joke, error code: ${res.statusCode}. ` +
        `Invalid content-type. Expected application/json but received ${contentType}`);
      callback('An error occurred while translating the Chuck Norris joke. Invalid content-type.');
    }

    res.setEncoding('utf8');
    let result = '';

    res.on('data', (chunk) => {
      result += chunk;
    });

    req.on('error', (err) => {
      console.error('An error occurred while translating the Chuck Norris joke: ' + err);
      callback('Es gab einen Fehler bei der Übersetzung.');
    });

    res.on('end', () => {
      console.log(`TRANSLATED to ${language} (XML): ${result}`);
      result = result
        .replace('<string xmlns="http://schemas.microsoft.com/2003/10/Serialization/">', '')
        .replace('</string>', '');
      console.log(`TRANSLATED to ${language}: ${result}`);
      callback(result);
    });
  });
  req.end();
}

/**
 * Gets a _random_ or _categorized_ joke from the Chuck Norris API.
 *
 * @param {string} [category] - A joke category to select.
 * @param {Function} callback - Done callback which takes the API result as argument.
 */
function httpGetFromChuckNorris(category, callback) {
  console.log('httpGetFromChuckNorris function');

  /**
   * Request options for Chuck Norris API.
   * @type {Object}
   * @private
   */
  const options = {
    host: 'api.chucknorris.io',
    protocol: 'https:',
    path: (category ? `/jokes/random?category=${encodeURIComponent(category)}` : '/jokes/random'),
    method: 'GET',
  };

  /**
   * Request joke.
   * @private
   */
  const req = https.request(options, (res) => {
    console.log(`STATUS: ${res.statusCode}`);
    if (res.statusCode !== 200) {
      callback(`An error occurred while getting the Chuck Norris joke, error code: ${res.statusCode}.`);
      return;
    }
    res.setEncoding('utf8');
    let result = '';

    res.on('data', (chunk) => {
      result += chunk;
    });

    req.on('error', (err) => {
      console.error('An error occurred while getting the Chuck Norris joke: ' + err);
      callback('An error occurred while getting the Chuck Norris joke.');
    });

    res.on('end', () => {
      // we have now received the raw return data in the returnData variable.
      // We can see it in the log output via:
      // console.log(JSON.stringify(returnData))
      // we may need to parse through it to extract the needed data
      console.log(result);
      callback(result);
    });
  });
  req.end();
}

/**
 * All intent handlers used in the Lambda skill.
 * @type {Object}
 * @private
 */
const handlers = {
  LaunchRequest: function () {
    // Use default!
    this.emit('GetNewChuckNorrisJokeIntent');
  },
  Unhandled: function () {
    this.emit(':ask', this.t('HELP_MESSAGE'), this.t('HELP_REPROMPT'));
  },
  GetNewChuckNorrisJokeIntent: function () {
    // Needed to detect language.
    const locale = this.event.request.locale;
    console.log('LOCALE', locale);

    httpGetFromChuckNorris(undefined, (myResult) => {
      console.log('received : ' + myResult);
      console.log('received value: ' + JSON.parse(myResult).value);
      const speechOutput = GET_JOKE_MESSAGE_PREFIX + JSON.parse(myResult).value;

      const matches = LOCALE_PATTERN.exec(locale);
      // The matches looks something like this:
      // ["en-US", "en", "US", index: 0, input: "en-US"]
      const language = matches[1];
      console.log('LANGUAGE: ' + language);
      if (language === 'en') { // do not translate from 'en' to 'en'!
        this.emit(':tellWithCard', speechOutput, SKILL_NAME);
      } else {
        translate(speechOutput, language, (translatedSpeechOutput) => {
          this.emit(':tellWithCard', translatedSpeechOutput, SKILL_NAME);
        });
      }
    });
  },
  GetNewChuckNorrisJokeAboutIntent: function () {
    const category = this.event.request.intent.slots.categoryType.value;
    // Needed to detect language.
    const locale = this.event.request.locale;
    console.log('LOCALE', locale);

    httpGetFromChuckNorris(category, (myResult) => {
      console.log('received : ' + myResult);
      const speechOutput = GET_JOKE_MESSAGE_PREFIX + JSON.parse(myResult).value;
      const matches = LOCALE_PATTERN.exec(locale);
      // The matches looks something like this:
      // ["en-US", "en", "US", index: 0, input: "en-US"]
      const language = matches[1];
      console.log('LANGUAGE: ' + language);
      if (language === 'en') { // do not translate from 'en' to 'en'!
        this.emit(':tellWithCard', speechOutput, SKILL_NAME);
      } else {
        translate(speechOutput, language, (translatedSpeechOutput) => {
          this.emit(':tellWithCard', translatedSpeechOutput, SKILL_NAME);
        });
      }
    });
  },
  'AMAZON.HelpIntent': function () {
    this.emit(':ask', this.t('HELP_MESSAGE'), this.t('HELP_REPROMPT'));
  },
  'AMAZON.CancelIntent': function () {
    this.emit(':tell', this.t('STOP_MESSAGE'));
  },
  'AMAZON.StopIntent': function () {
    this.emit(':tell', this.t('STOP_MESSAGE'));
  }
};

/**
 * Lambda entry point delegating to the _alexa-sdk_.
 *
 * @param {Object} event   - The Lambda event information.
 * @param {Object} context - The Lambda context information.
 * @public
 */
exports.handler = function (event, context) {
  const alexa = Alexa.handler(event, context);
  alexa.appId = APP_ID;
  // To enable string internationalization (i18n) features, set a resources object.
  alexa.resources = I18N;
  alexa.registerHandlers(handlers);
  alexa.execute();
};
/* eslint-enable import/no-commonjs, no-console, object-shorthand, prefer-destructuring, func-names */
