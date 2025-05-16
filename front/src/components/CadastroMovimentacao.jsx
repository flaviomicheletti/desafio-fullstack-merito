// src/components/CadastroMovimentacao.jsx
import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import {
  Container,
  Typography,
  Paper,
  TextField,
  Button,
  Grid,
  MenuItem,
  CircularProgress,
  Alert,
  Box,
  RadioGroup,
  FormControlLabel,
  Radio,
  FormControl,
  FormLabel,
} from '@mui/material';
import styled from '@emotion/styled';
import { addMovimentacao, resetAddMovimentacaoStatus } from '../store/movimentacoesSlice';
import { fetchCarteira } from '../store/carteiraSlice';

// Estilizações dos componentes
const StyledContainer = styled(Container)`
  padding: 24px;
  max-width: 600px;
  margin: 40px auto;
`;

const FormPaper = styled(Paper)`
  padding: 24px;
`;

const SectionTitle = styled(Typography)`
  margin-bottom: 24px;
  font-weight: 600;
  text-align: center;
`;

const ButtonContainer = styled(Box)`
  margin-top: 24px;
  display: flex;
  justify-content: flex-end;
  gap: 16px;
`;

// Dados mockados temporários
// const mockFundos = [
//     { id: 2, fundName: "ETF IVVB11" },
//     { id: 3, fundName: "Fundo Imobiliário XP" },
//     { id: 1, fundName: "Tesouro Selic 2026" },
// ];

// Opções de tipo de movimentação
const tip_movimentacao_options = [
    { value: 'APORTE', label: 'Aporte' },
    { value: 'RESGATE', label: 'Resgate' },
];

