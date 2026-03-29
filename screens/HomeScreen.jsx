import React, { useState, useEffect } from 'react';
import { View, Text, FlatList, StyleSheet, ActivityIndicator, TouchableOpacity, StatusBar } from 'react-native';
import { useDispatch, useSelector } from 'react-redux';
import { setProducts, setLoading, setError } from '../src/store/slices/productsSlice';
import { setCategories, setSelectedCategory } from '../src/store/slices/categoriesSlice';
import { addToCart } from '../src/store/slices/cartSlice';
import { getProducts, getCategories, getProductsByCategory } from '../services/productService';
import ProductCard from '../components/ProductCard';
import CategoryFilter from '../components/CategoryFilter';
import SearchBar from '../components/SearchBar';
import ConnectionStatus from '../components/ConnectionStatus';
import CustomAlert from '../components/CustomAlert';
import { Ionicons } from '@expo/vector-icons';

export default function HomeScreen({ navigation }) {
  const dispatch = useDispatch();
  const products = useSelector(state => state.products.items);
  const loading = useSelector(state => state.products.loading);
  const cartItems = useSelector(state => state.cart.items);
  const categories = useSelector(state => state.categories.items);
  const selectedCategory = useSelector(state => state.categories.selectedCategory);
  const [filteredProducts, setFilteredProducts] = useState([]);
  const [searchQuery, setSearchQuery] = useState('');

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

  useEffect(() => {
    loadCategoriesAndProducts();
  }, []);

  // Filtrar productos por búsqueda o categoría
  useEffect(() => {
    if (searchQuery.trim().length > 0) {
      const lowerQuery = searchQuery.toLowerCase();
      const results = products.filter(p => p.name.toLowerCase().includes(lowerQuery));
      setFilteredProducts(results);
    } else if (selectedCategory) {
      filterByCategory(selectedCategory);
    } else {
      setFilteredProducts(products);
    }
  }, [searchQuery, selectedCategory, products]);

  const loadCategoriesAndProducts = async () => {
    dispatch(setLoading(true));
    try {
      const categoriesData = await getCategories();
      console.log('📂 Categorías cargadas en HomeScreen:', categoriesData);
      dispatch(setCategories(categoriesData));

      const productsData = await getProducts();
      console.log('📦 Productos cargados en HomeScreen:', productsData);
      dispatch(setProducts(productsData));
      setFilteredProducts(productsData);
    } catch (error) {
      console.error('❌ Error al cargar:', error);
      dispatch(setError(error.message));
    } finally {
      dispatch(setLoading(false));
    }
  };

  const filterByCategory = async (categoryId) => {
    dispatch(setLoading(true));
    try {
      const categoryProducts = await getProductsByCategory(categoryId);
      setFilteredProducts(categoryProducts);
    } catch (error) {
      console.error('Error al filtrar por categoría:', error);
    } finally {
      dispatch(setLoading(false));
    }
  };

  const handleSelectCategory = (categoryId) => {
    if (selectedCategory === categoryId) {
      // Si vuelve a tocar la misma categoría, mostrar todos
      dispatch(setSelectedCategory(null));
      setFilteredProducts(products);
    } else {
      dispatch(setSelectedCategory(categoryId));
    }
  };

  const handleAddToCart = (product) => {
    dispatch(addToCart(product));
    showAlert({
      title: '✅ Agregado al Carrito',
      message: `${product.name} ha sido agregado correctamente`,
      type: 'success',
      buttons: [{ text: 'OK', onPress: () => {} }]
    });
  };

  const handleViewDetails = (product) => {
    navigation.navigate('ProductDetail', { product });
  };

  if (loading && products.length === 0) {
    return (
      <View style={styles.centerContainer}>
        <ActivityIndicator size="large" color="#2563EB" />
        <Text style={styles.loadingText}>Cargando productos...</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <StatusBar barStyle="dark-content" backgroundColor="#FFFFFF" />
      <ConnectionStatus />

      <CustomAlert
        visible={alertVisible}
        title={alertConfig.title}
        message={alertConfig.message}
        type={alertConfig.type}
        buttons={alertConfig.buttons}
        onClose={() => setAlertVisible(false)}
      />

      <View style={styles.header}>
        <View>
          <Text style={styles.subtitle}>Bienvenido</Text>
          <Text style={styles.title}>Hardware Store</Text>
        </View>
        <View style={styles.headerActions}>
          <TouchableOpacity
            style={styles.iconButton}
            onPress={() => navigation.navigate('Orders')}
          >
            <Ionicons name="receipt-outline" size={24} color="#1E293B" />
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.iconButton}
            onPress={() => navigation.navigate('Profile')}
          >
            <Ionicons name="person-outline" size={24} color="#1E293B" />
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.iconButton, styles.cartButton]}
            onPress={() => navigation.navigate('Cart')}
          >
            <Ionicons name="cart-outline" size={24} color="#FFFFFF" />
            {cartItems.length > 0 && (
              <View style={styles.badge}>
                <Text style={styles.badgeText}>{cartItems.length}</Text>
              </View>
            )}
          </TouchableOpacity>
        </View>
      </View>

      <SearchBar
        value={searchQuery}
        onChangeText={setSearchQuery}
        onClear={() => setSearchQuery('')}
      />

      {categories.length > 0 && (
        <CategoryFilter 
          categories={categories}
          selectedCategory={selectedCategory}
          onSelectCategory={handleSelectCategory}
        />
      )}
      
      <FlatList
        data={filteredProducts}
        keyExtractor={item => item.id}
        renderItem={({ item }) => (
          <ProductCard 
            product={item}
            onAddToCart={handleAddToCart}
            onViewDetails={handleViewDetails}
          />
        )}
        contentContainerStyle={styles.listContainer}
        nestedScrollEnabled={false}
        ListEmptyComponent={
          <View style={styles.emptyContainer}>
            <Ionicons name="search-outline" size={48} color="#CBD5E1" />
            <Text style={styles.emptyText}>No hay productos en esta categoría</Text>
          </View>
        }
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F8FAFC' 
  },
  centerContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#F8FAFC'
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingTop: 32,
    paddingBottom: 15,
    backgroundColor: '#FFFFFF',
    borderBottomWidth: 1,
    borderBottomColor: '#F1F5F9'
  },
  subtitle: {
    fontSize: 14,
    color: '#64748B',
    fontWeight: '500'
  },
  title: {
    fontSize: 24,
    fontWeight: '800',
    color: '#1E293B',
    letterSpacing: -0.5
  },
  headerActions: {
    flexDirection: 'row',
    gap: 12
  },
  iconButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#F1F5F9',
    justifyContent: 'center',
    alignItems: 'center'
  },
  cartButton: {
    backgroundColor: '#2563EB', 
  },
  badge: {
    position: 'absolute',
    top: -4,
    right: -4,
    backgroundColor: '#EF4444', 
    borderRadius: 10,
    minWidth: 18,
    height: 18,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 2,
    borderColor: '#FFFFFF'
  },
  badgeText: {
    color: '#FFFFFF',
    fontSize: 10,
    fontWeight: 'bold'
  },
  listContainer: {
    padding: 20,
    paddingTop: 10
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 60
  },
  emptyText: {
    fontSize: 16,
    color: '#94A3B8',
    marginTop: 10
  },
  loadingText: {
    marginTop: 12,
    fontSize: 16,
    color: '#64748B',
    fontWeight: '500'
  }
});
