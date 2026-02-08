from fastapi import APIRouter, HTTPException, Depends
from app.configuracionGeneral.errores import ERROR_CREDENCIALES
from app.configuracionGeneral.schemasGenerales import respuestaApi
from app.Usuarios.schemas.usuarioSchemas import IniciarSesionRequest
from app.configuracionGeneral.seguridadJWT import crearTokenJWT
from fastapi.security import OAuth2PasswordRequestForm 
from app.Usuarios.services.usuarioService import UsuarioService
from app.Usuarios.schemas.usuarioSchemas import *
from app.database import obtenerSesion
from app.configuracionGeneral.seguridadJWT import protegerRuta
publicRouter = APIRouter()

#Validador para login con swagger y manual

def validarLogin(username,password,dbSession):
    usuario=UsuarioService(dbSession).validarCredenciales(username,password)
    token=crearTokenJWT(usuario)
    return {"access_token": token, "token_type": "bearer"}

# Login Público - Swagger
@publicRouter.post("/loginSwagger",
             summary="Iniciar sesión con OAuth2PasswordBearer (OAuth2, password)",
             description="Iniciar sesión y obtener un token de acceso JWT directamente desde Swagger")
def iniciarSesion(request: OAuth2PasswordRequestForm = Depends(),# Usa form-data en swagger
                  dbSession=Depends(obtenerSesion)
                  ):
    return validarLogin(request.username, request.password, dbSession)


# Login Público - Manual JSON
@publicRouter.post("/login",
             summary="Iniciar sesión",
             description="Iniciar sesión y obtener un token de acceso JWT si se lo hace manualmente con cuerpo JSON")
def iniciarSesion(request: IniciarSesionRequest,dbSession=Depends(obtenerSesion)):# Usa cuerpo JSON
    return validarLogin(request.username, request.password, dbSession)

router = APIRouter()# Protege todas las rutas módulo Usuarios solo administradores

# Operaciones con usuario
@router.get("/", tags=["Usuarios"],
            dependencies=[Depends(protegerRuta("Usuarios", "GET"))],
            summary="Obtener todos los usuarios",
            status_code=200,
            response_model=respuestaApi)
async def obtenerTodosLosUsuarios(dbSession=Depends(obtenerSesion)):
    usuarioService = UsuarioService(dbSession)
    return usuarioService.listarUsuarios()

@router.get("/{idUsuario}", tags=["Usuarios"],
            dependencies=[Depends(protegerRuta("Usuarios", "GET"))],
            summary="Obtener un usuario por id",
            status_code=200,
            response_model=respuestaApi)
async def obtenerUsuarioPorId(idUsuario: int, dbSession=Depends(obtenerSesion)):
                              
    usuarioService = UsuarioService(dbSession)
    return usuarioService.obtenerPorId(idUsuario)


@router.post("/", tags=["Usuarios"],
             dependencies=[Depends(protegerRuta("Usuarios", "POST"))],
             description="Crear un nuevo usuario",
             status_code=201,
             response_model=respuestaApi)
async def crearUsuario(usuario: UsuarioCrearSchema, dbSession=Depends(obtenerSesion)):
    usuarioService = UsuarioService(dbSession)
    return usuarioService.crearUsuario(usuario)

@router.put("/{idUsuario}", tags=["Usuarios"],
            dependencies=[Depends(protegerRuta("Usuarios", "PUT"))],
            summary="Actualizar un usuario por id",
            status_code=200,
            response_model=respuestaApi)
async def actualizarUsuario(idUsuario: int, usuario: UsuarioActualizarSchema, dbSession=Depends(obtenerSesion)):
    usuarioService = UsuarioService(dbSession)
    return usuarioService.modificarUsuario(idUsuario, usuario)

@router.delete("/{idUsuario}", tags=["Usuarios"],
               dependencies=[Depends(protegerRuta("Usuarios", "DELETE"))],
               summary="Eliminar un usuario como soft delete(inactivo) por id",
               status_code=200,
               response_model=respuestaApi)
async def deshabilitarUsuario(idUsuario: int, dbSession=Depends(obtenerSesion)):
    usuarioService = UsuarioService(dbSession)
    return usuarioService.deshabilitarUsuario(idUsuario)

