import React from 'react';
import { View, Text, ScrollView, TouchableOpacity, StyleSheet } from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';

// Mapeo de ID de categoría a nombre del icono
const CATEGORY_ICONS = {
  motherboard: 'expansion-card',
  gpu: 'video-input-component',
  cpu: 'cpu-64-bit',
  ram: 'memory',
  storage: 'harddisk',
  default: 'view-grid'
};

export default function CategoryFilter({ categories, selectedCategory, onSelectCategory }) {

  const getIconName = (id) => {
    return CATEGORY_ICONS[id] || CATEGORY_ICONS.default;
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Categorías</Text>
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}
      >
        {categories.map((category) => {
          const isSelected = selectedCategory === category.id;
          return (
            <TouchableOpacity
              key={category.id}
              style={[
                styles.categoryChip,
                isSelected && styles.categoryChipSelected
              ]}
              onPress={() => onSelectCategory(category.id)}
              activeOpacity={0.7}
            >
              <MaterialCommunityIcons
                name={getIconName(category.id)}
                size={20}
                color={isSelected ? '#FFF' : '#64748B'}
                style={styles.icon}
              />
              <Text style={[
                styles.categoryText,
                isSelected && styles.categoryTextSelected
              ]}>
                {category.name}
              </Text>
            </TouchableOpacity>
          );
        })}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    paddingVertical: 16,
    backgroundColor: '#FFFFFF',
    borderBottomWidth: 1,
    borderBottomColor: '#F1F5F9'
  },
  title: {
    fontSize: 18,
    fontWeight: '700',
    paddingHorizontal: 20,
    marginBottom: 12,
    color: '#1E293B'
  },
  scrollContent: {
    paddingHorizontal: 15,
    paddingRight: 20
  },
  categoryChip: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F1F5F9',
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 50,
    marginRight: 10,
    borderWidth: 1,
    borderColor: '#E2E8F0'
  },
  categoryChipSelected: {
    backgroundColor: '#2563EB', 
    borderColor: '#2563EB'
  },
  icon: {
    marginRight: 8
  },
  categoryText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#64748B' 
  },
  categoryTextSelected: {
    color: '#FFFFFF'
  }
});
