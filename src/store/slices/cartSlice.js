import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import { saveCartToDB, getCartFromDB } from '../../db';

// Async thunk para cargar el carrito desde SQLite
export const loadCartFromStorage = createAsyncThunk(
  'cart/loadCartFromStorage',
  async (_, { rejectWithValue }) => {
    try {
      const cartItems = await getCartFromDB();
      return cartItems;
    } catch (error) {
      return rejectWithValue(error.message);
    }
  }
);

const cartSlice = createSlice({
  name: 'cart',
  initialState: {
    items: [],
    total: 0,
    loading: false,
    isInitialized: false // Flag para controlar si ya cargamos de DB
  },
  reducers: {
    setCart: (state, action) => {
      state.items = action.payload;
      state.total = state.items.reduce((sum, item) => sum + (item.price * item.quantity), 0);
    },
    addToCart: (state, action) => {
      const product = action.payload;
      const existingItem = state.items.find(item => item.id === product.id);

      if (existingItem) {
        // Si el producto ya está en el carrito, aumentar cantidad
        existingItem.quantity += 1;
      } else {
        // Si no existe, agregar nuevo producto
        state.items.push({
          ...product,
          quantity: 1
        });
      }

      // Recalcular total
      state.total = state.items.reduce((sum, item) => sum + (item.price * item.quantity), 0);
    },

    removeFromCart: (state, action) => {
      const productId = action.payload;
      state.items = state.items.filter(item => item.id !== productId);

      // Recalcular total
      state.total = state.items.reduce((sum, item) => sum + (item.price * item.quantity), 0);
    },

    updateQuantity: (state, action) => {
      const { productId, quantity } = action.payload;
      const item = state.items.find(item => item.id === productId);

      if (item && quantity > 0) {
        item.quantity = quantity;
      }

      // Recalcular total
      state.total = state.items.reduce((sum, item) => sum + (item.price * item.quantity), 0);
    },

    clearCart: (state) => {
      state.items = [];
      state.total = 0;
    }
  },
  extraReducers: (builder) => {
    builder
      .addCase(loadCartFromStorage.fulfilled, (state, action) => {
        state.items = action.payload;
        state.total = state.items.reduce((sum, item) => sum + (item.price * item.quantity), 0);
        state.loading = false;
        state.isInitialized = true;
      })
      .addCase(loadCartFromStorage.pending, (state) => {
        state.loading = true;
      })
      .addCase(loadCartFromStorage.rejected, (state) => {
        state.loading = false;
        state.isInitialized = true;
      });
  }
});

export const { addToCart, removeFromCart, updateQuantity, clearCart, setCart } = cartSlice.actions;
export default cartSlice.reducer;
