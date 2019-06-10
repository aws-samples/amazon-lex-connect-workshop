const callerNumbers = [
  {
    PhoneNumber: 'insertNumberHere in +44 format',
    CustomerName: 'Insert Name',
  },
];

const checkCaller = dialerNumber => callerNumbers.find(caller => caller.PhoneNumber === dialerNumber);

exports.handler = (event, context, callback) => {
  const match = checkCaller(event.Details.Parameters.PhoneNumber);
  const response = {
    CustomerMatch: match ? 1 : 0,
    ...match,
  };
  return callback(null, response);
};
