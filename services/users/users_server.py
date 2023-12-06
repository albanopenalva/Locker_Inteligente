import grpc
from concurrent import futures
import infrastructure.users_pb2_grpc as pb2_grpc
import infrastructure.users_pb2 as pb2
from domain.user import User
import logging.config
import os

class USERSService(pb2_grpc.USERSServicer):

    def __init__(self, *args, **kwargs):
        # Init logger
        logging.config.fileConfig(os.getcwd()+"/log/user_logger.conf", disable_existing_loggers=False)
        self.logger = logging.getLogger(__name__)
        self.logger.info('Servicio Usuarios inicializado') 
        user = User(701977269210)

    def GetUser(self, request, context):
        user = User(request.id)
        response = user.get()
        return pb2.userData(**response)
    
    def RegCard(self, request, context):
        success = {'success': False}
        user = User(request.id)
        if user.new(request.id) == "SUCCESS":
            success = {'success': True}
        return pb2.success(**success)
    
    def RegUser(self, request, context):
        success = {'success': False}
        user = User(request.id)
        if user.new(request.id, 
                    file=request.file, 
                    name=request.name, 
                    lastname=request.lastname, 
                    email=request.email, 
                    profile=request.profile) == "SUCCESS":
            success = {'success': True}
        return pb2.success(**success)
    
    def ChangeProfile(self, request, context):
        success = {'success': False}
        user = User(request.id)
        if user.edit(name=request.name, 
                     lastname=request.lastname, 
                     email=request.email, 
                     profile=request.profile) == "SUCCESS":
            success = {'success': True}
        return pb2.success(**success)
    
    def DeleteCard(self, request, context):
        success = {'success': False}
        user = User(request.id)
        if user.delete() == "SUCCESS":
            success = {'success': True}
        return pb2.success(**success)
    
    def DeleteUser(self, request, context):
        success = {'success': False}
        user = User(request.id)
        if user.edit(name=None, 
                     lastname=None, 
                     profile=None) == "SUCCESS":
            success = {'success': True}
            self.logger.error(f'Usuario {request.id} borrado') 
        return pb2.success(**success)
    
def serve(): 
    server = grpc.server(futures.ThreadPoolExecutor(max_workers=10))
    pb2_grpc.add_USERSServicer_to_server(USERSService(), server)
    server.add_insecure_port('[::]:50052')
    server.start()
    try:
        server.wait_for_termination()
    except KeyboardInterrupt:
        server.stop(None)

if __name__ == '__main__':
    serve()