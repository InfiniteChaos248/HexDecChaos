var express = require('express');
var controller = express.Router();
var OTP_CHAT_ID_CACHE = require("../telegram/cache");
const db = require('../util/database');
const bot = require('../telegram/telegram_bot');

// TODO DB rollback ?

controller.post('/telegram/register', (req, res) => {
    otp = req.body['otp']  
    uid = req.headers['uid']
    username = req.headers['username']
    chat_id = OTP_CHAT_ID_CACHE.get(otp);
    if(chat_id === undefined) {
        res.status(202).send('not registered in Telegram or OTP expired');
    } else {
        db.run('UPDATE USER SET TELEGRAM = ? WHERE USERNAME = ? AND ID = ?', [chat_id, username, uid], (err) => {
            if (err) res.status(500).send("error, try again later");
            OTP_CHAT_ID_CACHE.del(otp);
            res.status(200).send("registration successful, you will now receive reminders on Telegram");
        })
    }
})

controller.get('/telegram/deregister', (req, res) => { 
    uid = req.headers['uid']
    username = req.headers['username']
    db.run('UPDATE USER SET TELEGRAM = null WHERE USERNAME = ? AND ID = ?', [username, uid], (err) => {
        if (err) res.status(500).send("error, try again later");
        res.status(200).send("deregistration successful, you will stop receiving reminders on Telegram");
    })
})

controller.get('/telegram/fetch', (req, res) => { 
    uid = req.headers['uid']
    username = req.headers['username']
    
    db.get("SELECT * FROM USER WHERE USERNAME = ? AND ID = ?", [username, uid], (err, row) => {
        if (err) res.status(500).send("error");
        if(row) {    
            if(row["telegram"] === null || row["telegram"] === undefined && row["telegram"] === "") {
                res.status(202).send("user not registered for notifications");
            } else {
                res.status(200).send("user registered for notifications");
            }            
        } else {
            res.status(202).send("user not found");
        }
    })
})

controller.get('/telegram/test', (req, res) => { 
    uid = req.headers['uid']
    username = req.headers['username']
    
    db.get("SELECT * FROM USER WHERE USERNAME = ? AND ID = ?", [username, uid], (err, row) => {
        if (err) res.status(500).send("error");
        if(row) {    
            if(row["telegram"] === null || row["telegram"] === undefined && row["telegram"] === "") {
                res.status(202).send("user not registered for notifications");
            } else {
                chat_id = Number(row["telegram"])
                bot.telegram.sendMessage(chat_id, 'This is a test message, you will get your event and birthday reminders like this');
                res.status(200).send("success");
            }            
        } else {
            res.status(202).send("user not found");
        }
    })
})

controller.get('/birthday/fetch', (req, res) => { 
    uid = req.headers['uid']
    username = req.headers['username']
    
    db.all("SELECT * FROM BIRTHDAY WHERE USERNAME = ? AND UID = ?", [username, uid], (err, rows) => {
        if (err) res.status(500).send("error");
        res.setHeader('Content-Type', 'application/json').status(200).json(rows.map(row => {
            var event = {}
            event['eid'] = row['ID']
            event['name'] = row['NAME']
            event['relationship'] = row['RELATIONSHIP']
            event['year'] = row['YEAR']
            event['month'] = row['MONTH']
            event['day'] = row['DAY']
            event['notes'] = row['NOTES']
            event['reminders'] = row['REMINDERS']
            event['wishes'] = row['WISHES']
            event['color'] = row['COLOR']
            return event
        }));
    })
})

