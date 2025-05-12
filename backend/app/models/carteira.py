from peewee import (
    Model, IntegerField, CharField, DecimalField, DateTimeField, Check
)
from ..config.database import db

class BaseModel(Model):
    class Meta:
        database = db

class Carteira(BaseModel):
    id = IntegerField(primary_key=True)
    nome = CharField(max_length=100, null=False)
    ticker = CharField(max_length=10, unique=True, null=False)
    tipo = CharField(max_length=50, null=False)
    valor_cota = DecimalField(max_digits=10, decimal_places=2, null=False, constraints=[Check('valor_cota > 0')])
    quantidade_cotas = DecimalField(max_digits=10, decimal_places=2, null=False, constraints=[Check('quantidade_cotas >= 0')])
    valor_investido = DecimalField(max_digits=10, decimal_places=2, null=False, constraints=[Check('valor_investido >= 0')])
    criado_em = DateTimeField(null=False)
    atualizado_em = DateTimeField(null=False)

    class Meta:
        table_name = 'carteira'