import * as SQLite from 'expo-sqlite';

// Inicializar base de datos
let db;
let dbPromise = null;

const initDB = async () => {
    try {
        db = await SQLite.openDatabaseAsync('ecommerce.db');

        // Crear tabla de productos
        await db.execAsync(`
            CREATE TABLE IF NOT EXISTS products (
                id TEXT PRIMARY KEY,
                name TEXT NOT NULL,
                price REAL NOT NULL,
                description TEXT,
                image TEXT,
                category TEXT,
                stock INTEGER,
                json_data TEXT
            );
        `);

        // Crear tabla de carrito
        await db.execAsync(`
            CREATE TABLE IF NOT EXISTS cart (
                id TEXT PRIMARY KEY,
                productId TEXT NOT NULL,
                quantity INTEGER NOT NULL,
                name TEXT,
                price REAL,
                image TEXT,
                category TEXT
            );
        `);

        // Crear tabla de sesión
        await db.execAsync(`
            CREATE TABLE IF NOT EXISTS sessions (
                userId TEXT PRIMARY KEY,
                email TEXT NOT NULL,
                lastLogin TEXT
            );
        `);

        // Crear tabla de preferencias de usuario para datos persistentes como imagen de perfil
        await db.execAsync(`
            CREATE TABLE IF NOT EXISTS user_preferences (
                userId TEXT PRIMARY KEY,
                profileImage TEXT
            );
        `);

        // Crear tabla de órdenes para historial de pedidos
        await db.execAsync(`
            CREATE TABLE IF NOT EXISTS orders (
                orderId TEXT PRIMARY KEY,
                userId TEXT NOT NULL,
                items TEXT NOT NULL,
                total REAL NOT NULL,
                createdAt TEXT NOT NULL,
                status TEXT DEFAULT 'Completada'
            );
        `);

        console.log('✅ Base de datos SQLite inicializada correctamente');
        return db;
    } catch (error) {
        console.error('❌ Error al inicializar SQLite:', error);
        throw error;
    }
};

// Función auxiliar para asegurar que DB está inicializada
const ensureDB = async () => {
    if (db) return db;
    
    if (!dbPromise) {
        dbPromise = initDB();
    }
    
    return await dbPromise;
};

//Productos

