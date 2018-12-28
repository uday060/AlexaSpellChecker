'use strict';

var rightAnsAdjectives = ["Perfect!", "Correct!", "Awesome!", "Cool!", "you are right!"];
var wrongAnsAdjectives = ["Sorry wrong answer. Try again!", "It's wrong! can you try again", "Give another try!"];
var spellingTexts = ["elephant", "goat", "frog", "dates", "cherry", "Banana", "apple"];
var questionPrefixes = ["Can you spell", "How do you spell"];
var currentSpellingText;
var noOfRightAnswers = 0;
var noOfQuestionsAsked = 0;

/**
 * This sample demonstrates a simple skill built with the Amazon Alexa Skills Kit.
 * The Intent Schema, Custom Slots, and Sample Utterances for this skill, as well as
 * testing instructions are located at http://amzn.to/1LzFrj6
 *
 * For additional samples, visit the Alexa Skills Kit Getting Started guide at
 * http://amzn.to/1LGWsLG
 */


// --------------- Helpers that build all of the responses -----------------------

function buildSpeechletResponse(title, output, repromptText, shouldEndSession) {
    return {
        outputSpeech: {
            type: 'PlainText',
            text: output,
        },
        card: {
            type: 'Simple',
            title: `SessionSpeechlet - ${title}`,
            content: `SessionSpeechlet - ${output}`,
        },
        reprompt: {
            outputSpeech: {
                type: 'PlainText',
                text: repromptText,
            },
        },
        shouldEndSession,
    };
}

function buildResponse(sessionAttributes, speechletResponse) {
    return {
        version: '1.0',
        sessionAttributes,
        response: speechletResponse,
    };
}

// --------------- Functions that control the skill's behavior -----------------------

function getWelcomeResponse(callback) {
    // If we wanted to initialize the session to have some attributes we could add those here.
    const sessionAttributes = {};
    const cardTitle = 'Welcome';
    const speechOutput = 'Welcome to Spell Bee. ' +
        'You can test your spelling skills by saying start';
    // If the user either does not reply to the welcome message or says something that is not
    // understood, they will be prompted again with this text.
    const repromptText = 'Please say start to start';
    const shouldEndSession = false;

    callback(sessionAttributes,
        buildSpeechletResponse(cardTitle, speechOutput, repromptText, shouldEndSession));
}

function handleSessionEndRequest(callback) {
    const cardTitle = 'Session Ended';
    const speechOutput = "Thanks for trying the Spell Bee!  You have answered "+noOfRightAnswers+" right answers out of "+
                        noOfQuestionsAsked+" total questions. Have a nice day!";
    // Setting this to true ends the session and exits the skill.
    const shouldEndSession = true;

    callback({}, buildSpeechletResponse(cardTitle, speechOutput, null, shouldEndSession));
}

// --------------- Events -----------------------

/**
 * Called when the session starts.
 */
function onSessionStarted(sessionStartedRequest, session) {
    console.log(`onSessionStarted requestId=${sessionStartedRequest.requestId}, sessionId=${session.sessionId}`);
}

/**
 * Called when the user launches the skill without specifying what they want.
 */
function onLaunch(launchRequest, session, callback) {
    console.log(`onLaunch requestId=${launchRequest.requestId}, sessionId=${session.sessionId}`);

    // Dispatch to your skill's launch.
    getWelcomeResponse(callback);
}

/**
 * Called when the user ends the session.
 * Is not called when the skill returns shouldEndSession=true.
 */
function onSessionEnded(sessionEndedRequest, session) {
    console.log(`onSessionEnded requestId=${sessionEndedRequest.requestId}, sessionId=${session.sessionId}`);
}

/**
 * Called when the user specifies an intent for this skill.
 */
