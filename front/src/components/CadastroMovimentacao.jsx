// src/components/CadastroMovimentacao.jsx
import { useState, useEffect } from 'react';
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
import { fetchCarteira } from '../store/carteiraSlice'; // To get the list of funds

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

const mockFundos = [ // Using the provided mock data for now
    { id: 5, fundName: "a" },
    { id: 2, fundName: "ETF IVVB11" },
    { id: 3, fundName: "Fundo Imobiliário XP" },
    { id: 4, fundName: "nome" },
    { id: 1, fundName: "Tesouro Selic 2026" },
];

const tip_movimentacao_options = [
    { value: 'APORTE', label: 'Aporte' },
    { value: 'RESGATE', label: 'Resgate' },
];


const CadastroMovimentacao = () => {
  const dispatch = useDispatch();

  // State from movimentacoesSlice
  const { addMovimentacaoStatus, addMovimentacaoError, lastAddedMovimentacao } = useSelector(
    (state) => state.movimentacoes
  );

  // State from carteiraSlice for the fund dropdown
  const { portfolio: fundosDisponiveis, loading: loadingFundos } = useSelector(
    (state) => state.carteira
  );

  const [carteiraId, setCarteiraId] = useState('');
  const [dataOperacao, setDataOperacao] = useState(new Date().toISOString().split('T')[0]); // Defaults to today, backend uses its own date
  const [tipoMovimentacao, setTipoMovimentacao] = useState(tip_movimentacao_options[0].value); // Default to 'APORTE'
  const [valor, setValor] = useState('');
  const [quantidade, setQuantidade] = useState('');
  const [formErrors, setFormErrors] = useState({});

  useEffect(() => {
    // Fetch fundos if not already loaded or if mock data isn't being used
    // For now, we will switch to using fundosDisponiveis once populated
    if (fundosDisponiveis.length === 0 && loadingFundos === 'idle') {
      dispatch(fetchCarteira());
    }
  }, [dispatch, fundosDisponiveis, loadingFundos]);


  useEffect(() => {
    // Reset status when component unmounts
    return () => {
      dispatch(resetAddMovimentacaoStatus());
    };
  }, [dispatch]);

  useEffect(() => {
    if (addMovimentacaoStatus === 'succeeded') {
      console.log('Movimentação registrada com sucesso:', lastAddedMovimentacao);
      handleCancel(); // Clear form
    }
  }, [addMovimentacaoStatus, lastAddedMovimentacao, dispatch]);

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
    } else {
        // Additional check for RESGATE: ensure quantity is not more than available (if we had that info here)
        // For now, the backend handles this check: "Quantidade de cotas insuficiente para resgate"
    }

    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleSubmit = (event) => {
    event.preventDefault();
    if (validateForm()) {
      const movimentacaoData = {
        carteira_id: parseInt(carteiraId, 10),
        tipo: tipoMovimentacao,
        valor: parseFloat(valor),
        quantidade: parseFloat(quantidade),
        // 'type' (like "Ações") is not sent as it's not used by the backend for this endpoint
      };
      dispatch(addMovimentacao(movimentacaoData));
    }
  };

  const handleCancel = () => {
    setCarteiraId('');
    setTipoMovimentacao(tip_movimentacao_options[0].value);
    setValor('');
    setQuantidade('');
    setFormErrors({});
    dispatch(resetAddMovimentacaoStatus());
  };

  const fundOptions = fundosDisponiveis.length > 0 ? fundosDisponiveis : mockFundos;

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
                    {fundo.fundName || fundo.name} {/* API uses fundName, model has nome */}
                  </MenuItem>
                ))}
              </TextField>
            </Grid>

            <Grid item xs={12}>
              <TextField
                label="Data da Operação"
                type="date"
                value={dataOperacao}
                // onChange={(e) => setDataOperacao(e.target.value)} // Backend uses current server date
                InputLabelProps={{
                  shrink: true,
                }}
                fullWidth
                disabled // Backend currently sets its own date
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
                InputProps={{ inputProps: { min: 0.001, step: 0.001 } }} // Allow fractional quotas
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