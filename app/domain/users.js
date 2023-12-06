//dependencies------------------------------------------------------------------
const {clientUsers} = require('../infrastructure/user_client')
const {app_logger} = require("../log/app_logger");

//configure logger
const context = {context: "users.js"};
const log = app_logger.child(context);

const default_profile = "user";

class User {
    constructor() {
        this.card_id = null;
        this.file = "";
        this.status = false;
        this.name = "";
        this.lastname = "";
        this.email = "";
        this.profile = default_profile;     
    }

    get(card_id){  
        return new Promise((resolve) => {
            clientUsers.GetUser({id: card_id}, (error, userData) => {
                if (error) {
                    log.error(error);
                    resolve(false);
                } else {
                    this.card_id = card_id;
                    this.file = userData.file;
                    this.status = userData.status;
                    this.name = userData.name;
                    this.lastname = userData.lastname;
                    this.email = userData.email;
                    this.profile = userData.profile;
                    log.info(`Usuario ${this}`);
                    resolve(true);
                }
            }) 
        })
    }

    clear(){ 
        this.card_id = null;
        this.file = "";
        this.status = false;
        this.name = "";
        this.lastname = "";
        this.email = "";
        this.profile = default_profile;  
        log.info(`Info de usuario borada`);
    }

    registerCard(){
        return new Promise((resolve) => {
            clientUsers.RegCard({id: this.card_id}, (error, success) => {
                if (error) {
                    log.error(error);
                    resolve(false);
                } else {
                    log.info(`Tarjeta ${this.card_id} registrada`);
                    resolve(true);
                }
            })  
        })  
    }

    registerUser(){
        return new Promise((resolve) => {
            clientUsers.RegUser({id: this.card_id, file: this.file,  status: this.status, name: this.name, lastname: this.lastname, email: this.email, profile: default_profile}, (error, success) => {
                if (error) {
                    log.error(error);
                    resolve(false);
                } else {
                    if(success.success === true){
                        log.info(`Usuario registrado: ${this}`);
                        resolve(true);
                    } else{
                        log.error(`No se pudo registrar Usuario`);
                        resolve(false);
                    }
                }
            })  
        })    
    }
  
    changeProfile(profile) {
        return new Promise((resolve) => {
            clientUsers.ChangeProfile({id: this.card_id, file: this.file, status: this.status, name: this.name, lastname: this.lastname, email: this.email, profile: profile}, (error, success) => {
                if (error) {
                    log.error(error);
                    resolve(false);
                } else {
                    this.profile = profile;
                    log.info(`Perfil de usuario modificado: ${this}`);
                    resolve(true);
                }
            }) 
        })    
    }
  
    deleteUser() {
        return new Promise((resolve) => {
            clientUsers.DeleteUser({id: this.card_id, status: this.status, name: this.name, lastname: this.lastname, profile: this.profile}, (error, success) => {
                if (error) {
                    log.error(error);
                    resolve(false);
                } else {
                    log.info(`Usuario borrado: ${this}`)
                    resolve(true);
                }     
            }) 
        })       
    }
  
    deleteCard() {
        return new Promise((resolve) => {
            clientUsers.DeleteCard({id: this.card_id, status: this.status, name: this.name, lastname: this.lastname, profile: this.profile}, (error, success) => {
                if (error) {
                    log.error(error);
                    resolve(false);
                } else {
                    log.info(`Tarjeta borrada: ${this.card_id}`);
                    resolve(true);
                }     
            })
        })         
    }
  }

// Exporting variables and functions
module.exports = {User}