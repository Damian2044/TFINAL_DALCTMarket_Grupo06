import os
from sqlalchemy import create_engine
from sqlalchemy.ext.declarative import declarative_base
from sqlalchemy.orm import sessionmaker


BASEDATOS_URL = os.getenv(
    "DATABASE_URL","postgresql://dalctuser:Dalct1234@servicio-bdpostgres:5432/dalctmarket"
)

engine = create_engine(BASEDATOS_URL)

# Establecer la zona horaria por conexión (por defecto Quito) para que funciones de servidor
# como now() devuelvan la hora en la zona deseada. Se puede sobreescribir con la variable
# de entorno DB_TIMEZONE.
from sqlalchemy import event
DB_TIMEZONE = os.getenv("DB_TIMEZONE", "America/Guayaquil")

@event.listens_for(engine, "connect")
def _set_timezone(dbapi_connection, connection_record):
    try:
        cursor = dbapi_connection.cursor()
        cursor.execute(f"SET TIME ZONE '{DB_TIMEZONE}'")
        cursor.close()
    except Exception:
        # No bloquear si la conexión no soporta cursor (por ejemplo, motores no-Postgres)
        pass

SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)
Base = declarative_base()

# Obtener la sesión actual de la base de datos
def obtenerSesion():
    databaseSesion = SessionLocal()
    try:
        yield databaseSesion
    finally:
        databaseSesion.close()

def obtenerSesionDirecta():
    db = SessionLocal()
    return db


