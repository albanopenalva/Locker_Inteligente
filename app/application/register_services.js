//dependencies------------------------------------------------------------------
const path = require('path');
const {app_logger} = require("../log/app_logger");

//configure logger--------------------------------------------------------------
const context = {context: "register_services.js"};
const log = app_logger.child(context);

//variables---------------------------------------------------------------------

//exported functions------------------------------------------------------------
//Load register page
function loadRegister(window){
    log.info(`Cargando pantalla de registro`);
    window.loadFile(path.join(__dirname, '../renderer/register.html')); 
}
//Register user
async function registerUser(window, user, data){
    user.file = data.file;
    user.name = data.name;
    user.lastname = data.lastname;
    user.email = data.email;
    let success = await user.registerUser();
    if(!success){
        log.error(`Error registrando usuario: ${user}`);
        window.webContents.send('user:register', false);
        return false;
    }
    log.info(`Usuario: ${user} registrado`);
    window.webContents.send('user:register', true);
    return true;
}

// Exporting variables and functions
module.exports = {loadRegister, registerUser}