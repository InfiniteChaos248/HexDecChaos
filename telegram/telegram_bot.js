var Telegraf = require("telegraf");
var OTP_CHAT_ID_CACHE = require("./cache");

const ONES = Math.pow(10, 5);
const NINES = 9 * ONES;

const bot = new Telegraf.Telegraf(process.env.TELEGRAM_BOT_TOKEN);

bot.start((ctx) => ctx.reply('Hello, I am HexDecChaos bot'));

bot.command('register', async (ctx) => {    
    chat_id = ctx.message.chat.id;
    var otp = Math.floor(ONES + Math.random() * NINES);
    OTP_CHAT_ID_CACHE.set(otp, chat_id, process.env.CACHE_TTL);
    ctx.reply('please use "' + otp + '" to register');
});

module.exports = bot;