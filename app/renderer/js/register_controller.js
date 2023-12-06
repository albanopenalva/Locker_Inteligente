const success_alert = document.querySelector('#success_alert');
const success_alert_txt = document.querySelector('#success_alert_txt');
const error_alert = document.querySelector('#error_alert');
const error_alert_txt = document.querySelector('#error_alert_txt');
const register_btn = document.querySelector('#registro_btn');
const file_input = document.querySelector('#file_input');
const name_input = document.querySelector('#nombre_input');
const lastname_input = document.querySelector('#apellido_input');
const email_input = document.querySelector('#email_input');
const back_btn = document.querySelector('#atras');
const loader = document.querySelector('#loader');
const form = document.querySelector('#form');
const inputs = document.querySelector('#inputs');

//send to main
function toIndex(){
    ipcRenderer.send('page:index', null);
}

//welcome msj
window.addEventListener("DOMContentLoaded", function () {
    success_alert_txt.innerText = "Bienvenido nuevo usuario!\r\nIngrese sus datos para registrarse.";
    success_alert.classList.remove("hidden");
    success_alert.classList.add("rotate-horizontal-center");
    inputs.classList.add("animate-fallingjello");
    form.classList.remove("hidden");
    setTimeout(function () {
        success_alert.classList.add("hidden");
        success_alert.classList.remove("rotate-horizontal-center");
    }, 5000);
});

function verifyData() {
    //name and lastname could not be empty
    if (file_input.value === '' || name_input.value === '' || lastname_input.value === '' || email_input.value === '' || ValidateEmail(email_input.value) === false) {
        error_alert_txt.innerText = "Datos inválidos!\r\nAsegúrese de que todos los campos esten completos y sean corrrectos.";
        error_alert.classList.remove("hidden");
        error_alert.classList.add("rotate-horizontal-center");
        setTimeout(function () {
            error_alert.classList.add("hidden");
            error_alert.classList.remove("rotate-horizontal-center");
        }, 3000);
    } else{
        form.classList.add("hidden");
        loader.classList.add("loader");
        Keyboard.close();
        //register user
        regUser(file_input.value,
                name_input.value,
                lastname_input.value,
                email_input.value)
    }    
}

