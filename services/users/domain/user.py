"""
User class

Author: Albano Peñalva
Date: July 2023
"""

import logging, logging.config
from infrastructure.userDB import UsersDB
import os

class User:
    """
    User
    """
    __card_id = None 
    __file = None 
    __status = False
    __name = None
    __lastname = None
    __email = None
    __profile = None

    PROFILE_USER = "user"
    PROFILE_ADMIN = "admin"

    def __init__(self, id):
        """Construct the class."""
        # Init database
        self.user_DB = UsersDB()
        # Create user
        logging.config.fileConfig(os.getcwd()+"/log/user_logger.conf", disable_existing_loggers=False)
        self.logger = logging.getLogger(__name__)
        # Search user in database
        database_user = self.user_DB.select(id) 
        if database_user != None:
            self.__card_id = database_user[self.user_DB.ID]
            self.__file = database_user[self.user_DB.FILE]
            self.__status = True
            self.__name = database_user[self.user_DB.NAME]
            self.__lastname = database_user[self.user_DB.LASTNAME]
            self.__email = database_user[self.user_DB.EMAIL]
            self.__profile = database_user[self.user_DB.PROFILE]
            self.logger.info(f"Usuario {self.__name} {self.__lastname} - ID: {self.__card_id} - perfil: {self.__profile}")
        else:
            self.logger.info("Usuario desconocido")

    def get(self):
        """
        Return user data. 
        ------------------------
        INPUT:
        --------
        None
        ------------------------
        OUTPUT:
        --------
        user: dict containing id: RFID card ID, status: if card is registered, name: user's name, lastname: user's lastname, profile: user's profile (normal/admin)
        """
        return {'id': self.__card_id, 
                'file': self.__file, 
                'status': self.__status,
                'name': self.__name, 
                'lastname': self.__lastname, 
                'email': self.__email, 
                'profile': self.__profile}
        
    def new(self, id, file=None, name=None, lastname=None, email=None, profile="user"):
        """
        Create new user. 
        ------------------------
        INPUT:
        --------
        id: RFID card ID
        file: UNER file
        name: user's name
        lastname: user's lastname
        email: user's email
        profile: user's profile (user/admin)
        ------------------------
        OUTPUT:
        --------
        SUCCESS 
        ERROR
        """
        # check for id in database
        if self.__card_id == None:
            self.logger.info("Tarjeta nueva")
            self.__card_id = id
            self.__status = True
            if self.user_DB.insert(self.get()) == "SUCCESS":
                self.logger.info("Tarjeta registrada")
                return "SUCCESS"
            else:
                self.logger.error("No se pudo registrar tarjeta")
                return "ERROR"
        else:
            self.logger.info("Tarjeta ya registrada")
            if self.__name == None and self.__lastname == None:
                self.logger.info("Usuario nuevo")
                self.__file = file
                self.__name = name
                self.__lastname = lastname
                self.__email = email
                self.__profile = profile
                if self.user_DB.update(self.get()) == "SUCCESS":
                    self.logger.info("Usuario registrado")
                    return "SUCCESS"
                else:
                    self.logger.error("No se pudo registrar usuario")
                    return "ERROR"
            else:
                self.logger.error("Usuario con esa ID ya registrado")
                return "ERROR"
    
    def edit(self, name=None, lastname=None, email=None, profile=None):
        """
        Edit user data. 
        ------------------------
        INPUT:
        --------
        name: user's name
        lastname: user's lastname
        email: user's email
        profile: user's profile (user/admin)
        ------------------------
        OUTPUT:
        --------
        SUCCESS 
        ERROR
        """
        self.logger.info(f"Usuario {self.__name} {self.__lastname} - ID: {self.__card_id} - perfil: {self.__profile}")
        if name!=None:
            self.__name = name 
        if lastname != None:
            self.__lastname = lastname 
        if email != None:          
            self.__email = email
        if profile != None:          
            self.__profile = profile
        self.logger.info(f"Usuario modificado: {self.__name} {self.__lastname} e-mail: {self.__email} - ID: {self.__card_id} - perfil: {self.__profile}")
        return self.user_DB.update(self.get())
    
    def delete(self):
        """
        Delete user data. 
        ------------------------
        INPUT:
        --------
        None
        ------------------------
        OUTPUT:
        --------
        SUCCESS 
        ERROR
        """
        return self.user_DB.delete(self.get())
        






