// src/components/CadastroFundo.jsx
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
} from '@mui/material';
import styled from '@emotion/styled';
import { addFundo, resetAddFundoStatus } from '../store/carteiraSlice';

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

// Tipos de fundos disponíveis
// @TODO Hardcode
const fundTypes = [
  { value: 'Renda Fixa', label: 'Renda Fixa' },
  { value: 'Ações', label: 'Ações' },
  { value: 'Multimercado', label: 'Multimercado' },
];

const CadastroFundo = () => {
  const dispatch = useDispatch();
  const { addFundoStatus, addFundoError, lastAddedFundo } = useSelector((state) => state.carteira);

  // Estados do formulário
  const [nome, setNome] = useState('');
  const [ticker, setTicker] = useState('');
  const [tipo, setTipo] = useState(fundTypes[0].value);
  const [valorCota, setValorCota] = useState('');
  const [formErrors, setFormErrors] = useState({});
  const navigate = useNavigate();


  // Limpa status ao desmontar componente
  useEffect(() => {
    return () => {
      dispatch(resetAddFundoStatus());
    };
  }, [dispatch]);

  // Limpa formulário após cadastro bem-sucedido
  useEffect(() => {
    if (addFundoStatus === 'succeeded') {
      console.log('Fundo adicionado com sucesso:', lastAddedFundo);
      handleCancel();
    }
  }, [addFundoStatus, lastAddedFundo, dispatch]);

  // Valida campos do formulário
  const validateForm = () => {
    const errors = {};
    if (!nome.trim()) errors.nome = 'Nome do fundo é obrigatório.';
    else if (nome.trim().length > 100) errors.nome = 'Nome do fundo não pode exceder 100 caracteres.';

    if (!ticker.trim()) errors.ticker = 'Código (Ticker) é obrigatório.';
    else if (ticker.trim().length > 10) errors.ticker = 'Ticker não pode exceder 10 caracteres.';

    if (!tipo) errors.tipo = 'Tipo é obrigatório.';
    const numericValorCota = parseFloat(valorCota);
    if (isNaN(numericValorCota) || numericValorCota <= 0) {
      errors.valorCota = 'Valor da cota deve ser um número positivo.';
    }

    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  };

  // Envia dados do formulário
  const handleSubmit = (event) => {
    event.preventDefault();
    if (validateForm()) {
      const fundoData = {
        name: nome.trim(),
        ticker: ticker.trim(),
        type: tipo,
        quoteValue: parseFloat(valorCota),
      };
      dispatch(addFundo(fundoData));
    }
  };

  // Limpa formulário
  const handleCancel = () => {
    setNome('');
    setTicker('');
    setTipo(fundTypes[0].value);
    setValorCota('');
    setFormErrors({});
    dispatch(resetAddFundoStatus());
    navigate('/');    
  };

  return (
    <StyledContainer>
      <FormPaper elevation={3}>
        <SectionTitle variant="h5">Cadastro de Fundo</SectionTitle>
        <form onSubmit={handleSubmit} noValidate>
          <Grid container spacing={3}>
            <Grid item xs={12}>
              <TextField
                label="Nome do Fundo"
                value={nome}
                onChange={(e) => setNome(e.target.value)}
                fullWidth
                required
                error={!!formErrors.nome}
                helperText={formErrors.nome}
                inputProps={{ maxLength: 100 }}
              />
            </Grid>
            <Grid item xs={12}>
              <TextField
                label="Código (Ticker)"
                value={ticker}
                onChange={(e) => setTicker(e.target.value.toUpperCase())}
                fullWidth
                required
                error={!!formErrors.ticker}
                helperText={formErrors.ticker}
                inputProps={{ maxLength: 10 }}
              />
            </Grid>
            <Grid item xs={12}>
              <TextField
                label="Tipo"
                value={tipo}
                onChange={(e) => setTipo(e.target.value)}
                select
                fullWidth
                required
                error={!!formErrors.tipo}
                helperText={formErrors.tipo}
              >
                {fundTypes.map((option) => (
                  <MenuItem key={option.value} value={option.value}>
                    {option.label}
                  </MenuItem>
                ))}
              </TextField>
            </Grid>
            <Grid item xs={12}>
              <TextField
                label="Valor da Cota (R$)"
                value={valorCota}
                onChange={(e) => setValorCota(e.target.value)}
                type="number"
                fullWidth
                required
                error={!!formErrors.valorCota}
                helperText={formErrors.valorCota}
                InputProps={{
                    inputProps: {
                        min: 0.01,
                        step: 0.01
                    }
                }}
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
              disabled={addFundoStatus === 'loading'}
            >
              {addFundoStatus === 'loading' ? <CircularProgress size={24} color="inherit" /> : 'Salvar'}
            </Button>
          </ButtonContainer>
        </form>
        <Box mt={3}>
          {addFundoStatus === 'succeeded' && lastAddedFundo && (
            <Alert severity="success">
              Fundo "{lastAddedFundo.name}" cadastrado com sucesso! ID: {lastAddedFundo.id}
            </Alert>
          )}
          {addFundoStatus === 'failed' && addFundoError && (
            <Alert severity="error">
              Erro ao cadastrar fundo: {typeof addFundoError === 'string' ? addFundoError : JSON.stringify(addFundoError)}
            </Alert>
          )}
        </Box>
      </FormPaper>
    </StyledContainer>
  );
};

export default CadastroFundo;