//dependencies------------------------------------------------------------------
const path = require('path');
const {app, BrowserWindow, Menu, ipcMain} = require('electron');
const {User} = require("./domain/users");
const {Turn} = require("./domain/turns");
const {Cabinet, LOCKER_NUM} = require("./domain/cabinet");
const {app_logger} = require("./log/app_logger");
const {loadIndex, readCard, checkUser, checkDoors, checkTurns} = require("./application/index_services");
const {loadAdmin, loadStats, getLockerUser, forceStartTurn, forceEndTurn, registerCard, getStats} = require("./application/admin_services");
const {loadAvailability} = require("./application/availability_services");
const {loadlocker, openDoor, endTurn} = require("./application/locker_services");
const {loadSelection, lockerSelection} = require("./application/selection_services");
const {loadRegister, registerUser} = require("./application/register_services");
//configure logger
const context = {context: "main.js"};
const log = app_logger.child(context);

//variables---------------------------------------------------------------------
var user = new User();
var turn = new Turn();
var eLocker = new Cabinet();
//timers
var readCardTimer;
var availableTimer;
var doorCheckTimer;
var turnEndTimer;
var sessionEndTimer;
const read_card_period = 500;       // 0.5 seg
const available_period = 15000;     // 15 seg
const door_check_period = 2000;     // 2 seg
const turn_end_period = 60000;      // 1 min
const session_end_period = 60000;   // 1 min

//Main windows------------------------------------------------------------------
let mainWindow;
function createMainWindow(){
    mainWindow = new BrowserWindow({
      width: 1280,
      height: 800,
      //icon: `${__dirname}/assets/icons/Icon_256x256.png`,
      resizable: true,
      //fullscreen: true,
      webPreferences: {
        nodeIntegration: true,
        contextIsolation: true,
        preload: path.join(__dirname, 'preload.js'),
      },
    });
    log.info("Main windows creada");
    startUp();    
}
app.disableHardwareAcceleration();
//when the app is ready, create the window
app.on('ready', () => {
    createMainWindow();
    //create empty menu
    Menu.setApplicationMenu(null);
    //mainWindow.openDevTools();
    //remove variable from memory
    mainWindow.on('closed', () => (mainWindow = null));
});
//quit when all windows are closed.
app.on('window-all-closed', () => {
    app.quit();
});

//Index page--------------------------------------------------------------------
//change to index page
ipcMain.on('page:index', (e) => {
    //play return sound
    eLocker.speaker.return()
    startUp();
});
//start up
function startUp() {
    loadIndex(mainWindow);
    clearTimeout(availableTimer);
    log.info(`Timer para retorno de pantalla de disponibilidad detenido`);
    //start read card timer
    readCardTimer = setInterval(checkCard, read_card_period);  
    log.info(`Timer para lectura de tarjeta inicializado cada ${read_card_period}ms`);
    //start door check timer
    doorCheckTimer = setInterval(function () {
            checkDoors(mainWindow, eLocker);
        }, door_check_period);  
    log.info(`Timer para checkeo de puertas abiertas inicializado cada ${door_check_period}ms`);
    //start turn end timer
    turnEndTimer = setInterval(function () {
            checkTurns(eLocker);
        }, turn_end_period);  
    log.info(`Timer para checkeo de fin de turnos inicializado cada ${turn_end_period}ms`);
    //stop session en timer
    clearTimeout(sessionEndTimer);
    //reset values
    log.info(`Borrando info de usuario y turno`);
    user.clear();
    turn.clear();
    //eLocker.speaker.alarm_off();
}
//check_card
async function checkCard() {
    if(await readCard(eLocker)){
        //stop readCardTimer
        log.info(`Timer para lectura de tarjeta detenido`);
        clearInterval(readCardTimer);
        log.info(`Tarjeta detectada ${eLocker.card.id}`);
        var card_user = await checkUser(mainWindow, eLocker, user, turn);
        if(card_user==="ERROR"){
            readCardTimer = setInterval(checkCard, read_card_period);
        }
        if(card_user==="REGISTER"){
            loadRegister(mainWindow);
        }
        if(card_user==="ADMIN"){
            loadAdmin(mainWindow, user);
        }
        if(card_user==="TURN"){
            //open locker page
            loadlocker(mainWindow, user, turn);
            //start session end timer
            log.info(`Timer para checkeo de fin de turnos inicializado cada ${turn_end_period}ms`);
            clearTimeout(sessionEndTimer);
            sessionEndTimer = setTimeout(function () {
                startUp();
            }, session_end_period);
        }
        if(card_user==="NO_TURN"){
            //start session end timer
            clearTimeout(sessionEndTimer);
            sessionEndTimer = setTimeout(function () {
                startUp();
            }, session_end_period);
            //open selection page
            loadSelection(mainWindow, user);
        }
    }
}

