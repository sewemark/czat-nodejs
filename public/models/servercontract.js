'use strict'
module.exports = class ServerContract{
    constructor() {
        this.BROADCAST_MESSAGES = 'chat message';
        this.BROADCAST_USERS = 'application users';
        this.BROADCAST_ROOMS = 'rooms';
        this.BROADCAST_APPLICATIONUSES = 'application users';
    }
}