function onIntent(intentRequest, session, callback) {
    console.log(`onIntent requestId=${intentRequest.requestId}, sessionId=${session.sessionId}`);

    const intent = intentRequest.intent;
    const intentName = intentRequest.intent.name;

    console.log('IntentName '+intentName);

    // Dispatch to your skill's intent handlers
    if (intentName === 'SpellingIntent') {
        startSpellingSession(intent, session, callback);
    } else if (intentName === 'AnswerIntent') {
        answerQuestion(intent, session, callback);
    } else if (intentName === 'AMAZON.HelpIntent') {
        getWelcomeResponse(callback);
    } else if (intentName === 'AMAZON.StopIntent' || intentName === 'AMAZON.CancelIntent') {
        handleSessionEndRequest(callback);
    } else {
        throw new Error('Invalid intent');
    }
}

function getNextQuestion() {
    noOfQuestionsAsked++;
    currentSpellingText = spellingTexts[Math.floor(Math.random() * spellingTexts.length)];
    let speechOutput = questionPrefixes[Math.floor(Math.random() * questionPrefixes.length)] +" "+ currentSpellingText + " ?";
    
    return speechOutput;
}

function startSpellingSession(intent, session, callback) {
    const cardTitle = intent.name;
    let repromptText = '';
    let sessionAttributes = {};
    const shouldEndSession = false;
    let speechOutput = '';

    console.log('Inside startSpellingSession');
    
    speechOutput = getNextQuestion();
    repromptText = "Sorry I didn't get that";

    callback(sessionAttributes,
         buildSpeechletResponse(cardTitle, speechOutput, repromptText, shouldEndSession));
}

function answerQuestion(intent, session, callback) {
    const cardTitle = intent.name;
    let repromptText = '';
    let sessionAttributes = {};
    const shouldEndSession = false;
    let speechOutput = '';
    
    console.log('Inside answerQuestion');

    let answer = intent['slots']['LETTER']['value']
    answer = answer.replace(/[\. ]+/g, '').toLowerCase();
    console.log('Current spelling text ', currentSpellingText);
    if (answer.toLowerCase() === currentSpellingText.toLowerCase()) {
        noOfRightAnswers++;
        speechOutput = rightAnsAdjectives[Math.floor(Math.random() * rightAnsAdjectives.length)] 
                    +" Here is the next question. "+getNextQuestion();
    } else {
        console.log('Inside wrong answer');
        noOfRightAnswers--;
        speechOutput = wrongAnsAdjectives[Math.floor(Math.random() * rightAnsAdjectives.length)];
    }
    console.log("answer ",answer);
    
    repromptText = speechOutput;

    callback(sessionAttributes,
         buildSpeechletResponse(cardTitle, speechOutput, repromptText, shouldEndSession));
}

// Route the incoming request based on type (LaunchRequest, IntentRequest,
// etc.) The JSON body of the request is provided in the event parameter.
exports.handler = (event, context, callback) => {
    try {
        console.log(`event.session.application.applicationId=${event.session.application.applicationId}`);

        /**
         * Uncomment this if statement and populate with your skill's application ID to
         * prevent someone else from configuring a skill that sends requests to this function.
         */
        /*
        if (event.session.application.applicationId !== 'amzn1.echo-sdk-ams.app.[unique-value-here]') {
             callback('Invalid Application ID');
        }
        */

        if (event.session.new) {
            onSessionStarted({ requestId: event.request.requestId }, event.session);
        }

        if (event.request.type === 'LaunchRequest') {
            onLaunch(event.request,
                event.session,
                (sessionAttributes, speechletResponse) => {
                    callback(null, buildResponse(sessionAttributes, speechletResponse));
                });
        } else if (event.request.type === 'IntentRequest') {
             console.log("Intent Name inside handler"+event.request.intent.name);
            onIntent(event.request,
                event.session,
                (sessionAttributes, speechletResponse) => {
                    callback(null, buildResponse(sessionAttributes, speechletResponse));
                });
        } else if (event.request.type === 'SessionEndedRequest') {
            onSessionEnded(event.request, event.session);
            callback();
        }
    } catch (err) {
        callback(err);
    }
};