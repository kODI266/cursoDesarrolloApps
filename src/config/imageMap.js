// Mapeo de imágenes locales usando require()
// Este archivo asocia nombres de imágenes con sus rutas locales

const localImages = {
  product1: require('../../assets/images/product1.png'),
  product2: require('../../assets/images/product2.png'),
  product3: require('../../assets/images/product3.png'),
  product4: require('../../assets/images/product4.png'),
  product5: require('../../assets/images/product5.png'),
  product6: require('../../assets/images/product6.png'),
  product7: require('../../assets/images/product7.png'),
  product8: require('../../assets/images/product8.png'),
  product9: require('../../assets/images/product9.png'),
  product10: require('../../assets/images/product10.png'),
  product11: require('../../assets/images/product11.png'),
  product12: require('../../assets/images/product12.png'),
  product13: require('../../assets/images/product13.png'),
  product14: require('../../assets/images/product14.png'),
  product15: require('../../assets/images/product15.png'),
};

// Función para obtener la imagen por nombre
export const getLocalImage = (imageName) => {
  return localImages[imageName] || null;
};

// Exportar todas las imágenes disponibles
export default localImages;
