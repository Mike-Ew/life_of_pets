import React, { useState, useEffect, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Pressable,
  TextInput,
  Modal,
  Alert,
  ActivityIndicator,
  RefreshControl,
  ScrollView,
  FlatList,
} from 'react-native';
import PieChart from 'react-native-pie-chart';
import { expensesAPI } from '../services/api';

const EXPENSE_CATEGORIES = [
  { key: 'food', label: 'Food', color: '#FFB74D' },
  { key: 'litter', label: 'Litter', color: '#90CAF9' },
  { key: 'medicines', label: 'Medicines', color: '#A5D6A7' },
  { key: 'toys', label: 'Toys', color: '#F48FB1' },
  { key: 'grooming', label: 'Grooming', color: '#80DEEA' },
  { key: 'vet', label: 'Vet Bills', color: '#EF9A9A' },
  { key: 'accessories', label: 'Accessories', color: '#B39DDB' },
  { key: 'other', label: 'Other', color: '#CE93D8' },
];

const getCategoryColor = (category) => {
  const cat = EXPENSE_CATEGORIES.find((c) => c.key === category);
  return cat?.color || '#999';
};

const getCategoryLabel = (category) => {
  const cat = EXPENSE_CATEGORIES.find((c) => c.key === category);
  return cat?.label || category;
};

