import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import PieChart from 'react-native-pie-chart';

const EXPENSE_CATEGORIES = [
  { key: 'food', label: 'Food', color: '#FFB74D' },
  { key: 'litter', label: 'Litter', color: '#90CAF9' },
  { key: 'medicines', label: 'Medicines', color: '#A5D6A7' },
  { key: 'toys', label: 'Toys', color: '#F48FB1' },
  { key: 'other', label: 'Other', color: '#CE93D8' },
];

const sampleExpenses = [
  { category: 'food', amount: 120 },
  { category: 'litter', amount: 40 },
  { category: 'medicines', amount: 60 },
  { category: 'toys', amount: 30 },
  { category: 'other', amount: 20 },
];

export default function Expenses({ t }) {
  const total = sampleExpenses.reduce((sum, e) => sum + e.amount, 0);
  const chartWidth = 200;

  // ✅ FIX: Combine value + color inside the same object
  const series = sampleExpenses.map((e, i) => ({
    value: e.amount,
    color: EXPENSE_CATEGORIES[i].color,
  }));

  return (
    <View style={{ flex: 1, padding: 20, backgroundColor: t?.background || '#FFF' }}>
      <Text style={[styles.header, { color: t?.titleText || '#000' }]}>Total Expenses</Text>

      <PieChart
        widthAndHeight={chartWidth}
        series={series}
        coverRadius={0.6}
        coverFill="#FFFFFF"
      />

      <View style={{ marginTop: 24 }}>
        {sampleExpenses.map((e, i) => (
          <View key={e.category} style={styles.row}>
            <View style={[styles.colorDot, { backgroundColor: EXPENSE_CATEGORIES[i].color }]} />
            <Text style={[styles.label, { color: t?.textPrimary || '#333' }]}>
              {EXPENSE_CATEGORIES[i].label}
            </Text>
            <Text style={[styles.amount, { color: t?.textSecondary || '#555' }]}>
              ${e.amount}
            </Text>
          </View>
        ))}

        <View style={styles.row}>
          <Text style={[styles.totalLabel, { color: t?.titleText || '#000' }]}>Total</Text>
          <Text style={[styles.totalAmount, { color: t?.titleText || '#000' }]}>${total}</Text>
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  header: {
    fontSize: 20,
    fontWeight: '700',
    marginBottom: 18,
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 10,
  },
  colorDot: {
    width: 18,
    height: 18,
    borderRadius: 9,
    marginRight: 10,
  },
  label: {
    flex: 1,
    fontSize: 15,
    fontWeight: '600',
  },
  amount: {
    fontSize: 15,
    fontWeight: '500',
  },
  totalLabel: {
    flex: 1,
    fontSize: 16,
    fontWeight: '700',
  },
  totalAmount: {
    fontSize: 16,
    fontWeight: '700',
  },
});
