// src/components/Dashboard.jsx
import { useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { Container, Typography, Paper, Table, TableBody, TableCell, TableContainer, TableHead, TableRow, CircularProgress, Alert } from '@mui/material';
import styled from '@emotion/styled';
import { fetchCarteira } from '../store/carteiraSlice';

// Estilizações dos componentes
const StyledContainer = styled(Container)`
  padding: 24px;
  max-width: 1200px;
  margin: 0 auto;
`;

const SectionTitle = styled(Typography)`
  margin-bottom: 16px;
  font-weight: 600;
`;

const TotalInvestedPaper = styled(Paper)`
  padding: 24px;
  margin-bottom: 24px;
  text-align: center;
  background-color: #f5f5f5;
`;

const TableHeaderCell = styled(TableCell)`
  font-weight: 600;
`;

const CenteredContent = styled('div')`
  display: flex;
  justify-content: center;
  align-items: center;
  min-height: 200px;
`;

// Formata valor para moeda brasileira
const formatCurrency = (value) => {
  if (typeof value !== 'number') {
    return 'N/A';
  }
  return new Intl.NumberFormat('pt-BR', {
    style: 'currency',
    currency: 'BRL',
  }).format(value);
};

// Formata data para padrão brasileiro
const formatDate = (dateStr) => {
  if (!dateStr) return 'N/A';
  const date = (dateStr instanceof Date) ? dateStr : new Date(dateStr);
  if (isNaN(date.getTime())) return 'Data inválida';
  return date.toLocaleDateString('pt-BR', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
  });
};

const Dashboard = () => {
  const dispatch = useDispatch();
  const {
    portfolioSummary,
    portfolio,
    recentTransactions,
    loading,
    error,
  } = useSelector((state) => state.carteira);

  // Carrega dados da carteira
  useEffect(() => {
    if (loading === 'idle') {
      dispatch(fetchCarteira());
    }
  }, [dispatch, loading]);

  // Exibe loading enquanto carrega dados
  if (loading === 'loading') {
    return (
      <StyledContainer>
        <CenteredContent>
          <CircularProgress />
        </CenteredContent>
      </StyledContainer>
    );
  }

  // Exibe erro se ocorrer
  if (loading === 'failed' && error) {
    return (
      <StyledContainer>
        <Alert severity="error">Erro ao carregar dados: {error}</Alert>
      </StyledContainer>
    );
  }

  // Garante que os dados existam
  const investedAmount = portfolioSummary?.invested ?? 0;
  const portfolioList = portfolio ?? [];
  const transactionsList = recentTransactions ?? [];

  return (
    <StyledContainer>
      {/* Seção do total investido */}
      <TotalInvestedPaper elevation={3}>
        <SectionTitle variant="h5">Total Investido</SectionTitle>
        <Typography variant="h4" color="primary">
          {formatCurrency(investedAmount)}
        </Typography>
      </TotalInvestedPaper>

      {/* Tabela de fundos */}
      <SectionTitle variant="h5">Meus Fundos</SectionTitle>
      {portfolioList.length > 0 ? (
        <TableContainer component={Paper} sx={{ marginBottom: '24px' }}>
          <Table>
            <TableHead>
              <TableRow>
                <TableHeaderCell>Data</TableHeaderCell>
                <TableHeaderCell>Fundo</TableHeaderCell>
                <TableHeaderCell>Tipo</TableHeaderCell>
                <TableHeaderCell>Quant.</TableHeaderCell>
                <TableHeaderCell>Valor Investido</TableHeaderCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {portfolioList.map((fund) => (
                <TableRow key={fund.id}>
                  <TableCell>{formatDate(fund.date)}</TableCell>
                  <TableCell>{fund.fundName}</TableCell>
                  <TableCell>{fund.type}</TableCell>
                  <TableCell>{fund.quantity}</TableCell>
                  <TableCell>{formatCurrency(fund.amount)}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </TableContainer>
      ) : (
        <Typography sx={{ marginBottom: '24px' }}>Nenhum fundo na carteira.</Typography>
      )}

      {/* Tabela de movimentações */}
      <SectionTitle variant="h5">Movimentações Recentes</SectionTitle>
      {transactionsList.length > 0 ? (
        <TableContainer component={Paper}>
          <Table>
            <TableHead>
              <TableRow>
                <TableHeaderCell>Data</TableHeaderCell>
                <TableHeaderCell>Fundo</TableHeaderCell>
                <TableHeaderCell>Tipo</TableHeaderCell>
                <TableHeaderCell>Valor</TableHeaderCell>
                <TableHeaderCell>Quant.</TableHeaderCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {transactionsList.map((transaction) => (
                <TableRow key={transaction.id}>
                  <TableCell>{formatDate(transaction.date)}</TableCell>
                  <TableCell>{transaction.fundName}</TableCell>
                  <TableCell>{transaction.type}</TableCell>
                  <TableCell>{formatCurrency(transaction.amount)}</TableCell>
                  <TableCell>{transaction.quantity}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </TableContainer>
      ) : (
        <Typography>Nenhuma movimentação recente.</Typography>
      )}
    </StyledContainer>
  );
};

export default Dashboard;