
// This is an array to define the contact numbers you want to recognise 
// as a user dials in. 
const callerNumbers = [
  {
    PhoneNumber: 'insertNumberHere in +44 format',
    CustomerName: 'Insert Name',
  },
];

// This function performs a key-value style lookup. It's likely in production systems the data
// would be stored in a database rather than an array. 
const checkCaller = dialerNumber => callerNumbers.find(caller => caller.PhoneNumber === dialerNumber);


exports.handler = (event, context, callback) => {
  // check to see if the caller is a match in our array
  const match = checkCaller(event.Details.Parameters.PhoneNumber);
  // return a response in the format required by Connect
  // the object returns whether the customer is a match or not as a bool
  // and then returns the caller details if a match is found.
  const response = {
    CustomerMatch: match ? 1 : 0,
    ...match,
  };
  return callback(null, response);
};