const CadastroMovimentacao = () => {
  const dispatch = useDispatch();

  // Estados do Redux
  const { addMovimentacaoStatus, addMovimentacaoError, lastAddedMovimentacao } = useSelector(
    (state) => state.movimentacoes
  );
  const { portfolio: fundosDisponiveis, loading: loadingFundos } = useSelector(
    (state) => state.carteira
  );

  // Estados do formulário
  const [carteiraId, setCarteiraId] = useState('');
  const [dataOperacao, setDataOperacao] = useState(new Date().toISOString().split('T')[0]);
  const [tipoMovimentacao, setTipoMovimentacao] = useState(tip_movimentacao_options[0].value);
  const [valor, setValor] = useState('');
  const [quantidade, setQuantidade] = useState('');
  const [formErrors, setFormErrors] = useState({});
  const navigate = useNavigate();  

  // Carrega lista de fundos disponíveis
  useEffect(() => {
    if (fundosDisponiveis.length === 0 && loadingFundos === 'idle') {
      dispatch(fetchCarteira());
    }
  }, [dispatch, fundosDisponiveis, loadingFundos]);

  // Limpa status ao desmontar componente
  useEffect(() => {
    return () => {
      dispatch(resetAddMovimentacaoStatus());
    };
  }, [dispatch]);

  // Limpa formulário após cadastro bem-sucedido
  useEffect(() => {
    if (addMovimentacaoStatus === 'succeeded') {
      handleCancel();
    }
  }, [addMovimentacaoStatus, lastAddedMovimentacao, dispatch]);

  // Valida campos do formulário
  const validateForm = () => {
    const errors = {};
    if (!carteiraId) errors.carteiraId = 'Selecione um fundo.';
    if (!tipoMovimentacao) errors.tipoMovimentacao = 'Selecione o tipo de movimentação.';

    const numericValor = parseFloat(valor);
    if (isNaN(numericValor) || numericValor <= 0) {
      errors.valor = 'Valor deve ser um número positivo.';
    }

    const numericQuantidade = parseFloat(quantidade);
    if (isNaN(numericQuantidade) || numericQuantidade <= 0) {
      errors.quantidade = 'Quantidade de cotas deve ser um número positivo.';
    }

    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  };

  // Envia dados do formulário
  const handleSubmit = (event) => {
    event.preventDefault();
    if (validateForm()) {
      const movimentacaoData = {
        carteira_id: parseInt(carteiraId, 10),
        tipo: tipoMovimentacao,
        valor: parseFloat(valor),
        quantidade: parseFloat(quantidade),
      };
      dispatch(addMovimentacao(movimentacaoData));
    }
  };

  // Limpa formulário
  const handleCancel = () => {
    setCarteiraId('');
    setTipoMovimentacao(tip_movimentacao_options[0].value);
    setValor('');
    setQuantidade('');
    setFormErrors({});
    dispatch(resetAddMovimentacaoStatus());
    navigate('/');     
  };

  // Usa fundos da API ou mockados temporariamente
  // const fundOptions = fundosDisponiveis.length > 0 ? fundosDisponiveis : mockFundos;
  const fundOptions = fundosDisponiveis;

  return (
    <StyledContainer>
      <FormPaper elevation={3}>
        <SectionTitle variant="h5">Registro de Movimentação</SectionTitle>
        <form onSubmit={handleSubmit} noValidate>
          <Grid container spacing={3}>
            <Grid item xs={12}>
              <TextField
                label="Fundo"
                value={carteiraId}
                onChange={(e) => setCarteiraId(e.target.value)}
                select
                fullWidth
                required
                error={!!formErrors.carteiraId}
                helperText={formErrors.carteiraId || (loadingFundos === 'loading' ? 'Carregando fundos...' : '')}
                disabled={loadingFundos === 'loading' || fundOptions.length === 0}
              >
                {fundOptions.length === 0 && loadingFundos !== 'loading' && (
                    <MenuItem value="" disabled>
                        Nenhum fundo disponível. Cadastre um fundo primeiro.
                    </MenuItem>
                )}
                {fundOptions.map((fundo) => (
                  <MenuItem key={fundo.id} value={fundo.id}>
                    {fundo.fundName || fundo.name}
                  </MenuItem>
                ))}
              </TextField>
            </Grid>

            <Grid item xs={12}>
              <TextField
                label="Data da Operação"
                type="date"
                value={dataOperacao}
                InputLabelProps={{
                  shrink: true,
                }}
                fullWidth
                disabled
                helperText="A data da operação é definida automaticamente pelo servidor."
              />
            </Grid>

            <Grid item xs={12}>
              <FormControl component="fieldset" error={!!formErrors.tipoMovimentacao} required>
                <FormLabel component="legend">Tipo de Movimentação</FormLabel>
                <RadioGroup
                  row
                  aria-label="tipo-movimentacao"
                  name="tipo-movimentacao"
                  value={tipoMovimentacao}
                  onChange={(e) => setTipoMovimentacao(e.target.value)}
                >
                  {tip_movimentacao_options.map(option => (
                     <FormControlLabel key={option.value} value={option.value} control={<Radio />} label={option.label} />
                  ))}
                </RadioGroup>
                {formErrors.tipoMovimentacao && <Typography color="error" variant="caption">{formErrors.tipoMovimentacao}</Typography>}
              </FormControl>
            </Grid>

            <Grid item xs={12}>
              <TextField
                label="Valor (R$)"
                value={valor}
                onChange={(e) => setValor(e.target.value)}
                type="number"
                fullWidth
                required
                error={!!formErrors.valor}
                helperText={formErrors.valor}
                InputProps={{ inputProps: { min: 0.01, step: 0.01 } }}
              />
            </Grid>

            <Grid item xs={12}>
              <TextField
                label="Quantidade de Cotas"
                value={quantidade}
                onChange={(e) => setQuantidade(e.target.value)}
                type="number"
                fullWidth
                required
                error={!!formErrors.quantidade}
                helperText={formErrors.quantidade}
                InputProps={{ inputProps: { min: 0.001, step: 0.001 } }}
              />
            </Grid>
          </Grid>
          <ButtonContainer>
            <Button onClick={handleCancel} color="secondary" variant="outlined">
              Cancelar
            </Button>
            <Button
              type="submit"
              variant="contained"
              color="primary"
              disabled={addMovimentacaoStatus === 'loading'}
            >
              {addMovimentacaoStatus === 'loading' ? <CircularProgress size={24} color="inherit" /> : 'Registrar'}
            </Button>
          </ButtonContainer>
        </form>
        <Box mt={3}>
          {addMovimentacaoStatus === 'succeeded' && lastAddedMovimentacao && (
            <Alert severity="success">
              Movimentação registrada com sucesso! ID: {lastAddedMovimentacao.id}
            </Alert>
          )}
          {addMovimentacaoStatus === 'failed' && addMovimentacaoError && (
            <Alert severity="error">
              Erro ao registrar movimentação: {typeof addMovimentacaoError === 'string' ? addMovimentacaoError : JSON.stringify(addMovimentacaoError)}
            </Alert>
          )}
        </Box>
      </FormPaper>
    </StyledContainer>
  );
};

export default CadastroMovimentacao;