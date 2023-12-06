//dependencies------------------------------------------------------------------
const {clientTurns} = require('../infrastructure/turns_client')
const {app_logger} = require("../log/app_logger");

//configure logger
const context = {context: "turns.js"};
const log = app_logger.child(context);

class Turn{
    constructor(){
        this.id = null;
        this.active = false;
        this.lock_num = null;
        this.init_time = null;
        this.end_time = null;
    }

    areFree(){
        return new Promise((resolve) => {
            clientTurns.GetFreeLockers({}, (error, data) => {
                if (error) {
                    log.error(error);
                    resolve(null);
                } else {
                    log.info(`Casilleros libres: ${data}`);
                    resolve(data);
                }
            }) 
        })
    }

    isFree(lock_num){
        return new Promise((resolve) => {
            clientTurns.GetFreeLockers({}, (error, data) => {
                if (error) {
                    log.error(error);
                    resolve(false);
                } else {
                    var i = 0;
                    for (const key of Object.keys(data)) {
                        if(i == (lock_num-1)){
                            log.info(`Casillero ${lock_num} libre: ${data[key]}`);
                            resolve(data[key]);
                        }
                        i++;
                    }
                }
            }) 
        })
    }

    get(user_id){
        return new Promise((resolve) => {
            clientTurns.UserGotTurn({id: user_id}, (error, turnData) => {
                if (error) {
                    log.error(error);
                    resolve(false);
                } else {
                    this.id = turnData.id;
                    this.active = turnData.active;
                    this.lock_num = turnData.lock_num;
                    this.init_time = turnData.init_time;
                    this.end_time = turnData.end_time;
                    log.info(`Usuario ${this.id} tiene turno: ${this.active} en casillero ${this.lock_num} a partir de las ${this.init_time} hasta las ${this.end_time}`);
                    resolve(true);
                }
            }) 
        })
    }

    getUser(lock_num){
        return new Promise((resolve) => {
            clientTurns.LockerGotTurn({num: lock_num}, (error, turnData) => {
                if (error) {
                    log.error(error);
                    resolve(false);
                } else {
                    log.info(`Casillero ${lock_num} ocupado por usuario ${turnData.id}`);
                    resolve(turnData.id);
                }
            }) 
        })
    }

    start(user_id, lock_num){
        return new Promise((resolve) => {
            clientTurns.StartTurn({id: user_id, active: true, lock_num: lock_num}, (error, turnData) => {
                if (error) {
                    log.error(error);
                    resolve(false);
                } else {
                    if(turnData.active){
                        this.id = turnData.id;
                        this.active = true;
                        this.lock_num = turnData.lock_num;
                        this.init_time = turnData.start_time;
                        this.end_time = turnData.end_time;
                        log.info(`Nuevo turno para usuario ${this.id} en casillero ${this.lock_num}`);
                        resolve(true);
                    }
                    else{
                        log.error(`No se pudo inicializar turno para usuario ${this.id} en casillero ${this.lock_num}`);
                        resolve(false);
                    }
                }
            }) 
        })
    }

    end(){
        return new Promise((resolve) => {
            clientTurns.EndTurn({id: this.id, active: this.active, lock_num: this.lock_num}, (error, success) => {
                if (error) {
                    log.error(error);
                    resolve(false);
                } else {
                    log.info(`Finalizado turno de usuario ${this.id} en casillero ${this.lock_num}`);
                    this.clear();
                    resolve(true);
                }
            }) 
        })
    }

    clear(){
        this.id = null;
        this.active = false;
        this.lock_num = null;
        log.info(`Info de turno borrada`);
    }

    getByDate(date1, date2){
        let turn_list = new Array();
        return new Promise((resolve) => {
            log.info(`Recuperando turnos entre ${date1} y ${date2}`);
            const call = clientTurns.GetTurns({init_datetime: date1, end_datetime: date2});
            call.on('data', (turn) => {
                turn_list.push(turn);
            })
            call.on('end', () => {
                log.info(`${turn_list.length} turnos encontrados`);
                // calculate number of days
                var d1 = new Date(date1);
                var d2 = new Date(date2);
                var days = (d2.getTime() - d1.getTime()) / (1000 * 3600 * 24) + 1;
                // create array with diferents dates
                let dates = new Array(Math.floor(days));
                for(var i = 0; i < Math.floor(days); i++){
                    dates[i] = d1.getFullYear() + "/" + (d1.getMonth() + 1) + "/" + d1.getDate();
                    d1.setDate(d1.getDate() + 1);
                }
                // count turns for each day
                let turn_qty = new Array(dates.length).fill(0);
                for(const turn of turn_list){
                    var date_time = new Date(turn.init_time);
                    var date = date_time.getFullYear() + "/" + (date_time.getMonth() + 1) + "/" + date_time.getDate();
                    turn_qty[dates.indexOf(date)] += 1;
                }
                // create object with {date: turn_qty}
                var obj = {};
                dates.forEach((element, index) => {
                    obj[element] = turn_qty[index];
                });
                resolve(obj);
            })
        })
    }
}

// Exporting variables and functions
module.exports = {Turn}