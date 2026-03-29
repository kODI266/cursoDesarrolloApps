import React from 'react';
import { View, Text, Modal, TouchableOpacity, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';

export default function CustomAlert({ 
  visible = false, 
  title = 'Alerta', 
  message = '', 
  type = 'info', 
  buttons = [{ text: 'OK', onPress: () => {} }],
  onClose = () => {}
}) {
  const getIcon = () => {
    switch(type) {
      case 'success':
        return { name: 'checkmark-circle', color: '#10B981' };
      case 'error':
        return { name: 'close-circle', color: '#EF4444' };
      case 'warning':
        return { name: 'warning', color: '#F59E0B' };
      default:
        return { name: 'information-circle', color: '#2563EB' };
    }
  };

  const getBackgroundColor = () => {
    switch(type) {
      case 'success':
        return '#ECFDF5';
      case 'error':
        return '#FEF2F2';
      case 'warning':
        return '#FFFBEB';
      default:
        return '#EFF6FF';
    }
  };

  const icon = getIcon();

  return (
    <Modal
      visible={visible}
      transparent={true}
      animationType="fade"
      onRequestClose={onClose}
    >
      <View style={styles.overlay}>
        <View style={[styles.alertBox, { backgroundColor: getBackgroundColor() }]}>
          {/* Icono */}
          <View style={styles.iconContainer}>
            <Ionicons name={icon.name} size={48} color={icon.color} />
          </View>

          {/* Título */}
          <Text style={styles.title}>{title}</Text>

          {/* Mensaje */}
          <Text style={styles.message}>{message}</Text>

          {/* Botones */}
          <View style={styles.buttonsContainer}>
            {buttons.map((button, index) => (
              <TouchableOpacity
                key={index}
                style={[
                  styles.button,
                  buttons.length > 1 && index === 0 && styles.buttonSecondary,
                  buttons.length > 1 && index === buttons.length - 1 && styles.buttonPrimary,
                  buttons.length === 1 && styles.buttonPrimary
                ]}
                onPress={() => {
                  button.onPress?.();
                  onClose();
                }}
              >
                <Text
                  style={[
                    styles.buttonText,
                    buttons.length > 1 && index === 0 && styles.buttonSecondaryText,
                    buttons.length > 1 && index === buttons.length - 1 && styles.buttonPrimaryText,
                    buttons.length === 1 && styles.buttonPrimaryText
                  ]}
                >
                  {button.text}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20
  },
  alertBox: {
    borderRadius: 20,
    padding: 28,
    alignItems: 'center',
    width: '100%',
    maxWidth: 340,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.25,
    shadowRadius: 20,
    elevation: 15
  },
  iconContainer: {
    marginBottom: 16,
    justifyContent: 'center',
    alignItems: 'center'
  },
  title: {
    fontSize: 20,
    fontWeight: '800',
    color: '#1E293B',
    marginBottom: 8,
    textAlign: 'center'
  },
  message: {
    fontSize: 15,
    color: '#64748B',
    marginBottom: 24,
    textAlign: 'center',
    lineHeight: 22
  },
  buttonsContainer: {
    flexDirection: 'row',
    gap: 12,
    width: '100%'
  },
  button: {
    flex: 1,
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1.5
  },
  buttonPrimary: {
    backgroundColor: '#2563EB',
    borderColor: '#2563EB'
  },
  buttonSecondary: {
    backgroundColor: '#FFFFFF',
    borderColor: '#E2E8F0'
  },
  buttonText: {
    fontWeight: '700',
    fontSize: 15
  },
  buttonPrimaryText: {
    color: '#FFFFFF'
  },
  buttonSecondaryText: {
    color: '#64748B'
  }
});