//validate e-mail
function ValidateEmail(email) {
    var validRegex = /^[a-zA-Z0-9.!#$%&'*+/=?^_`{|}~-]+@[a-zA-Z0-9-]+(?:\.[a-zA-Z0-9-]+)*$/;  
    if(email.match(validRegex)){
      return true;
    } else {
      return false;
    }
}

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

//load user name
ipcRenderer.on('user:register', (success) => {
    loader.classList.remove("loader");
    if(success){
        success_alert_txt.innerText = "Usuario Registrado!";
        success_alert.classList.remove("hidden");
        success_alert.classList.add("rotate-horizontal-center");
        setTimeout(function () {
            success_alert.classList.add("hidden");
            success_alert.classList.remove("rotate-horizontal-center");
        }, 3000);
    } else{
        error_alert_txt.innerText = "Error al registrar Usuario";
        error_alert.classList.remove("hidden");
        error_alert.classList.add("rotate-horizontal-center");
        setTimeout(function () {
            error_alert.classList.add("hidden");
            error_alert.classList.remove("rotate-horizontal-center");
            form.classList.remove("hidden");
            inputs.classList.add("animate-fallingjello");
        }, 3000);
    }
});

//send to main
function regUser(file, name, lastname, email){
    ipcRenderer.send('user:register', {file, name, lastname, email});
}

//event listeners
register_btn.addEventListener('click', verifyData);
back_btn.addEventListener('click', toIndex);

//---keyboard---
const Keyboard = {
    elements: {
        main: null,
        keysContainer: null,
        keys: []
    },

    eventHandlers: {
        oninput: null,
        onclose: null
    },

    properties: {
        value: "",
        capsLock: false
    },

    init() {
        // Create main elements
        this.elements.main = document.createElement("div");
        this.elements.keysContainer = document.createElement("div");

        // Setup main elements
        this.elements.main.classList.add("keyboard", "keyboard--hidden");
        this.elements.keysContainer.classList.add("keyboard__keys");
        this.elements.keysContainer.appendChild(this._createKeys());

        this.elements.keys = this.elements.keysContainer.querySelectorAll(".keyboard__key");

        // Add to DOM
        this.elements.main.appendChild(this.elements.keysContainer);
        document.body.appendChild(this.elements.main);

        // Automatically use keyboard for elements with .use-keyboard-input
        document.querySelectorAll(".use-keyboard-input").forEach(element => {
            element.addEventListener("focus", () => {
                this.open(element.value, currentValue => {
                    element.value = currentValue;
                });
            });
        });
    },

    _createKeys() {
        const fragment = document.createDocumentFragment();
        const keyLayout = [
            "1", "2", "3", "4", "5", "6", "7", "8", "9", "0", "backspace",
            "q", "w", "e", "r", "t", "y", "u", "i", "o", "p",
            "caps", "a", "s", "d", "f", "g", "h", "j", "k", "l", "ñ", "enter",
            "done", "z", "x", "c", "v", "b", "n", "m", ",", ".", "?",
            "@", "space", "-"
        ];

        // Creates HTML for an icon
        const createIconHTML = (icon_name) => {
            return `<i class="material-icons">${icon_name}</i>`;
        };

        keyLayout.forEach(key => {
            const keyElement = document.createElement("button");
            const insertLineBreak = ["backspace", "p", "enter", "?"].indexOf(key) !== -1;

            // Add attributes/classes
            keyElement.setAttribute("type", "button");
            keyElement.classList.add("keyboard__key");

            switch (key) {
                case "backspace":
                    keyElement.classList.add("keyboard__key--wide");
                    keyElement.innerHTML = createIconHTML("backspace");

                    keyElement.addEventListener("click", () => {
                        this.properties.value = this.properties.value.substring(0, this.properties.value.length - 1);
                        this._triggerEvent("oninput");
                    });

                    break;

                case "caps":
                    keyElement.classList.add("keyboard__key--wide", "keyboard__key--activatable");
                    keyElement.innerHTML = createIconHTML("keyboard_capslock");

                    keyElement.addEventListener("click", () => {
                        this._toggleCapsLock();
                        keyElement.classList.toggle("keyboard__key--active", this.properties.capsLock);
                    });

                    break;

                case "enter":
                    keyElement.classList.add("keyboard__key--wide");
                    keyElement.innerHTML = createIconHTML("keyboard_return");

                    keyElement.addEventListener("click", () => {
                        this.properties.value += "\n";
                        this._triggerEvent("oninput");
                    });

                    break;

                case "space":
                    keyElement.classList.add("keyboard__key--extra-wide");
                    keyElement.innerHTML = createIconHTML("space_bar");

                    keyElement.addEventListener("click", () => {
                        this.properties.value += " ";
                        this._triggerEvent("oninput");
                    });

                    break;

                case "done":
                    keyElement.classList.add("keyboard__key--wide", "keyboard__key--dark");
                    keyElement.innerHTML = createIconHTML("check_circle");

                    keyElement.addEventListener("click", () => {
                        this.close();
                        this._triggerEvent("onclose");
                    });

                    break;

                default:
                    keyElement.textContent = key.toLowerCase();

                    keyElement.addEventListener("click", () => {
                        this.properties.value += this.properties.capsLock ? key.toUpperCase() : key.toLowerCase();
                        this._triggerEvent("oninput");
                    });

                    break;
            }

            fragment.appendChild(keyElement);

            if (insertLineBreak) {
                fragment.appendChild(document.createElement("br"));
            }
        });

        return fragment;
    },

    _triggerEvent(handlerName) {
        if (typeof this.eventHandlers[handlerName] == "function") {
            this.eventHandlers[handlerName](this.properties.value);
        }
    },

    _toggleCapsLock() {
        this.properties.capsLock = !this.properties.capsLock;

        for (const key of this.elements.keys) {
            if (key.childElementCount === 0) {
                key.textContent = this.properties.capsLock ? key.textContent.toUpperCase() : key.textContent.toLowerCase();
            }
        }
    },

    open(initialValue, oninput, onclose) {
        this.properties.value = initialValue || "";
        this.eventHandlers.oninput = oninput;
        this.eventHandlers.onclose = onclose;
        this.elements.main.classList.remove("keyboard--hidden");
    },

    close() {
        this.properties.value = "";
        this.eventHandlers.oninput = oninput;
        this.eventHandlers.onclose = onclose;
        this.elements.main.classList.add("keyboard--hidden");
    }
};

window.addEventListener("DOMContentLoaded", function () {
    Keyboard.init();
});