export const insertProducts = async (products) => {
    try {
        const database = await ensureDB();
        
        // Usar transacción para mejor rendimiento
        await database.withTransactionAsync(async () => {
            // Eliminar productos existentes
            await database.execAsync('DELETE FROM products');

            // Insertar productos uno a uno dentro de la transacción
            for (const product of products) {
                await database.runAsync(
                    `INSERT INTO products (id, name, price, description, image, category, stock, json_data)
                     VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
                    [
                        product.id,
                        product.name,
                        product.price,
                        product.description || '',
                        product.image || '',
                        product.category || '',
                        product.stock || 0,
                        JSON.stringify(product)
                    ]
                );
            }
        });
        console.log(`✅ ${products.length} productos guardados en SQLite`);
    } catch (error) {
        console.error('❌ Error guardando productos en SQLite:', error);
    }
};

export const fetchProductsFromDB = async () => {
    try {
        const database = await ensureDB();
        const result = await database.getAllAsync('SELECT * FROM products');
        const products = result.map(row => JSON.parse(row.json_data));
        console.log(`✅ ${products.length} productos recuperados de SQLite`);
        return products;
    } catch (error) {
        console.error('❌ Error recuperando productos de SQLite:', error);
        return [];
    }
};

// Carrito

export const saveCartToDB = async (cartItems) => {
    try {
        const database = await ensureDB();
        await database.withTransactionAsync(async () => {
            await database.execAsync('DELETE FROM cart');
            for (const item of cartItems) {
                await database.runAsync(
                    `INSERT INTO cart (id, productId, quantity, name, price, image, category)
                     VALUES (?, ?, ?, ?, ?, ?, ?)`,
                    [
                        item.id || item.productId,
                        item.productId || item.id,
                        item.quantity,
                        item.name || '',
                        item.price || 0,
                        item.image || '',
                        item.category || ''
                    ]
                );
            }
        });
        console.log('✅ Carrito guardado en SQLite');
    } catch (error) {
        console.error('❌ Error guardando carrito en SQLite:', error);
    }
};

export const getCartFromDB = async () => {
    try {
        const database = await ensureDB();
        const cartItems = await database.getAllAsync('SELECT * FROM cart');
        console.log(`✅ ${cartItems.length} items de carrito recuperados de SQLite`);
        return cartItems.map(item => ({
            ...item,
            id: item.id,
            productId: item.productId,
            quantity: item.quantity,
            price: item.price
        }));
    } catch (error) {
        console.error('❌ Error recuperando carrito de SQLite:', error);
        return [];
    }
};

//  Sesión

export const createSession = async (user) => {
    try {
        const database = await ensureDB();
        await database.withTransactionAsync(async () => {
            await database.execAsync('DELETE FROM sessions');
            await database.runAsync(
                `INSERT INTO sessions (userId, email, lastLogin) VALUES (?, ?, ?)`,
                [user.uid, user.email, new Date().toISOString()]
            );
        });
        console.log('✅ Sesión guardada en SQLite');
    } catch (error) {
        console.error('❌ Error creando sesión en SQLite:', error);
    }
};

export const getSession = async () => {
    try {
        const database = await ensureDB();
        const result = await database.getFirstAsync('SELECT * FROM sessions');
        if (result) {
            console.log('✅ Sesión encontrada en SQLite:', result.email);
            return { uid: result.userId, email: result.email };
        }
        return null;
    } catch (error) {
        console.error('❌ Error obteniendo sesión de SQLite:', error);
        return null;
    }
};

export const deleteSession = async () => {
    try {
        const database = await ensureDB();
        await database.execAsync('DELETE FROM sessions');
        console.log('✅ Sesión eliminada de SQLite');
    } catch (error) {
        console.error('❌ Error eliminando sesión de SQLite:', error);
    }
};

//  Preferencias de Usuario (Imagen de Perfil Persistente

export const saveProfileImageToDB = async (userId, imagePath) => {
    try {
        const database = await ensureDB();
        await database.runAsync(
            `INSERT INTO user_preferences (userId, profileImage) VALUES (?, ?)
             ON CONFLICT(userId) DO UPDATE SET profileImage = excluded.profileImage`,
            [userId, imagePath]
        );
        console.log('✅ Foto de perfil guardada en SQLite');
    } catch (error) {
        console.error('❌ Error guardando foto de perfil en SQLite:', error);
    }
};

export const getProfileImageFromDB = async (userId) => {
    try {
        const database = await ensureDB();
        const result = await database.getFirstAsync(
            'SELECT profileImage FROM user_preferences WHERE userId = ?',
            [userId]
        );
        if (result) {
            console.log('✅ Foto de perfil recuperada de SQLite');
            return result.profileImage;
        }
        return null;
    } catch (error) {
        console.error('❌ Error recuperando foto de perfil de SQLite:', error);
        return null;
    }
};

//  Órdenes

export const saveOrderToDB = async (userId, cartItems, total) => {
    try {
        const database = await ensureDB();
        const orderId = `order_${Date.now()}`;
        const createdAt = new Date().toISOString();
        const itemsJson = JSON.stringify(cartItems);

        await database.runAsync(
            `INSERT INTO orders (orderId, userId, items, total, createdAt, status)
             VALUES (?, ?, ?, ?, ?, ?)`,
            [orderId, userId, itemsJson, total, createdAt, 'Completada']
        );
        console.log('✅ Orden guardada en SQLite:', orderId);
        return orderId;
    } catch (error) {
        console.error('❌ Error guardando orden en SQLite:', error);
        return null;
    }
};

export const getOrdersFromDB = async (userId) => {
    try {
        const database = await ensureDB();
        const result = await database.getAllAsync(
            'SELECT * FROM orders WHERE userId = ? ORDER BY createdAt DESC',
            [userId]
        );
        const orders = result.map(row => ({
            ...row,
            items: JSON.parse(row.items)
        }));
        console.log(`✅ ${orders.length} órdenes recuperadas de SQLite`);
        return orders;
    } catch (error) {
        console.error('❌ Error recuperando órdenes de SQLite:', error);
        return [];
    }
};

export const deleteOrderFromDB = async (orderId) => {
    try {
        const database = await ensureDB();
        await database.runAsync(
            'DELETE FROM orders WHERE orderId = ?',
            [orderId]
        );
        console.log('✅ Orden eliminada de SQLite:', orderId);
    } catch (error) {
        console.error('❌ Error eliminando orden de SQLite:', error);
    }
};

// Inicializar DB de forma segura
ensureDB().catch(error => {
    console.error('❌ Error crítico al inicializar la base de datos:', error);
});
