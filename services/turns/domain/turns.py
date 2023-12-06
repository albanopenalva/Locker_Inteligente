"""
Locker's turns class

Author: Albano Peñalva
Date: Abril 2023
"""

import logging, logging.config
from datetime import datetime
from infrastructure.turnsDB import TurnsDB
from threading import Timer
import os

class Turn:
    """
    Turn for one locker
    """
    __locker_number = None # from 1 to 16
    __locker_available = True
    __user_id = None
    __init_time = None
    __end_time = None
    __door_openings = 0
    DEFAULT_END_TIME = " 23:59:59"
    __PERIOD = 60          # interval for turn ending check (in seconds)
    

    def __init__(self, lock_num):
        """Construct the class."""
        # Init database
        self.turn_DB = TurnsDB()
        # Create logger
        logging.config.fileConfig(os.getcwd()+"/log/turns_logger.conf", disable_existing_loggers=False)
        self.logger = logging.getLogger(__name__)
        self.logger.info(f"Turno para casillero {lock_num}")
        # New turn
        self.__locker_number = lock_num
        # Check database for active turn
        active_turn = self.turn_DB.select_active_locker(lock_num)
        if active_turn != "ERROR":
            # Check if active turn end time have passed actual time
            end_time = datetime.strptime(active_turn[self.turn_DB.END], self.turn_DB.DATETIME_FORMAT)
            if(end_time > datetime.now()):
                self.logger.info(f"Turno para casillero {lock_num} vigente")
                self.__locker_available = False
                self.__user_id = active_turn[self.turn_DB.USER]
                self.__init_time = active_turn[self.turn_DB.INIT]
                self.__end_time = active_turn[self.turn_DB.END]
            else:
                # end time has passed, end turn in db
                self.logger.info(f"Turno para casillero {lock_num} vencido, finalizando turno")
                self.turn_DB.end(self.__locker_number, active_turn[self.turn_DB.END]) 
        self.turn_ending_thread = Timer(self.__PERIOD, self.turn_ending_check)
        self.turn_ending_thread.start()

    def start(self, user):
        """
        Starts a turn
        ------------------------
        INPUT:
        --------
        user: user id
        ------------------------
        OUTPUT:
        --------
        SUCCESS: turn granted
        ERROR: turn granted
        """
        turn = {'locker': self.__locker_number, 
                'user': user, 
                'init_time': datetime.now().strftime(self.turn_DB.DATETIME_FORMAT),
                'end_time': datetime.now().strftime(self.turn_DB.DATE_FORMAT)}
        turn["end_time"] = turn["end_time"] + self.DEFAULT_END_TIME
        if self.turn_DB.start(turn) == "SUCCESS":
            self.__user_id = user
            self.__locker_available = False
            self.__init_time = turn['init_time']
            self.__end_time = turn['end_time']
            self.logger.info(f"Turno en casillero {self.__locker_number} inicializado")
            #start turn end checking task
            self.turn_ending_thread = Timer(self.__PERIOD, self.turn_ending_check)
            self.turn_ending_thread.start()
            return "SUCCESS"
        else:
            self.logger.error(f"No se pudo iniciar turno en casillero {self.__locker_number}")
            return "ERROR"

    def finish(self):
        """
        Ends a turn
        ------------------------
        INPUT:
        --------
        
        ------------------------
        OUTPUT:
        --------
        SUCCESS: turn closed
        ERROR: turn closed
        """
        if self.turn_DB.end(self.__locker_number, datetime.now().strftime(self.turn_DB.DATETIME_FORMAT)) == "SUCCESS":
            self.logger.info("Turno finalizado")
            self.__locker_available = True
            self.__user_id = None
            self.logger.info(f"Turno en casillero {self.__locker_number} finalizado")
            return "SUCCESS"
        else:
            self.logger.error(f"No se pudo finalizar turno en casillero {self.__locker_number}")
            return "ERROR"

    def is_free(self):
        """
        Checks if locker is available
        ------------------------
        INPUT:
        --------
        
        ------------------------
        OUTPUT:
        --------
        """
        if(self.__locker_available):
            self.logger.info(f"Casillero {self.__locker_number} disponible")
        else:
            self.logger.info(f"Casillero {self.__locker_number} ocupado")
        return self.__locker_available

    def get_user(self):
        """
        Return locker user
        ------------------------
        INPUT:
        --------
        
        ------------------------
        OUTPUT:
        --------
        """
        self.logger.info(f"Casillero {self.__locker_number} ocupado por usuario {self.__user_id}")
        return self.__user_id

    def get_number(self):
        """
        Return locker user
        ------------------------
        INPUT:
        --------
        
        ------------------------
        OUTPUT:
        --------
        """
        self.logger.info(f"Casillero {self.__locker_number}")
        return self.__locker_number

    def get_init(self):
        """
        Return locker init time
        ------------------------
        INPUT:
        --------
        
        ------------------------
        OUTPUT:
        --------
        """
        self.logger.info(f"Inicio del turno {self.__init_time}")
        return self.__init_time
    def get_end(self):
        """
        Return locker end time
        ------------------------
        INPUT:
        --------
        
        ------------------------
        OUTPUT:
        --------
        """
        self.logger.info(f"Finalización del turno {self.__end_time}")
        return self.__end_time
    
    def edit(self, user, available, init):
        """
        Edit turn information
        ------------------------
        INPUT:
        --------
        user: user id
        ------------------------
        OUTPUT:
        --------
        SUCCESS: turn granted
        ERROR: turn granted
        """
        self.__user_id = user
        self.__locker_available = available
        self.__init_time = init
        self.logger.info(f"Se modifica info de turno en casillero {self.__locker_number}")

    def get_by_date(self, from_dt, to_dt):
        """
        Edit turn information
        ------------------------
        INPUT:
        --------
        from_dt: date and time
        to_dt: date and time
        ------------------------
        OUTPUT:
        --------
        turns: list of turns between from_dt and to_dt
        """
        #agregar checkeo de fechas
        return self.turn_DB.select_between_dates(from_dt, to_dt)
    
    def turn_ending_check(self):
        """
        Checks if turn has expired
        ------------------------
        INPUT:
        --------
        ------------------------
        OUTPUT:
        --------
        """
        # Check if active turn end time have passed actual time
        if(self.is_free() == False):
            end_time = datetime.strptime(self.get_end(), self.turn_DB.DATETIME_FORMAT)
            if(end_time > datetime.now()):
                self.logger.info(f"Turno para casillero {self.get_number()} vigente")
            else:
                # end time has passed, end turn in db
                self.logger.info(f"Turno para casillero {self.get_number()} vencido, finalizando turno")
                self.finish()
            self.turn_ending_thread = Timer(self.__PERIOD, self.turn_ending_check)
            self.turn_ending_thread.start()



