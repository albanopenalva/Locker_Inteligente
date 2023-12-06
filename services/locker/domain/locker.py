"""
Locker class

A locker contains:
    - 1 door sensor
    - 1 door lock
    - 1 outlet control

Author: Albano Peñalva
Date: July 2023
"""
import logging, logging.config
from threading import Timer
import os

class Locker:

    __number = None
    __lock_pin_base = 65
    __lock_addr = 0x20
    __door_pin_base = 81
    __door_addr = 0x21
    __outlet_pin_base = 97
    __outlet_addr = 0x22

    def __init__(self, number, wiringpi):
        # Init logger
        logging.config.fileConfig(os.getcwd()+"/log/locker_logger.conf", disable_existing_loggers=False)
        self.logger = logging.getLogger(__name__)
        self.logger.info(f'Inicializando Locker {number}')  

        """Construct the class."""
        self.__number = number
        self.__wiringpi = wiringpi
        
        # Set lock pins as output in high state
        try:
            self.__wiringpi.digitalWrite(self.__lock_pin_base + self.__number - 1, 1)  # set state as high
            self.__wiringpi.pinMode(self.__lock_pin_base + self.__number - 1, 1)  # set as output
            self.logger.info(f'Cerradura {self.__number} inicializada') 
        except Exception as e:
            self.logger.error(f"No se puede inicializar cerradura {self.__number}", exc_info=True)
        # Set door pins as input
        try:
            self.__wiringpi.pinMode(self.__door_pin_base + self.__number - 1, 0)  # set as input
            self.logger.info(f'Puerta {self.__number} inicializada') 
        except Exception as e:
            self.logger.error(f"No se puede inicializar puerta {self.__number}", exc_info=True)
        # Set outlet pins as output in high state
        try:
            self.__wiringpi.digitalWrite(self.__outlet_pin_base + self.__number - 1, 1)  # set state as high
            self.__wiringpi.pinMode(self.__outlet_pin_base + self.__number - 1, 1)  # set as output
            self.logger.info(f'Tomacorrientes {self.__number} inicializado') 
        except Exception as e:
            self.logger.error(f"No se puede inicializar tomacorrientes {self.__number - 1}", exc_info=True)

    def open(self):
        """
        Open Locker door
        ------------------------
        INPUT:
        --------
        None
        ------------------------
        OUTPUT:
        --------
        SUCCESS: door opened
        ERROR: error
        """
        try:
            self.__wiringpi.digitalWrite(self.__lock_pin_base + self.__number - 1, 0)  # set state as low
            t = Timer(1, self.__wiringpi.digitalWrite, [self.__lock_pin_base + self.__number - 1, 1])
            t.start()
            self.logger.info(f'Cerradura {self.__number} desbloqueada') 
        except Exception as e:
            self.logger.error("No se puede desbloquear cerradura {self.__number}", exc_info=True)
            return "ERROR"
        return "SUCCESS"
        
    def is_closed(self):
        """
        Checks if locker door is closed
        ------------------------
        INPUT:
        --------
        None
        ------------------------
        OUTPUT:
        --------
        True: door closed
        False: door open
        """
        try:
            if self.__wiringpi.digitalRead(self.__door_pin_base + self.__number - 1):
                self.logger.info(f'Puerta {self.__number} abierta') 
                return True
            else:
                self.logger.info(f'Puerta {self.__number} cerrada')
                return False
        except Exception as e:
            self.logger.error("No se puede desbloquear cerradura {self.__number}", exc_info=True)
            return "ERROR"
        
    
    def activate_outlet(self):
        """
        Activate a Locker outlet
        ------------------------
        INPUT:
        --------
        None
        ------------------------
        OUTPUT:
        --------
        SUCCESS: outlet activated
        ERROR: error
        """
        try:
            self.__wiringpi.digitalWrite(self.__outlet_pin_base + self.__number - 1, 0)
            self.logger.info(f'Tomacorrientes {self.__number} activado') 
            return "SUCCESS"
        except Exception as e:
            self.logger.error("No se puede activar tomacorrientes {self.__number}", exc_info=True)
            return "ERROR"

    def deactivate_outlet(self):
        """
        Dectivate Locker outlet
        ------------------------
        INPUT:
        --------
        None
        ------------------------
        OUTPUT:
        --------
        SUCCESS: outlet deactivated
        ERROR: error
        """
        try:
            self.__wiringpi.digitalWrite(self.__outlet_pin_base + self.__number - 1, 1)
            self.logger.info(f'Tomacorrientes {self.__number} desactivado') 
            return "SUCCESS"
        except Exception as e:
            self.logger.error("No se puede desactivar tomacorrientes {self.__number}", exc_info=True)
            return "ERROR"
