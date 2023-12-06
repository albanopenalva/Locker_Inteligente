//dependencies------------------------------------------------------------------
const {clientLocker} = require('../infrastructure/locker_client')
const {app_logger} = require("../log/app_logger");

//configure logger
const context = {context: "card.js"};
const log = app_logger.child(context);


class Card{
    constructor(){
        this.id = null;
        this.text = null;
        this.detected = false;
        log.info("Nuevo lector de tarjeta");
    }

    get(){
        return new Promise((resolve) => {
            clientLocker.GetID({}, (error, data) => {
                if (error) {
                    log.error(error);
                    resolve(false);
                } else {
                    this.id = data.id;
                    this.text = data.text;
                    this.detected = data.detected;
                    resolve(true);
                }
            }) 
        })        
    }
}

// Exporting variables and functions
module.exports = {Card}