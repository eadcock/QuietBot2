const { promiseStatus, PromiseStatuses } = require('promise-status-async');

module.exports.wait = (promise) => {
  return new Promise(async r => {
    const status = await promiseStatus(promise);
    if(status !== PromiseStatuses.PROMISE_PENDING) {
      r();
    }
  
    promise.then(_ => { r(); });
  })
}

module.exports.name = 'awaitPromise';