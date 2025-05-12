import os
import sys
sys.path.append(os.path.abspath(os.path.join(os.path.dirname(__file__), '..')))

from flask import Flask
from flask_restful import Api
from flask_cors import CORS
from .config.database import db
from .resources.carteira import CarteiraResource
from .resources.movimentacoes import MovimentacoesResource

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

# Registro das rotas
api.add_resource(CarteiraResource, '/api/v1/carteira')
api.add_resource(MovimentacoesResource, '/api/v1/movimentacoes')

if __name__ == '__main__':
    app.run(debug=True)