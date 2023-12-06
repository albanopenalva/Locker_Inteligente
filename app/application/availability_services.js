//dependencies------------------------------------------------------------------
const path = require('path');
const {Turn} = require("../domain/turns");
const {app_logger} = require("../log/app_logger");

//configure logger--------------------------------------------------------------
const context = {context: "availability_services.js"};
const log = app_logger.child(context);

//variables---------------------------------------------------------------------


//exported functions------------------------------------------------------------
//Load availability page
function loadAvailability(window){
    log.info(`Cargando pantalla de disponibilidad de casilleros`);
    window.loadFile(path.join(__dirname, '../renderer/availability.html'));
    lockerAvailable(window);
}
//Check fo available lockers
async function lockerAvailable(window){
    //check lockers available
    let turn = new Turn();
    let free_lockers = await turn.areFree();
    if(free_lockers == null){
        log.error(`Error buscando casilleros libres`);
    }
    //send lockers available to renderer
    window.webContents.once('did-finish-load', () => {
        window.webContents.send('locker:available', free_lockers);
    });
}

// Exporting variables and functions
module.exports = {loadAvailability}