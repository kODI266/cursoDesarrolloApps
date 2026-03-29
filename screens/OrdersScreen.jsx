import React, { useEffect, useState } from 'react';
import { View, Text, FlatList, Button, StyleSheet, ActivityIndicator, Image, TouchableOpacity } from 'react-native';
import { useDispatch, useSelector } from 'react-redux';
import { loadOrdersFromStorage, removeOrder } from '../src/store/slices/ordersSlice';
import { deleteOrderFromDB } from '../src/db';
import { getLocalImage } from '../src/config/imageMap';
import { Ionicons, MaterialCommunityIcons } from '@expo/vector-icons';
import CustomAlert from '../components/CustomAlert';

export default function OrdersScreen({ navigation }) {
  const dispatch = useDispatch();
  const user = useSelector(state => state.auth.user);
  const orders = useSelector(state => state.orders.items);
  const loading = useSelector(state => state.orders.loading);

  const [alertVisible, setAlertVisible] = useState(false);
  const [alertConfig, setAlertConfig] = useState({
    title: '',
    message: '',
    type: 'info',
    buttons: []
  });
  const [orderToDelete, setOrderToDelete] = useState(null);

  useEffect(() => {
    if (user?.uid) {
      dispatch(loadOrdersFromStorage(user.uid));
    }
  }, [user, dispatch]);

  const showAlert = (config) => {
    setAlertConfig(config);
    setAlertVisible(true);
  };

  const handleDeleteOrder = (orderId) => {
    setOrderToDelete(orderId);
    showAlert({
      title: 'Eliminar Pedido',
      message: '¿Estás seguro de que deseas eliminar este pedido del historial?',
      type: 'warning',
      buttons: [
        { 
          text: 'Cancelar', 
          onPress: () => setOrderToDelete(null)
        },
        { 
          text: 'Eliminar',
          onPress: async () => {
            try {
              await deleteOrderFromDB(orderId);
              dispatch(removeOrder(orderId));
              showAlert({
                title: 'Pedido Eliminado',
                message: 'El pedido ha sido eliminado correctamente',
                type: 'success',
                buttons: [{ text: 'OK', onPress: () => {} }]
              });
            } catch (error) {
              showAlert({
                title: 'Error',
                message: 'No se pudo eliminar el pedido',
                type: 'error',
                buttons: [{ text: 'OK', onPress: () => {} }]
              });
            }
            setOrderToDelete(null);
          }
        }
      ]
    });
  };

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('es-ES', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  if (loading) {
    return (
      <View style={styles.centerContainer}>
        <ActivityIndicator size="large" color="#2563EB" />
        <Text style={styles.loadingText}>Cargando historial...</Text>
      </View>
    );
  }

  if (orders.length === 0) {
    return (
      <View style={styles.emptyContainer}>
        <Ionicons name="receipt-outline" size={80} color="#E2E8F0" />
        <Text style={styles.emptyText}>No tienes pedidos aún</Text>
        <Text style={styles.emptySubtext}>
          Tus compras recientes aparecerán aquí
        </Text>
        <View style={styles.buttonContainer}>
          <Button
            title="Ir al Catálogo"
            onPress={() => navigation.navigate('Home')}
            color="#2563EB"
          />
        </View>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>Mis Pedidos</Text>
        <Text style={styles.subtitle}>{orders.length} órdenes registradas</Text>
      </View>

      <FlatList
        data={orders}
        keyExtractor={item => item.orderId}
        renderItem={({ item }) => (
          <View style={styles.orderCard}>
            {/* Header de la tarjeta */}
            <View style={styles.cardHeader}>
              <View style={styles.headerLeft}>
                <MaterialCommunityIcons name="package-variant-closed" size={24} color="#2563EB" />
                <View style={styles.orderIdContainer}>
                  <Text style={styles.orderIdLabel}>Pedido</Text>
                  <Text style={styles.orderIdValue}>#{item.orderId.slice(-8).toUpperCase()}</Text>
                </View>
              </View>
              <View style={styles.statusBadge}>
                <Text style={styles.statusText}>{item.status}</Text>
              </View>
            </View>

            <View style={styles.dateContainer}>
              <Ionicons name="calendar-outline" size={14} color="#64748B" />
              <Text style={styles.dateText}>{formatDate(item.createdAt)}</Text>
            </View>

            {/* Lista de productos resumen */}
            <View style={styles.productsList}>
              {item.items.map((product, index) => {
                const imageSource = product.image ? getLocalImage(product.image) : null;
                return (
                  <View key={index} style={styles.productRow}>
                     {imageSource ? (
                        <Image source={imageSource} style={styles.productThumb} />
                      ) : (
                        <View style={styles.fallbackThumb}>
                          <Ionicons name="image-outline" size={16} color="#94A3B8" />
                        </View>
                      )}
                    <View style={styles.productInfo}>
                      <Text style={styles.productName} numberOfLines={1}>{product.name}</Text>
                      <Text style={styles.productQty}>x{product.quantity}</Text>
                    </View>
                    <Text style={styles.productPrice}>${(product.price * product.quantity).toFixed(2)}</Text>
                  </View>
                );
              })}
            </View>

            <View style={styles.divider} />

            {/* Footer con Total y Acciones */}
            <View style={styles.cardFooter}>
              <View>
                <Text style={styles.totalLabel}>Total</Text>
                <Text style={styles.totalValue}>${item.total.toFixed(2)}</Text>
              </View>

              <View style={styles.actions}>
                <TouchableOpacity
                  style={styles.deleteButton}
                  onPress={() => handleDeleteOrder(item.orderId)}
                >
                  <Ionicons name="trash-outline" size={20} color="#EF4444" />
                </TouchableOpacity>
              </View>
            </View>
          </View>
        )}
        contentContainerStyle={styles.listContainer}
        nestedScrollEnabled={false}
      />

      {/* Botón Volver al Home */}
      <View style={styles.footerContainer}>
        <View style={styles.backButtonContainer}>
          <Button
            title="Volver al Catálogo"
            onPress={() => navigation.navigate('Home')}
            color="#2563EB"
          />
        </View>
      </View>

      <CustomAlert
        visible={alertVisible}
        title={alertConfig.title}
        message={alertConfig.message}
        type={alertConfig.type}
        buttons={alertConfig.buttons}
        onClose={() => setAlertVisible(false)}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F8FAFC'
  },
  header: {
    padding: 20,
    paddingTop: 32,
    backgroundColor: '#FFFFFF',
    borderBottomWidth: 1,
    borderBottomColor: '#E2E8F0',
    marginBottom: 10
  },
  title: {
    fontSize: 24,
    fontWeight: '800',
    color: '#1E293B'
  },
  subtitle: {
    fontSize: 14,
    color: '#64748B',
    marginTop: 4
  },
  centerContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#F8FAFC'
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 40
  },
  emptyText: {
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 8,
    color: '#1E293B',
    marginTop: 20
  },
  emptySubtext: {
    fontSize: 14,
    color: '#64748B',
    marginBottom: 30,
    textAlign: 'center'
  },
  loadingText: {
    marginTop: 12,
    fontSize: 16,
    color: '#64748B'
  },
  buttonContainer: {
    width: '100%'
  },
  listContainer: {
    padding: 16,
    paddingBottom: 40
  },
  orderCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 16,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2
  },
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8
  },
  headerLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12
  },
  orderIdContainer: {
    justifyContent: 'center'
  },
  orderIdLabel: {
    fontSize: 10,
    color: '#64748B',
    textTransform: 'uppercase',
    fontWeight: '700'
  },
  orderIdValue: {
    fontSize: 16,
    fontWeight: '700',
    color: '#1E293B'
  },
  statusBadge: {
    backgroundColor: '#DCFCE7', 
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: '#10B981'
  },
  statusText: {
    fontSize: 12,
    fontWeight: '700',
    color: '#15803D' 
  },
  dateContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginBottom: 16
  },
  dateText: {
    fontSize: 13,
    color: '#64748B'
  },
  productsList: {
    marginBottom: 16
  },
  productRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8
  },
  productThumb: {
    width: 32,
    height: 32,
    borderRadius: 6,
    marginRight: 10
  },
  fallbackThumb: {
    width: 32,
    height: 32,
    borderRadius: 6,
    backgroundColor: '#F1F5F9',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 10
  },
  productInfo: {
    flex: 1,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginRight: 10
  },
  productName: {
    fontSize: 14,
    color: '#334155',
    flex: 1,
    marginRight: 8
  },
  productQty: {
    fontSize: 13,
    color: '#64748B',
    fontWeight: '500'
  },
  productPrice: {
    fontSize: 14,
    fontWeight: '600',
    color: '#334155'
  },
  divider: {
    height: 1,
    backgroundColor: '#F1F5F9',
    marginBottom: 12
  },
  cardFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center'
  },
  totalLabel: {
    fontSize: 12,
    color: '#64748B',
    textTransform: 'uppercase',
    fontWeight: '600'
  },
  totalValue: {
    fontSize: 20,
    fontWeight: '800',
    color: '#1E293B'
  },
  actions: {
    flexDirection: 'row',
    gap: 10
  },
  deleteButton: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: '#FEF2F2',
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#FECACA'
  },
  footerContainer: {
    padding: 16,
    backgroundColor: '#FFFFFF',
    borderTopWidth: 1,
    borderTopColor: '#E2E8F0',
    alignItems: 'center'
  },
  backButtonContainer: {
    width: '100%',
    borderRadius: 8,
    overflow: 'hidden'
  },
  backButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#2563EB',
    paddingVertical: 12,
    paddingHorizontal: 20,
    borderRadius: 8
  },
  backButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '600',
    marginLeft: 8
  }
});
