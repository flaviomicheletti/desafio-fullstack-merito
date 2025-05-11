-- Criação da tabela carteira
CREATE TABLE carteira (
    id SERIAL PRIMARY KEY,
    nome VARCHAR(100) NOT NULL,
    ticker VARCHAR(10) NOT NULL UNIQUE,
    tipo VARCHAR(50) NOT NULL,
    valor_cota DECIMAL(10,2) NOT NULL CHECK (valor_cota > 0),
    quantidade_cotas DECIMAL(10,2) NOT NULL CHECK (quantidade_cotas >= 0),
    valor_investido DECIMAL(10,2) NOT NULL CHECK (valor_investido >= 0),
    criado_em TIMESTAMP NOT NULL DEFAULT NOW(),
    atualizado_em TIMESTAMP NOT NULL DEFAULT NOW()
);

-- Criação da tabela movimentacoes
CREATE TABLE movimentacoes (
    id SERIAL PRIMARY KEY,
    carteira_id INTEGER NOT NULL REFERENCES carteira(id),
    data_operacao DATE NOT NULL DEFAULT CURRENT_DATE,
    tipo VARCHAR(10) NOT NULL CHECK (tipo IN ('APORTE', 'RESGATE')),
    valor DECIMAL(10,2) NOT NULL CHECK (valor > 0),
    quantidade_cotas DECIMAL(10,2) NOT NULL CHECK (quantidade_cotas > 0),
    criado_em TIMESTAMP NOT NULL DEFAULT NOW()
);

-- Índices para otimização
CREATE INDEX idx_carteira_ticker ON carteira(ticker);
CREATE INDEX idx_movimentacoes_carteira_id ON movimentacoes(carteira_id);
CREATE INDEX idx_movimentacoes_data_operacao ON movimentacoes(data_operacao);