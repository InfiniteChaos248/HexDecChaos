var express = require('express');
var controller = express.Router();
var OTP_CHAT_ID_CACHE = require("../telegram/cache");
const db = require('../util/database');
const bot = require('../telegram/telegram_bot');

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

module.exports = controller;