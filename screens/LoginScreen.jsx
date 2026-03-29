import React, { useState, useEffect } from 'react';
import { View, Text, TextInput, Button, StyleSheet, ActivityIndicator, TouchableOpacity, KeyboardAvoidingView, Platform, Image } from 'react-native';
import { useDispatch, useSelector } from 'react-redux';
import { loginUser, registerUser, clearError } from '../src/store/slices/authSlice';
import { Ionicons } from '@expo/vector-icons';

export default function LoginScreen() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isRegistering, setIsRegistering] = useState(false);
  const [validationError, setValidationError] = useState('');

  const dispatch = useDispatch();
  const { loading, error } = useSelector((state) => state.auth);

  // Mostrar errores de Firebase
  useEffect(() => {
    if (error) {
      setValidationError(error);
      dispatch(clearError());
    }
  }, [error, dispatch]);

  // Validar email en tiempo real
  const validateEmail = (emailToValidate) => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(emailToValidate);
  };

  // Validaciones antes de enviar
  const validateForm = () => {
    setValidationError('');

    if (!email.trim()) {
      setValidationError('Por favor ingresa un correo electrónico');
      return false;
    }

    if (!validateEmail(email)) {
      setValidationError('Por favor ingresa un correo electrónico válido');
      return false;
    }

    if (!password) {
      setValidationError('Por favor ingresa una contraseña');
      return false;
    }

    if (password.length < 6) {
      setValidationError('La contraseña debe tener al menos 6 caracteres');
      return false;
    }

    return true;
  };

  const handleAuth = () => {
    if (!validateForm()) {
      return;
    }

    if (isRegistering) {
      dispatch(registerUser({ email, password }));
    } else {
      dispatch(loginUser({ email, password }));
    }
  };

  const handleToggleMode = () => {
    setValidationError('');
    setIsRegistering(!isRegistering);
  };

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === "ios" ? "padding" : "height"}
      style={styles.container}
    >
      <View style={styles.card}>
        <View style={styles.header}>
          <View style={styles.logoContainer}>
            <Ionicons name="hardware-chip" size={40} color="#2563EB" />
          </View>
          <Text style={styles.title}>
            {isRegistering ? 'Crear Cuenta' : 'Bienvenido'}
          </Text>
          <Text style={styles.subtitle}>
            {isRegistering ? 'Regístrate para comenzar' : 'Inicia sesión para continuar'}
          </Text>
        </View>

        {/* Mensaje de error si existe */}
        {validationError ? (
          <View style={styles.errorContainer}>
            <Ionicons name="alert-circle" size={20} color="#DC2626" />
            <Text style={styles.errorText}>{validationError}</Text>
          </View>
        ) : null}

        <View style={styles.form}>
          <View style={styles.inputContainer}>
            <Ionicons name="mail-outline" size={20} color="#94A3B8" style={styles.inputIcon} />
            <TextInput
              style={[styles.input, validationError && email === '' ? styles.inputError : {}]}
              placeholder="Correo electrónico"
              value={email}
              onChangeText={(text) => {
                setEmail(text);
                setValidationError(''); // Limpiar error al escribir
              }}
              autoCapitalize="none"
              keyboardType="email-address"
              editable={!loading}
              placeholderTextColor="#94A3B8"
            />
          </View>

          <View style={styles.inputContainer}>
            <Ionicons name="lock-closed-outline" size={20} color="#94A3B8" style={styles.inputIcon} />
            <TextInput
              style={[styles.input, validationError && password === '' ? styles.inputError : {}]}
              placeholder="Contraseña"
              value={password}
              onChangeText={(text) => {
                setPassword(text);
                setValidationError(''); // Limpiar error al escribir
              }}
              secureTextEntry
              editable={!loading}
              placeholderTextColor="#94A3B8"
            />
          </View>

          {/* Mensaje de ayuda en registro */}
          {isRegistering && password.length > 0 && password.length < 6 && (
            <Text style={styles.helperText}>
              Mínimo 6 caracteres ({password.length}/6)
            </Text>
          )}

          {/* Botón de Acción */}
          {loading ? (
            <View style={styles.loadingButton}>
              <ActivityIndicator size="small" color="#FFFFFF" />
              <Text style={styles.loadingButtonText}>
                {isRegistering ? 'Creando cuenta...' : 'Iniciando sesión...'}
              </Text>
            </View>
          ) : (
            <View style={styles.buttonWrapper}>
              <Button
                title={isRegistering ? "Registrarse" : "Iniciar Sesión"}
                onPress={handleAuth}
                color="#2563EB"
              />
            </View>
          )}
        </View>

        {/* Cambiar entre Login y Registro */}
        <View style={styles.footer}>
          <Text style={styles.footerText}>
            {isRegistering ? '¿Ya tienes cuenta?' : '¿No tienes cuenta?'}
          </Text>
          <TouchableOpacity onPress={handleToggleMode}>
            <Text style={styles.footerLink}>
              {isRegistering ? "Inicia Sesión" : "Regístrate"}
            </Text>
          </TouchableOpacity>
        </View>
      </View>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
    justifyContent: 'center',
    backgroundColor: '#F1F5F9',
  },
  card: {
    backgroundColor: '#FFFFFF',
    borderRadius: 24,
    padding: 30,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.1,
    shadowRadius: 20,
    elevation: 10
  },
  header: {
    alignItems: 'center',
    marginBottom: 30
  },
  logoContainer: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: '#EFF6FF',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 20
  },
  title: {
    fontSize: 28,
    fontWeight: '800',
    color: '#1E293B',
    marginBottom: 8
  },
  subtitle: {
    fontSize: 16,
    color: '#64748B'
  },
  errorContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FEF2F2',
    borderRadius: 12,
    padding: 12,
    marginBottom: 20,
    borderWidth: 1,
    borderColor: '#FECACA'
  },
  errorText: {
    color: '#DC2626',
    fontSize: 14,
    marginLeft: 8,
    flex: 1
  },
  form: {
    marginBottom: 20
  },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F8FAFC',
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    marginBottom: 16,
    height: 56
  },
  inputIcon: {
    marginLeft: 16,
    marginRight: 12
  },
  input: {
    flex: 1,
    height: '100%',
    fontSize: 16,
    color: '#334155'
  },
  inputError: {
    borderColor: '#EF4444',
    backgroundColor: '#FFF5F5',
  },
  helperText: {
    fontSize: 12,
    color: '#64748B',
    marginBottom: 16,
    marginLeft: 5,
  },
  buttonWrapper: {
    borderRadius: 12,
    overflow: 'hidden', 
    marginTop: 10
  },
  loadingButton: {
    backgroundColor: '#2563EB',
    borderRadius: 12,
    height: 48,
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 10
  },
  loadingButtonText: {
    color: '#FFFFFF',
    fontWeight: '600',
    marginLeft: 10
  },
  footer: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 10
  },
  footerText: {
    fontSize: 14,
    color: '#64748B',
    marginRight: 6
  },
  footerLink: {
    fontSize: 14,
    color: '#2563EB',
    fontWeight: '700'
  }
});
