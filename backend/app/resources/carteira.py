from flask_restful import Resource, request
from ..config.database import db, logger
from ..models.carteira import Carteira
from ..models.movimentacoes import Movimentacoes
from datetime import datetime
import peewee

class CarteiraResource(Resource):
    def get(self):
        try:
            # Calcular saldo total
            saldo_total = Carteira.select(peewee.fn.SUM(Carteira.valor_investido).alias('saldo_total')).scalar() or 0

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
                now = datetime.now()
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