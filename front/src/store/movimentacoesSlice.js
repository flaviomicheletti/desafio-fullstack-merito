// src/store/movimentacoesSlice.js
import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import { createMovimentacaoItem } from '../services/api';
import { fetchCarteira } from './carteiraSlice'; // To re-fetch carteira data after a transaction

// Async Thunk for creating a new movimentacao
export const addMovimentacao = createAsyncThunk(
  'movimentacoes/addMovimentacao',
  async (movimentacaoData, { dispatch, rejectWithValue }) => {
    // The backend expects `quantidade` and `valor`.
    // The Postman example has `carteira_id`, `tipo`, `type` (Ações), `quantidade`, `valor`.
    // The backend script for movimentacoes does not use `type` from the request body.
    // It uses `carteira_id`, `tipo`, `quantidade`, `valor`.
    // We will send what the backend expects.
    const payload = {
        carteira_id: movimentacaoData.carteira_id,
        tipo: movimentacaoData.tipo,
        quantidade: movimentacaoData.quantidade,
        valor: movimentacaoData.valor,
    };
    try {
      const response = await createMovimentacaoItem(payload);
      // After successfully adding a movimentacao, re-fetch the carteira data
      // as balances and recent transactions will have changed.
      dispatch(fetchCarteira());
      return response.data; // This is the newly created movimentacao item
    } catch (error) {
      return rejectWithValue(error.response?.data?.error || error.message);
    }
  }
);

const initialState = {
  addMovimentacaoStatus: 'idle', // 'idle' | 'loading' | 'succeeded' | 'failed'
  addMovimentacaoError: null,
  lastAddedMovimentacao: null,
};

const movimentacoesSlice = createSlice({
  name: 'movimentacoes',
  initialState,
  reducers: {
    // Optional: a reducer to reset the addMovimentacao status
    resetAddMovimentacaoStatus: (state) => {
      state.addMovimentacaoStatus = 'idle';
      state.addMovimentacaoError = null;
      state.lastAddedMovimentacao = null;
    }
  },
  extraReducers: (builder) => {
    builder
      .addCase(addMovimentacao.pending, (state) => {
        state.addMovimentacaoStatus = 'loading';
        state.addMovimentacaoError = null;
      })
      .addCase(addMovimentacao.fulfilled, (state, action) => {
        state.addMovimentacaoStatus = 'succeeded';
        state.lastAddedMovimentacao = action.payload;
        // Carteira data is refreshed by fetchCarteira called within addMovimentacao thunk
      })
      .addCase(addMovimentacao.rejected, (state, action) => {
        state.addMovimentacaoStatus = 'failed';
        state.addMovimentacaoError = action.payload;
      });
  },
});

export const { resetAddMovimentacaoStatus } = movimentacoesSlice.actions;
export default movimentacoesSlice.reducer;