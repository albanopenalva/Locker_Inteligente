# -*- coding: utf-8 -*-
"""
Database for eLocker turns

Author: Albano Peñalva
Date: Abril 2023
"""

import sqlite3
import logging, logging.config
import os

class TurnsDB():

    TURN_ID = 0
    LOCKER = 1
    ACTIVE = 2
    USER = 3
    INIT = 4
    END = 5
    DOOR = 6
    DATETIME_FORMAT = "%Y-%m-%d %H:%M:%S"
    DATE_FORMAT = "%Y-%m-%d"
    
    def __init__(self):
        """
        Creates turns table in users Database:
        - turn_id: int (turn's incremental id)
        - locker: int (locker number, 1 to 12)
        - active: bool (active turn = occupied locker)
        - user: int (user ID)
        - init_time: string ("%Y-%m-%d %H:%M:%S")
        - end_time: string ("%Y-%m-%d %H:%M:%S")
        - door_openings: int
        """
        #Create logger
        logging.config.fileConfig(os.getcwd()+"/log/turns_logger.conf", disable_existing_loggers=False)
        self.logger = logging.getLogger(__name__)
        self.logger.info("Base de datos inicializada.")

        #Create DB
        self.DB = os.getcwd()+"/infrastructure/turns.db"
        try:
            conn = sqlite3.connect(self.DB)
            cur = conn.cursor()
            cur.execute(""" CREATE TABLE IF NOT EXISTS turns (
                turn_id INTEGER PRIMARY KEY AUTOINCREMENT,
                locker INTEGER NOT NULL,
                active INTEGER NOT NULL,
                user INTEGER NOT NULL,
                init_time TEXT NOT NULL, 
                end_time TEXT,
                door_openings INTEGER
                ) """)
            conn.close()
        except Exception as e:
            self.logger.error("No se puede conectar a base de datos.", exc_info=True)
        
    def start(self, turn):
        """
        Add turn to turns Database
        ------------------------
        INPUT:
        turn: dict containing locker: locker number, user: user's ID, 
              init_time:  (string) date and time in DATETIME_FORMAT
        ------------------------
        OUTPUT:
        SUCCESS: turn added to Database
        ERROR: 
        """
        try:
            conn = sqlite3.connect(self.DB)
            cur = conn.cursor()
            cur.execute("""INSERT INTO turns (locker, active, user, init_time, end_time) VALUES (?, ?, ?, ?, ?)""", 
                (turn['locker'], '1', turn['user'], turn['init_time'], turn['end_time']))
            self.logger.info("Turno agregado en base de datos.")
            conn.commit()
            conn.close()
        except Exception as e:
            self.logger.error("Ocurrió una excepción.", exc_info=True)
            return "ERROR"
        return "SUCCESS"
    
    def select_active(self):
        """
        Search active turns in Database
        ------------------------
        INPUT:
        None
        ------------------------
        OUTPUT:
        turns: list of active turns
        """
        try:
            conn = sqlite3.connect(self.DB)
            cur = conn.cursor()
            cur.execute("""SELECT * FROM turns WHERE active=?""", ('1'))
            turns = cur.fetchall()
            conn.close()
            self.logger.info("Buscando turnos activos en base de datos.")
            return turns
        except Exception as e:
            self.logger.error("Ocurrió una excepción.", exc_info=True)
            return "ERROR"
    
    def select_active_locker(self, locker):
        """
        Search active turns in Database
        ------------------------
        INPUT:
        locker: locker number (1 to 12)
        ------------------------
        OUTPUT:
        If there is an active turn for locker:
            turn
        else:
            "ERROR"
        """
        self.logger.info(f"Revisando en base de datos si casillero {locker} tiene un turno activo")
        turns = self.select_active()
        for turn in turns:
            if turn[1] == locker:
                self.logger.info(f"Casillero {locker} tiene un turno activo")
                return turn
        self.logger.info(f"Casillero {locker} NO tiene un turno activo")
        return "ERROR"
    
    def end(self, locker, end_time):
        """
        Close turn in Database
        ------------------------
        INPUT:
        end_time: (string) date and time in DATETIME_FORMAT
        ------------------------
        OUTPUT:
        SUCCESS: there is an active turn to close
        ERROR: ther is not active turn for selected locker
        """
        turn = self.select_active_locker(locker)
        if turn != "ERROR":
            try:
                conn = sqlite3.connect(self.DB)
                cur = conn.cursor()
                cur.execute("""UPDATE turns SET active=?, end_time=?
                            WHERE turn_id=?""", 
                            ('0', end_time, turn[0]))
                conn.commit()
                conn.close()
                self.logger.info(f"Turno en casillero {locker} finalizado")
                return "SUCCESS"
            except Exception as e:
                self.logger.error("Ocurrió una excepción.", exc_info=True)
        else:
            self.logger.warning("Error al intentar finalizar turno")
            return "ERROR"
                
    def select_between_dates(self, init, end):
        """
        Select all turns from Database between init and end date time
        ------------------------
        INPUT:
        init: (string) date and time in DATETIME_FORMAT
        end: (string) date and time in DATETIME_FORMAT
        ------------------------
        OUTPUT:
        turns: array or turns
        """
        self.logger.info("Recuperando turnos de la base de datos")
        try:
            conn = sqlite3.connect(self.DB)
            cur = conn.cursor()
            cur.execute("""SELECT * FROM turns WHERE init_time BETWEEN ? AND ?""", 
                            (init, end))
            users = cur.fetchall()
            conn.close()
            return users
        except Exception as e:
            self.logger.error("Ocurrió una excepción.", exc_info=True)
            return "ERROR"
                
    def select_all(self):
        """
        Select all turns from Database
        ------------------------
        INPUT:
        None
        ------------------------
        OUTPUT:
        turns: array or turns
        """
        try:
            conn = sqlite3.connect(self.DB)
            cur = conn.cursor()
            cur.execute("""SELECT * FROM turns""")
            users = cur.fetchall()
            conn.close()
            self.logger.info("Recuperando turnos de la base de datos")
            return users
        except Exception as e:
            self.logger.error("Ocurrió una excepción.", exc_info=True)
            return "ERROR"
                