controller.post('/birthday/add', (req, res) => { 
    try {
        uid = req.headers['uid']
        username = req.headers['username']
        name = req.body['name']
        relationship = req.body['relationship']
        year = req.body['year']
        month = req.body['month']
        day = req.body['day']
        notes = req.body['notes']
        reminders = req.body['reminders']
        wishes = req.body['wishes']
        color = req.body['color']

        db.run('INSERT INTO BIRTHDAY(UID, USERNAME, NAME, RELATIONSHIP, YEAR, MONTH, DAY, NOTES, REMINDERS, WISHES, COLOR) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)',
    [uid, username, name, relationship, year, month, day, notes, reminders, wishes, color], 
    function(err) {
        if (err) throw err;
        var bid = this.lastID;
        var today_date = new Date();
        reminders.split('|').forEach(rem => {
            var event_date = new Date();
            event_date.setMonth(month - 1, day);
            if(event_date <= today_date) {
                event_date.setFullYear(today_date.getFullYear() + 1);
            }
            if(rem!=='DEFAULT') {
                var days = Number(rem.replace("D", ""));
                event_date.setDate(event_date.getDate() - days);
            }
            db.run('INSERT INTO BIRTHDAY_EVENTS(BID, MONTH, DAY, YEAR, REM) VALUES (?, ?, ?, ?, ?)', 
            [bid, event_date.getMonth(), event_date.getDate(), event_date.getFullYear(), rem], 
            (err) => {
                if (err) throw err;
            })
        });
        res.status(200).send("success")
    })
    } catch(err) {
        res.status(500).send("error, try again later");
    }      
})

controller.post('/birthday/update', (req, res) => { 
    try {
        eid = req.body['eid']    
        uid = req.headers['uid']
        username = req.headers['username']
        name = req.body['name']
        relationship = req.body['relationship']
        year = req.body['year']
        month = req.body['month']
        day = req.body['day']
        notes = req.body['notes']
        reminders = req.body['reminders']
        wishes = req.body['wishes']
        color = req.body['color']

        db.get('SELECT * FROM BIRTHDAY WHERE USERNAME= ? AND UID= ? AND ID = ?', [username, uid, eid], function(err, row) {
            if(err) throw err;
            if(row) {
                var rescheduled = false;
                if(reminders !== row['REMINDERS'] || month !== row["MONTH"] || day !== row["DAY"]) {
                    rescheduled = true;
                }
                db.run('UPDATE BIRTHDAY SET NAME=?, RELATIONSHIP=?, YEAR=?, MONTH=?, DAY=?, NOTES=?, REMINDERS=?, WISHES=?, COLOR=? WHERE USERNAME=? AND ID=?',
                [name, relationship, year, month, day, notes, reminders, wishes, color, username, eid],
                function(err) {
                    if(err) throw err;
                    if(rescheduled) {
                        var bid = row['ID'];
                        db.run('DELETE FROM BIRTHDAY_EVENTS WHERE BID = ?', [bid], function(err) {
                            if(err) throw err;
                            var today_date = new Date();
                            reminders.split('|').forEach(rem => {
                                var event_date = new Date();
                                event_date.setMonth(month - 1, day);
                                if(event_date <= today_date) {
                                    event_date.setFullYear(today_date.getFullYear() + 1);
                                }
                                if(rem!=='DEFAULT') {
                                    var days = Number(rem.replace("D", ""));
                                    event_date.setDate(event_date.getDate() - days);
                                }
                                db.run('INSERT INTO BIRTHDAY_EVENTS(BID, MONTH, DAY, YEAR, REM) VALUES (?, ?, ?, ?, ?)', 
                                [bid, event_date.getMonth(), event_date.getDate(), event_date.getFullYear(), rem], 
                                (err) => {
                                    if (err) throw err;
                                })
                            })
                            res.status(200).send("success")
                        })
                    }
                })
            } else {
                res.status(500).send('username or event ID is not present in DB');
            }
        })

    } catch(err) {
        res.status(500).send("error, try again later");
    }      
})

controller.post('/birthday/delete', (req, res) => { 
    try {
        eid = req.body['eid']    
        uid = req.headers['uid']
        username = req.headers['username']        
        db.get('SELECT * FROM BIRTHDAY WHERE USERNAME= ? AND UID= ? AND ID = ?', [username, uid, eid], function(err, row) {
            if(err) throw err;
            if(row) {                
                db.run('DELETE FROM BIRTHDAY WHERE USERNAME= ? AND UID= ? AND ID = ?',
                [username, uid, eid],
                function(err) {
                    if(err) throw err;                    
                    db.run('DELETE FROM BIRTHDAY_EVENTS WHERE BID = ?', [eid], function(err) {
                        if(err) throw err;                        
                        res.status(200).send("success")
                    })                    
                })
            } else {
                res.status(500).send('username or event ID is not present in DB');
            }
        })
    } catch(err) {
        res.status(500).send("error, try again later");
    }      
})

module.exports = controller;