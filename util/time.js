const { promisify } = require('util');

module.exports = { timeAsync: promisify(setTimeout) };
