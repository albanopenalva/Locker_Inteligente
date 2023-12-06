//dependencies------------------------------------------------------------------
const {clientLocker} = require('../infrastructure/locker_client')
const {app_logger} = require("../log/app_logger");

//configure logger
const context = {context: "speaker.js"};
const log = app_logger.child(context);

const CLICK = 0
const ERROR = 1
const SELECT = 2
const RETURN = 3
const ACCESS = 4
const EXIT = 5
const ALARM = 6

class Speaker{
    constructor(){
        log.info(`Nuevo Speaker`)
    }

    alarm_on(){
        const sound = {on: true, sound: ALARM, loop: true}
        clientLocker.PlaySound(sound, (error, success) => {
            if (error) {
                log.error(error);
            } else {
                log.info(`Alarma encendida`)
            }
        }) 
    }

    alarm_off(){
        const sound = {on: false, sound: ALARM, loop: false}
        clientLocker.PlaySound(sound, (error, success) => {
            if (error) {
                log.error(error);
            } else {
                log.info(`Alarma apagada`)
            }
        }) 
    }

    click(){
        const sound = {on: true, sound: CLICK, loop: false}
        clientLocker.PlaySound(sound, (error, success) => {
            if (error) {
                log.error(error);
            } else {
                log.info(`Reproduciendo sonido click`)
            }
        }) 
    }

    error(){
        const sound = {on: true, sound: ERROR, loop: false}
        clientLocker.PlaySound(sound, (error, success) => {
            if (error) {
                log.error(error);
            } else {
                log.info(`Reproduciendo sonido error`)
            }
        }) 
    }

    select(){
        const sound = {on: true, sound: SELECT, loop: false}
        clientLocker.PlaySound(sound, (error, success) => {
            if (error) {
                log.error(error);
            } else {
                log.info(`Reproduciendo sonido select`)
            }
        }) 
    }

    return(){
        const sound = {on: true, sound: RETURN, loop: false}
        clientLocker.PlaySound(sound, (error, success) => {
            if (error) {
                log.error(error);
            } else {
                log.info(`Reproduciendo sonido return`)
            }
        }) 
    }

    access(){
        const sound = {on: true, sound: ACCESS, loop: false}
        clientLocker.PlaySound(sound, (error, success) => {
            if (error) {
                log.error(error);
            } else {
                log.info(`Reproduciendo sonido access`)
            }
        }) 
    }

    exit(){
        const sound = {on: true, sound: EXIT, loop: false}
        clientLocker.PlaySound(sound, (error, success) => {
            if (error) {
                log.error(error);
            } else {
                log.info(`Reproduciendo sonido exit`)
            }
        }) 
    }
}

// Exporting variables and functions
module.exports = {Speaker}