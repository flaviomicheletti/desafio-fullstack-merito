from peewee import (
    Model, IntegerField, DateField, CharField, DecimalField, ForeignKeyField,
    DateTimeField, Check
)
from datetime import datetime
from ..config.database import db
from .carteira import Carteira

class BaseModel(Model):
    class Meta:
        database = db

class Movimentacoes(BaseModel):
    id = IntegerField(primary_key=True)
    carteira = ForeignKeyField(Carteira, backref='movimentacoes', column_name='carteira_id', null=False)
    data_operacao = DateField(default=datetime.now, null=False)
    tipo = CharField(max_length=10, null=False, constraints=[Check("tipo IN ('APORTE', 'RESGATE')")])
    valor = DecimalField(max_digits=10, decimal_places=2, null=False, constraints=[Check('valor > 0')])
    quantidade_cotas = DecimalField(max_digits=10, decimal_places=2, null=False, constraints=[Check('quantidade_cotas > 0')])
    criado_em = DateTimeField(null=False)

    class Meta:
        table_name = 'movimentacoes'