import React from 'react';
import { StatusBar } from 'expo-status-bar';
import { Provider } from 'react-redux';
import store from './src/store/store';
import RootNavigator from './navigation/RootNavigator';
import { useEffect } from 'react';
import { initializeProducts } from './services/productService';

export default function App() {
  useEffect(() => {
    // Inicializar productos en Firebase (solo ejecuta una vez)
    initializeProducts();
  }, []);

  return (
    <Provider store={store}>
      <StatusBar barStyle="dark-content" />
      <RootNavigator />
    </Provider>
  );
}
