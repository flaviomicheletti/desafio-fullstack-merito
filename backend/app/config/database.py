import logging
from peewee import PostgresqlDatabase

# Configuração de logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

# Configuração do banco de dados PostgreSQL
db = PostgresqlDatabase(
    'investments',
    user='admin',
    password='admin123',
    host='localhost',
    port=5432
)