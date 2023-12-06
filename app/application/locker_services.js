//dependencies------------------------------------------------------------------
const path = require('path');
const {app_logger} = require("../log/app_logger");

//configure logger--------------------------------------------------------------
const context = {context: "locker_services.js"};
const log = app_logger.child(context);

//variables---------------------------------------------------------------------


//exported functions------------------------------------------------------------
//Load locker page
function loadlocker(window, user, turn){
    log.info(`Cargando pantalla de casillero`);
    window.loadFile(path.join(__dirname, '../renderer/locker.html'));
    //send lockers number to renderer
    window.webContents.once('did-finish-load', () => {
        window.webContents.send('locker:info', {turn, user});
    });
}
//open door
function openDoor(cabinet, door_num){
    //play select sound
    cabinet.speaker.select()
    log.info(`Abriendo puerta ${door_num}`);
    cabinet.lockers[door_num-1].open();
}
//end turn
async function endTurn(cabinet, turn){
    //deactivate outlet
    cabinet.lockers[turn.lock_num-1].setOutlet(false);
    //end turn
    let success = await turn.end();
    if(!success){
        log.error(`Error finalizando turno`);
    }
    //play exit sound
    cabinet.speaker.exit()
    log.info(`Turno finalizado`);
}

// Exporting variables and functions
module.exports = {loadlocker, openDoor, endTurn}