import React from 'react';
import { View, Text, Button, StyleSheet, Image, TouchableOpacity } from 'react-native';
import { getLocalImage } from '../src/config/imageMap';
import { MaterialIcons } from '@expo/vector-icons';

export default function ProductCard({ product, onAddToCart, onViewDetails }) {
  // Obtener imagen local usando el mapeo
  const imageSource = product.image ? getLocalImage(product.image) : null;

  return (
    <View style={styles.card}>
      {/* Imagen del producto */}
      <View style={styles.imageContainer}>
        {imageSource ? (
          <Image
            source={imageSource}
            style={styles.productImage}
          />
        ) : (
          <View style={styles.fallbackContainer}>
            <MaterialIcons name="image-not-supported" size={60} color="#9CA3AF" />
          </View>
        )}
      </View>

      <View style={styles.contentContainer}>
        <Text style={styles.name} numberOfLines={2}>{product.name}</Text>
        <Text style={styles.price}>${product.price.toFixed(2)}</Text>
        <Text style={styles.description} numberOfLines={3}>{product.description}</Text>

        <View style={styles.buttonContainer}>
          <View style={styles.buttonWrapper}>
            <Button
              title="Ver Detalles"
              onPress={() => onViewDetails(product)}
              color="#2563EB"
            />
          </View>
          <View style={styles.buttonWrapper}>
            <Button
              title="Agregar"
              onPress={() => onAddToCart(product)}
              color="#10B981" 
            />
          </View>
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    marginBottom: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 4, 
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: '#F1F5F9'
  },
  imageContainer: {
    width: '100%',
    height: 200,
    backgroundColor: '#F8FAFC',
    justifyContent: 'center',
    alignItems: 'center'
  },
  productImage: {
    width: '100%',
    height: '100%',
    resizeMode: 'contain',
  },
  fallbackContainer: {
    width: '100%',
    height: '100%',
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#F1F5F9'
  },
  contentContainer: {
    padding: 16,
  },
  name: {
    fontSize: 18,
    fontWeight: '700',
    color: '#1E293B',
    marginBottom: 8
  },
  price: {
    fontSize: 20,
    color: '#059669', 
    fontWeight: '800',
    marginBottom: 8
  },
  description: {
    fontSize: 14,
    color: '#64748B', 
    marginBottom: 16,
    lineHeight: 20
  },
  buttonContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    gap: 12
  },
  buttonWrapper: {
    flex: 1,
    borderRadius: 8,
    overflow: 'hidden' 
  }
});
