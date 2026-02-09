from fastapi import APIRouter, Depends, UploadFile, File
import os
from fastapi.responses import JSONResponse
from app.configuracionGeneral.schemasGenerales import respuestaApi
from app.ParametrosSistema.services.parametroSistemaService import ParametroSistemaService
from app.ParametrosSistema.schemas.parametroSistemaSchemas import *
from app.database import obtenerSesion
from app.configuracionGeneral.seguridadJWT import protegerRuta

router = APIRouter()

# Endpoint para subir imagen y crear carpeta si no existe (camelCase y español)
@router.post("/subirLogo", 
             dependencies=[Depends(protegerRuta("ParametrosSistema", "POST"))],
             tags=["ParametrosSistema"], summary="Subir logo del negocio", status_code=200)
async def subirLogoNegocio(archivoLogo: UploadFile = File(...)):
    carpetaImagenes = os.path.join(os.path.dirname(os.path.dirname(os.path.dirname(__file__))), "imagenes")
    if not os.path.exists(carpetaImagenes):
        os.makedirs(carpetaImagenes)
    extensionLogo = os.path.splitext(archivoLogo.filename)[1]
    nombreFinalLogo = f"nuevo_logo{extensionLogo}"
    rutaLogo = os.path.join(carpetaImagenes, nombreFinalLogo)
    print("rutaLogo", rutaLogo)
    with open(rutaLogo, "wb") as archivoDestino:
        contenidoLogo = await archivoLogo.read()
        archivoDestino.write(contenidoLogo)
    return JSONResponse(status_code=200, content={"success": True, "message": "logoSubidoCorrectamente", "data": {"rutaLogo": f"imagenes/{nombreFinalLogo}"}})

@router.get("/", tags=["ParametrosSistema"], 
            dependencies=[Depends(protegerRuta("ParametrosSistema", "GET"))],
            summary="Obtener todos los parámetros", status_code=200, response_model=respuestaApi)
async def obtenerParametros(dbSession=Depends(obtenerSesion)):
    servicio = ParametroSistemaService(dbSession)
    return servicio.listarParametros()

@router.get("/{idParametro}",
            dependencies=[Depends(protegerRuta("ParametrosSistema", "GET"))], 
            tags=["ParametrosSistema"], summary="Obtener un parámetro por id", status_code=200, response_model=respuestaApi)
async def obtenerParametroPorId(idParametro: int, dbSession=Depends(obtenerSesion)):
    servicio = ParametroSistemaService(dbSession)
    return servicio.obtenerParametroPorId(idParametro)

@router.post("/", tags=["ParametrosSistema"], 
             dependencies=[Depends(protegerRuta("ParametrosSistema", "POST"))],
             summary="Crear un parámetro", status_code=201, response_model=respuestaApi)
async def crearParametro(parametro: ParametroSistemaCrearSchema, dbSession=Depends(obtenerSesion)):
    servicio = ParametroSistemaService(dbSession)
    return servicio.crearParametro(parametro)

@router.put("/{idParametro}", 
            dependencies=[Depends(protegerRuta("ParametrosSistema", "PUT"))],
            tags=["ParametrosSistema"], summary="Actualizar un parámetro", status_code=200, response_model=respuestaApi)
async def actualizarParametro(idParametro: int, parametro: ParametroSistemaActualizarSchema, dbSession=Depends(obtenerSesion)):
    servicio = ParametroSistemaService(dbSession)
    return servicio.modificarParametro(idParametro, parametro)

@router.delete("/{idParametro}", 
               dependencies=[Depends(protegerRuta("ParametrosSistema", "DELETE"))],
               tags=["ParametrosSistema"], summary="Eliminar (soft delete) un parámetro por id", status_code=200, response_model=respuestaApi)
async def deshabilitarParametro(idParametro: int, dbSession=Depends(obtenerSesion)):
    servicio = ParametroSistemaService(dbSession)
    return servicio.deshabilitarParametro(idParametro)
