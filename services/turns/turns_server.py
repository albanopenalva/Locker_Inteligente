import grpc
from concurrent import futures
import infrastructure.turns_pb2_grpc as pb2_grpc
import infrastructure.turns_pb2 as pb2
from domain.turns import Turn
import logging.config
import os

class TURNSService(pb2_grpc.TURNSServicer):

    def __init__(self, *args, **kwargs):
        # Init logger
        logging.config.fileConfig(os.getcwd()+"/log/turns_logger.conf", disable_existing_loggers=False)
        self.logger = logging.getLogger(__name__)
        # Create turns for all lockers 
        self.locker_turn = [Turn(number) for number in range(1, 17)]      
        self.logger.info('Servicio Turnos inicializado')                                         

    def GetFreeLockers(self, request, context):
        # Looks for turns availables
        # Returns: list of free lockers
        self.logger.info("Recuperando casilleros libres")
        free = [locker.is_free() for locker in self.locker_turn]
        lockers = [f'locker{locker.get_number()}' for locker in self.locker_turn]
        free_locker = {key: value for key, value in zip(lockers, free)}
        return pb2.freeLockers(**free_locker)

    def UserGotTurn(self, request, context):
        # Check if user have a turn for a locker
        # Input: user's id
        # Return: turn
        self.logger.info(f"Revisando si usuario {request.id} tiene turno")
        turn = {"id": request.id, "active": False, "lock_num": None, "init_time": '', "end_time": ''}
        for locker in self.locker_turn:
            if (locker.get_user() == request.id) and not(locker.is_free()):
                turn["active"] = True
                turn["lock_num"] = locker.get_number()
                turn["init_time"] = locker.get_init()
                turn["end_time"] = locker.get_end()
        if(turn["active"]):
            self.logger.info(f"Usuario con turno en casillero {turn['lock_num']}")
        else:
            self.logger.info("Usuario sin turno")
        return pb2.turn(**turn)

    def LockerGotTurn(self, request, context):
        # Check if a locker have an active turn
        # Input: locker number
        # Return: turn
        self.logger.info(f"Revisando si locker {request.num} tiene turno activo")
        turn = {"id": None, "active": False, "lock_num": request.num, "init_time": '', "end_time": ''}
        if(self.locker_turn[request.num-1].is_free()):
            self.logger.info(f"Casillero {request.num} sin turno")
        else:
            self.logger.info(f"Casillero {request.num} con turno")
            turn["id"] = self.locker_turn[request.num-1].get_user()
            turn["active"] = True
            turn["init_time"] = self.locker_turn[request.num-1].get_init()
            turn["end_time"] = self.locker_turn[request.num-1].get_end()
        return pb2.turn(**turn)

    def StartTurn(self, request, context):
        # Starts a locker's turn for an user
        # Input: turn
        # Return: success
        self.logger.info("Iniciando turno")
        turn = {"id": None, "active": False, "lock_num": request.lock_num, "init_time": '', "end_time": ''}
        if self.locker_turn[request.lock_num-1].is_free():
            if self.locker_turn[request.lock_num-1].start(request.id) == "SUCCESS":
                turn["id"] = self.locker_turn[request.lock_num-1].get_user()
                turn["active"] = True
                turn["init_time"] = self.locker_turn[request.lock_num-1].get_init()
                turn["end_time"] = self.locker_turn[request.lock_num-1].get_end()
                self.logger.info("Turno inicializado")
        else:
            self.logger.warning("Casillero ocupado")
        return pb2.turn(**turn)

    def EndTurn(self, request, context):
        # Ends a locker's turn
        # Input: turn
        # Return: success
        self.logger.info("Finalizando turno")
        success = {"success": False}
        if(self.locker_turn[request.lock_num-1].is_free()):
            self.logger.error("Casillero sin turno")
        else:
            if self.locker_turn[request.lock_num-1].finish() == "SUCCESS":
                success = {"success": True}
        return pb2.success(**success)

    def GetTurns(self, request, context):
        # Send info for turns between dates
        # Input: dates
        # Return: turn_info
        self.logger.info(f"Recuperando turnos entre {request.init_datetime} y {request.end_datetime}")
        turn_list = self.locker_turn[0].get_by_date(request.init_datetime, request.end_datetime)
        turn_info = {"id": None, "active": False, "lock_num": None, "init_time": '', "end_time": ''}
        for turn in turn_list:
            turn_info["id"] = turn[self.locker_turn[0].turn_DB.TURN_ID]
            turn_info["active"] = turn[self.locker_turn[0].turn_DB.ACTIVE]
            turn_info["lock_num"] = turn[self.locker_turn[0].turn_DB.LOCKER]
            turn_info["init_time"] = turn[self.locker_turn[0].turn_DB.INIT]
            turn_info["end_time"] = turn[self.locker_turn[0].turn_DB.END]
            yield pb2.turn(**turn_info)

def serve(): 
    server = grpc.server(futures.ThreadPoolExecutor(max_workers=10))
    pb2_grpc.add_TURNSServicer_to_server(TURNSService(), server)
    server.add_insecure_port('[::]:50053')
    server.start()
    try:
        server.wait_for_termination()
    except KeyboardInterrupt:
        server.stop(None)


if __name__ == '__main__':
    serve()