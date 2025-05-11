-- Listar Fundos na Carteira:
SELECT id, nome, ticker, tipo, valor_cota, quantidade_cotas, valor_investido
FROM carteira
ORDER BY nome;

-- Calcular Saldo Total da Carteira:
SELECT SUM(valor_investido) AS saldo_total
FROM carteira;

-- Listar Últimas Movimentações:
SELECT m.data_operacao, c.nome AS fundo, m.tipo, m.valor, m.quantidade_cotas
FROM movimentacoes m
JOIN carteira c ON m.carteira_id = c.id
ORDER BY m.data_operacao DESC
LIMIT 5;