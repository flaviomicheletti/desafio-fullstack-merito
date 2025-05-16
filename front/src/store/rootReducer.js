// src/store/movimentacoesSlice.js
import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import { createMovimentacaoItem } from '../services/api';
import { fetchCarteira } from './carteiraSlice';

/**
 * Thunk assíncrono para criar nova movimentação
 * - Prepara o payload conforme esperado pelo backend
 * - Envia os dados para a API
 * - Atualiza a carteira após sucesso
 * - Retorna a nova movimentação criada
 */
export const addMovimentacao = createAsyncThunk(
  'movimentacoes/addMovimentacao',
  async (movimentacaoData, { dispatch, rejectWithValue }) => {
    // Estrutura do payload conforme exigido pelo backend
    const payload = {
        carteira_id: movimentacaoData.carteira_id,  // ID do fundo
        tipo: movimentacaoData.tipo,               // Tipo (APORTE/RESGATE)
        quantidade: movimentacaoData.quantidade,   // Quantidade de cotas
        valor: movimentacaoData.valor,             // Valor total da operação
    };
    
    try {
      const response = await createMovimentacaoItem(payload);
      // Atualiza os dados da carteira após movimentação
      dispatch(fetchCarteira());
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data?.error || error.message);
    }
  }
);

// Estado inicial do slice de movimentações
const initialState = {
  addMovimentacaoStatus: 'idle',     // Status da operação: 'idle' | 'loading' | 'succeeded' | 'failed'
  addMovimentacaoError: null,        // Erro no cadastro de movimentação
  lastAddedMovimentacao: null,       // Última movimentação registrada com sucesso
};

/**
 * Slice das movimentações contendo:
 * - Reducers síncronos
 * - Extra reducers para ações assíncronas
 */
const movimentacoesSlice = createSlice({
  name: 'movimentacoes',
  initialState,
  reducers: {
    /**
     * Reducer para resetar o status de cadastro
     * - Limpa o estado após operações completas
     * - Útil para reiniciar o fluxo de cadastro
     */
    resetAddMovimentacaoStatus: (state) => {
      state.addMovimentacaoStatus = 'idle';
      state.addMovimentacaoError = null;
      state.lastAddedMovimentacao = null;
    }
  },
  extraReducers: (builder) => {
    builder
      // Caso de loading durante requisição
      .addCase(addMovimentacao.pending, (state) => {
        state.addMovimentacaoStatus = 'loading';
        state.addMovimentacaoError = null;
      })
      
      // Caso de sucesso na requisição
      .addCase(addMovimentacao.fulfilled, (state, action) => {
        state.addMovimentacaoStatus = 'succeeded';
        // Armazena a última movimentação cadastrada
        state.lastAddedMovimentacao = action.payload;
        // Observação: A carteira é atualizada pelo fetchCarteira disparado no thunk
      })
      
      // Caso de falha na requisição
      .addCase(addMovimentacao.rejected, (state, action) => {
        state.addMovimentacaoStatus = 'failed';
        state.addMovimentacaoError = action.payload;
      });
  },
});

// Exporta a action e o reducer
export const { resetAddMovimentacaoStatus } = movimentacoesSlice.actions;
export default movimentacoesSlice.reducer;