'use strict'

module.exports=  class Room{
    constructor(name){
        this.name = name;
        this.users =  new Array();
        this.messages =  new Array();
    }
}