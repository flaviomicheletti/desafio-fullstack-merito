from flask import Flask, request
from flask_restful import Api, Resource
from flask_cors import CORS
from peewee import (
    Model, PostgresqlDatabase, IntegerField, CharField, DecimalField,
    DateField, ForeignKeyField, DateTimeField, Check, fn
)
from datetime import datetime, UTC
import peewee
import logging

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

# Definindo a classe base para os modelos
class BaseModel(Model):
    class Meta:
        database = db

# Modelo para a tabela carteira
class Carteira(BaseModel):
    id = IntegerField(primary_key=True)
    nome = CharField(max_length=100, null=False)
    ticker = CharField(max_length=10, unique=True, null=False)
    tipo = CharField(max_length=50, null=False)
    valor_cota = DecimalField(max_digits=10, decimal_places=2, null=False, constraints=[Check('valor_cota > 0')])
    quantidade_cotas = DecimalField(max_digits=10, decimal_places=2, null=False, constraints=[Check('quantidade_cotas >= 0')])
    valor_investido = DecimalField(max_digits=10, decimal_places=2, null=False, constraints=[Check('valor_investido >= 0')])
    criado_em = DateTimeField(null=False)  # Alterado para DateTimeField
    atualizado_em = DateTimeField(null=False)  # Alterado para DateTimeField

    class Meta:
        table_name = 'carteira'

# Modelo para a tabela movimentacoes
class Movimentacoes(BaseModel):
    id = IntegerField(primary_key=True)
    carteira = ForeignKeyField(Carteira, backref='movimentacoes', column_name='carteira_id', null=False)
    data_operacao = DateField(default=datetime.now, null=False)
    tipo = CharField(max_length=10, null=False, constraints=[Check("tipo IN ('APORTE', 'RESGATE')")])
    valor = DecimalField(max_digits=10, decimal_places=2, null=False, constraints=[Check('valor > 0')])
    quantidade_cotas = DecimalField(max_digits=10, decimal_places=2, null=False, constraints=[Check('quantidade_cotas > 0')])
    criado_em = DateTimeField(null=False)  # Alterado para DateTimeField

    class Meta:
        table_name = 'movimentacoes'

# Inicialização do Flask
app = Flask(__name__)
api = Api(app)

# Configuração do CORS
CORS(app, resources={r"/api/*": {"origins": "http://localhost:5173"}})

# Conectar ao banco antes de iniciar
@app.before_request
def connect_db():
    db.connect()

# Fechar conexão após cada requisição
@app.after_request
def close_db(response):
    if not db.is_closed():
        db.close()
    return response

class CarteiraResource(Resource):
    def get(self):
        try:
            # Calcular saldo total
            saldo_total = Carteira.select(fn.SUM(Carteira.valor_investido).alias('saldo_total')).scalar() or 0

            # Listar fundos na carteira
            fundos = []
            for fundo in Carteira.select().order_by(Carteira.nome):
                fundos.append({
                    'id': fundo.id,
                    'date': fundo.atualizado_em.strftime('%Y-%m-%d') if hasattr(fundo.atualizado_em, 'strftime') else str(fundo.atualizado_em),
                    'fundName': fundo.nome,
                    'type': fundo.tipo,
                    'quantity': float(fundo.quantidade_cotas),
                    'amount': float(fundo.valor_investido)
                })

            # Listar últimas movimentações
            movimentacoes = []
            query = (Movimentacoes
                     .select(Movimentacoes, Carteira)
                     .join(Carteira)
                     .order_by(Movimentacoes.data_operacao.desc())
                     .limit(5))
            for mov in query:
                movimentacoes.append({
                    'id': mov.id,
                    'date': mov.data_operacao.strftime('%Y-%m-%d') if hasattr(mov.data_operacao, 'strftime') else str(mov.data_operacao),
                    'fundName': mov.carteira.nome,
                    'type': mov.tipo,
                    'quantity': float(mov.quantidade_cotas),
                    'amount': float(mov.valor)
                })

            # Montar resposta JSON
            response = {
                'portfolioSummary': {
                    'invested': float(saldo_total)
                },
                'portfolio': fundos,
                'recentTransactions': movimentacoes
            }

            return response, 200

        except Exception as e:
            logger.error(f"Erro no GET /api/v1/carteira: {str(e)}")
            return {'error': str(e)}, 500

    def post(self):
        try:
            # Obter os dados do JSON
            data = request.get_json()
            if not data:
                return {'error': 'Nenhum dado fornecido'}, 400

            # Validar campos obrigatórios
            required_fields = ['name', 'ticker', 'type', 'quoteValue']
            for field in required_fields:
                if field not in data:
                    return {'error': f'Campo {field} é obrigatório'}, 400

            # Validar valores
            if not isinstance(data['quoteValue'], (int, float)) or data['quoteValue'] <= 0:
                return {'error': 'quoteValue deve ser um número positivo'}, 400
            if len(data['name']) > 100:
                return {'error': 'name excede o tamanho máximo de 100 caracteres'}, 400
            if len(data['ticker']) > 10:
                return {'error': 'ticker excede o tamanho máximo de 10 caracteres'}, 400
            if len(data['type']) > 50:
                return {'error': 'type excede o tamanho máximo de 50 caracteres'}, 400

            # Criar novo registro na tabela carteira
            with db.atomic():
                now = datetime.now()  # Sem UTC para compatibilidade com o banco
                logger.info(f"Valores para inserção: nome={data['name']}, ticker={data['ticker']}, tipo={data['type']}, valor_cota={data['quoteValue']}, criado_em={now}, atualizado_em={now}")
                carteira = Carteira.create(
                    nome=data['name'],
                    ticker=data['ticker'],
                    tipo=data['type'],
                    valor_cota=data['quoteValue'],
                    quantidade_cotas=0,
                    valor_investido=0,
                    criado_em=now,
                    atualizado_em=now
                )

            # Montar resposta com os dados do registro criado
            response = {
                'id': carteira.id,
                'name': carteira.nome,
                'ticker': carteira.ticker,
                'type': carteira.tipo,
                'quoteValue': float(carteira.valor_cota),
                'quantity': float(carteira.quantidade_cotas),
                'amount': float(carteira.valor_investido),
                'createdAt': carteira.criado_em.strftime('%Y-%m-%d %H:%M:%S'),
                'updatedAt': carteira.atualizado_em.strftime('%Y-%m-%d %H:%M:%S')
            }

            logger.info(f"Registro criado na carteira: {response}")
            return response, 201

        except peewee.IntegrityError as e:
            logger.error(f"Erro de integridade no POST /api/v1/carteira: {str(e)}")
            if 'unique constraint' in str(e).lower():
                return {'error': 'Ticker já existe'}, 400
            return {'error': str(e)}, 500
        except Exception as e:
            logger.error(f"Erro no POST /api/v1/carteira: {str(e)}")
            return {'error': str(e)}, 500


