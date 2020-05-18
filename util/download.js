const Axios = require('axios');
const fs = require('fs');
const { promisify } = require('util');
const { agent } = require('./agent');

const statAsync = promisify(fs.stat);

const downloadImage = async (url, filename, useAgent = true) => {
    try {
        const exit = await statAsync(filename).catch(() => '');
        if (exit) return;
        const file = fs.createWriteStream(filename);
        const ret = await Axios.get(url, { agent: useAgent ? agent : undefined, responseType: 'stream' });
        ret.data.pipe(file);
        return new Promise((resolve, reject) => {
            file.on('finish', resolve);
            file.on('error', reject);
        });
    } catch (e) {}
};

module.exports = { downloadImage };
