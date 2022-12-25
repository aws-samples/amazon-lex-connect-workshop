const AWS = require('aws-sdk');

// Route the incoming request based on intent.
const accounts = [
  {
    type: 'current',
    pinNumber: '1234',
    balance: '134.12',
  },
  {
    type: 'saving',
    pinNumber: '1234',
    balance: '154.12',
  },
];

// Check to see if an account matches for the account type and also that the pin number for that 
// account matches the array
const getAccount = (type, pinNumber) => {
  const result = accounts.find(account => account.type.toLowerCase() === type.toLowerCase()
  && account.pinNumber === pinNumber);
  return result;
};

const balanceIntent = (intentRequest, callback) => {
  const { slots } = intentRequest.sessionState.intent;
  const sessionAttributes = { ...intentRequest.sessionState.sessionAttributes, ...slots };
  const PinNumber = intentRequest.sessionState.intent.slots.PinNumber.value.interpretedValue
  const AccountType = intentRequest.sessionState.intent.slots.AccountType.value.interpretedValue
  const account = getAccount(AccountType, PinNumber);

  if (!account) {
    callback({
      "sessionState": {
        "dialogAction": {
          "slotToElicit": "PinNumber",
          "type": "ElicitSlot"
        },
        "intent": {
          "confirmationState": "Confirmed",
          "name": "GetBalanceCheck",
          "state": "Failed"
        }, 
      },
      "messages": [
        {
          "contentType": "PlainText",
          "content": 'No accounts have been found with this pin number please re-enter your pin number'
        }
      ]
    });
    // callback(elicitSlot(sessionAttributes, 'GetBalanceCheck', slots, 'PinNumber', {
    //   contentType: 'PlainText',
    //   content: 'No accounts have been found with this pin number please re-enter your pin number',
    // }));
    
  } else {
      callback({
      "sessionState": {
        "dialogAction": {
          "type": "Close"
        },
        "intent": {
          "confirmationState": "Confirmed",
          "name": "GetBalanceCheck",
          "state": "Fulfilled"
        }, 
      },
      "messages": [
        {
          "contentType": "PlainText",
          "content": `You have £${account.balance} in your account`
        }
      ]
    });
  }
};

const balanceIntentError = (intentRequest, callback) => {
  const { slots } = intentRequest.currentIntent;
  const sessionAttributes = { ...intentRequest.sessionAttributes, ...slots };
  const account = getAccount(slots.AccountType, slots.PinNumber);
  callback(close(sessionAttributes, 'Fulfilled', {
    contentType: 'PlainText',
    content: `You have £${account.balance} in your account, is there anything can help you with?`,
  }));
};

// This a simple example to demonstrate how lambda can work with the flow
const simpleResponse = (intentRequest, callback) => {
  const { slots } = intentRequest.sessionState.intent.slots;
  const PinNumber = intentRequest.sessionState.intent.slots.PinNumber.value.interpretedValue
  const AccountType = intentRequest.sessionState.intent.slots.AccountType.value.interpretedValue
  console.log(AccountType)
  console.log(PinNumber)
  const $msg = `Thank you for using the lambda function.
  You submitted the following values AccountType:${AccountType} 
  pinNumber ${PinNumber}. Now it's time to make it actually do something!`;
  
  // callback(close({}, {
  //   contentType: 'PlainText',
  //   content: $msg,
  // }));
  
  callback({
    "sessionState": {
      "dialogAction": {
        "type": "Close"
      },
      "intent": {
        "confirmationState": "Confirmed",
        "name": "GetBalanceCheck",
        "state": "Fulfilled"
      }, 
    },
    "messages": [
      {
        "contentType": "PlainText",
        "content": $msg
      }
    ]
  })
};
//.value.interpretedValue
// Called when the user specifies an intent for this skill.
const dispatch = (intentRequest, callback) => {
  console.log(JSON.stringify(intentRequest, null, 2));
  console.log(`dispatch userId=${intentRequest.sessionId}, intentName=${intentRequest.sessionState.intent.name}`);
  const intentName = intentRequest.sessionState.intent.name;

  if (intentName === 'GetBalanceCheck') {
    return simpleResponse(intentRequest, callback);
    //return balanceIntentError(intentRequest, callback);
    //return balanceIntent(intentRequest, callback);
  }
  return {};
};

const loggingCallback = (response, originalCallback) => {
  console.log('lambda response:\n', JSON.stringify(response, null, 2));
  originalCallback(null, response);
};

// The handler function is the one that gets called by lambda as it is invoked
exports.handler = (event, context, callback) => {
  try {
    console.log(`event.bot.name=${event.bot.name}`);
    dispatch(event, response => loggingCallback(response, callback));
  } catch (err) {
    callback(err);
  }
};


// --------------- Helpers that build all of the responses -----------------------
// continue dialog with the customer, expressing that the user will select another intent after
// she hears this response
const nextIntent = (sessionAttributes, message) => {
  console.log(`nextIntent:  ${JSON.stringify(message)}`);
  return {
    sessionAttributes,
    dialogAction: {
      type: 'ElicitIntent',
      message,
    },
  };
};

const elicitSlot = (sessionAttributes, intentName, slots, slotToElicit, message) => ({
  sessionAttributes,
  dialogAction: {
    type: 'ElicitSlot',
    intentName,
    slots,
    slotToElicit,
    message,
  },
});


const confirmIntent = (sessionAttributes, intentName, slots, message) => ({
  sessionAttributes,
  dialogAction: {
    type: 'ConfirmIntent',
    intentName,
    slots,
    message,
  },
});

// const close = (sessionAttributes, fulfillmentState, message) => ({
//   sessionAttributes,
//   dialogAction: {
//     type: 'Close',
//     fulfillmentState,
//     message,
//   },
// });

const delegate = (sessionAttributes, slots) => ({
  sessionAttributes,
  dialogAction: {
    type: 'Delegate',
    slots,
  },
});
