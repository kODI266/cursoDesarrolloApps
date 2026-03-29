# Proyecto Final - Ecommerce App 

Este proyecto es la entrega final del curso de Desarrollo de Aplicaciones Móviles. Consiste en una aplicación de comercio electrónico desarrollada con **React Native (Expo)** que integra diversas tecnologías para ofrecer una experiencia completa, incluyendo autenticación, base de datos en tiempo real, persistencia local y uso de hardware del dispositivo.

## Tecnologías Utilizadas

*   **React Native & Expo**: Framework principal para el desarrollo móvil.
*   **Redux Toolkit**: Gestión del estado global de la aplicación (Carrito, Productos, Autenticación).
*   **Firebase**:
    *   **Authentication**: Gestión de usuarios (Login/Registro).
    *   **Realtime Database**: Almacenamiento de productos y categorías en la nube.
*   **SQLite (Expo SQLite)**: Persistencia de datos local para funcionamiento Offline:
    *   Caché de productos.
    *   Persistencia del carrito de compras.
    *   Gestión de sesiones de usuario.
    *   Almacenamiento de preferencias de usuario (Foto de perfil).
*   **Expo Image Picker & File System**: Integración con la **Cámara** y **Galería** para la foto de perfil del usuario.

## Funcionalidades

### 1. Autenticación y Sesión
*   Login y Registro de usuarios mediante Firebase Auth.
*   Persistencia de la sesión (Auto-login) utilizando SQLite.
*   Cierre de sesión seguro.

### 2. Catálogo de Productos
*   Visualización de productos obtenidos desde Firebase Realtime Database.
*   **Modo Offline**: Si no hay conexión, la aplicación carga los productos almacenados previamente en la base de datos local (SQLite).
*   Filtrado por categorías.
*   Detalle de producto.

### 3. Carrito de Compras
*   Agregar productos al carrito.
*   Control de cantidad.
*   Cálculo automático del total.
*   **Persistencia**: El estado del carrito se guarda en SQLite, por lo que no se pierde al cerrar la app.

### 4. Perfil de Usuario (Feature Nativa)
*   Visualización del perfil de usuario.
*   **Foto de Perfil Personalizada**:
    *   Uso de **Cámara** para tomar una foto.
    *   Uso de **Galería** para seleccionar una imagen.
    *   La imagen se guarda en el sistema de archivos local (`expo-file-system`) y su referencia se persiste en una tabla dedicada en SQLite (`user_preferences`), asegurando que la foto permanezca entre sesiones.

## Instalación y Ejecución

1.  **Clonar el repositorio**
    git clone <url-del-repo>
    cd proyecto-final

2.  **Instalar dependencias**
    npm install
    npm install -g expo-cli

3.  **Ejecutar la aplicación**
    npm start



Entrega Final - Curso Desarrollo Mobile - Justo Da Silva Catela
