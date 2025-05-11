// src/store/carteiraSlice.js
import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import { getCarteiraData, createCarteiraItem } from '../services/api';

// Async Thunk for fetching carteira data
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

// Async Thunk for creating a new carteira item (fundo)
export const addFundo = createAsyncThunk(
  'carteira/addFundo',
  async (fundoData, { dispatch, rejectWithValue }) => {
    try {
      const response = await createCarteiraItem(fundoData);
      // After successfully adding a fundo, re-fetch the entire carteira data
      // to ensure the dashboard is up-to-date.
      dispatch(fetchCarteira());
      return response.data; // This is the newly created fundo item
    } catch (error) {
      return rejectWithValue(error.response?.data?.error || error.message);
    }
  }
);

const initialState = {
  // Data for GET /carteira
  portfolioSummary: { invested: 0 },
  portfolio: [],
  recentTransactions: [],
  loading: 'idle', // 'idle' | 'loading' | 'succeeded' | 'failed'
  error: null,

  // Status for POST /carteira
  addFundoStatus: 'idle', // 'idle' | 'loading' | 'succeeded' | 'failed'
  addFundoError: null,
  lastAddedFundo: null,
};

const carteiraSlice = createSlice({
  name: 'carteira',
  initialState,
  reducers: {
    // Optional: a reducer to reset the addFundo status if needed from a component
    resetAddFundoStatus: (state) => {
      state.addFundoStatus = 'idle';
      state.addFundoError = null;
      state.lastAddedFundo = null;
    }
  },
  extraReducers: (builder) => {
    builder
      // Reducers for fetchCarteira
      .addCase(fetchCarteira.pending, (state) => {
        state.loading = 'loading';
        state.error = null;
      })
      .addCase(fetchCarteira.fulfilled, (state, action) => {
        state.loading = 'succeeded';
        state.portfolioSummary = action.payload.portfolioSummary;
        state.portfolio = action.payload.portfolio;
        state.recentTransactions = action.payload.recentTransactions;
      })
      .addCase(fetchCarteira.rejected, (state, action) => {
        state.loading = 'failed';
        state.error = action.payload;
      })
      // Reducers for addFundo
      .addCase(addFundo.pending, (state) => {
        state.addFundoStatus = 'loading';
        state.addFundoError = null;
      })
      .addCase(addFundo.fulfilled, (state, action) => {
        state.addFundoStatus = 'succeeded';
        state.lastAddedFundo = action.payload; // Store the created fundo details
        // Data is refreshed by fetchCarteira called within addFundo thunk
      })
      .addCase(addFundo.rejected, (state, action) => {
        state.addFundoStatus = 'failed';
        state.addFundoError = action.payload;
      });
  },
});

export const { resetAddFundoStatus } = carteiraSlice.actions;
export default carteiraSlice.reducer;