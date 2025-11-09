// src/screens/ScreenStyles.js

import { StyleSheet, Dimensions } from 'react-native';

const { width } = Dimensions.get('window');

export const styles = StyleSheet.create({
  // --- Global Styles ---
  background: {
    flex: 1, // Make it fill the entire screen
    justifyContent: 'center', // Center content vertically
  },
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.45)', // A 45% black tint
    justifyContent: 'center', // Center content vertically
    padding: 20, // Add padding so contentBox doesn't touch edges
  },
  screenContainer: {
    flex: 1,
    backgroundColor: '#f0f4f8',
    padding: 16,
    justifyContent: 'center',
    alignItems: 'center',
  },
  contentBox: {
    backgroundColor: '#ffffff',
    padding: 24,
    borderRadius: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.05,
    shadowRadius: 12,
    elevation: 5,
    width: '100%',
    maxWidth: 450,
    alignItems: 'center',
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#6495ED',
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 16,
    color: '#333',
    marginBottom: 24,
    textAlign: 'center',
  },

  // --- Buttons ---
  buttonGroup: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    width: '100%',
  },
  btn: {
    paddingVertical: 12,
    paddingHorizontal: 24,
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
    minWidth: 120,
  },
  btnPrimary: {
    backgroundColor: '#6495ED',
  },
  btnPrimaryText: {
    color: '#ffffff',
    fontSize: 16,
    fontWeight: '600',
  },
  btnSecondary: {
    backgroundColor: '#f0f4f8',
    borderColor: '#e1e8f0',
    borderWidth: 1,
  },
  btnSecondaryText: {
    color: '#6495ED',
    fontSize: 16,
    fontWeight: '600',
  },

  // --- Forms ---
  formBox: {
    alignItems: 'stretch',
  },
  formTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 24,
    textAlign: 'center',
  },
  formGroup: {
    marginBottom: 16,
  },
  label: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 8,
    color: '#333',
  },
  input: {
    width: '100%',
    padding: 12,
    borderWidth: 1,
    borderColor: '#ccc',
    borderRadius: 8,
    fontSize: 16,
  },
  formLink: {
    marginTop: 24,
    textAlign: 'center',
    fontSize: 14,
  },
  linkText: {
    color: '#6495ED',
    fontWeight: '600',
  },

  // --- Dashboard ---
  dashboardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    width: '100%',
    marginBottom: 24,
  },
  dashboardTitle: {
    fontSize: 24,
    fontWeight: 'bold',
  },
  petGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
  },
  petCard: {
    backgroundColor: '#ffffff',
    borderRadius: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 3,
    width: (width - 48) / 2, // 2 columns with padding
    marginBottom: 16,
    overflow: 'hidden',
  },
  petImage: {
    width: '100%',
    height: 150,
  },
  petName: {
    fontSize: 18,
    fontWeight: '600',
    textAlign: 'center',
    padding: 16,
  },

  // --- FAB ('+' Button) ---
  fab: {
    position: 'absolute',
    bottom: 30,
    right: 30,
    width: 60,
    height: 60,
    backgroundColor: '#6495ED',
    borderRadius: 30,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#000',
    shadowOpacity: 0.2,
    shadowOffset: { width: 0, height: 4 },
    shadowRadius: 8,
    elevation: 8,
  },
  fabText: {
    color: 'white',
    fontSize: 36,
    lineHeight: 36,
  },
});