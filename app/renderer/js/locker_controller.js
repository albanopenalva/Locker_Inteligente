const back_btn = document.querySelector('#atras');
const open_btn = document.querySelector('#abrir');
const end_turn_btn = document.querySelector('#fin_turno');
const cancel_btn = document.querySelector('#cancelar');
const confirm_btn = document.querySelector('#confirmar');
const timeout_warn = document.querySelector('#timeout_warn');
const lock1_open = document.querySelector('#lock1_o');
const lock1_closed = document.querySelector('#lock1_c');
const lock2_open = document.querySelector('#lock2_o');
const lock2_closed = document.querySelector('#lock2_c');
const lock3_open = document.querySelector('#lock3_o');
const lock3_closed = document.querySelector('#lock3_c');
const lock4_open = document.querySelector('#lock4_o');
const lock4_closed = document.querySelector('#lock4_c');
const lock5_open = document.querySelector('#lock5_o');
const lock5_closed = document.querySelector('#lock5_c');
const lock6_open = document.querySelector('#lock6_o');
const lock6_closed = document.querySelector('#lock6_c');
const lock7_open = document.querySelector('#lock7_o');
const lock7_closed = document.querySelector('#lock7_c');
const lock8_open = document.querySelector('#lock8_o');
const lock8_closed = document.querySelector('#lock8_c');
const lock9_open = document.querySelector('#lock9_o');
const lock9_closed = document.querySelector('#lock9_c');
const lock10_open = document.querySelector('#lock10_o');
const lock10_closed = document.querySelector('#lock10_c');
const lock11_open = document.querySelector('#lock11_o');
const lock11_closed = document.querySelector('#lock11_c');
const lock12_open = document.querySelector('#lock12_o');
const lock12_closed = document.querySelector('#lock12_c');
const lock13_open = document.querySelector('#lock13_o');
const lock13_closed = document.querySelector('#lock13_c');
const lock14_open = document.querySelector('#lock14_o');
const lock14_closed = document.querySelector('#lock14_c');
const lock15_open = document.querySelector('#lock15_o');
const lock15_closed = document.querySelector('#lock15_c');
const lock16_open = document.querySelector('#lock16_o');
const lock16_closed = document.querySelector('#lock16_c');
const lock_open = [lock1_open, lock2_open, lock3_open, lock4_open, 
    lock5_open, lock6_open, lock7_open, lock8_open, 
    lock9_open, lock10_open, lock11_open, lock12_open, 
    lock13_open, lock14_open, lock15_open, lock16_open];
const lock_closed = [lock1_closed, lock2_closed, lock3_closed, lock4_closed, 
    lock5_closed, lock6_closed, lock7_closed, lock8_closed, 
    lock9_closed, lock10_closed, lock11_closed, lock12_closed, 
    lock13_closed, lock14_closed, lock15_closed, lock16_closed]; 
const lock_number = document.querySelector('#casillero');
const hour = document.querySelector('#hour');
const min = document.querySelector('#min');
const user_txt = document.querySelector('#usuario');
const cabinet = document.querySelector('#cabinet');
const info_locker = document.querySelector('#info_locker');
const loader = document.querySelector('#loader');
const success_alert = document.querySelector('#success_alert');
const error_alert = document.querySelector('#error_alert');
const success_alert_txt = document.querySelector('#success_alert_txt');
const error_alert_txt = document.querySelector('#error_alert_txt');
const warning_alert = document.querySelector('#warning_alert');
const info_alert = document.querySelector('#info_alert');
const warning_alert_txt = document.querySelector('#warning_alert_txt');
const info_alert_txt = document.querySelector('#info_alert_txt');

var end_time = null;
var door_num = null;

//configure logger
const context = {context: "locker.js"};

//send to main
function toIndex(){
    ipcRenderer.send('page:index', null);
    cabinet.classList.add("slide-down");
    info_locker.classList.add("slide-down");
}

