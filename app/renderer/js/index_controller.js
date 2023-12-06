const available_btn = document.querySelector('#disponibles');
const error_alert = document.querySelector('#error_alert');
const error_alert_txt = document.querySelector('#error_alert_txt');
const warning_alert = document.querySelector('#warning_alert');
const warning_alert_txt = document.querySelector('#warning_alert_txt');

//configure logger
const context = {context: "index.js"};

//send to main
function seeAvailable(){
    app_logger.info(context, `Cambiando a pantalla de casilleros disponibles`);
    ipcRenderer.send('page:available', null);
}

//invalid card
ipcRenderer.on('card:invalid', () => {
    error_alert_txt.innerText = `Tarjeta inválida!`;
    error_alert.classList.remove("hidden");
    error_alert.classList.add("rotate-horizontal-center");
    setTimeout(function () {
        error_alert.classList.add("hidden");
        error_alert.classList.remove("rotate-horizontal-center");
    }, 3000); 
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
available_btn.addEventListener('click', seeAvailable);