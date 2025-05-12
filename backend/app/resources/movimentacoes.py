from flask_restful import Resource, request
from ..config.database import db, logger
from ..models.carteira import Carteira
from ..models.movimentacoes import Movimentacoes
from datetime import datetime
import peewee

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

            now = datetime.now()
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