//load user name
ipcRenderer.on('locker:info', ({turn, user}) => {
    user_txt.innerText = user.name + " " + user.lastname;
    lock_number.innerText = "Casillero " + turn.lock_num;
    lock_closed[turn.lock_num-1].classList.add("animate-pong");
    end_time = new Date(turn.end_time);
    app_logger.info(context, `Hora de finalización ${turn.end_time}`);
    const date_time = turn.end_time.split(" ");
    success_alert_txt.innerText = `Bienvenido ${user.name} ${user.lastname}. \r\nTienes asignado el casillero ${turn.lock_num}. \r\nTu turno termina a las ${date_time[1]}.`;
    door_num = turn.lock_num;
    success_alert.classList.remove("hidden");
    success_alert.classList.add("rotate-horizontal-center");
    setTimeout(function () {
        success_alert.classList.add("hidden");
        success_alert.classList.remove("rotate-horizontal-center");
    }, 5000); 
    loader.classList.remove("loader");
    cabinet.classList.remove("hidden");
    cabinet.classList.add("animate-bouncetop");
    info_locker.classList.remove("hidden");
    info_locker.classList.add("animate-fallingjello");
});

//door open alarm
ipcRenderer.on('door:alarm', (state) => {
    if(state){
        warning_alert_txt.innerText = `Puerta Abierta!\r\nCerrarla por favor.`;
        error_alert.classList.add("hidden");
        warning_alert.classList.remove("hidden");
        warning_alert.classList.add("rotate-horizontal-center-cont");
    } else{
        warning_alert.classList.add("hidden");
        warning_alert.classList.remove("rotate-horizontal-center-cont");
    }
});

//load open door
ipcRenderer.on('locker:open', (num) => {
    lock_closed[num-1].classList.add("hidden");
    lock_open[num-1].classList.remove("hidden");
});

//load closed door
ipcRenderer.on('locker:closed', (num) => {
    lock_closed[num-1].classList.remove("hidden");
    lock_open[num-1].classList.add("hidden");
});

function currentTime() {
    if(end_time != null){
        let date = new Date();
        let seconds = parseInt((end_time - date) / 1000);
        let mm = parseInt(seconds / 60);
        let hh = parseInt(mm / 60);
        mm = mm - hh * 60;

        hh = (hh < 10) ? "0" + hh : hh;
        mm = (mm < 10) ? "0" + mm : mm;
      
        hour.innerText = hh; 
        min.innerText = mm + "hs"; 
    }
    
    let t = setTimeout(function(){ currentTime() }, 1000);
}
currentTime();

function openLocker() {
    ipcRenderer.send('door:open', null);
    success_alert_txt.innerText = `Puerta ${door_num} desbloqueada.`;
    success_alert.classList.remove("hidden");
    success_alert.classList.add("rotate-horizontal-center");
    setTimeout(function () {
        success_alert.classList.add("hidden");
        success_alert.classList.remove("rotate-horizontal-center");
    }, 5000); 
}

function endTurn() {
    ipcRenderer.send('turn:end', null);
    cabinet.classList.add("slide-down");
    info_locker.classList.add("slide-down");
    info_alert.classList.add("hidden");
    info_alert.classList.remove("rotate-horizontal-center");
}

function doConfirm() {
    success_alert.classList.add("hidden");
    success_alert.classList.remove("rotate-horizontal-center");
    error_alert.classList.add("hidden");
    error_alert.classList.remove("rotate-horizontal-center");
    info_alert.classList.remove("hidden");
    info_alert.classList.add("rotate-horizontal-center");
}

function doCancel() {
    info_alert.classList.add("hidden");
    info_alert.classList.remove("rotate-horizontal-center");
}

function showTimeout() {
    success_alert.classList.add("hidden");
    success_alert.classList.remove("rotate-horizontal-center");
    error_alert.classList.add("hidden");
    error_alert.classList.remove("rotate-horizontal-center");
    warning_alert_txt.innerText = `Tu turno termina a las ${end_time.getHours()}:${end_time.getMinutes()}hs.\r\nRecuerda retirar todas tus pertenencias antes de esa hora.`;
    warning_alert.classList.remove("hidden");
    warning_alert.classList.add("rotate-horizontal-center");
    setTimeout(function () {
        warning_alert.classList.add("hidden");
        warning_alert.classList.remove("rotate-horizontal-center");
    }, 5000); 
}

// Eventos
open_btn.addEventListener('click', openLocker);
end_turn_btn.addEventListener('click', doConfirm);
back_btn.addEventListener('click', toIndex);
confirm_btn.addEventListener('click', endTurn);
cancel_btn.addEventListener('click', doCancel);
timeout_warn.addEventListener('click', showTimeout);