class MovimentacoesResource(Resource):
    def post(self):
        try:
            # Obter os dados do JSON
            data = request.get_json()
            if not data:
                return {'error': 'Nenhum dado fornecido'}, 400

            # Validar campos obrigatórios
            required_fields = ['carteira_id', 'tipo', 'quantidade', 'valor']
            for field in required_fields:
                if field not in data:
                    return {'error': f'Campo {field} é obrigatório'}, 400

            # Verificar se a carteira existe
            try:
                carteira = Carteira.get(Carteira.id == data['carteira_id'])
            except peewee.DoesNotExist:
                return {'error': 'Carteira não encontrada'}, 404

            # Validar valores
            if not isinstance(data['quantidade'], (int, float)) or data['quantidade'] <= 0:
                return {'error': 'quantidade deve ser um número positivo'}, 400
            if not isinstance(data['valor'], (int, float)) or data['valor'] <= 0:
                return {'error': 'valor deve ser um número positivo'}, 400
            if data['tipo'] not in ['APORTE', 'RESGATE']:
                return {'error': 'tipo deve ser APORTE ou RESGATE'}, 400

            # Se for resgate, verificar se há saldo suficiente
            if data['tipo'] == 'RESGATE' and data['quantidade'] > carteira.quantidade_cotas:
                return {'error': 'Quantidade de cotas insuficiente para resgate'}, 400

            now = datetime.now()  # Sem UTC para compatibilidade com o banco
            hoje = datetime.now().date()

            with db.atomic():
                # Registrar a movimentação
                logger.info(f"Inserindo movimentação: carteira_id={data['carteira_id']}, tipo={data['tipo']}, valor={data['valor']}, quantidade={data['quantidade']}, data_op={hoje}, criado_em={now}")
                
                movimentacao = Movimentacoes.create(
                    carteira=carteira,
                    data_operacao=hoje,
                    tipo=data['tipo'],
                    valor=data['valor'],
                    quantidade_cotas=data['quantidade'],
                    criado_em=now
                )

                # Atualizar o saldo da carteira
                if data['tipo'] == 'APORTE':
                    carteira.quantidade_cotas += data['quantidade']
                    carteira.valor_investido += data['valor']
                else:  # RESGATE
                    carteira.quantidade_cotas -= data['quantidade']
                    # Calcular o valor proporcional do resgate
                    valor_proporcional = (data['quantidade'] / (carteira.quantidade_cotas + data['quantidade'])) * carteira.valor_investido
                    carteira.valor_investido -= valor_proporcional

                carteira.atualizado_em = now
                carteira.save()

            # Montar resposta
            response = {
                'id': movimentacao.id,
                'carteira_id': carteira.id,
                'data_operacao': hoje.strftime('%Y-%m-%d'),
                'tipo': movimentacao.tipo,
                'valor': float(movimentacao.valor),
                'quantidade_cotas': float(movimentacao.quantidade_cotas),
                'saldo_atual': {
                    'quantidade_cotas': float(carteira.quantidade_cotas),
                    'valor_investido': float(carteira.valor_investido)
                }
            }

            logger.info(f"Movimentação registrada: {response}")
            return response, 201

        except Exception as e:
            logger.error(f"Erro no POST /api/v1/movimentacoes: {str(e)}")
            return {'error': str(e)}, 500


# Registro das rotas
api.add_resource(CarteiraResource, '/api/v1/carteira')
api.add_resource(MovimentacoesResource, '/api/v1/movimentacoes')

if __name__ == '__main__':
    app.run(debug=True)