const promisesAPlusTests = require('promises-aplus-tests')
const adapter = require('./MyPromise.js')
promisesAPlusTests(adapter, function (err) {
  console.log(err)
})
