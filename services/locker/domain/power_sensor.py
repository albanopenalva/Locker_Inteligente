"""
Power sensor class

Measures power comsuption in  12V and 220V lines.

Author: Albano Peñalva
Date: July 2023
"""

from ina219 import INA219
import domain.pi_acs71020 as acs71020
import logging, logging.config
import os

class PowerSensor:

    __SHUNT_OHMS = 0.1

    def __init__(self):
        # Init logger
        logging.config.fileConfig(os.getcwd()+"/log/locker_logger.conf", disable_existing_loggers=False)
        self.logger = logging.getLogger(__name__)
        # Init INA219
        try:
            self.__ina = INA219(self.__SHUNT_OHMS)
            self.__ina.configure(self.__ina.RANGE_16V)
            self.logger.info('INA219 inicializado')  
        except Exception as e:
            self.logger.error("No se puede inicializar INA219.", exc_info=True)
        # Init ACS71020
        try:
            self.__acs = acs71020.ACS71020()
            self.__acs.configure()
            self.logger.info('ACS71020 inicializado')  
        except Exception as e:
            self.logger.error("No se puede inicializar ACS71020.", exc_info=True)
    
    def measure_12v_consumption(self):
        """
        Measures 12V line consumption
        ------------------------
        INPUT:
        --------
        None
        ------------------------
        OUTPUT:
        --------
        Voltage: in Volts
        Current: in Amps
        Power: in Watts
        """
        try:
            consumption = {'Voltage': self.__ina.supply_voltage(),
                        'Current': self.__ina.current(),
                        'Power': self.__ina.power()}
            return consumption
        except Exception as e:
            self.logger.error("No se puede medir consumo en la línea de 12V", exc_info=True)
            return "ERROR"

    def measure_220v_consumption(self):
        """
        Measures 220V line consumption
        ------------------------
        INPUT:
        --------
        None
        ------------------------
        OUTPUT:
        --------
        Voltage: in Volts
        Current: in Amps
        Power: in Watts
        """
        try:
            consumption = {'Voltage': self.__acs.voltage(),
                        'Current': self.__acs.current(),
                        'Power': self.__acs.power_active()}
            return consumption
        except Exception as e:
            self.logger.error("No se puede medir consumo en la línea de 220V", exc_info=True)
            return "ERROR"
    