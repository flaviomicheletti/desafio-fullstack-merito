-- Inserir fundos na carteira
INSERT INTO carteira (id, nome, ticker, tipo, valor_cota, quantidade_cotas, valor_investido, criado_em, atualizado_em) VALUES
    (1, 'Tesouro Selic 2026', 'FIXA11', 'Renda Fixa', 10.50, 80.00, 840.00, '2025-05-01 12:00:00', '2025-05-04 11:00:00'),
    (2, 'ETF IVVB11', 'IVVB11', 'Ações', 25.00, 150.00, 3750.00, '2025-05-01 12:30:00', '2025-05-05 12:00:00'),
    (3, 'Fundo Imobiliário XP', 'MULT13', 'Multimercado', 15.75, 150.00, 2362.50, '2025-05-01 13:00:00', '2025-05-03 10:30:00');

-- Inserir movimentações
INSERT INTO movimentacoes (id, carteira_id, data_operacao, tipo, valor, quantidade_cotas, criado_em) VALUES
    (1, 1, '2025-05-02', 'APORTE', 1050.00, 100.00, '2025-05-02 09:00:00'),   -- Tesouro Selic 2026 (FIXA11)
    (2, 2, '2025-05-03', 'APORTE', 2500.00, 100.00, '2025-05-03 10:00:00'),   -- ETF IVVB11
    (3, 1, '2025-05-04', 'RESGATE', 210.00, 20.00, '2025-05-04 11:00:00'),    -- Tesouro Selic 2026 (FIXA11)
    (4, 3, '2025-05-02', 'APORTE', 1575.00, 100.00, '2025-05-02 09:30:00'),   -- Fundo Imobiliário XP (MULT13)
    (5, 3, '2025-05-03', 'APORTE', 787.50, 50.00, '2025-05-03 10:30:00'),     -- Fundo Imobiliário XP (MULT13)
    (6, 2, '2025-05-05', 'APORTE', 1250.00, 50.00, '2025-05-05 12:00:00');    -- ETF IVVB11
