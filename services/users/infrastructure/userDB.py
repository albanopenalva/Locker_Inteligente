# -*- coding: utf-8 -*-
"""
Database for eLocker users

Author: Albano Peñalva
Date: Abril 2023
"""

import sqlite3
import logging, logging.config
import os

class UsersDB():

    ID = 0
    FILE = 1
    NAME = 2
    LASTNAME = 3
    EMAIL = 4
    PROFILE = 5
    
    def __init__(self):
        """
        Creates users table in users Database
        """
        #Create logger
        logging.config.fileConfig(os.getcwd()+"/log/user_logger.conf", disable_existing_loggers=False)
        self.logger = logging.getLogger(__name__)
        self.logger.info("Base de datos inicializada.")

        #Create DB
        try:
            self.DB = os.getcwd()+"/infrastructure/users.db"
            conn = sqlite3.connect(self.DB)
            cur = conn.cursor()
            cur.execute(""" CREATE TABLE IF NOT EXISTS users (
                id INT NOT NULL PRIMARY KEY,
                file TEXT UNIQUE,
                name TEXT,
                lastname TEXT,
                email TEXT UNIQUE,
                profile TEXT
                ) """)
            conn.close()
        except Exception as e:
            self.logger.error("No se puede conectar a base de datos", exc_info=True)
        
        
    def insert(self, user):
        """
        Add user to users Database
        ------------------------
        INPUT:
        --------
        user: dict containing id: RFID card ID, name: user's name, lastname: user's lastname, profile: user's profile (normal/admin)
        ------------------------
        OUTPUT:
        --------
        SUCCESS: user added to Database
        ERROR: user with that ID already exists in Database
        """
        try:
            conn = sqlite3.connect(self.DB)
            cur = conn.cursor()
            cur.execute("""INSERT INTO users VALUES (?, ?, ?, ?, ?, ?)""", 
                (user['id'], user['file'], user['name'], user['lastname'], user['email'], user['profile']))
            self.logger.info("Usuario agregado en base de datos")
            conn.commit()
            conn.close()
        except Exception as e:
            self.logger.error("Ocurrió una excepción", exc_info=True)
            return "ERROR"
        return "SUCCESS"
    
    def select(self, card_id):
        """
        Search user in Database
        ------------------------
        INPUT:
        --------
        card_id: RFID card ID
        ------------------------
        OUTPUT:
        --------
        user: array containing id: RFID card ID, name: user's name, lastname: user's lastname, profile: user's profile (normal/admin)
        user = None if card_id doesn't exists in Database
        user['name'] = None if user doesn't exists in Database
        """
        self.logger.info("Buscando trajeta en base de datos.")
        try:
            conn = sqlite3.connect(self.DB)
            cur = conn.cursor()
            cur.execute("""SELECT * FROM users WHERE id=?""", (card_id,))
            user = cur.fetchone()
            conn.close()
            return user
        except Exception as e:
            self.logger.error("Ocurrió una excepción.", exc_info=True)
            return "ERROR"
    
    def update(self, user):
        """
        Change user's data in Database
        ------------------------
        INPUT:
        --------
        user: dict containing id: RFID card ID, name: user's name, lastname: user's lastname, profile: user's profile (normal/admin)
        ------------------------
        OUTPUT:
        --------
        SUCCESS: user's data updated in Database
        ERROR: user with that ID doesn't exists in Database
        """
        try:
            conn = sqlite3.connect(self.DB)
            cur = conn.cursor()
            if self.select(user['id']) != None:
                print("update")
                cur.execute("""UPDATE users SET file=?,
                            name=?,
                            lastname=?,
                            email=?,
                            profile=?
                            WHERE id=?""", 
                            (user['file'], user['name'], user['lastname'], 
                             user['email'], user['profile'], user['id']))
                conn.commit()
                conn.close()
                self.logger.info("Info de usuario modificada en base de datos.")
                return "SUCCESS"
            else:
                self.logger.error("Usuario inexistente.")
                return "ERROR"
        except Exception as e:
            self.logger.error("Ocurrió una excepción.", exc_info=True)
            conn.close()
            return "ERROR"
        
    def delete(self, user):
        """
        Delete user from Database
        ------------------------
        INPUT:
        --------
        user: dict containing id: RFID card ID, name: user's name, lastname: user's lastname, profile: user's profile (normal/admin)
        ------------------------
        OUTPUT:
        --------
        SUCCESS: user deleted from Database
        ERROR: user with that ID doesn't exists in Database
        """
        try:
            conn = sqlite3.connect(self.DB)
            cur = conn.cursor()
            if self.select(user['id']) != None:
                cur.execute("""DELETE from users WHERE tarjeta=?""", 
                            (user['id'],))
                conn.commit()
                conn.close()
                self.logger.info("Info de usuario borrada de base de datos.")
                return "SUCCESS"
            else:
                self.logger.error("Usuario inexistente.")
                return "ERROR"
        except Exception as e:
            self.logger.error("Ocurrió una excepción.", exc_info=True)
            return "ERROR"
    
    def select_all(self):
        """
        Select all users from Database
        ------------------------
        INPUT:
        --------
        None
        ------------------------
        OUTPUT:
        --------
        users: array or users
        """
        try:
            conn = sqlite3.connect(self.DB)
            cur = conn.cursor()
            cur.execute("""SELECT * FROM users""")
            users = cur.fetchall()
            conn.close()
            self.logger.info("Recuperando info de usuarios de base de datos.")
            return users
        except Exception as e:
            self.logger.error("Ocurrió una excepción.", exc_info=True)
            return "ERROR"