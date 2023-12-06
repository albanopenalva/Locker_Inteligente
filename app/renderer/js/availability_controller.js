const back_btn = document.querySelector('#atras');
const lock1 = document.querySelector('#lock1');
const unlock1 = document.querySelector('#unlock1');
const lock2 = document.querySelector('#lock2');
const unlock2 = document.querySelector('#unlock2');
const lock3 = document.querySelector('#lock3');
const unlock3 = document.querySelector('#unlock3');
const lock4 = document.querySelector('#lock4');
const unlock4 = document.querySelector('#unlock4');
const lock5 = document.querySelector('#lock5');
const unlock5 = document.querySelector('#unlock5');
const lock6 = document.querySelector('#lock6');
const unlock6 = document.querySelector('#unlock6');
const lock7 = document.querySelector('#lock7');
const unlock7 = document.querySelector('#unlock7');
const lock8 = document.querySelector('#lock8');
const unlock8 = document.querySelector('#unlock8');
const lock9 = document.querySelector('#lock9');
const unlock9 = document.querySelector('#unlock9');
const lock10 = document.querySelector('#lock10');
const unlock10 = document.querySelector('#unlock10');
const lock11 = document.querySelector('#lock11');
const unlock11 = document.querySelector('#unlock11');
const lock12 = document.querySelector('#lock12');
const unlock12 = document.querySelector('#unlock12');
const lock13 = document.querySelector('#lock13');
const unlock13 = document.querySelector('#unlock13');
const lock14 = document.querySelector('#lock14');
const unlock14 = document.querySelector('#unlock14');
const lock15 = document.querySelector('#lock15');
const unlock15 = document.querySelector('#unlock15');
const lock16 = document.querySelector('#lock16');
const unlock16 = document.querySelector('#unlock16');
const lock = [lock1, lock2, lock3, lock4, 
    lock5, lock6, lock7, lock8, 
    lock9, lock10, lock11, lock12, 
    lock13, lock14, lock15, lock16];
const unlock = [unlock1, unlock2, unlock3, unlock4, 
    unlock5, unlock6, unlock7, unlock8, 
    unlock9, unlock10, unlock11, unlock12, 
    unlock13, unlock14, unlock15, unlock16];
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
const locker1 = document.querySelector('#locker1');
const locker2 = document.querySelector('#locker2');
const locker3 = document.querySelector('#locker3');
const locker4 = document.querySelector('#locker4');
const locker5 = document.querySelector('#locker5');
const locker6 = document.querySelector('#locker6');
const locker7 = document.querySelector('#locker7');
const locker8 = document.querySelector('#locker8');
const locker9 = document.querySelector('#locker9');
const locker10 = document.querySelector('#locker10');
const locker11 = document.querySelector('#locker11');
const locker12 = document.querySelector('#locker12');
const locker13 = document.querySelector('#locker13');
const locker14 = document.querySelector('#locker14');
const locker15 = document.querySelector('#locker15');
const locker16 = document.querySelector('#locker16');
const cabinet = document.querySelector('#cabinet');
const loader = document.querySelector('#loader');
const success_alert = document.querySelector('#success_alert');
const success_alert_txt = document.querySelector('#success_alert_txt');
const error_alert = document.querySelector('#error_alert');
const error_alert_txt = document.querySelector('#error_alert_txt');
const warning_alert = document.querySelector('#warning_alert');
const warning_alert_txt = document.querySelector('#warning_alert_txt');

//configure logger
const context = {context: "availability.js"};

//send to main
function toIndex(){
    app_logger.info(`Cargando pantalla index`);
    ipcRenderer.send('page:index', null);
}

//send alert
function isOccupied(lock_num){
    error_alert.classList.add("hidden");
    error_alert.classList.remove("rotate-horizontal-center");
    success_alert.classList.add("hidden");
    success_alert.classList.remove("rotate-horizontal-center");
    if(lock[lock_num-1].classList.contains("hidden")){
        //casillero libre
        success_alert_txt.innerText = "Casillero libre";
        success_alert.classList.remove("hidden");
        success_alert.classList.add("rotate-horizontal-center");
        setTimeout(function () {
            success_alert.classList.add("hidden");
            success_alert.classList.remove("rotate-horizontal-center");
        }, 3000);
    } else{
        //casillero ocupado
        error_alert_txt.innerText = "Casillero ocupado!";
        error_alert.classList.remove("hidden");
        error_alert.classList.add("rotate-horizontal-center");
        cabinet.classList.add("shake-left-right");
        setTimeout(function () {
            error_alert.classList.add("hidden");
            error_alert.classList.remove("rotate-horizontal-center");
            cabinet.classList.remove("shake-left-right");
            cabinet.classList.remove("animate-bouncetop");
        }, 3000);
    }
}

//load availability
ipcRenderer.on('locker:available', (available) => {
    loader.classList.remove("loader");
    cabinet.classList.remove("hidden");
    cabinet.classList.add("animate-bouncetop");
    var i = 0;
    for (const key of Object.keys(available)) {
        if(available[key]){
            lock[i].classList.add("hidden");
            unlock[i].classList.remove("hidden");
            app_logger.info(context, `Casillero ${i+1} libre`);
        } else{
            unlock[i].classList.add("hidden");
            lock[i].classList.remove("hidden");
            app_logger.info(context, `Casillero ${i+1} ocupado`);
        }
        i++;
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

//event listeners
back_btn.addEventListener('click', toIndex);
locker1.addEventListener('click', function(){isOccupied(1)});
locker2.addEventListener('click', function(){isOccupied(2)});
locker3.addEventListener('click', function(){isOccupied(3)});
locker4.addEventListener('click', function(){isOccupied(4)});
locker5.addEventListener('click', function(){isOccupied(5)});
locker6.addEventListener('click', function(){isOccupied(6)});
locker7.addEventListener('click', function(){isOccupied(7)});
locker8.addEventListener('click', function(){isOccupied(8)});
locker9.addEventListener('click', function(){isOccupied(9)});
locker10.addEventListener('click', function(){isOccupied(10)});
locker11.addEventListener('click', function(){isOccupied(11)});
locker12.addEventListener('click', function(){isOccupied(12)});
locker13.addEventListener('click', function(){isOccupied(13)});
locker14.addEventListener('click', function(){isOccupied(14)});
locker15.addEventListener('click', function(){isOccupied(15)});
locker16.addEventListener('click', function(){isOccupied(16)});