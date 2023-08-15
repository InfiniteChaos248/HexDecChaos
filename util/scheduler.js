const schedule = require('node-schedule');
const db = require('../util/database');
var logger = require("../log");
const bot = require('../telegram/telegram_bot');

function trigger_birthday_reminders() {
    try {
        let job_date = new Date();
        logger.info('sending reminders for date :: ' + job_date);

        var day = job_date.getDate();
        var month = job_date.getMonth();
        var year = job_date.getFullYear();

        db.all('SELECT u.id as uid, u.username, u.telegram, b.id as bid, b.name, b.relationship, b.notes, b.month, b.day, be.rem FROM user u JOIN birthday b ON u.id=b.uid JOIN birthday_events be ON b.id=be.bid WHERE u.telegram IS NOT NULL AND be.year = ? AND be.month=? AND be.day=?',
        [year, month, day], function(err, rows) {
            if(err) throw err
            if(rows) {
                rows.forEach(row => {
                    var chat_id = row['telegram']
                    var name = row['NAME']
                    var rem = row['rem']

                    var message = "";
                    if(rem === "DEFAULT") {
                        message = `It's ${name}'s Birthday today`
                    } else {
                        message = `It's ${name}'s Birthday in ${Number(rem.replace("D", ""))} days`
                    }                    
                    bot.telegram.sendMessage(chat_id, message);
                })
            }
        })
    } catch(err) {
        logger.eror('error while sending reminders :: ' + err)
    }
}

const job = schedule.scheduleJob('0 0 0 * * *', trigger_birthday_reminders);

module.exports = job;