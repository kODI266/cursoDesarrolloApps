import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet } from 'react-native';
import NetInfo from '@react-native-community/netinfo';
import { Ionicons } from '@expo/vector-icons';

export default function ConnectionStatus() {
  const [isConnected, setIsConnected] = useState(true);
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    // Suscribirse a cambios de conexión
    const unsubscribe = NetInfo.addEventListener(state => {
      // usar isConnected como principal, isInternetReachable como fallback
      const connected = state.isConnected === true;
      
      setIsConnected(connected);
      
      // Solo mostrar cuando está offline
      setIsVisible(!connected);
      
      // Log para debugging
      if (!connected) {
        console.log('📵 MODO OFFLINE - Usando base de datos local SQLite');
        console.log('Estado de conexión:', {
          isConnected: state.isConnected,
          isInternetReachable: state.isInternetReachable,
          type: state.type
        });
      } else {
        console.log('📡 ONLINE - Conectado a Firebase');
        console.log('Tipo de conexión:', state.type);
      }
    });

    return unsubscribe;
  }, []);

  if (!isVisible) {
    return null;
  }

  return (
    <View style={styles.container}>
      <Ionicons name="cloud-offline" size={20} color="#FFFFFF" style={styles.icon} />
      <Text style={styles.text}>
        Modo Offline - Usando datos locales
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: '#334155', 
    paddingVertical: 10,
    paddingHorizontal: 20,
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    borderBottomWidth: 1,
    borderBottomColor: '#1E293B'
  },
  icon: {
    marginRight: 8
  },
  text: {
    color: '#F8FAFC',
    fontWeight: '600',
    fontSize: 14,
    textAlign: 'center'
  }
});
