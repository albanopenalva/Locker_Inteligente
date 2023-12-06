//dependencies------------------------------------------------------------------
const path = require('path');
const {User} = require("../domain/users");
const {Turn} = require("../domain/turns");
const {app_logger} = require("../log/app_logger");

//configure logger--------------------------------------------------------------
const context = {context: "admin_services.js"};
const log = app_logger.child(context);

//variables---------------------------------------------------------------------

//exported functions------------------------------------------------------------
//Load administrator page
async function loadAdmin(window, user){
    log.info(`Cargando pantalla de administrador`);
    window.loadFile(path.join(__dirname, '../renderer/admin.html'));
    //check lockers available
    let turn = new Turn();
    let free_lockers = await turn.areFree();
    if(free_lockers == null){
        log.error(`Error buscando casilleros libres`);
    }
    //send user and free lockers to renderer
    window.webContents.once('did-finish-load', () => {
        window.webContents.send('locker:user', user);
        window.webContents.send('locker:available', free_lockers);
    });
    delete turn;
}
//Load statistics page
async function loadStats(window){
    log.info(`Cargando pantalla de estadísticas`);
    window.loadFile(path.join(__dirname, '../renderer/stats.html'));
    window.webContents.once('did-finish-load', () => {
        window.webContents.send('stats:rdy', {});
    });
}
//Show a locker user's name
async function getLockerUser(window, lock_num){
    var locker_turn = new Turn();
    var locker_user = new User();
    //check locker available
    if(await locker_turn.isFree(lock_num)){
        // locker free
        log.info(`Locker ${lock_num} libre`);
    }else{
        log.info(`Locker ${lock_num} ocupado`);
        let user_id = await locker_turn.getUser(lock_num);
        let success = await locker_user.get(user_id);
        if(!success){
            log.error(`Error al identificar usuario`);
            return;
        }
    }
    window.webContents.send('admin:lockeruser', locker_user);
    delete locker_turn;
    delete locker_user;
}
//Start a turn in a free locker for the admin
async function forceStartTurn(window, cabinet, user, lock_num){
    let turn = new Turn();
    if(await turn.isFree(lock_num)){
        log.info(`Locker ${lock_num} libre`);
        //try to get a turn
        let success = await turn.start(user.card_id, lock_num);
        if(!success){
            log.error(`No se pudo iniciar turno`);
            return;
        }    
        log.info(`Turno: ${turn} asignado a usuario: ${user}`);
        //activate outlet
        cabinet.lockers[turn.lock_num-1].setOutlet(true);
        //play select sound
        cabinet.speaker.select();
        let free_lockers = await turn.areFree();
        if(free_lockers == null){
            log.error(`Error buscando casilleros libres`);
        }
        //send user and free lockers to renderer
        window.webContents.send('locker:available', free_lockers);
        //send confirmation alert
        window.webContents.send('locker:assigned', lock_num);  
    } else{
        //send ocuppied alert
        window.webContents.send('locker:occupied', lock_num);
        //play error sound
        eLocker.speaker.error();
        log.info(`Locker ${lock_num} ocupado`);
    }
    delete turn;
}
//End a turn in any locker
async function forceEndTurn(window, cabinet, lock_num){
    var locker_turn = new Turn();
    //check locker available
    if(await locker_turn.isFree(lock_num)){
        // locker free
        log.info(`Locker ${lock_num} libre`);
        window.webContents.send('admin:lockerend', false);
    }else{
        log.info(`Locker ${lock_num} ocupado`);
        //deactivate outlet
        cabinet.lockers[lock_num-1].setOutlet(false);
        //end turn
        let id = await locker_turn.getUser(lock_num);
        await locker_turn.get(id);
        let success = await locker_turn.end();
        if(!success){
            log.error(`Error finalizando turno`);
        }
        //play exit sound
        cabinet.speaker.exit()
        log.info(`Turno finalizado`);
        let free_lockers = await locker_turn.areFree();
        if(free_lockers == null){
            log.error(`Error buscando casilleros libres`);
        }
        //send user and free lockers to renderer
        window.webContents.send('locker:available', free_lockers);
        window.webContents.send('admin:lockerend', true);
    }
    delete locker_turn;
}

async function registerCard(window, cabinet){
    let success = await cabinet.card.get();
    if(!success){
        log.error(`Error al leer tarjeta`);
        return
    }
    if(cabinet.card.detected){
        //stop readCardTimer
        log.info(`Timer para lectura de tarjeta detenido`);
        cabinet.speaker.click();
        log.info(`Tarjeta detectada ${cabinet.card.id}`);
        var card_user = new User();
        let success = await card_user.get(cabinet.card.id);
        if(!success){
            log.info(`Error al identificar usuario`);
            return;
        }
        if(!card_user.status){
            log.info(`Tarjeta nueva`);
            card_user.card_id = cabinet.card.id;
            success = await card_user.registerCard();
            if(success){
                log.info(`Nueva tarjeta registrada`);
                window.webContents.send('admin:cardregistered', true);
            }
            return;
        }
        log.info(`Tarjeta ya registrada`);
        window.webContents.send('admin:cardregistered', false);
    } else{
        //do nothing
    }
}
//Search for power and turns stats between dates
async function getStats(window, cabinet, date1, date2){
    let turn = new Turn();
    let turn_by_date = await turn.getByDate(date1, date2);
    if(turn_by_date == null){
        log.error(`Error buscando turnos`);
    }else{
    }
    let power = await cabinet.power_sensor.getByDate(date1, date2);
    if(power == null){
        log.error(`Error buscando consumo`);
    }else{
    }
    //send turn data
    window.webContents.send('locker:stats', {turn_by_date, power});
    delete turn;
}

// Exporting variables and functions
module.exports = {loadAdmin, loadStats, getLockerUser, forceStartTurn, forceEndTurn, registerCard, getStats}