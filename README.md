[![Build Status](https://travis-ci.org/deadratfink/alexa-skill-chuck-norris.svg?branch=master)](https://travis-ci.org/deadratfink/alexa-skill-chuck-norris)

# alexa-skill-chuck-norris

Alexa Lambda skill which integrates the [Chuck Norris API](https://api.chucknorris.io) utilizing the
[alexa-sdk](https://github.com/alexa/alexa-skills-kit-sdk-for-nodejs).

## Use Cases

The skill supports the following use cases: 

1. Ask for a random english joke about Chuck Norris by calling the Chuck Norris API
   (https://api.chucknorris.io/jokes/random). The result of the API call is passed to Alexa for reading.
   
   > Example: _Ask Chuck Norris a joke._
2. When asking Alexa for a joke you can choose also a certain _category_ of jokes. These are defined by the API
   and can be retrieved by a call to https://api.chucknorris.io/jokes/categories.
   
   |en-US, en-GB|de-DE|
   |---|---|
   |explicit|not done yet|
   |dev|not done yet|
   |movie|not done yet|
   |food|not done yet|
   |celebrity|not done yet|
   |science|not done yet|
   |political|not done yet|
   |sport|not done yet|
   |religion|not done yet|
   |animal|not done yet|
   |music|not done yet|
   |history|not done yet|
   |travel|not done yet|
   |career|not done yet|
   |money|not done yet|
   |fashion|not done yet|

   > Example: _Ask Chuck Norris a_ `{category}` _joke._

All this works fine for Alexa Devices which are configured to English language. For German language (and potentially others)
there is a translation hook depending on the passed _locale_.

### API Result Translation

Alexa passes the _locale_ to the Lambda function. Any other language parsed from this _locale_ than `'en'` is
forwarded to the Microsoft Translation API (alongside the result from _Chuck Norris API_) which returns the proper
translation. Of course, due to the fact that automatic translation engines are not always perfect in doing their job 
there could be strange or even funny results for the jokes in other languages.

The [Microsoft Translation API](https://www.microsoft.com/en-us/translator/translatorapi.aspx) is
for _commercial use_ but provides an initial trial period. Anyway, you have to
[register](https://www.microsoft.com/en-us/translator/getstarted.aspx) 
first (make sure you have your credit card at hand) to use this service (read all MS instructions carefully
while you create the translation account in the Azure Cloud). At the end of the setup you will obtain an _authorization key_
which needs to be send on every request to the API. They provide an OAuth handshake which
is not very handy in our case - but fortunately, there is also an API-key like authorization possibility where the
_static_ authorization key can be sent via a special header named `Ocp-Apim-Subscription-Key`.

Therefore, the Lambda function needs to be configured with an environment variable `MS_OCP_APIM_SUBSCRIPTION_KEY` where 
you put your freshly obtained key (this is needed only if language with locales other than `en-US` and `en-GB` are
configured, see also setup steps below).

## General Setup

Do the setup in this order:

1. Setup the Alexa skill.
2. Create a Lambda function.
3. Configure the Application ID.

### Setup Alexa Skill

1. Login to your [Amazon Developer Account](http://developer.amazon.com).
2. Choose _Alexa_ tab.
3. Click button _Add a New Skill_ (on the right top).
4. In _Skill Information_:
    1. Choose a _Name_, e.g. _Chuck Norris Jokes_.
    2. Choose an _Invocation Name_, e.g. _chuck norris_.
    3. Save.
5. Switch to _Interaction Model_:
    1. Insert _Intent Schema_ (copy from _./speechAssets/IntentSchema.json_).
    2. Define _Custom Slot Type_ named `FACT_TYPE` and insert list values from _./speechAssets/slots.txt_.
    3. Add _Sample Utterances_ (copy from _./speechAssets/SampleUtterances.txt_).
6. In _Configuration_ insert the [ARN](https://docs.aws.amazon.com/en_us/general/latest/gr/aws-arns-and-namespaces.html)
   of the created Lambda function into the _Default_ field.
7. Optional: add more languages (of course, this requires the translation of the _utterances_ and categories to the target language).

### Setup of Lambda Function

1. Login with your account to [AWS Management Console](https://aws.amazon.com).
2. Switch to _Lamda_ section.
3. Click button _Create function_ (on the right top).
4. Choose button _Author from scratch_.
5. In _Configure triggers_ click on the dotted square (in _Add Trigger_ field) and choose _Alexa Skills Kit_, click _Next_ button.
6. Copy the code from _./src/index.js_ to the _Lambda function code_'s field.
7. Optional: If translation needed add `MS_OCP_APIM_SUBSCRIPTION_KEY` environment variable.
8. Choose _lambda_basic_execution_ in _Existing role<sup>*</sup>_ field.
9. Export the function.

### Configure the Application ID

Once the skill is created you can find this value on the skill's page on http://developer.amazon.com. Copy it and
configure the Lambda function with an environment variable `APP_ID` and assign the copied value.

## Limitations

- A [Serverless](https://serverless.readme.io) setup is missing at the moment, but the _./src/index.js_ can simply be copied
into the Lambda function's code window of the AWS console.
- Joke category Mapping is not implemented yet for German language (only first use case can be applied).

## Legal disclaimer

This project and its creator is not affiliated with Chuck Norris, any motion picture corporation, any television
corporation, parent, or affiliate corporation. All motion pictures, products, and brands mentioned in this README
are the respective trademarks and copyrights of their owners. All content provided by this project is intended for
humorous entertainment (satire) purposes only. The content provided by this project is not necessarily true and
should not be regarded as truth!
