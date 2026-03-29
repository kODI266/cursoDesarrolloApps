import React, { useEffect } from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { useDispatch, useSelector } from 'react-redux';
import AuthNavigator from './AuthNavigator';
import AppNavigator from './AppNavigator';
import { subscribeToAuthChanges } from '../services/authService';
import { setUser } from '../src/store/slices/authSlice';
import { loadCartFromStorage } from '../src/store/slices/cartSlice';
import { loadOrdersFromStorage } from '../src/store/slices/ordersSlice';
import { saveCartToDB } from '../src/db';

export default function RootNavigator() {
  const user = useSelector((state) => state.auth.user);
  const cartItems = useSelector((state) => state.cart.items);
  const isCartInitialized = useSelector((state) => state.cart.isInitialized);
  const dispatch = useDispatch();

  // Escuchar cambios de autenticación
  useEffect(() => {
    const unsubscribe = subscribeToAuthChanges((currentUser) => {
      if (currentUser) {
        // Serializamos solo lo necesario
        dispatch(setUser({ uid: currentUser.uid, email: currentUser.email }));
        // Cargar órdenes del usuario
        dispatch(loadOrdersFromStorage(currentUser.uid));
      } else {
        dispatch(setUser(null));
      }
    });

    return unsubscribe;
  }, [dispatch]);

  // Cargar carrito guardado al iniciar
  useEffect(() => {
    dispatch(loadCartFromStorage());
  }, [dispatch]);

  // Guardar carrito en SQLite cuando cambie
  useEffect(() => {
    // Solo guardo si el carrito ya fue inicializado desde la DB
    if (isCartInitialized && cartItems && cartItems.length >= 0) {
        saveCartToDB(cartItems).catch(error => {
            console.error('Error al guardar carrito en RootNavigator:', error);
        });
    }
  }, [cartItems, isCartInitialized]);

  return (
    <NavigationContainer>
      {user ? <AppNavigator /> : <AuthNavigator />}
    </NavigationContainer>
  );
}
