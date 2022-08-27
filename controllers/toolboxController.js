var express = require('express');
var controller = express.Router();

var uuid = require('uuid');

controller.get('/uuid', (req, res) => {
    res.status(200).send(uuid.v4());
});

module.exports = controller;