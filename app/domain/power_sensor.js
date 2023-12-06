//dependencies------------------------------------------------------------------
const {clientLocker} = require('../infrastructure/locker_client')
const {app_logger} = require("../log/app_logger");

//configure logger
const context = {context: "power_sensor.js"};
const log = app_logger.child(context);

class PowerSensor{
    constructor(){

    }

    getByDate(date1, date2){
        let consumption_list = new Array();
        return new Promise((resolve) => {
            log.info(`Recuperando consumo entre ${date1} y ${date2}`);
            const call = clientLocker.GetPower({init_datetime: date1, end_datetime: date2});
            call.on('data', (consumption) => {
                consumption_list.push(consumption);
            })
            call.on('end', () => {
                log.info(`${consumption_list.length} registros de consumo encontrados`);
                resolve(consumption_list);
            })
        })
    }
}

// Exporting variables and functions
module.exports = {PowerSensor}
