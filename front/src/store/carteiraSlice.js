// src/store/carteiraSlice.js
import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import { getCarteiraData, createCarteiraItem } from '../services/api';

/**
 * Thunk assíncrono para buscar dados da carteira
 * - Faz a chamada à API para obter os dados completos da carteira
 * - Atualiza o estado global com os dados recebidos
 */
export const fetchCarteira = createAsyncThunk(
  'carteira/fetchCarteira',
  async (_, { rejectWithValue }) => {
    try {
      const response = await getCarteiraData();
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data?.error || error.message);
    }
  }
);

/**
 * Thunk assíncrono para adicionar um novo fundo à carteira
 * - Envia os dados do novo fundo para a API
 * - Após sucesso, dispara uma atualização dos dados da carteira
 * - Retorna o novo fundo criado
 */
export const addFundo = createAsyncThunk(
  'carteira/addFundo',
  async (fundoData, { dispatch, rejectWithValue }) => {
    try {
      const response = await createCarteiraItem(fundoData);
      // Atualiza os dados da carteira após adicionar novo fundo
      dispatch(fetchCarteira());
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data?.error || error.message);
    }
  }
);

// Estado inicial do slice
const initialState = {
  // Dados da carteira
  portfolioSummary: { invested: 0 },  // Resumo do investimento
  portfolio: [],                      // Lista de fundos na carteira
  recentTransactions: [],             // Histórico de movimentações
  loading: 'idle',                    // Status da requisição: 'idle' | 'loading' | 'succeeded' | 'failed'
  error: null,                        // Erro da requisição

  // Status para adição de novos fundos
  addFundoStatus: 'idle',             // Status da requisição de adição
  addFundoError: null,                // Erro ao adicionar fundo
  lastAddedFundo: null,               // Último fundo adicionado com sucesso
};

/**
 * Slice da carteira que contém:
 * - Reducers síncronos
 * - Extra reducers para lidar com ações assíncronas
 */
const carteiraSlice = createSlice({
  name: 'carteira',
  initialState,
  reducers: {
    /**
     * Reducer para resetar o status de adição de fundo
     * - Usado para limpar o estado após operações completas
     */
    resetAddFundoStatus: (state) => {
      state.addFundoStatus = 'idle'; // 'idle' | 'loading' | 'succeeded' | 'failed'
      state.addFundoError = null;
      state.lastAddedFundo = null;
    }
  },
  extraReducers: (builder) => {
    builder
      // Casos para fetchCarteira
      .addCase(fetchCarteira.pending, (state) => {
        state.loading = 'loading';
        state.error = null;
      })
      .addCase(fetchCarteira.fulfilled, (state, action) => {
        state.loading = 'succeeded';
        // Atualiza todos os dados da carteira com a resposta da API
        state.portfolioSummary = action.payload.portfolioSummary;
        state.portfolio = action.payload.portfolio;
        state.recentTransactions = action.payload.recentTransactions;
      })
      .addCase(fetchCarteira.rejected, (state, action) => {
        state.loading = 'failed';
        state.error = action.payload;
      })

      // Casos para addFundo
      .addCase(addFundo.pending, (state) => {
        state.addFundoStatus = 'loading';
        state.addFundoError = null;
      })
      .addCase(addFundo.fulfilled, (state, action) => {
        state.addFundoStatus = 'succeeded';
        // Armazena o último fundo adicionado
        state.lastAddedFundo = action.payload;
        // Observação: Os dados são atualizados pelo fetchCarteira disparado no thunk
      })
      .addCase(addFundo.rejected, (state, action) => {
        state.addFundoStatus = 'failed';
        state.addFundoError = action.payload;
      });
  },
});

// Exporta a action e o reducer
export const { resetAddFundoStatus } = carteiraSlice.actions;
export default carteiraSlice.reducer;