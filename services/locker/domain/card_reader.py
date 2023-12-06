"""
Card reader class

Author: Albano Peñalva
Date: July 2023
"""

from mfrc522 import SimpleMFRC522
import logging, logging.config
import os

class CardReader:
     
    def __init__(self):
        # Init logger
        logging.config.fileConfig(os.getcwd()+"/log/locker_logger.conf", disable_existing_loggers=False)
        self.logger = logging.getLogger(__name__)
        # Init MFRC522
        try:
            self.__card_reader = SimpleMFRC522()
            self.logger.info('MFRC522 inicializado')  
        except Exception as e:
            self.logger.error("No se puede inicializar MFRC522.", exc_info=True)

    def read(self):
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
        try:
            id, text = self.__card_reader.read_no_block()
            card = {'id': id, 'text': text, 'detected': True}
            if id == None:
                card['detected'] = False
            else:
                self.logger.info(f'Tarjeta {id} detectada') 
            return card
        except Exception as e:
            self.logger.error("No se puede comunicar con lector RFID", exc_info=True)
            return "ERROR"
