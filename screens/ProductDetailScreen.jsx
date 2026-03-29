import React, { useState } from 'react';
import { View, Text, Button, StyleSheet, ScrollView, Image, TouchableOpacity } from 'react-native';
import { useRoute } from '@react-navigation/native';
import { useDispatch } from 'react-redux';
import { addToCart } from '../src/store/slices/cartSlice';
import { getLocalImage } from '../src/config/imageMap';
import { Ionicons, MaterialIcons } from '@expo/vector-icons';
import CustomAlert from '../components/CustomAlert';

export default function ProductDetailScreen({ navigation }) {
  const route = useRoute();
  const dispatch = useDispatch();
  const product = route.params?.product;

  const [alertVisible, setAlertVisible] = useState(false);
  const [alertConfig, setAlertConfig] = useState({
    title: '',
    message: '',
    type: 'info',
    buttons: []
  });

  const showAlert = (config) => {
    setAlertConfig(config);
    setAlertVisible(true);
  };

  const handleAddToCart = () => {
    dispatch(addToCart(product));
    showAlert({
      title: '✅ Agregado al Carrito',
      message: `${product.name} ha sido agregado correctamente`,
      type: 'success',
      buttons: [
        { 
          text: 'Cancelar', 
          onPress: () => {} 
        },
        { 
          text: 'Ir al Carrito',
          onPress: () => navigation.navigate('Cart')
        }
      ]
    });
  };

  if (!product) {
    return (
      <View style={styles.centerContainer}>
        <Ionicons name="alert-circle-outline" size={64} color="#EF4444" />
        <Text style={styles.errorTitle}>Producto no encontrado</Text>
        <Button 
          title="Volver al Catálogo"
          onPress={() => navigation.goBack()}
          color="#2563EB"
        />
      </View>
    );
  }

  // Obtener imagen local
  const imageSource = product.image ? getLocalImage(product.image) : null;

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.contentContainer}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
          <Ionicons name="arrow-back" size={24} color="#1E293B" />
        </TouchableOpacity>
      </View>

      {/* Imagen grande del producto */}
      <View style={styles.imageContainer}>
        {imageSource ? (
          <Image
            source={imageSource}
            style={styles.productImage}
          />
        ) : (
          <View style={styles.fallbackImage}>
            <MaterialIcons name="image-not-supported" size={100} color="#CBD5E1" />
          </View>
        )}
      </View>

      <View style={styles.infoContainer}>
        <Text style={styles.brand}>{product.brand}</Text>
        <Text style={styles.title}>{product.name}</Text>
        <Text style={styles.price}>${product.price.toFixed(2)}</Text>

        <View style={styles.divider} />

        <Text style={styles.sectionTitle}>Descripción</Text>
        <Text style={styles.description}>{product.description}</Text>

        <View style={styles.detailsCard}>
          <View style={styles.detailRow}>
            <Ionicons name="hardware-chip-outline" size={20} color="#64748B" />
            <Text style={styles.detailText}>Categoría: {product.category}</Text>
          </View>
          <View style={styles.detailRow}>
            <Ionicons name="pricetag-outline" size={20} color="#64748B" />
            <Text style={styles.detailText}>ID: {product.id}</Text>
          </View>
          {product.specs && (
            <View style={styles.detailRow}>
              <Ionicons name="construct-outline" size={20} color="#64748B" />
              <Text style={styles.detailText}>{product.specs}</Text>
            </View>
          )}
          <View style={styles.detailRow}>
            <Ionicons name="checkmark-circle-outline" size={20} color="#10B981" />
            <Text style={[styles.detailText, { color: '#10B981', fontWeight: '600' }]}>
              Stock Disponible
            </Text>
          </View>
        </View>

        <View style={styles.actionContainer}>
          <View style={styles.mainButton}>
            <Button
              title="Agregar al Carrito"
              onPress={handleAddToCart}
              color="#2563EB"
            />
          </View>
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
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FFFFFF',
  },
  contentContainer: {
    paddingBottom: 40
  },
  centerContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20
  },
  errorTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    marginVertical: 10,
    color: '#1E293B'
  },
  header: {
    paddingHorizontal: 20,
    paddingTop: 32,
    paddingBottom: 10,
  },
  backButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#F1F5F9',
    justifyContent: 'center',
    alignItems: 'center'
  },
  imageContainer: {
    width: '100%',
    height: 300,
    backgroundColor: '#F8FAFC',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 20
  },
  productImage: {
    width: '80%',
    height: '100%',
    resizeMode: 'contain',
  },
  fallbackImage: {
    width: '100%',
    height: '100%',
    justifyContent: 'center',
    alignItems: 'center'
  },
  infoContainer: {
    paddingHorizontal: 24
  },
  brand: {
    fontSize: 14,
    color: '#64748B',
    fontWeight: '600',
    textTransform: 'uppercase',
    letterSpacing: 1,
    marginBottom: 4
  },
  title: {
    fontSize: 26,
    fontWeight: '800',
    color: '#1E293B',
    marginBottom: 8,
    lineHeight: 32
  },
  price: {
    fontSize: 28,
    color: '#2563EB',
    fontWeight: '800',
    marginBottom: 20
  },
  divider: {
    height: 1,
    backgroundColor: '#E2E8F0',
    marginBottom: 20
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: '#1E293B',
    marginBottom: 10
  },
  description: {
    fontSize: 16,
    color: '#475569',
    lineHeight: 24,
    marginBottom: 24
  },
  detailsCard: {
    backgroundColor: '#F8FAFC',
    borderRadius: 12,
    padding: 16,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    marginBottom: 30
  },
  detailRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12
  },
  detailText: {
    marginLeft: 12,
    fontSize: 15,
    color: '#475569'
  },
  actionContainer: {
    marginBottom: 20
  },
  mainButton: {
    borderRadius: 8,
    overflow: 'hidden',
    height: 50,
    justifyContent: 'center'
  }
});
