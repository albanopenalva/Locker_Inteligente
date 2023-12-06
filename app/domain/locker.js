//dependencies------------------------------------------------------------------
const {clientLocker} = require('../infrastructure/locker_client')
const {app_logger} = require("../log/app_logger");

//configure logger
const context = {context: "loker.js"};
const log = app_logger.child(context);

class Locker{
    constructor(lock_num){
        this.num = lock_num;
        this.door_closed = true;
        this.open_timeout = false;
        this.doorOpenTimer;
        this.door_open_timeout = 60000;
        log.info(`Nuevo locker ${lock_num}`)
    }

    open(){
        clientLocker.OpenDoor({number: this.num}, (error, success) => {
            if (error) {
                log.error(error);
            } else {
                log.info(`Puerta ${this.num} desbloqueada`)
            }
        }) 
    }

    isClosed(){
        return new Promise((resolve) => {
            clientLocker.IsDoorClosed({number: this.num}, (error, door_closed) => {
                if (error) {
                    log.error(error);
                    resolve(false);
                } else {
                    if(door_closed.closed){
                        //log.info(`Puerta ${this.num} cerrada`);
                        clearTimeout(this.doorOpenTimer);
                        this.door_closed = true;
                        this.open_timeout = false;
                    } else{
                        log.info(`Puerta ${this.num} abierta`);
                        if(this.door_closed){
                            // Start timeout timer
                            this.doorOpenTimer = setTimeout(() => {
                                this.open_timeout = true;
                            }, this.door_open_timeout);
                        }
                        this.door_closed = false;
                    }
                    resolve(true);
                }
            }) 
        })
    }

    setOutlet(activated){
        clientLocker.SetOutlet({number: this.num, activated: activated}, (error, success) => {
            if (error) {
                log.error(error);
            } else {
                log.info(`Tomacorrientes ${this.num} en estado ${activated}`)
            }
        })
    }
}

// Exporting variables and functions
module.exports = {Locker}