//register page--------------------------------------------------------------------
//register user
ipcMain.on('user:register', (e, data) => {
    log.info(`Registrando usuario`);
    if(registerUser(mainWindow, user, data)){
        //change to locker selection page
        setTimeout(function () {
            //start session end timer
            clearTimeout(sessionEndTimer);
            sessionEndTimer = setTimeout(function () {
                startUp();
            }, session_end_period);
            loadSelection(mainWindow, user);
        }, 2000); 
    }    
});

//select locker page--------------------------------------------------------------
//user select a locker
ipcMain.on('locker:select', (e, lock_num) => {
    if(lockerSelection(mainWindow, eLocker, user, turn, lock_num)){
        //start session end timer
        clearTimeout(sessionEndTimer);
        sessionEndTimer = setTimeout(function () {
            startUp();
        }, session_end_period);
    } 
});

//locker page---------------------------------------------------------------------
//open door
ipcMain.on('door:open', (e) => {
    openDoor(eLocker, turn.lock_num);
});
//end turn
ipcMain.on('turn:end', (e) => {
    endTurn(eLocker, turn);
    // alert mensaje de despedida         
    setTimeout(function () {
        startUp();
    }, 1000); 
});

//admin page---------------------------------------------------------------
//change to stats page
ipcMain.on('page:stats', (e) => {
    loadStats(mainWindow);
});
//change to stats page
ipcMain.on('page:admin', (e) => {
    loadAdmin(mainWindow, user);
});
//admin controls
ipcMain.on('admin:open', (e, door_num) => {
    openDoor(eLocker, door_num);
});
ipcMain.on('admin:user', (e, door_num) => {
    getLockerUser(mainWindow, door_num);
});
ipcMain.on('admin:start', (e, door_num) => {
    forceStartTurn(mainWindow, eLocker, user, door_num);
});
ipcMain.on('admin:end', (e, door_num) => {
    forceEndTurn(mainWindow, eLocker, door_num);
});
ipcMain.on('admin:readcard', (e, on) => {
    if(on){
        log.info(`Timer para lectura de tarjeta inicializado`);
        readCardTimer = setInterval(function () {
            registerCard(mainWindow, eLocker);
        }, read_card_period); 
    }else{
        log.info(`Timer para lectura de tarjeta detenido`);
        clearInterval(readCardTimer);
    }
});

//stats page---------------------------------------------------------------
ipcMain.on('stats:date', (e, {date1, date2}) => {
    getStats(mainWindow, eLocker, date1, date2);
})

//availability page---------------------------------------------------------------
ipcMain.on('page:available', (e) => {
    log.info(`Timer para lectura de tarjeta detenido`);
    clearInterval(readCardTimer);
    log.info(`Timer para retorno de pantalla de disponibilidad iniciado durante ${available_period}ms`);
    availableTimer = setTimeout(function () {
        startUp();
    }, available_period);
    loadAvailability(mainWindow);
});
