import grpc
from concurrent import futures
from datetime import datetime
import infrastructure.locker_pb2_grpc as pb2_grpc
import infrastructure.locker_pb2 as pb2
from domain.cabinet import Cabinet
import logging.config
import os

class LOCKERService(pb2_grpc.LOCKERServicer):

    def __init__(self, *args, **kwargs):
        # Init logger
        logging.config.fileConfig(os.getcwd()+"/log/locker_logger.conf", disable_existing_loggers=False)
        self.logger = logging.getLogger(__name__)
        self.logger.info('Inicializando servicio Locker')  
        self.cabinet = Cabinet(1)
        self.door_list = [number for number in range(1, 17)]

    def OpenDoor(self, request, context):
        status = self.cabinet.open_door(request.number)
        if status == "SUCCESS":
            success = {'success': True}
            self.logger.info(f'Puerta {request.number} desbloqueada')  
        else:
            success = {'success': False}
            self.logger.error(f'No se pudo desbloquear puerta {request.number}')  
        return pb2.success(**success)

    def IsDoorClosed(self, request, context):
        closed = True
        status = self.cabinet.is_door_closed(request.number)
        if status == False:
            closed = False
            self.logger.info('Puerta {request.number} abierta') 
        door_closed = {'closed': closed}
        return pb2.door_closed(**door_closed)

    def SetOutlet(self, request, context):
        if request.activated:
            status = self.cabinet.activate_outlet(request.number)
            if status == "SUCCESS":
                success = {'success': True}
                self.logger.info(f'Tomacorrientes {request.number} activado') 
            else:
                success = {'success': False}
                self.logger.error(f'No se pudo activar el tomacorrientes {request.number}') 
        else:
            status = self.cabinet.deactivate_outlet(request.number)
            if status == "SUCCESS":
                success = {'success': True}
                self.logger.info(f'Tomacorrientes {request.number} desactivado') 
            else:
                success = {'success': False}
                self.logger.error(f'No se pudo desactivar el tomacorrientes {request.number}') 
        return pb2.success(**success)

    def GetPower(self, request, context):
        comsumption_dict = self.cabinet.get_consumption_by_day(request.init_datetime, request.end_datetime)
        response = {'date': '', "power": 0}
        for date, power in comsumption_dict.items():
            response['date'] = datetime.strftime(date, self.cabinet.consumption_DB.DATETIME_FORMAT)
            response['power'] = power
            yield pb2.consumption(**response)

    def GetID(self, request, context):
        card = self.cabinet.read_RFID()
        if(card != "ERROR"):
            if(card["detected"]):
                self.logger.info(f"Tarjeta {card['id']} detectada") 
        else:
            self.logger.error('No se puede leer ID')
            card = {'id': 0, 'text': "", 'detected': False}
        return pb2.card(**card)

    def PlaySound(self, request, context):
        success = {'success': False}
        if(request.on):
            if(self.cabinet.play_sound(request.sound, request.loop) == "SUCCESS"):
                self.logger.info(f"Sonido reproducido") 
                success = {'success': True}
            else:
                self.logger.error(f"No se pudo reproducir sonido")
        else:
            self.cabinet.stop_sound()
            self.logger.info('Sonido detenido')
            success = {'success': True}
        return pb2.success(**success)

def serve():
    server = grpc.server(futures.ThreadPoolExecutor(max_workers=10))
    pb2_grpc.add_LOCKERServicer_to_server(LOCKERService(), server)
    server.add_insecure_port('[::]:50051')
    server.start()
    try:
        server.wait_for_termination()
    except KeyboardInterrupt:
        server.stop(None)

if __name__ == '__main__':
    serve()