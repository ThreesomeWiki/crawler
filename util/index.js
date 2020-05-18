const download = require('./download');
const time = require('./time');
const request = require('./request');

module.exports = { ...download, ...time, ...request };
