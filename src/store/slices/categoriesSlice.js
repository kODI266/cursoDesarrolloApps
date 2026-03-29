import { createSlice } from '@reduxjs/toolkit';

const categoriesSlice = createSlice({
  name: 'categories',
  initialState: {
    items: [],
    loading: false,
    error: null,
    selectedCategory: null
  },
  reducers: {
    setCategories: (state, action) => {
      state.items = action.payload;
      state.loading = false;
    },
    setLoading: (state, action) => {
      state.loading = action.payload;
    },
    setError: (state, action) => {
      state.error = action.payload;
      state.loading = false;
    },
    setSelectedCategory: (state, action) => {
      state.selectedCategory = action.payload;
    }
  }
});

export const { setCategories, setLoading, setError, setSelectedCategory } = categoriesSlice.actions;
export default categoriesSlice.reducer;
