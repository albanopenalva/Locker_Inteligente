//dependencies------------------------------------------------------------------
const path = require('path');
const {Turn} = require("../domain/turns");
const {app_logger} = require("../log/app_logger");
const {loadlocker} = require("./locker_services");

//configure logger--------------------------------------------------------------
const context = {context: "selection_services.js"};
const log = app_logger.child(context);

//variables---------------------------------------------------------------------

//exported functions------------------------------------------------------------
//Load selection page
async function loadSelection(window, user){
    let turn = new Turn();
    log.info(`Cargando pantalla de sección de casillero`);
    window.loadFile(path.join(__dirname, '../renderer/selection.html'));
    //check lockers available
    log.info(`Buscando casilleros libres`);
    let free_lockers = await turn.areFree();
    if(free_lockers == null){
        log.error(`Error buscando casilleros libres`);
    }
    window.webContents.once('did-finish-load', () => {
        window.webContents.send('locker:available', free_lockers);
        window.webContents.send('locker:user', user);
    });
}
//user select a locker
async function lockerSelection(window, cabinet, user, turn, lock_num){
    if(await turn.isFree(lock_num)){
        log.info(`Locker ${lock_num} libre`);
        //try to get a turn
        let success = await turn.start(user.card_id, lock_num);
        if(!success){
            log.error(`No se pudo iniciar turno`);
            return false;
        }    
        log.info(`Turno: ${turn} asignado a usuario: ${user}`);
        //activate outlet
        cabinet.lockers[turn.lock_num-1].setOutlet(true);
        //play select sound
        cabinet.speaker.select()
        //send confirmation alert
        window.webContents.send('locker:assigned', lock_num);
        //change to locker page
        setTimeout(function () {
            loadlocker(window, user, turn);
        }, 2000);   
        return true;
    } else{
        //send ocuppied alert
        window.webContents.send('locker:occupied', lock_num);
        //play error sound
        cabinet.speaker.error();
        log.info(`Locker ${lock_num} ocupado`);
        return false;
    }
}

// Exporting variables and functions
module.exports = {loadSelection, lockerSelection}