# -*- coding: utf-8 -*-
"""
Database for eLocker power consumption 

Author: Albano Peñalva
Date: Abril 2023
"""

import sqlite3
import logging, logging.config
import os

class ConsumptionDB():

    MEASSURE_ID = 0
    DATE_TIME = 1
    VOLTAJE_220V = 2
    CURRENT_220V = 3
    POWER_220V = 4
    VOLTAJE_12V = 5
    CURRENT_12V = 6
    POWER_12V = 7
    DATETIME_FORMAT = "%Y-%m-%d %H:%M:%S"
    DATE_FORMAT = "%Y-%m-%d"
    
    def __init__(self):
        """
        Creates power table in comsumption Database
        - meassure_id: int (meassure's incremental id)
        - date_time: string ("%Y-%m-%d %H:%M:%S")
        - voltaje_220v: int
        - current_220v: int
        - power_220v: int
        - voltaje_12v: int
        - current_12v: int
        - power_12v: int
        """
        #Create logger
        logging.config.fileConfig(os.getcwd()+"/log/locker_logger.conf", disable_existing_loggers=False)
        self.logger = logging.getLogger(__name__)
        self.logger.info("Base de datos inicializada.")

        #Create DB
        try:
            self.DB = os.getcwd()+"/infrastructure/comsumption.db"
            conn = sqlite3.connect(self.DB)
            cur = conn.cursor()
            cur.execute(""" CREATE TABLE IF NOT EXISTS power (
                meassure_id INTEGER PRIMARY KEY AUTOINCREMENT,
                date_time TEXT NOT NULL, 
                voltaje_220v INTEGER NOT NULL,
                current_220v INTEGER NOT NULL,
                power_220v INTEGER NOT NULL,
                voltaje_12v INTEGER NOT NULL,
                current_12v INTEGER NOT NULL,
                power_12v INTEGER NOT NULL
                ) """)
            conn.close()
        except Exception as e:
            self.logger.error("No se puede conectar a base de datos", exc_info=True)
        
        
    def insert(self, date_time, meassure_220v, meassure_12v):
        """
        Add meassure to comsumption Database
        ------------------------
        INPUT:
        --------
        date_time: string ("%Y-%m-%d %H:%M:%S")
        meassure_220v: dict containing meassure: voltaje, current, power 
        meassure_12v: dict containing locker: voltaje, current, power 
        ------------------------
        OUTPUT:
        --------
        SUCCESS: meassure added to Database
        ERROR: error
        """
        try:
            conn = sqlite3.connect(self.DB)
            cur = conn.cursor()
            cur.execute("""INSERT INTO power (date_time, voltaje_220v, current_220v, power_220v, 
                        voltaje_12v, current_12v, power_12v) 
                        VALUES (?, ?, ?, ?, ?, ?, ?)""", 
                        (date_time,
                         meassure_220v['Voltage'], meassure_220v['Current'], meassure_220v['Power'], 
                         meassure_12v['Voltage'], meassure_12v['Current'], meassure_12v['Power']))
            self.logger.info("Medición agregada en base de datos")
            conn.commit()
            conn.close()
        except Exception as e:
            self.logger.error("Ocurrió una excepción", exc_info=True)
            return "ERROR"
        return "SUCCESS"
    
    def select(self, from_dt, to_dt):
        """
        Search meassures in Database
        ------------------------
        INPUT:
        --------
        from_dt: date and time of range beginning 
        to_dt: date and time of range end
        ------------------------
        OUTPUT:
        --------
        array or meassures
        """
        self.logger.info("Buscando mediciones en base de datos.")
        try:
            conn = sqlite3.connect(self.DB)
            cur = conn.cursor()
            cur.execute("""SELECT * FROM power WHERE date_time BETWEEN (?) AND (?)""", 
                        (from_dt, to_dt))
            meassures = cur.fetchall()
            conn.close()
            return meassures
        except Exception as e:
            self.logger.error("Ocurrió una excepción.", exc_info=True)
            return "ERROR"
    
    def select_all(self):
        """
        Select all meassures from Database
        ------------------------
        INPUT:
        --------
        None
        ------------------------
        OUTPUT:
        --------
        array or meassures
        """
        try:
            conn = sqlite3.connect(self.DB)
            cur = conn.cursor()
            cur.execute("""SELECT * FROM power""")
            users = cur.fetchall()
            conn.close()
            self.logger.info("Recuperando mediciones de base de datos.")
            return users
        except Exception as e:
            self.logger.error("Ocurrió una excepción.", exc_info=True)
            return "ERROR"