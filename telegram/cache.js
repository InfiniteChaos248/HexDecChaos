var NodeCache = require("node-cache");

const OTP_CHAT_ID_CACHE = new NodeCache();

module.exports = OTP_CHAT_ID_CACHE;