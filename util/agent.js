const { SocksProxyAgent } = require('socks-proxy-agent');

const agent = new SocksProxyAgent(`socks5://127.0.0.1:1081`);

module.exports = { agent };
