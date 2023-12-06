//dependencies------------------------------------------------------------------
const path = require('path');
const {app_logger} = require("../log/app_logger");
const {User} = require("../domain/users");
const {Turn} = require("../domain/turns");
const {Cabinet, LOCKER_NUM} = require("../domain/cabinet");

//configure logger--------------------------------------------------------------
const context = {context: "index_services.js"};
const log = app_logger.child(context);

//variables---------------------------------------------------------------------
var any_door_open = false;
var any_door_open_prev = false;
//exported functions------------------------------------------------------------
//Load index page
function loadIndex(window){
    log.info(`Cargando pantalla index`);
    window.loadFile(path.join(__dirname, '../renderer/index.html'));
}

//read RFID cards
async function readCard(cabinet) {
    let success = await cabinet.card.get();
    if(!success){
        log.error(`Error al leer tarjeta`);
        return false;
    }
    if(cabinet.card.detected){
        return true;
    } else{
        return false;
    }
}

//indetify User
async function checkUser(window, cabinet, user, turn) {
    let success = await user.get(cabinet.card.id);
    if(!success){
        log.error(`Error al identificar usuario`);
        return "ERROR";
    }
    if(!user.status){
        //display error msj (card not recognised)
        window.webContents.send('card:invalid', null);
        //play error sound
        cabinet.speaker.error();
        log.info(`Tarjeta inválida`)
        return "ERROR";
    }
    //RFID card in database
    //play acces sound
    cabinet.speaker.access();
    if(user.name == ''){
        //User not registered
        log.info(`Usuario no registrado`);
        return "REGISTER";
    }
    //User already registered, check if admin
    if(user.profile == "admin"){
        //load admin page
        log.info(`Acceso administrador`);
        return "ADMIN"
    }
    //not admin
    log.info(`Acceso usuario`);
    //check if user have a locker
    
    success = await turn.get(cabinet.card.id);
    if(!success){
        log.error(`Error obteniendo turno`);
        return "ERROR"
    }
    if (turn.active){
        log.info(`Usuario: ${user} con turno: ${turn}`);
        //user have a locker turn
        return "TURN"
    } else{
        log.info(`Usuario: ${user} sin turno`);
        //user don't have a locker
        return "NO_TURN"
    }
}

//check open doors
async function checkDoors(window, cabinet) {
    any_door_open = false;
    for(var number=0; number<LOCKER_NUM; number++){
        //check if door is closed
        let success = await cabinet.lockers[number].isClosed();
        if(!success){
            log.error(`No se pudo checkear puertas abiertas`);
            return;
        } 
        if(cabinet.lockers[number].door_closed){
            window.webContents.send('locker:closed', number+1);
        } else{
            window.webContents.send('locker:open', number+1);
        }
        //check for open timeout
        if(cabinet.lockers[number].open_timeout){
            any_door_open = true;
            log.warn(`Puerta: ${number+1} abierta demasiado tiempo`);
            window.webContents.send('door:alarm', true);
        }
    }
    //alert
    if(any_door_open !== any_door_open_prev){
        if(any_door_open){
            cabinet.speaker.alarm_on();
        }else{
            cabinet.speaker.alarm_off();
            window.webContents.send('door:alarm', false);
        }
    }
    any_door_open_prev = any_door_open;
}

//check open doors
async function checkTurns(cabinet) {
    var turn = new Turn();
    //check lockers available
    let free_lockers = await turn.areFree();
    if(free_lockers == null){
        log.error(`Error buscando casilleros libres`);
    }
    var i = 0;
    for (const key of Object.keys(free_lockers)) {
        //if locker is free deactivate outlet
        if(free_lockers[key]){
            cabinet.lockers[i].setOutlet(false);
        } else{
            cabinet.lockers[i].setOutlet(true);
        }
        i++;
    }
}

// Exporting variables and functions
module.exports = {loadIndex, readCard, checkUser, checkDoors, checkTurns}