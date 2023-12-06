"""
Cabinet class

A cabinet contains multiple lockers, a card reader and power sensor.

Author: Albano Peñalva
Date: July 2023
"""

import logging, logging.config
from domain.locker import Locker
from domain.power_sensor import PowerSensor
from domain.card_reader import CardReader
from domain.speaker import Speaker
from infrastructure.consumptionDB import ConsumptionDB
from threading import Timer
from datetime import datetime, timedelta
import os
import wiringpi

class Cabinet:

    ID = None                               # ID number for this cabinet
    LOCKER_NUMBER = 16                      # Number of lockers in the cabinet
    LOCKER_LIST = range(1, LOCKER_NUMBER+1) # List of locker's numbers

    __PERIOD = 300          # interval for consumption measurement (in seconds)
    __HOUR = 3600 
    __lock_pin_base = 65
    __lock_addr = 0x20
    __door_pin_base = 81
    __door_addr = 0x21
    __outlet_pin_base = 97
    __outlet_addr = 0x22

    def __init__(self, id_number):
        self.ID = id_number
        # Init logger
        logging.config.fileConfig(os.getcwd()+"/log/locker_logger.conf", disable_existing_loggers=False)
        self.logger = logging.getLogger(__name__)
        self.logger.info('Inicializando Armario')  
        # Init lockers
        try:
            wiringpi.wiringPiSetup()  # initialise wiringpi
        except Exception as e:
            self.logger.error("Error inicializando WiringPi.", exc_info=True)
        #Init lock control
        try:
            wiringpi.mcp23017Setup(self.__lock_pin_base, self.__lock_addr)  # set up the pins for lock control
            self.logger.info('Control de cerraduras inicializado')  
        except Exception as e:
            self.logger.error("No se puede inicializar control de cerraduras.", exc_info=True)
        #Init door control
        try:
            wiringpi.mcp23017Setup(self.__door_pin_base, self.__door_addr)  # set up the pins for door control
            self.logger.info('Control de puertas inicializado')  
        except Exception as e:
            self.logger.error("No se puede inicializar control de puertas.", exc_info=True)
        #Init outlet control
        try:
            wiringpi.mcp23017Setup(self.__outlet_pin_base, self.__outlet_addr)  # set up the pins for outlet control
            self.logger.info('Control de tomacorientes inicializado')  
        except Exception as e:
            self.logger.error("No se puede inicializar control de tomacorientes.", exc_info=True)
        self.lockers = [Locker(number, wiringpi) for number in self.LOCKER_LIST]
        # Init card reader
        self.card_reader = CardReader()
        # init speaker
        self.speaker = Speaker()
        # Init power meassurement DB
        self.consumption_DB = ConsumptionDB()
        # Init power sensor
        self.power_sensor = PowerSensor()
        self.comsumption_thread = Timer(self.__PERIOD, self.read_consumption)
        self.comsumption_thread.start()

    def open_door(self, locker_number):
        """
        Open a Locker door
        ------------------------
        INPUT:
        --------
        locker_number: door number (1 to LOCKER_NUMBER)
        ------------------------
        OUTPUT:
        --------
        SUCCESS: door opened
        ERROR: door doesn't exists
        """
        if locker_number <= self.LOCKER_NUMBER:
            return self.lockers[locker_number-1].open()
        else:
            self.logger.error("Puerta inexistente")
            return "ERROR"
        
    def is_door_closed(self, locker_number):
        """
        Checks if a Locker door is closed
        ------------------------
        INPUT:
        --------
        locker_number: door number (1 to LOCKER_NUMBER)
        ------------------------
        OUTPUT:
        --------
        True: door closed
        False: door open
        ERROR: door doesn't exists
        """
        if locker_number <= self.LOCKER_NUMBER:
            return self.lockers[locker_number-1].is_closed()
        else:
            self.logger.error("Puerta inexistente")
            return "ERROR"

    def activate_outlet(self, locker_number):
        """
        Activate a Locker outlet
        ------------------------
        INPUT:
        --------
        locker_number: door number (1 to LOCKER_NUMBER)
        ------------------------
        OUTPUT:
        --------
        SUCCESS: outlet activated
        ERROR: locker doesn't exists
        """
        if locker_number <= self.LOCKER_NUMBER:
            return self.lockers[locker_number-1].activate_outlet()
        else:
            self.logger.error("Tomacorrientes inexistente")
            return "ERROR"

    def deactivate_outlet(self, locker_number):
        """
        Dectivate a Locker outlet
        ------------------------
        INPUT:
        --------
        locker_number: door number (1 to LOCKER_NUMBER)
        ------------------------
        OUTPUT:
        --------
        SUCCESS: outlet deactivated
        ERROR: locker doesn't exists
        """
        if locker_number <= self.LOCKER_NUMBER:
            return self.lockers[locker_number-1].deactivate_outlet()
        else:
            self.logger.error("Tomacorrientes inexistente")
            return "ERROR"

    def read_RFID(self):
        """
        Reads RFID card ID
        ------------------------
        INPUT:
        --------
        None
        ------------------------
        OUTPUT:
        --------
        ID: card ID
        Text: text stored in card 
        """
        return self.card_reader.read()

    def play_sound(self, sound_number, continuous):
        """
        Play a sound
        ------------------------
        INPUT:
        --------
        sound_number: number of one listed sounds:
            "click": 0
            "error": 1
            "select": 2
            "return": 3
            "access": 4
            "exit": 5
            "alarm": 6
        continuous: 
            True: sounds in loop
            False: sounds once
        ------------------------
        OUTPUT:
        --------
        SUCCESS: 
        ERROR: 
        """
        if sound_number < len(self.speaker.sounds):
            self.speaker.play(self.speaker.sounds[sound_number], continuous)
            return "SUCCESS"
        else:
            self.logger.error("Sonido inexistente")
            return "ERROR"

    def stop_sound(self):
        """
        Stop all sounds
        ------------------------
        INPUT:
        --------
        None
        ------------------------
        OUTPUT:
        --------
        None
        """
        self.speaker.stop()

    def read_consumption(self):
        """
        Reads power consumption periodically and save it in DB
        ------------------------
        INPUT:
        --------
        None
        ------------------------
        OUTPUT:
        --------
        None
        """
        # meassure consumption
        consumption_12v = self.power_sensor.measure_12v_consumption()
        consumption_220v = self.power_sensor.measure_220v_consumption()
        # store in DB
        self.consumption_DB.insert(datetime.now().strftime(self.consumption_DB.DATETIME_FORMAT),
                                   consumption_220v, 
                                   consumption_12v)
        # restart thread
        self.comsumption_thread = Timer(self.__PERIOD, self.read_consumption)
        self.comsumption_thread.start()

    def get_consumption_by_day(self, init_dt, end_dt):
        """
        Reads power consumption from DB and arrange by day
        ------------------------
        INPUT:
        --------
        init_dt:  
        end_dt:
        ------------------------
        OUTPUT:
        --------
        Dict containing date and power consumption
        """
        init = datetime.strptime(init_dt, self.consumption_DB.DATETIME_FORMAT)
        end = datetime.strptime(end_dt, self.consumption_DB.DATETIME_FORMAT)
        datelist = [init + timedelta(days=x) for x in range(((end + timedelta(days=1)) - init).days)] 
        powerlist = [0 for date in datelist]
        # get consumption from DB
        consumption_list = self.consumption_DB.select(init_dt, end_dt)
        if consumption_list == "ERROR":
            self.logger.error("No se pudo recuperar consumo de base de datos")
            return dict(zip(datelist, powerlist))
        else:
            # arrange power consumption by day
            for consumption in consumption_list:
                for index, date in enumerate(datelist):
                    date_c = datetime.strptime(consumption[self.consumption_DB.DATE_TIME], self.consumption_DB.DATETIME_FORMAT)
                    if date_c.date() == date.date():
                        powerlist[index] = powerlist[index] + consumption[self.consumption_DB.POWER_220V] * self.__PERIOD / self.__HOUR
            return dict(zip(datelist, powerlist))
        
        
