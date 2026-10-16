const { EventEmitter } = require("events");

const notificationEmitter = new EventEmitter();
notificationEmitter.setMaxListeners(200);

module.exports = notificationEmitter;
