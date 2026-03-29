import { configureStore } from '@reduxjs/toolkit';
import productsReducer from './slices/productsSlice';
import cartReducer from './slices/cartSlice';
import categoriesReducer from './slices/categoriesSlice';
import authReducer from './slices/authSlice';
import ordersReducer from './slices/ordersSlice';

export const store = configureStore({
  reducer: {
    products: productsReducer,
    cart: cartReducer,
    categories: categoriesReducer,
    auth: authReducer,
    orders: ordersReducer
  }
});

export default store;