export default function Expenses({ pets = [], t }) {
  const [summary, setSummary] = useState({ categories: [], total: 0 });
  const [recentExpenses, setRecentExpenses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [modalVisible, setModalVisible] = useState(false);
  const [formData, setFormData] = useState({
    category: 'food',
    amount: '',
    description: '',
    pet: null,
  });

  const fetchData = useCallback(async () => {
    try {
      const [summaryData, expenses] = await Promise.all([
        expensesAPI.getSummary(),
        expensesAPI.getAll(),
      ]);
      setSummary(summaryData);
      setRecentExpenses(expenses.slice(0, 10)); // Show last 10
    } catch (error) {
      console.log('Error fetching expenses:', error);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, []);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  const onRefresh = () => {
    setRefreshing(true);
    fetchData();
  };

  const handleAddExpense = async () => {
    if (!formData.amount || parseFloat(formData.amount) <= 0) {
      Alert.alert('Error', 'Please enter a valid amount');
      return;
    }

    try {
      const today = new Date().toISOString().split('T')[0];
      await expensesAPI.create({
        category: formData.category,
        amount: parseFloat(formData.amount),
        description: formData.description,
        pet: formData.pet,
        date: today,
      });

      setModalVisible(false);
      setFormData({ category: 'food', amount: '', description: '', pet: null });
      fetchData(); // Refresh data
      Alert.alert('Success', 'Expense added!');
    } catch (error) {
      Alert.alert('Error', 'Failed to add expense.');
      console.error('Add expense error:', error);
    }
  };

  const handleDeleteExpense = async (id) => {
    Alert.alert('Delete Expense', 'Are you sure you want to delete this expense?', [
      { text: 'Cancel', style: 'cancel' },
      {
        text: 'Delete',
        style: 'destructive',
        onPress: async () => {
          try {
            await expensesAPI.delete(id);
            fetchData();
          } catch (error) {
            Alert.alert('Error', 'Failed to delete expense.');
          }
        },
      },
    ]);
  };

  const chartWidth = 180;

  // Prepare chart data
  const series =
    summary.categories.length > 0
      ? summary.categories.map((item) => ({
          value: parseFloat(item.total) || 0,
          color: getCategoryColor(item.category),
        }))
      : [{ value: 1, color: '#ddd' }]; // Empty state

  if (loading) {
    return (
      <View style={[styles.loadingContainer, { backgroundColor: t?.background || '#FFF' }]}>
        <ActivityIndicator size="large" color={t?.accent || '#6495ED'} />
        <Text style={[styles.loadingText, { color: t?.textSecondary }]}>Loading expenses...</Text>
      </View>
    );
  }

  return (
    <ScrollView
      style={{ flex: 1, backgroundColor: t?.background || '#FFF' }}
      contentContainerStyle={{ padding: 20, paddingBottom: 40 }}
      refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />}
    >
      <View style={styles.headerRow}>
        <Text style={[styles.header, { color: t?.titleText || '#000' }]}>Expenses</Text>
        <Pressable
          style={[styles.addButton, { backgroundColor: t?.accent || '#6495ED' }]}
          onPress={() => setModalVisible(true)}
        >
          <Text style={styles.addButtonText}>+ Add</Text>
        </Pressable>
      </View>

      {/* Chart Section */}
      <View style={styles.chartContainer}>
        <PieChart
          widthAndHeight={chartWidth}
          series={series}
          coverRadius={0.6}
          coverFill={t?.cardBg || '#FFFFFF'}
        />
        <View style={styles.totalOverlay}>
          <Text style={[styles.totalLabel, { color: t?.textSecondary }]}>Total</Text>
          <Text style={[styles.totalAmount, { color: t?.titleText || '#000' }]}>
            ${parseFloat(summary.total || 0).toFixed(2)}
          </Text>
        </View>
      </View>

      {/* Category Breakdown */}
      <View style={styles.categorySection}>
        <Text style={[styles.sectionTitle, { color: t?.textPrimary }]}>By Category</Text>
        {summary.categories.length > 0 ? (
          summary.categories.map((item) => (
            <View key={item.category} style={styles.row}>
              <View style={[styles.colorDot, { backgroundColor: getCategoryColor(item.category) }]} />
              <Text style={[styles.categoryLabel, { color: t?.textPrimary || '#333' }]}>
                {getCategoryLabel(item.category)}
              </Text>
              <Text style={[styles.categoryAmount, { color: t?.textSecondary || '#555' }]}>
                ${parseFloat(item.total).toFixed(2)}
              </Text>
            </View>
          ))
        ) : (
          <Text style={[styles.emptyText, { color: t?.textSecondary }]}>No expenses recorded yet</Text>
        )}
      </View>

      {/* Recent Expenses */}
      <View style={styles.recentSection}>
        <Text style={[styles.sectionTitle, { color: t?.textPrimary }]}>Recent Expenses</Text>
        {recentExpenses.length > 0 ? (
          recentExpenses.map((expense) => (
            <Pressable
              key={expense.id}
              style={[styles.expenseRow, { backgroundColor: t?.cardBg || '#FFF' }]}
              onLongPress={() => handleDeleteExpense(expense.id)}
            >
              <View style={[styles.colorDot, { backgroundColor: getCategoryColor(expense.category) }]} />
              <View style={styles.expenseInfo}>
                <Text style={[styles.expenseCategory, { color: t?.textPrimary }]}>
                  {getCategoryLabel(expense.category)}
                </Text>
                <Text style={[styles.expenseDate, { color: t?.textSecondary }]}>
                  {expense.date} {expense.pet_name ? `• ${expense.pet_name}` : ''}
                </Text>
                {expense.description ? (
                  <Text style={[styles.expenseDesc, { color: t?.textSecondary }]}>{expense.description}</Text>
                ) : null}
              </View>
              <Text style={[styles.expenseAmount, { color: t?.textPrimary }]}>
                ${parseFloat(expense.amount).toFixed(2)}
              </Text>
            </Pressable>
          ))
        ) : (
          <Text style={[styles.emptyText, { color: t?.textSecondary }]}>No recent expenses</Text>
        )}
        <Text style={[styles.hint, { color: t?.textSecondary }]}>Long press to delete</Text>
      </View>

      {/* Add Expense Modal */}
      <Modal visible={modalVisible} animationType="slide" transparent>
        <View style={styles.modalOverlay}>
          <View style={[styles.modalContent, { backgroundColor: t?.cardBg || '#FFF' }]}>
            <Text style={[styles.modalTitle, { color: t?.textPrimary }]}>Add Expense</Text>

            <View style={styles.inputGroup}>
              <Text style={[styles.label, { color: t?.textSecondary }]}>Category</Text>
              <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.categoryPicker}>
                {EXPENSE_CATEGORIES.map((cat) => (
                  <Pressable
                    key={cat.key}
                    style={[
                      styles.categoryOption,
                      { borderColor: cat.color },
                      formData.category === cat.key && { backgroundColor: cat.color },
                    ]}
                    onPress={() => setFormData({ ...formData, category: cat.key })}
                  >
                    <Text
                      style={[
                        styles.categoryOptionText,
                        { color: formData.category === cat.key ? '#FFF' : t?.textPrimary },
                      ]}
                    >
                      {cat.label}
                    </Text>
                  </Pressable>
                ))}
              </ScrollView>
            </View>

            <View style={styles.inputGroup}>
              <Text style={[styles.label, { color: t?.textSecondary }]}>Amount ($) *</Text>
              <TextInput
                style={[styles.input, { backgroundColor: t?.background, color: t?.textPrimary }]}
                value={formData.amount}
                onChangeText={(text) => setFormData({ ...formData, amount: text })}
                keyboardType="decimal-pad"
                placeholder="0.00"
                placeholderTextColor={t?.textSecondary}
              />
            </View>

            <View style={styles.inputGroup}>
              <Text style={[styles.label, { color: t?.textSecondary }]}>Description (optional)</Text>
              <TextInput
                style={[styles.input, { backgroundColor: t?.background, color: t?.textPrimary }]}
                value={formData.description}
                onChangeText={(text) => setFormData({ ...formData, description: text })}
                placeholder="e.g., Monthly food supply"
                placeholderTextColor={t?.textSecondary}
              />
            </View>

            <View style={styles.inputGroup}>
              <Text style={[styles.label, { color: t?.textSecondary }]}>Pet (optional)</Text>
              <ScrollView horizontal showsHorizontalScrollIndicator={false}>
                <Pressable
                  style={[
                    styles.petOption,
                    formData.pet === null && styles.petOptionSelected,
                  ]}
                  onPress={() => setFormData({ ...formData, pet: null })}
                >
                  <Text style={formData.pet === null ? styles.petOptionTextSelected : styles.petOptionText}>
                    General
                  </Text>
                </Pressable>
                {pets.map((pet) => (
                  <Pressable
                    key={pet.id}
                    style={[
                      styles.petOption,
                      formData.pet === pet.id && styles.petOptionSelected,
                    ]}
                    onPress={() => setFormData({ ...formData, pet: pet.id })}
                  >
                    <Text style={formData.pet === pet.id ? styles.petOptionTextSelected : styles.petOptionText}>
                      {pet.name}
                    </Text>
                  </Pressable>
                ))}
              </ScrollView>
            </View>

            <View style={styles.buttonRow}>
              <Pressable
                style={[styles.button, styles.cancelButton]}
                onPress={() => setModalVisible(false)}
              >
                <Text style={styles.cancelButtonText}>Cancel</Text>
              </Pressable>
              <Pressable style={[styles.button, styles.saveButton]} onPress={handleAddExpense}>
                <Text style={styles.saveButtonText}>Add</Text>
              </Pressable>
            </View>
          </View>
        </View>
      </Modal>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    marginTop: 12,
    fontSize: 14,
  },
  headerRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 20,
  },
  header: {
    fontSize: 20,
    fontWeight: '700',
  },
  addButton: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 8,
  },
  addButtonText: {
    color: '#FFF',
    fontWeight: '600',
  },
  chartContainer: {
    alignItems: 'center',
    marginBottom: 24,
    position: 'relative',
  },
  totalOverlay: {
    position: 'absolute',
    top: '50%',
    left: '50%',
    transform: [{ translateX: -40 }, { translateY: -20 }],
    alignItems: 'center',
    width: 80,
  },
  totalLabel: {
    fontSize: 12,
  },
  totalAmount: {
    fontSize: 18,
    fontWeight: '700',
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 12,
  },
  categorySection: {
    marginBottom: 24,
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 10,
  },
  colorDot: {
    width: 14,
    height: 14,
    borderRadius: 7,
    marginRight: 10,
  },
  categoryLabel: {
    flex: 1,
    fontSize: 14,
    fontWeight: '500',
  },
  categoryAmount: {
    fontSize: 14,
    fontWeight: '600',
  },
  emptyText: {
    fontSize: 14,
    fontStyle: 'italic',
  },
  recentSection: {
    marginBottom: 24,
  },
  expenseRow: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 12,
    borderRadius: 8,
    marginBottom: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 1,
  },
  expenseInfo: {
    flex: 1,
  },
  expenseCategory: {
    fontSize: 14,
    fontWeight: '600',
  },
  expenseDate: {
    fontSize: 12,
    marginTop: 2,
  },
  expenseDesc: {
    fontSize: 12,
    marginTop: 2,
  },
  expenseAmount: {
    fontSize: 16,
    fontWeight: '700',
  },
  hint: {
    fontSize: 12,
    textAlign: 'center',
    marginTop: 8,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  modalContent: {
    width: '100%',
    maxWidth: 400,
    borderRadius: 16,
    padding: 24,
    maxHeight: '80%',
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: '700',
    marginBottom: 20,
    textAlign: 'center',
  },
  inputGroup: {
    marginBottom: 16,
  },
  label: {
    fontSize: 14,
    fontWeight: '600',
    marginBottom: 6,
  },
  input: {
    borderRadius: 8,
    padding: 12,
    fontSize: 16,
    borderWidth: 1,
    borderColor: '#ddd',
  },
  categoryPicker: {
    flexDirection: 'row',
  },
  categoryOption: {
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 16,
    borderWidth: 2,
    marginRight: 8,
  },
  categoryOptionText: {
    fontSize: 13,
    fontWeight: '500',
  },
  petOption: {
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: '#ddd',
    marginRight: 8,
  },
  petOptionSelected: {
    backgroundColor: '#6495ED',
    borderColor: '#6495ED',
  },
  petOptionText: {
    fontSize: 13,
  },
  petOptionTextSelected: {
    fontSize: 13,
    color: '#FFF',
    fontWeight: '600',
  },
  buttonRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 20,
  },
  button: {
    flex: 1,
    paddingVertical: 12,
    borderRadius: 8,
    alignItems: 'center',
  },
  cancelButton: {
    backgroundColor: '#f0f0f0',
    marginRight: 8,
  },
  cancelButtonText: {
    color: '#666',
    fontWeight: '600',
  },
  saveButton: {
    backgroundColor: '#6495ED',
    marginLeft: 8,
  },
  saveButtonText: {
    color: '#fff',
    fontWeight: '600',
  },
});
