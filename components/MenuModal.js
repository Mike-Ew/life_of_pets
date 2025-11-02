import React from 'react';
import { Modal, TouchableWithoutFeedback, View, Text, TouchableOpacity, StyleSheet } from 'react-native';

export default function MenuModal({ visible, onClose, screens, onSelect, t }) {
  return (
    <Modal visible={visible} transparent animationType="fade">
      <TouchableWithoutFeedback onPress={onClose}>
        <View style={styles.modalOverlay} />
      </TouchableWithoutFeedback>

      <View style={[styles.modalContainer, { backgroundColor: t.modalBg, shadowColor: t.cardShadow }] }>
        <Text style={[styles.menuTitle, { color: t.titleText }]}>Menu</Text>
        {screens.map((s) => (
          <TouchableOpacity key={s} style={styles.menuItem} onPress={() => onSelect(s)}>
            <Text style={[styles.menuItemText, { color: t.textPrimary }]}>{s}</Text>
          </TouchableOpacity>
        ))}
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.3)',
  },
  modalContainer: {
    position: 'absolute',
    top: 80,
    left: 20,
    right: 20,
    backgroundColor: '#FFF8F2',
    borderRadius: 12,
    padding: 14,
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.18,
    shadowRadius: 12,
    elevation: 6,
  },
  menuTitle: {
    fontSize: 18,
    fontWeight: '700',
    marginBottom: 8,
  },
  menuItem: {
    paddingVertical: 10,
  },
  menuItemText: {
    fontSize: 16,
  },
});
