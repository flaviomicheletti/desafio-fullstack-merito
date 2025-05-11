// src/services/api.js
import axios from 'axios';

const apiClient = axios.create({
  baseURL: 'http://localhost:5000/api/v1',
  headers: {
    'Content-Type': 'application/json',
  },
});

// Carteira Endpoints
export const getCarteiraData = () => apiClient.get('/carteira');
export const createCarteiraItem = (data) => apiClient.post('/carteira', data);

// Movimentacoes Endpoints
export const createMovimentacaoItem = (data) => apiClient.post('/movimentacoes', data);

export default apiClient;