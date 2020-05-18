const axios = require('axios');
const { agent } = require('./agent');

const get = async (url, params) => {
    return await axios.get(url, { agent, ...params });
};

module.exports = { get };
