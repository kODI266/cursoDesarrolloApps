import React, { useState, useEffect } from 'react';
import { View, Text, Button, Image, StyleSheet, TouchableOpacity } from 'react-native';
import { useDispatch, useSelector } from 'react-redux';
import { logoutUser } from '../src/store/slices/authSlice';
import * as ImagePicker from 'expo-image-picker';
import * as FileSystem from 'expo-file-system/legacy';
import { saveProfileImageToDB, getProfileImageFromDB } from '../src/db';
import { Ionicons } from '@expo/vector-icons';
import CustomAlert from '../components/CustomAlert';

export default function ProfileScreen({ navigation }) {
  const dispatch = useDispatch();
  const user = useSelector(state => state.auth.user);
  const [image, setImage] = useState(null);

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
    // Cargar imagen guardada al iniciar
    const loadProfileImage = async () => {
      if (user?.uid) {
        try {
          const savedImage = await getProfileImageFromDB(user.uid);
          if (savedImage) {
            console.log('Imagen cargada de BD:', savedImage);
            setImage(savedImage);
          }
        } catch (error) {
          console.error('Error cargando imagen inicial:', error);
        }
      }
    };
    loadProfileImage();
  }, [user]);

  const handleLogout = () => {
    dispatch(logoutUser());
  };

  const verifyPermissions = async (permissionType) => {
    try {
      if (permissionType === 'camera') {
          const { status } = await ImagePicker.requestCameraPermissionsAsync();
          if (status !== 'granted') {
              showAlert({
                title: 'Permiso Denegado',
                message: 'Necesitamos acceso a la cámara para tomar la foto.',
                type: 'warning',
                buttons: [{ text: 'OK', onPress: () => {} }]
              });
              return false;
          }
          return true;
      } else {
          const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
          if (status !== 'granted') {
              showAlert({
                title: 'Permiso Denegado',
                message: 'Necesitamos acceso a la galería para seleccionar la foto.',
                type: 'warning',
                buttons: [{ text: 'OK', onPress: () => {} }]
              });
              return false;
          }
          return true;
      }
    } catch (error) {
      console.error('Error verificando permisos:', error);
      return false;
    }
  };

  const saveImageLocally = async (uri) => {
      if (!uri) return;
      try {
        const filename = uri.split('/').pop();
        const newPath = FileSystem.documentDirectory + `profile_${user.uid}_${filename}`;
        console.log('Guardando imagen en:', newPath);

        await FileSystem.copyAsync({
            from: uri,
            to: newPath
        });

        // Guardar la ruta permanente en SQLite
        await saveProfileImageToDB(user.uid, newPath);
        setImage(newPath);
        
        showAlert({
          title: '¡Imagen Guardada!',
          message: 'Tu foto de perfil se ha actualizado correctamente.',
          type: 'success',
          buttons: [{ text: 'OK', onPress: () => {} }]
        });
      } catch (error) {
          console.error('Error guardando imagen:', error);
          showAlert({
            title: 'Error',
            message: 'No se pudo guardar la imagen localmente.',
            type: 'error',
            buttons: [{ text: 'OK', onPress: () => {} }]
          });
      }
  };

  const pickImage = async () => {
    try {
      const hasPermission = await verifyPermissions('gallery');
      if (!hasPermission) return;

      let result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Images,
        allowsEditing: true,
        aspect: [1, 1],
        quality: 0.5,
      });

      if (!result.canceled && result.assets && result.assets.length > 0) {
        await saveImageLocally(result.assets[0].uri);
      }
    } catch (error) {
      console.error('Error en pickImage:', error);
      showAlert({
        title: 'Error',
        message: 'Ocurrió un error al abrir la galería.',
        type: 'error',
        buttons: [{ text: 'OK', onPress: () => {} }]
      });
    }
  };

  const takePhoto = async () => {
      try {
        const hasPermission = await verifyPermissions('camera');
        if (!hasPermission) return;

        let result = await ImagePicker.launchCameraAsync({
            allowsEditing: true,
            aspect: [1, 1],
            quality: 0.5,
        });

        if (!result.canceled && result.assets && result.assets.length > 0) {
            await saveImageLocally(result.assets[0].uri);
        }
      } catch (error) {
        console.error('Error en takePhoto:', error);
        showAlert({
          title: 'Error',
          message: 'Ocurrió un error al tomar la foto.',
          type: 'error',
          buttons: [{ text: 'OK', onPress: () => {} }]
        });
      }
  };

  return (
    <View style={styles.container}>
      <CustomAlert
        visible={alertVisible}
        title={alertConfig.title}
        message={alertConfig.message}
        type={alertConfig.type}
        buttons={alertConfig.buttons}
        onClose={() => setAlertVisible(false)}
      />

      <View style={styles.card}>
        <View style={styles.header}>
           <Text style={styles.title}>Mi Perfil</Text>
           <TouchableOpacity onPress={() => navigation.navigate('Home')}>
             <Ionicons name="close" size={24} color="#64748B" />
           </TouchableOpacity>
        </View>

        {/* Sección de Avatar */}
        <View style={styles.avatarSection}>
            <View style={styles.avatarContainer}>
              {image ? (
                  <Image source={{ uri: image }} style={styles.avatar} />
              ) : (
                  <View style={[styles.avatar, styles.avatarPlaceholder]}>
                      <Text style={styles.avatarText}>
                          {user?.email ? user.email.charAt(0).toUpperCase() : '?'}
                      </Text>
                  </View>
              )}
              <TouchableOpacity style={styles.cameraButton} onPress={takePhoto}>
                <Ionicons name="camera" size={20} color="#FFF" />
              </TouchableOpacity>
            </View>

            <Text style={styles.emailText}>{user?.email}</Text>
            <TouchableOpacity onPress={pickImage}>
              <Text style={styles.linkText}>Cambiar foto de perfil</Text>
            </TouchableOpacity>
        </View>

        <View style={styles.divider} />

        <View style={styles.menuSection}>
           <TouchableOpacity style={styles.menuItem} onPress={() => navigation.navigate('Orders')}>
             <View style={styles.menuIcon}>
               <Ionicons name="receipt-outline" size={20} color="#2563EB" />
             </View>
             <Text style={styles.menuText}>Mis Pedidos</Text>
             <Ionicons name="chevron-forward" size={20} color="#CBD5E1" />
           </TouchableOpacity>
        </View>

        <View style={styles.buttonContainer}>
          <Button
            title="Cerrar Sesión"
            color="#EF4444"
            onPress={handleLogout}
          />
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        padding: 20,
        backgroundColor: '#F8FAFC',
        justifyContent: 'center'
    },
    card: {
      backgroundColor: '#FFFFFF',
      borderRadius: 24,
      padding: 24,
      shadowColor: '#000',
      shadowOffset: { width: 0, height: 4 },
      shadowOpacity: 0.1,
      shadowRadius: 12,
      elevation: 5
    },
    header: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
      marginBottom: 30
    },
    title: {
        fontSize: 24,
        fontWeight: '800',
        color: '#1E293B'
    },
    avatarSection: {
      alignItems: 'center',
      marginBottom: 30
    },
    avatarContainer: {
        position: 'relative',
        marginBottom: 16,
    },
    avatar: {
        width: 120,
        height: 120,
        borderRadius: 60,
        borderWidth: 4,
        borderColor: '#F1F5F9'
    },
    avatarPlaceholder: {
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: '#E2E8F0'
    },
    avatarText: {
        fontSize: 48,
        color: '#94A3B8',
        fontWeight: 'bold'
    },
    cameraButton: {
      position: 'absolute',
      bottom: 0,
      right: 0,
      backgroundColor: '#2563EB',
      width: 36,
      height: 36,
      borderRadius: 18,
      justifyContent: 'center',
      alignItems: 'center',
      borderWidth: 3,
      borderColor: '#FFFFFF'
    },
    emailText: {
        fontSize: 18,
        fontWeight: '600',
        color: '#334155',
        marginBottom: 8
    },
    linkText: {
      color: '#2563EB',
      fontSize: 14,
      fontWeight: '500'
    },
    divider: {
      height: 1,
      backgroundColor: '#F1F5F9',
      marginBottom: 20
    },
    menuSection: {
      marginBottom: 30
    },
    menuItem: {
      flexDirection: 'row',
      alignItems: 'center',
      paddingVertical: 12
    },
    menuIcon: {
      width: 36,
      height: 36,
      borderRadius: 10,
      backgroundColor: '#F8FAFC',
      justifyContent: 'center',
      alignItems: 'center',
      marginRight: 12
    },
    menuText: {
      flex: 1,
      fontSize: 16,
      color: '#334155',
      fontWeight: '500'
    },
    buttonContainer: {
        marginTop: 10
    }
});
