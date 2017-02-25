/**
 * Created by sewemark on 2016-04-30.
 */
'use strict'
module.exports = class ClientContract{
    constructor(){
        this.CONNECTION = 'connection';
        this.USERCONNECTION = 'user connection';
        this.JOIN_ROOM = 'join room';
        this.LEAVE_ROOM ='leave room';
        this.CREATE_ROOM = 'create room';
    }
}