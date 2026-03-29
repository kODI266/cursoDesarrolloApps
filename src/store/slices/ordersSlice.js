import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import { getOrdersFromDB } from '../../db';

// Async thunk para cargar órdenes desde SQLite
export const loadOrdersFromStorage = createAsyncThunk(
  'orders/loadOrdersFromStorage',
  async (userId, { rejectWithValue }) => {
    try {
      if (!userId) {
        console.log('⚠️ No hay userId para cargar órdenes');
        return [];
      }
      const orders = await getOrdersFromDB(userId);
      return orders;
    } catch (error) {
      return rejectWithValue(error.message);
    }
  }
);

const ordersSlice = createSlice({
  name: 'orders',
  initialState: {
    items: [],
    loading: false,
    error: null,
    isInitialized: false
  },
  reducers: {
    setOrders: (state, action) => {
      state.items = action.payload;
      state.loading = false;
    },
    addOrder: (state, action) => {
      state.items.unshift(action.payload); // Agregar al principio
    },
    removeOrder: (state, action) => {
      state.items = state.items.filter(order => order.orderId !== action.payload);
    },
    clearOrders: (state) => {
      state.items = [];
    }
  },
  extraReducers: (builder) => {
    builder
      .addCase(loadOrdersFromStorage.pending, (state) => {
        state.loading = true;
      })
      .addCase(loadOrdersFromStorage.fulfilled, (state, action) => {
        state.items = action.payload;
        state.loading = false;
        state.isInitialized = true;
      })
      .addCase(loadOrdersFromStorage.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
        state.isInitialized = true;
      });
  }
});

export const { setOrders, addOrder, removeOrder, clearOrders } = ordersSlice.actions;
export default ordersSlice.reducer;
