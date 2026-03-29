import { ref, get } from 'firebase/database';
import { db } from '../firebase/firebaseConfig';
import { insertProducts, fetchProductsFromDB } from '../src/db';

// Obtener todas las categorías desde Firebase
export const getCategories = async () => {
  try {
    const categoriesRef = ref(db, 'categories');
    const snapshot = await get(categoriesRef);
    
    if (snapshot.exists()) {
      const categoriesObj = snapshot.val();
      console.log('📥 Datos de categorías recibidos:', categoriesObj);
      
      // Convertir objeto a array
      const categoriesArray = Object.keys(categoriesObj).map(key => ({
        id: key,
        name: categoriesObj[key].name || key,
        description: categoriesObj[key].description || '',
        icon: getIconForCategory(key)
      }));
      
      console.log('✅ Categorías obtenidas desde Firebase:', categoriesArray.length);
      console.log('📋 Categorías:', categoriesArray);
      return categoriesArray;
    } else {
      console.log('⚠️ No hay categorías en Firebase');
      return [];
    }
  } catch (error) {
    console.warn('⚠️ Error al obtener categorías:', error.message);
    return [];
  }
};

// Función auxiliar para obtener icono según categoría
const getIconForCategory = (categoryId) => {
  const icons = {
    motherboard: '🖥️',
    motherboards: '🖥️',
    gpu: '🎮',
    gpus: '🎮',
    cpu: '⚙️',
    cpus: '⚙️',
    ram: '💾',
    storage: '💿',
    otros: '📦'
  };
  return icons[categoryId.toLowerCase()] || '📦';
};

// Obtener todos los productos desde Firebase
export const getProducts = async () => {
  try {
    const productsRef = ref(db, 'products');
    const snapshot = await get(productsRef);
    
    if (snapshot.exists()) {
      const productsObj = snapshot.val();
      console.log('📥 Datos de productos recibidos:', productsObj);
      
      // Convertir objeto a array
      const productsArray = Object.keys(productsObj).map(key => ({
        id: key,
        ...productsObj[key]
      }));
      
      console.log('✅ Productos obtenidos desde Firebase:', productsArray.length);

      // Guardar en SQLite para uso offline
      await insertProducts(productsArray);

      return productsArray;
    } else {
      console.log('⚠️ No hay productos en Firebase');
      return [];
    }
  } catch (error) {
    console.warn('⚠️ Error al obtener productos (probando offline):', error.message);

    // Si falla (offline), intentar cargar desde SQLite
    console.log('🔄 Intentando cargar productos desde SQLite...');
    const localProducts = await fetchProductsFromDB();

    if (localProducts.length > 0) {
      console.log(`✅ Recuperados ${localProducts.length} productos de la base de datos local`);
      return localProducts;
    }

    return [];
  }
};

// Obtener productos por categoría
export const getProductsByCategory = async (categoryId) => {
  try {
    const productsRef = ref(db, 'products');
    const snapshot = await get(productsRef);
    
    if (snapshot.exists()) {
      const productsObj = snapshot.val();
      
      // Convertir objeto a array
      const productsArray = Object.keys(productsObj).map(key => ({
        id: key,
        ...productsObj[key]
      }));
      
      // Filtrar productos que coincidan con la categoría (insensible a mayúsculas)
      const filtered = productsArray.filter(item => 
        item.category && item.category.toLowerCase() === categoryId.toLowerCase()
      );
      console.log(`✅ ${filtered.length} productos encontrados para ${categoryId}`);
      return filtered;
    } else {
      console.log('⚠️ No hay productos en Firebase');
      return [];
    }
  } catch (error) {
    console.warn('⚠️ Error al obtener productos:', error.message);
    return [];
  }
};

// Obtener un producto por ID
export const getProductById = async (productId) => {
  try {
    const productRef = ref(db, `products/${productId}`);
    const snapshot = await get(productRef);
    
    if (snapshot.exists()) {
      const product = snapshot.val();
      console.log('✅ Producto obtenido:', product.name);
      return {
        id: productId,
        ...product
      };
    } else {
      console.log('⚠️ Producto no encontrado');
      return null;
    }
  } catch (error) {
    console.warn('⚠️ Error al obtener producto:', error.message);
    return null;
  }
};

// Inicializar productos (solo para probar)
export const initializeProducts = async () => {
  console.log('✅ Base de datos ya está inicializada en Firebase');
};
