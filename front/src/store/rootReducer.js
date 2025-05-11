// src/store/rootReducer.js
import { combineReducers } from '@reduxjs/toolkit';
import carteiraReducer from './carteiraSlice';
import movimentacoesReducer from './movimentacoesSlice';

const rootReducer = combineReducers({
  carteira: carteiraReducer,
  movimentacoes: movimentacoesReducer,
});

export default rootReducer;