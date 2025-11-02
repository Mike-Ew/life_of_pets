import React from 'react';
import { TouchableOpacity, View, Text, Image, StyleSheet } from 'react-native';

export default function PetCard({ item, onPress, t, personalityColors }) {
  return (
    <TouchableOpacity onPress={() => onPress(item)} style={[styles.card, { backgroundColor: t.cardBg, shadowColor: t.cardShadow }]} activeOpacity={0.9}>
      <Image source={item.image} style={styles.petImageLeft} resizeMode="cover" />
      <View style={styles.cardBodyHorizontal}>
        <View style={styles.rowTop}>
          <Text style={[styles.petName, { color: t.textPrimary }]}>{item.name}</Text>
          <View style={[styles.personalityBadge, { backgroundColor: personalityColors[item.personality] || '#DDD' }]}> 
            <Text style={[styles.personalityText, { color: t.textPrimary }]}>{item.personality ? item.personality.charAt(0).toUpperCase() + item.personality.slice(1) : ''}</Text>
          </View>
        </View>
        <Text style={[styles.petDetails, { color: t.textSecondary }]}>{item.breed}</Text>
        <Text style={[styles.petDetails, { marginTop: 8, color: t.textSecondary }]}>{item.age}</Text>
      </View>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: '#fffaf6',
    borderRadius: 12,
    overflow: 'hidden',
    width: '100%',
    flexDirection: 'row',
    alignItems: 'center',
    padding: 10,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.18,
    shadowRadius: 8,
    elevation: 4,
  },
  petImageLeft: {
    width: 120,
    height: 120,
    borderRadius: 8,
    marginRight: 12,
  },
  cardBodyHorizontal: {
    flex: 1,
    paddingVertical: 6,
  },
  rowTop: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 6,
  },
  personalityBadge: {
    paddingVertical: 4,
    paddingHorizontal: 8,
    borderRadius: 12,
    minWidth: 72,
    alignItems: 'center',
  },
  personalityText: {
    fontSize: 12,
    fontWeight: '700',
  },
  petName: {
    fontSize: 18,
    fontWeight: '700',
    marginBottom: 6,
  },
  petDetails: {
    fontSize: 14,
  },
});
