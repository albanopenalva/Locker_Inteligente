const back_btn = document.querySelector('#atras');
const bar1 = document.querySelector('#bar1');
const bar2 = document.querySelector('#bar2');
const bar3 = document.querySelector('#bar3');
const bar4 = document.querySelector('#bar4');
const bar5 = document.querySelector('#bar5');
const bar6 = document.querySelector('#bar6');
const bar7 = document.querySelector('#bar7');
const bars = [bar1, bar2, bar3, bar4, bar5, bar6, bar7];
const lab1 = document.querySelector('#lab1');
const lab2 = document.querySelector('#lab2');
const lab3 = document.querySelector('#lab3');
const lab4 = document.querySelector('#lab4');
const lab5 = document.querySelector('#lab5');
const lab6 = document.querySelector('#lab6');
const lab7 = document.querySelector('#lab7');
const labels = [lab1, lab2, lab3, lab4, lab5, lab6, lab7];
const lab8 = document.querySelector('#lab8');
const lab9 = document.querySelector('#lab9');
const lab10 = document.querySelector('#lab10');
const lab11 = document.querySelector('#lab11');
const lab12 = document.querySelector('#lab12');
const lab13 = document.querySelector('#lab13');
const lab14 = document.querySelector('#lab14');
const labels2 = [lab8, lab9, lab10, lab11, lab12, lab13, lab14];
const lin1 = document.querySelector('#lin1');
const lin2 = document.querySelector('#lin2');
const lin3 = document.querySelector('#lin3');
const lin4 = document.querySelector('#lin4');
const lin5 = document.querySelector('#lin5');
const lin6 = document.querySelector('#lin6');
const lin7 = document.querySelector('#lin7');
const lin8 = document.querySelector('#lin8');
const lin9 = document.querySelector('#lin9');
const lin10 = document.querySelector('#lin10');
const lin11 = document.querySelector('#lin11');
const lin12 = document.querySelector('#lin12');
const lin13 = document.querySelector('#lin13');
const lin14 = document.querySelector('#lin14');
const lins = [lin1, lin2, lin3, lin4, lin5, lin6, lin7];
const datefrom = document.querySelector('#datefrom');
const dateto = document.querySelector('#dateto');
const turns_btn = document.querySelector('#radio1');
const power_btn = document.querySelector('#radio2');
const bar_plot = document.querySelector('#barras');
const lin_plot = document.querySelector('#lineas');
const charts = document.querySelector('#graficos');

//send to main
function toAdmin(){
    ipcRenderer.send('page:admin',null);
}

//stats loaded
ipcRenderer.on('stats:rdy', ({}) => {
    loader.classList.remove("loader");
    charts.classList.remove("hidden");
    charts.classList.add("animate-fallingjello");
})

//select date for showing stats
function submitDate(){
    const gmt = "T00:00:00-03:00";
    var d1 = new Date(datefrom.value+gmt);
    var d2 = new Date(datefrom.value+gmt);
    d2.setDate(d2.getDate() + 6);
    var mm1 = d1.getMonth() + 1; // getMonth() is zero-based
    var dd1 = d1.getDate();
    var mm2 = d2.getMonth() + 1; // getMonth() is zero-based
    var dd2 = d2.getDate();
    dateto.innerText = (dd2>9 ? '' : '0') + dd2 + "/" + (mm2>9 ? '' : '0') + mm2 + "/" + d2.getFullYear();
    date1 = d1.getFullYear() + "-" + (mm1>9 ? '' : '0') + mm1 + "-" + (dd1>9 ? '' : '0') + dd1+ " 00:00:00"
    date2 = d2.getFullYear() + "-" + (mm2>9 ? '' : '0') + mm2 + "-" + (dd2>9 ? '' : '0') + dd2+ " 23:59:59"
    ipcRenderer.send('stats:date', {date1, date2});
    for(const bar of bars){
        bar.classList.remove("animations-bars");
    }    
    for(const lin of lins){
        lin.classList.remove("animations-bars");
    }   
}

//change between charts
function changePlot(){
    console.log("Change plot")
    for(const bar of bars){
        bar.classList.remove("animations-bars");
    }    
    for(const lin of lins){
        lin.classList.remove("animations-bars");
    }    
    if(turns_btn.checked){        
        lin_plot.classList.add("hidden");
        for(const bar of bars){
            bar.classList.add("animations-bars");
        }    
        bar_plot.classList.remove("hidden");
    } 
    if(power_btn.checked){
        bar_plot.classList.add("hidden");
        for(const lin of lins){
            lin.classList.add("animations-bars");
        }    
        lin_plot.classList.remove("hidden");
    }
}

//locker occupied alert
ipcRenderer.on('locker:stats', ({turn_by_date, power}) => {
    //search for max number of turns in one day
    var turn_max = 0;
    for (const key of Object.keys(turn_by_date)) {
        if(turn_by_date[key] > turn_max){
            turn_max = turn_by_date[key];
        }
    }
    if(turn_max === 0){
        turn_max = 10;
    }
    //edit bar plot
    var i = 0;
    for (const key of Object.keys(turn_by_date)) {
        bars[i].style = `--size: ${turn_by_date[key]/turn_max};  --color: linear-gradient(#cb28ff, #4f68f9); opacity: 0.8`;
        bars[i].classList.add("animations-bars");
        bars[i].innerText = `${turn_by_date[key]}`;
        labels[i].innerText = `${key}`;
        i++;
    }
    //search for max consumption in one day
    var power_max = 0;
    for (const pow of power) {
        if(pow.power > power_max){
            power_max = pow.power;
        }
    }
    if(power_max === 0){
        power_max = 1;
    }
    //edit lines plot
    var i = 0;
    var start = power[0].power;
    for (const pow of power) {
        lins[i].style = `--start: ${start/power_max}; --size: ${pow.power/power_max};  --color: linear-gradient(#cb28ff, #4f68f9); opacity: 0.8`;
        start = pow.power;
        lins[i].classList.add("animations-bars");
        lins[i].innerText = `${pow.power.toFixed(2)}`;
        var text_array = pow.date.split(" ")
        labels2[i].innerText = `${text_array[0]}`;
        i++;
    }
    //show plots
    changePlot();
})

back_btn.addEventListener('click', toAdmin);
datefrom.addEventListener('input', submitDate);
turns_btn.addEventListener('click', changePlot);
power_btn.addEventListener('click', changePlot);
