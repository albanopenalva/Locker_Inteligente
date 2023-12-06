//dependencies------------------------------------------------------------------
const {Locker} = require("./locker");
const {Card} = require("./card");
const {Speaker} = require("./speaker");
const {PowerSensor} = require("./power_sensor");
const {app_logger} = require("../log/app_logger");

//configure logger
const context = {context: "cabinet.js"};
const log = app_logger.child(context);

const LOCKER_NUM = 16;

class Cabinet{
    constructor() {
        this.lockers = new Array();
        for(var i=1; i<=LOCKER_NUM; i++){
            this.lockers.push(new Locker(i));
        }
        this.card = new Card();
        this.speaker = new Speaker();
        this.power_sensor = new PowerSensor();
        log.info(`Nuevo eLocker`);
    }
}

// Exporting variables and functions
module.exports = {Cabinet, LOCKER_NUM}