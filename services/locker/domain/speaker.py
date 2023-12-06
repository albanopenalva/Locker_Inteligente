"""
Speaker class

Author: Albano Peñalva
Date: August 2023
"""
import logging, logging.config
from threading import Thread
import pygame.mixer as mixer
import os

class Speaker:

    __CLICK = "click"       # 0
    __ERROR = "error"       # 1
    __SELECT = "select"     # 2
    __RETURN = "return"     # 3
    __ACCESS = "access"     # 4
    __EXIT = "exit"         # 5
    __ALARM = "alarm"       # 6
    sounds = [__CLICK, __ERROR, __SELECT, __RETURN, __ACCESS, __EXIT, __ALARM]

    def __init__(self):
        # Init logger
        logging.config.fileConfig(os.getcwd()+"/log/locker_logger.conf", disable_existing_loggers=False)
        self.logger = logging.getLogger(__name__)
        # Init audio controller
        self.__continuous = False
        try:
            mixer.init()
            #elf.logger.info(f'Inicializando Speaker') 
            self.__sound_list = {
                self.__CLICK: mixer.Sound(os.getcwd()+'/domain/sounds/atm-cash-machine-key-press.wav'),
                self.__ERROR: mixer.Sound(os.getcwd()+'/domain/sounds/wrong-electricity-buzz.wav'),
                self.__SELECT: mixer.Sound(os.getcwd()+'/domain/sounds/interface-option-select.wav'),
                self.__RETURN: mixer.Sound(os.getcwd()+'/domain/sounds/software-interface-back.wav'),
                self.__ACCESS: mixer.Sound(os.getcwd()+'/domain/sounds/positive-notification.wav'),
                self.__EXIT: mixer.Sound(os.getcwd()+'/domain/sounds/software-interface-remove.wav'),
                self.__ALARM: mixer.Sound(os.getcwd()+'/domain/sounds/system-beep-buzzer-fail.wav'),
            }   
        except Exception as e:
            self.logger.error(f"No se puede inicializar Speaker", exc_info=True)
        
    def play(self, sound, continuous=False):
        """
        Plays selected sound
        ------------------------
        INPUT:
        --------
        sound: one of listed sounds
        continuous: 
            True: sounds in loop
            False: sounds once
        ------------------------
        OUTPUT:
        --------
        None
        """
        self.__continuous = continuous
        self.play_thread = Thread(name='play_sound', target=self.__play, args=[sound,])
        self.play_thread.start()

    def __play(self, sound):
        try:
            if(self.__continuous):
                self.__sound_list[sound].play(loops=-1)
                self.logger.info(f'Reproduciendo sonido {sound} en forma continua') 
            else:
                self.__sound_list[sound].play(loops=0)
                self.logger.info(f'Reproduciendo sonido {sound}') 
        except Exception as e:
            self.logger.error(f"No se puede reproducir sonido {sound}", exc_info=True)

    def stop(self):
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
        try:
            mixer.stop()
            self.logger.info(f'Sonidos detenidos') 
        except Exception as e:
            self.logger.error(f"No se puede detener sonido", exc_info=True)
        self.__continuous = False
        