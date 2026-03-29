import React, { useState } from 'react';
import { View, Text, FlatList, Button, StyleSheet, Image, TouchableOpacity } from 'react-native';
import { useDispatch, useSelector } from 'react-redux';
import { removeFromCart, updateQuantity, clearCart } from '../src/store/slices/cartSlice';
import { addOrder } from '../src/store/slices/ordersSlice';
import { saveOrderToDB } from '../src/db';
import { getLocalImage } from '../src/config/imageMap';
import { Ionicons, MaterialIcons } from '@expo/vector-icons';
import CustomAlert from '../components/CustomAlert';

export default function CartScreen({ navigation }) {
  const dispatch = useDispatch();
  const cartItems = useSelector(state => state.cart.items);
  const total = useSelector(state => state.cart.total);
  const user = useSelector(state => state.auth.user);

  const [alertVisible, setAlertVisible] = useState(false);
  const [alertConfig, setAlertConfig] = useState({
    title: '',
    message: '',
    type: 'info',
    buttons: []
  });
  const [itemToDelete, setItemToDelete] = useState(null);

  const showAlert = (config) => {
    setAlertConfig(config);
    setAlertVisible(true);
  };

  const handleRemoveItem = (productId, productName) => {
    setItemToDelete(productId);
    showAlert({
      title: 'Eliminar Producto',
      message: `¿Estás seguro de que deseas eliminar "${productName}" del carrito?`,
      type: 'warning',
      buttons: [
        { 
          text: 'Cancelar', 
          onPress: () => setItemToDelete(null)
        },
        { 
          text: 'Eliminar',
          onPress: () => {
            dispatch(removeFromCart(productId));
            showAlert({
              title: 'Producto Eliminado',
              message: 'El producto ha sido eliminado del carrito',
              type: 'success',
              buttons: [{ text: 'OK', onPress: () => {} }]
            });
            setItemToDelete(null);
          }
        }
      ]
    });
  };

  const handleIncreaseQuantity = (productId, currentQuantity) => {
    dispatch(updateQuantity({ productId, quantity: currentQuantity + 1 }));
  };

  const handleDecreaseQuantity = (productId, currentQuantity) => {
    if (currentQuantity > 1) {
      dispatch(updateQuantity({ productId, quantity: currentQuantity - 1 }));
    }
  };

  const handleCheckout = async () => {
    if (cartItems.length === 0) {
      showAlert({
        title: 'Carrito Vacío',
        message: 'Agrega productos antes de hacer una compra',
        type: 'warning',
        buttons: [{ text: 'OK', onPress: () => {} }]
      });
      return;
    }
    
    if (!user) {
      showAlert({
        title: 'Inicio de Sesión Requerido',
        message: 'Debes iniciar sesión para completar tu compra',
        type: 'warning',
        buttons: [
          { text: 'Cancelar', onPress: () => {} },
          { text: 'Ir a Login', onPress: () => navigation.navigate('Profile') }
        ]
      });
      return;
    }

    try {
      console.log('🛒 Iniciando checkout...');
      console.log('📦 Items:', cartItems);
      console.log('💰 Total:', total);
      console.log('👤 Usuario:', user.uid);

      // Guardar orden en SQLite
      const orderId = await saveOrderToDB(user.uid, cartItems, total);
      
      console.log('📝 Order ID retornado:', orderId);

      if (orderId) {
        console.log('✅ Orden guardada correctamente');
        
        const newOrder = {
          orderId,
          userId: user.uid,
          items: cartItems,
          total,
          createdAt: new Date().toISOString(),
          status: 'Completada'
        };
        
        // Agregar orden ANTES de limpiar carrito
        dispatch(addOrder(newOrder));
        
        console.log('🎉 Mostrando alerta de compra exitosa');
        
        // Mostrar alerta PRIMERO
        showAlert({
          title: '✅ ¡Compra Exitosa!',
          message: `Tu pedido #${orderId.slice(-8).toUpperCase()} ha sido confirmado.\nTotal: $${total.toFixed(2)}`,
          type: 'success',
          buttons: [
            { 
              text: 'Ver Mis Pedidos',
              onPress: () => {
                console.log('📋 Navegando a Orders');
                dispatch(clearCart());
                setAlertVisible(false);
                setTimeout(() => navigation.navigate('Orders'), 300);
              }
            },
            { 
              text: 'Seguir Comprando',
              onPress: () => {
                console.log('🏠 Navegando a Home');
                dispatch(clearCart());
                setAlertVisible(false);
                setTimeout(() => navigation.navigate('Home'), 300);
              }
            }
          ]
        });
      } else {
        console.log('❌ Order ID es null');
        throw new Error('No se pudo generar el ID de la orden');
      }
    } catch (error) {
      console.error('❌ Error al procesar la compra:', error);
      console.error('Stack:', error.stack);
      showAlert({
        title: 'Error en la Compra',
        message: `No se pudo procesar la compra: ${error.message}`,
        type: 'error',
        buttons: [{ text: 'OK', onPress: () => {} }]
      });
    }
  };

  if (cartItems.length === 0) {
    return (
      <View style={styles.emptyContainer}>
        <Ionicons name="cart-outline" size={100} color="#E2E8F0" />
        <Text style={styles.emptyTitle}>Tu carrito está vacío</Text>
        <Text style={styles.emptyText}>¡Agrega productos para comenzar!</Text>
        <View style={styles.emptyButtonContainer}>
          <Button
            title="Explorar Productos"
            onPress={() => navigation.navigate('Home')}
            color="#2563EB"
          />
        </View>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      {/* CustomAlert */}
      <CustomAlert
        visible={alertVisible}
        title={alertConfig.title}
        message={alertConfig.message}
        type={alertConfig.type}
        buttons={alertConfig.buttons}
        onClose={() => setAlertVisible(false)}
      />

      <View style={styles.header}>
        <Text style={styles.title}>Carrito de Compras</Text>
        <Text style={styles.itemCount}>{cartItems.length} productos</Text>
      </View>
      
      <FlatList
        data={cartItems}
        keyExtractor={item => item.id}
        renderItem={({ item }) => {
          const imageSource = item.image ? getLocalImage(item.image) : null;
          
          return (
            <View style={styles.cartItem}>
              <View style={styles.imageContainer}>
                {imageSource ? (
                  <Image
                    source={imageSource}
                    style={styles.productImage}
                  />
                ) : (
                  <MaterialIcons name="image-not-supported" size={40} color="#CBD5E1" />
                )}
              </View>
              
              <View style={styles.itemInfo}>
                <View style={styles.itemHeader}>
                  <Text style={styles.itemName} numberOfLines={1}>{item.name}</Text>
                  <TouchableOpacity onPress={() => handleRemoveItem(item.id, item.name)}>
                    <Ionicons name="trash-outline" size={20} color="#EF4444" />
                  </TouchableOpacity>
                </View>

                <Text style={styles.itemPrice}>${item.price.toFixed(2)}</Text>

                <View style={styles.controlsRow}>
                  <View style={styles.quantityContainer}>
                    <TouchableOpacity
                      style={styles.qtyButton}
                      onPress={() => handleDecreaseQuantity(item.id, item.quantity)}
                    >
                      <Text style={styles.qtyButtonText}>-</Text>
                    </TouchableOpacity>
                    <Text style={styles.quantity}>{item.quantity}</Text>
                    <TouchableOpacity
                      style={styles.qtyButton}
                      onPress={() => handleIncreaseQuantity(item.id, item.quantity)}
                    >
                      <Text style={styles.qtyButtonText}>+</Text>
                    </TouchableOpacity>
                  </View>

                  <Text style={styles.subtotal}>
                    Total: <Text style={styles.subtotalValue}>${(item.price * item.quantity).toFixed(2)}</Text>
                  </Text>
                </View>
              </View>
            </View>
          );
        }}
        contentContainerStyle={styles.listContainer}
        nestedScrollEnabled={false}
      />

      <View style={styles.footer}>
        <View style={styles.totalRow}>
          <Text style={styles.totalLabel}>Total a Pagar</Text>
          <Text style={styles.totalValue}>${total.toFixed(2)}</Text>
        </View>
        <View style={styles.checkoutButtonContainer}>
          <Button
            title="Confirmar Compra"
            onPress={handleCheckout}
            color="#2563EB"
          />
        </View>
        <View style={styles.continueButtonContainer}>
          <Button
            title="Seguir Comprando"
            onPress={() => navigation.navigate('Home')}
            color="#64748B"
          />
        </View>
      </View>
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
    borderBottomColor: '#E2E8F0'
  },
  title: {
    fontSize: 24,
    fontWeight: '800',
    color: '#1E293B'
  },
  itemCount: {
    fontSize: 14,
    color: '#64748B',
    marginTop: 4
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
    backgroundColor: '#F8FAFC'
  },
  emptyTitle: {
    fontSize: 22,
    fontWeight: 'bold',
    marginTop: 20,
    color: '#1E293B'
  },
  emptyText: {
    fontSize: 16,
    marginTop: 10,
    color: '#64748B',
    marginBottom: 30
  },
  emptyButtonContainer: {
    width: 200
  },
  listContainer: {
    padding: 15,
    paddingBottom: 200 
  },
  cartItem: {
    flexDirection: 'row',
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    padding: 12,
    marginBottom: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
    borderWidth: 1,
    borderColor: '#F1F5F9'
  },
  imageContainer: {
    width: 80,
    height: 80,
    backgroundColor: '#F8FAFC',
    borderRadius: 8,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12
  },
  productImage: {
    width: '100%',
    height: '100%',
    resizeMode: 'contain',
  },
  itemInfo: {
    flex: 1,
    justifyContent: 'space-between'
  },
  itemHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start'
  },
  itemName: {
    fontSize: 15,
    fontWeight: '600',
    color: '#1E293B',
    flex: 1,
    marginRight: 8
  },
  itemPrice: {
    fontSize: 14,
    color: '#64748B',
    marginTop: 2
  },
  controlsRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: 8
  },
  quantityContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F1F5F9',
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#E2E8F0'
  },
  qtyButton: {
    paddingHorizontal: 10,
    paddingVertical: 4
  },
  qtyButtonText: {
    fontSize: 16,
    color: '#1E293B',
    fontWeight: 'bold'
  },
  quantity: {
    fontSize: 14,
    fontWeight: '600',
    color: '#1E293B',
    minWidth: 20,
    textAlign: 'center'
  },
  subtotal: {
    fontSize: 12,
    color: '#64748B'
  },
  subtotalValue: {
    color: '#059669',
    fontWeight: '700',
    fontSize: 14
  },
  footer: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: '#FFFFFF',
    borderTopWidth: 1,
    borderTopColor: '#E2E8F0',
    padding: 20,
    paddingBottom: 30,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: -4 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 10
  },
  totalRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 20
  },
  totalLabel: {
    fontSize: 18,
    color: '#64748B',
    fontWeight: '600'
  },
  totalValue: {
    fontSize: 24,
    color: '#1E293B',
    fontWeight: '800'
  },
  checkoutButtonContainer: {
    marginBottom: 10,
    borderRadius: 8,
    overflow: 'hidden'
  },
  continueButtonContainer: {
    borderRadius: 8,
    overflow: 'hidden'
  }
});
