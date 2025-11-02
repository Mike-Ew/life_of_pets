import React, { useState } from "react";
import { StatusBar } from "expo-status-bar";
import {
  StyleSheet,
  Text,
  View,
  FlatList,
  Image,
  TouchableOpacity,
  SafeAreaView,
  Alert,
  Modal,
  TouchableWithoutFeedback,
  TextInput,
  ScrollView,
  Switch,
} from "react-native";
import PetCard from './components/PetCard';
import MenuModal from './components/MenuModal';
import ActivityMonitor from './components/ActivityMonitor';
import HealthFeeding from './components/HealthFeeding';
import Expenses from './components/Expenses';

const INITIAL_PETS = [
  {
    id: "1",
    name: "Bella",
    breed: "Welsh Corgi",
    age: "3 yrs",
    personality: "playful",
    height: "60 cm",
    weight: "30 kg",
    image: require("./assets/Pet Pictures/alvan-nee-eoqnr8ikwFE-unsplash.jpg"),
  },
  {
    id: "2",
    name: "Draco",
    breed: "German Shepherd",
    age: "4 yrs",
    personality: "calm",
    height: "65 cm",
    weight: "35 kg",
    image: require("./assets/Pet Pictures/david-lezcano-m-Doa-GTrUw-unsplash.jpg"),
  },
  {
    id: "3",
    name: "Minx",
    breed: "Tabby",
    age: "2 yrs",
    personality: "curious",
    height: "40 cm",
    weight: "12 kg",
    image: require("./assets/Pet Pictures/IMG_3229.jpeg"),
  },
  {
    id: "4",
    name: "Luna",
    breed: "Golden Retriever",
    age: "5 yrs",
    personality: "gentle",
    height: "45 cm",
    weight: "10 kg",
    image: require("./assets/Pet Pictures/richard-brutyo-Sg3XwuEpybU-unsplash.jpg"),
  },
];

// NOTE: we'll create sample reminders relative to 'now' in the component so dates
// are always relevant when previewing the app.

const PERSONALITY_COLORS = {
  calm: "#C7E7DB", // soft mint
  playful: "#FFE1B5", // warm sunny
  curious: "#F7D6E0", // soft pink
};

const THEMES = {
  light: {
    background: '#FFF8F2',
    headerBg: '#FFF6EE',
    headerShadow: '#E7CFC2',
    titleText: '#5A3E36',
    cardBg: '#fffaf6',
    cardShadow: '#E6CFC3',
    textPrimary: '#4A2F28',
    textSecondary: '#8A6F64',
    accent: '#FF8A65',
    modalBg: '#FFF8F2',
    inputBg: '#FFF',
  },
  dark: {
    background: '#121212',
    headerBg: '#1E1E1E',
    headerShadow: '#000000',
    titleText: '#FFF1EB',
    cardBg: '#1B1B1B',
    cardShadow: '#000000',
    textPrimary: '#F5EDE9',
    textSecondary: '#CFC0B8',
    accent: '#FF8A65',
    modalBg: '#1A1A1A',
    inputBg: '#222222',
  }
};

export default function App() {
  const [pets, setPets] = useState(INITIAL_PETS);
  const [modalVisible, setModalVisible] = useState(false);
  const [selectedScreen, setSelectedScreen] = useState("Dashboard");

  // Add Pet modal state
  const [addModalVisible, setAddModalVisible] = useState(false);
  const [formName, setFormName] = useState("");
  const [formBreed, setFormBreed] = useState("");
  const [formAge, setFormAge] = useState("");
  const [formPersonality, setFormPersonality] = useState("calm");
  const [formImage, setFormImage] = useState(INITIAL_PETS[0].image);
  const [formHeight, setFormHeight] = useState("");
  const [formWeight, setFormWeight] = useState("");

  // Pet detail modal state
  const [petDetailVisible, setPetDetailVisible] = useState(false);
  const [selectedPet, setSelectedPet] = useState(null);

  const SCREENS = [
    "Dashboard",
    "Activity Monitor",
    "Health & Feeding",
    "Expenses",
    "Settings",
  ];

  const onAddPet = () => {
    // open add pet modal
    setFormName("");
    setFormBreed("");
    setFormAge("");
    setFormPersonality("calm");
    setFormImage(INITIAL_PETS[0].image);
    setAddModalVisible(true);
  };

  const onNavPress = () => {
    setModalVisible(true);
  };

  const selectScreen = (screen) => {
    setSelectedScreen(screen);
    setModalVisible(false);
  };

  // Build sample reminders relative to current time so preview always shows upcoming items
  const now = new Date();
  const makeDate = (daysFromNow, hours = 9) => {
    const d = new Date(now);
    d.setDate(now.getDate() + daysFromNow);
    d.setHours(hours, 0, 0, 0);
    return d.toISOString();
  };

  const SAMPLE_REMINDERS = [
    { id: 'r1', petId: INITIAL_PETS[0].id, title: 'Vaccination reminder', date: makeDate(1, 10) },
    { id: 'r2', petId: INITIAL_PETS[1].id, title: 'Grooming appointment', date: makeDate(2, 14) },
    { id: 'r3', petId: INITIAL_PETS[2].id, title: 'Feeding - special diet', date: makeDate(4, 8) },
  ];

  // Compute reminders occurring in the next 2-3 days (inclusive)
  const upcomingReminders = SAMPLE_REMINDERS.filter((r) => {
    const d = new Date(r.date);
    const cutoff = new Date(now);
    cutoff.setDate(now.getDate() + 3);
    // include reminders >= now and <= cutoff
    return d >= now && d <= cutoff;
  }).sort((a, b) => new Date(a.date) - new Date(b.date)).map((r) => {
    const pet = pets.find((p) => p.id === r.petId) || INITIAL_PETS.find((p) => p.id === r.petId) || {};
    return { ...r, petName: pet.name, petImage: pet.image };
  });

  const openDetail = (pet) => {
    setSelectedPet(pet);
    setPetDetailVisible(true);
  };

  const renderPet = ({ item }) => (
    <PetCard item={item} onPress={openDetail} t={t} personalityColors={PERSONALITY_COLORS} />
  );

  const NUM_COLUMNS = 1;
  const [theme, setTheme] = useState('light');
  const t = THEMES[theme];

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: t.background }]}> 
      <View style={[styles.header, { backgroundColor: t.headerBg, shadowColor: t.headerShadow }] }>
        <TouchableOpacity onPress={onNavPress} style={styles.headerLeft}>
          <Text style={[styles.headerIcon, { color: t.textPrimary }]}>☰</Text>
        </TouchableOpacity>

        <Text style={[styles.title, { color: t.titleText }]}>{selectedScreen === "Dashboard" ? "My Pets" : selectedScreen}</Text>

        <TouchableOpacity onPress={onAddPet} style={styles.headerRight}>
          <Text style={[styles.addText, { color: t.accent }]}>+ Add</Text>
        </TouchableOpacity>
      </View>

      <MenuModal visible={modalVisible} onClose={() => setModalVisible(false)} screens={SCREENS} onSelect={selectScreen} t={t} />

      {selectedScreen === "Dashboard" ? (
        <FlatList
          data={pets}
          keyExtractor={(item) => item.id}
          renderItem={renderPet}
          contentContainerStyle={styles.list}
          numColumns={NUM_COLUMNS}
          // When numColumns changes (for example during hot reload), changing the
          // key forces a fresh mount of the FlatList which avoids the runtime
          // Invariant Violation: "Changing numColumns on the fly is not supported."
          key={`flatlist-cols-${NUM_COLUMNS}`}
          ListFooterComponent={() => (
              <View style={[styles.remindersContainer, { backgroundColor: t.modalBg, borderColor: t.cardShadow }]}> 
                <Text style={[styles.remindersTitle, { color: t.titleText }]}>Upcoming reminders</Text>
                {upcomingReminders.length === 0 ? (
                  <Text style={[styles.noRemindersText, { color: t.textSecondary }]}>No reminders in the next few days.</Text>
                ) : (
                  upcomingReminders.map((r) => (
                    <View key={r.id} style={[styles.reminderItem, { borderBottomColor: theme === 'dark' ? '#222' : '#F3E9E6' }]}>
                      {r.petImage ? <Image source={r.petImage} style={styles.reminderThumb} /> : null}
                      <View style={styles.reminderBody}>
                        <Text style={[styles.reminderTitle, { color: t.textPrimary }]}>{r.title}</Text>
                        <Text style={[styles.reminderPet, { color: t.textSecondary }]}>{r.petName}</Text>
                      </View>
                      <Text style={[styles.reminderDate, { color: t.textSecondary }]}>{new Date(r.date).toLocaleString()}</Text>
                    </View>
                  ))
                )}
              </View>
          )}
        />
      ) : (
        selectedScreen === 'Activity Monitor' ? (
          <ActivityMonitor pets={pets} t={t} />
        ) : selectedScreen === 'Health & Feeding' ? (
          <HealthFeeding pets={pets} t={t} />
        ) : selectedScreen === 'Expenses' ? (
          <Expenses t={t} />
        ) : selectedScreen === 'Settings' ? (
          <View style={[styles.placeholderContainer, { backgroundColor: t.background }]}>
            <View style={{ width: '100%', paddingHorizontal: 20 }}>
              <Text style={[styles.menuTitle, { color: t.titleText }]}>Settings</Text>
              <View style={{ marginTop: 12 }}>
                <Text style={[styles.inputLabel, { color: t.textSecondary }]}>Display</Text>
                <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginTop: 8 }}>
                  <Text style={{ color: t.textPrimary, fontWeight: '600' }}>Dark mode</Text>
                  <Switch value={theme === 'dark'} onValueChange={(v) => setTheme(v ? 'dark' : 'light')} thumbColor={t.accent} />
                </View>
              </View>
            </View>
          </View>
        ) : (
          <View style={styles.placeholderContainer}>
            <Text style={[styles.placeholderTitle, { color: t.titleText }]}>{selectedScreen}</Text>
            <Text style={[styles.placeholderText, { color: t.textSecondary }]}>Placeholder content for {selectedScreen}.</Text>
          </View>
        )
      )}

      {/* Pet Detail Modal */}
      <Modal visible={petDetailVisible} transparent animationType="slide">
        <TouchableWithoutFeedback onPress={() => setPetDetailVisible(false)}>
          <View style={styles.modalOverlay} />
        </TouchableWithoutFeedback>

        <View style={[styles.detailModalContainer, { backgroundColor: t.modalBg, shadowColor: t.cardShadow }] }>
          {selectedPet ? (
            <View>
              <Image source={selectedPet.image} style={styles.detailImage} />
              <View style={{ padding: 12 }}>
                <Text style={[styles.menuTitle, { color: t.titleText }]}>{selectedPet.name}</Text>
                <Text style={[styles.detailLabel, { color: t.textSecondary }]}>Breed</Text>
                <Text style={[styles.detailValue, { color: t.textPrimary }]}>{selectedPet.breed}</Text>

                <Text style={[styles.detailLabel, { color: t.textSecondary, marginTop: 8 }]}>Age</Text>
                <Text style={[styles.detailValue, { color: t.textPrimary }]}>{selectedPet.age}</Text>

                <Text style={[styles.detailLabel, { color: t.textSecondary, marginTop: 8 }]}>Height</Text>
                <Text style={[styles.detailValue, { color: t.textPrimary }]}>{selectedPet.height || '—'}</Text>

                <Text style={[styles.detailLabel, { color: t.textSecondary, marginTop: 8 }]}>Weight</Text>
                <Text style={[styles.detailValue, { color: t.textPrimary }]}>{selectedPet.weight || '—'}</Text>

                <View style={{ flexDirection: 'row', justifyContent: 'flex-end', marginTop: 12 }}>
                  <TouchableOpacity style={[styles.cancelButton, { backgroundColor: t.inputBg, borderColor: t.cardShadow }]} onPress={() => setPetDetailVisible(false)}>
                    <Text style={[styles.cancelText, { color: t.textPrimary }]}>Close</Text>
                  </TouchableOpacity>
                </View>
              </View>
            </View>
          ) : null}
        </View>
      </Modal>

      {/* Add Pet Modal */}
      <Modal visible={addModalVisible} transparent animationType="slide">
        <TouchableWithoutFeedback onPress={() => setAddModalVisible(false)}>
          <View style={styles.modalOverlay} />
        </TouchableWithoutFeedback>

        <View style={[styles.addModalContainer, { backgroundColor: t.inputBg, shadowColor: t.cardShadow }] }>
          <ScrollView contentContainerStyle={{ padding: 12 }}>
            <Text style={[styles.menuTitle, { color: t.titleText }]}>Add a new pet</Text>

            <Text style={[styles.inputLabel, { color: t.textSecondary }]}>Name</Text>
            <TextInput value={formName} onChangeText={setFormName} style={[styles.input, { backgroundColor: t.inputBg, borderColor: theme === 'dark' ? '#333' : '#EFE6E0' }]} placeholder="e.g. Coco" placeholderTextColor={ theme === 'dark' ? '#999' : '#666' } />

            <Text style={[styles.inputLabel, { color: t.textSecondary }]}>Breed</Text>
            <TextInput value={formBreed} onChangeText={setFormBreed} style={[styles.input, { backgroundColor: t.inputBg, borderColor: theme === 'dark' ? '#333' : '#EFE6E0' }]} placeholder="e.g. Labrador" placeholderTextColor={ theme === 'dark' ? '#999' : '#666' } />

            <Text style={[styles.inputLabel, { color: t.textSecondary }]}>Age</Text>
            <TextInput value={formAge} onChangeText={setFormAge} style={[styles.input, { backgroundColor: t.inputBg, borderColor: theme === 'dark' ? '#333' : '#EFE6E0' }]} placeholder="e.g. 2 yrs" placeholderTextColor={ theme === 'dark' ? '#999' : '#666' } />

            <Text style={[styles.inputLabel, { color: t.textSecondary }]}>Height</Text>
            <TextInput value={formHeight} onChangeText={setFormHeight} style={[styles.input, { backgroundColor: t.inputBg, borderColor: theme === 'dark' ? '#333' : '#EFE6E0' }]} placeholder="e.g. 55 cm" placeholderTextColor={ theme === 'dark' ? '#999' : '#666' } />

            <Text style={[styles.inputLabel, { color: t.textSecondary }]}>Weight</Text>
            <TextInput value={formWeight} onChangeText={setFormWeight} style={[styles.input, { backgroundColor: t.inputBg, borderColor: theme === 'dark' ? '#333' : '#EFE6E0' }]} placeholder="e.g. 12 kg" placeholderTextColor={ theme === 'dark' ? '#999' : '#666' } />

            <Text style={[styles.inputLabel, { color: t.textSecondary }]}>Personality</Text>
            <View style={styles.personalityRow}>
              {Object.keys(PERSONALITY_COLORS).map((p) => (
                <TouchableOpacity key={p} style={[styles.personalityOption, formPersonality === p ? styles.personalityOptionActive : null, { backgroundColor: t.modalBg }]} onPress={() => setFormPersonality(p)}>
                  <View style={[styles.personalitySwatch, { backgroundColor: PERSONALITY_COLORS[p] }]} />
                  <Text style={[styles.personalityOptionText, { color: t.textPrimary }]}>{p.charAt(0).toUpperCase() + p.slice(1)}</Text>
                </TouchableOpacity>
              ))}
            </View>

            <Text style={[styles.inputLabel, { marginTop: 12, color: t.textSecondary }]}>Choose image</Text>
            <View style={styles.imagePickerRow}>
              {INITIAL_PETS.map((pi) => (
                <TouchableOpacity key={pi.id} onPress={() => setFormImage(pi.image)} style={[styles.imageThumbWrap, formImage === pi.image ? [styles.imageThumbActive, { borderColor: t.accent }] : null]}>
                  <Image source={pi.image} style={styles.imageThumb} />
                </TouchableOpacity>
              ))}
            </View>

            <View style={{ flexDirection: 'row', justifyContent: 'space-between', marginTop: 16 }}>
              <TouchableOpacity style={[styles.cancelButton, { backgroundColor: t.inputBg, borderColor: t.cardShadow }]} onPress={() => setAddModalVisible(false)}>
                <Text style={[styles.cancelText, { color: t.textPrimary }]}>Cancel</Text>
              </TouchableOpacity>

              <TouchableOpacity style={[styles.submitButton, { backgroundColor: t.accent }]} onPress={() => {
                if (!formName.trim()) { Alert.alert('Validation', 'Please enter a name'); return; }
                const newPet = {
                  id: Date.now().toString(),
                  name: formName,
                  breed: formBreed,
                  age: formAge,
                  height: formHeight,
                  weight: formWeight,
                  personality: formPersonality,
                  image: formImage,
                };
                setPets([newPet, ...pets]);
                setAddModalVisible(false);
              }}>
                <Text style={styles.submitText}>Add Pet</Text>
              </TouchableOpacity>
            </View>
          </ScrollView>
        </View>
      </Modal>

      <StatusBar style="auto" />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#FFF8F2",
  },
  header: {
    backgroundColor: "#FFF6EE",
    paddingVertical: 20,
    paddingHorizontal: 16,
    borderBottomWidth: 0,
    alignItems: "center",
    justifyContent: "center",
    shadowColor: "#E7CFC2",
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.25,
    shadowRadius: 6,
    elevation: 2,
    flexDirection: "row",
    justifyContent: "space-between",
  },
  title: {
    fontSize: 22,
    fontWeight: "700",
    color: "#5A3E36",
  },
  list: {
    padding: 12,
  },
  // row is no longer used when rendering a single column
  row: {
    justifyContent: "space-between",
    marginBottom: 12,
  },
  card: {
    backgroundColor: "#fffaf6",
    borderRadius: 12,
    overflow: "hidden",
    width: "100%",
    flexDirection: "row",
    alignItems: "center",
    padding: 10,
    // shadow (iOS)
    shadowColor: "#E6CFC3",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.18,
    shadowRadius: 8,
    // elevation (Android)
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
    color: '#5A3E36',
  },
  petName: {
    fontSize: 18,
    fontWeight: "700",
    marginBottom: 6,
    color: "#4A2F28",
  },
  petDetails: {
    fontSize: 14,
    color: "#8A6F64",
  },
  headerLeft: {
    padding: 6,
  },
  headerRight: {
    padding: 6,
  },
  headerLeft: {
    padding: 6,
  },
  headerRight: {
    padding: 6,
  },
  headerIcon: {
    fontSize: 20,
    color: "#7A4B3A",
  },
  addText: {
    fontSize: 16,
    color: "#FF8A65",
    fontWeight: "700",
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.3)",
  },
  modalContainer: {
    position: "absolute",
    top: 80,
    left: 20,
    right: 20,
    backgroundColor: "#FFF8F2",
    borderRadius: 12,
    padding: 14,
    shadowColor: "#E6CFC3",
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.18,
    shadowRadius: 12,
    elevation: 6,
  },
  menuTitle: {
    fontSize: 18,
    fontWeight: "700",
    marginBottom: 8,
    color: "#5A3E36",
  },
  menuItem: {
    paddingVertical: 10,
  },
  menuItemText: {
    fontSize: 16,
    color: "#6A4A40",
  },
  placeholderContainer: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
  },
  placeholderTitle: {
    fontSize: 22,
    fontWeight: "700",
    marginBottom: 8,
    color: "#5A3E36",
  },
  placeholderText: {
    fontSize: 14,
    color: "#8A6F64",
  },
  remindersContainer: {
    marginTop: 18,
    backgroundColor: '#FFF6F2',
    padding: 12,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: '#F0E3DF',
  },
  remindersTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: '#5A3E36',
    marginBottom: 8,
  },
  noRemindersText: {
    color: '#8A6F64',
    fontSize: 14,
  },
  reminderItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 8,
    borderBottomWidth: 1,
    borderBottomColor: '#F3E9E6',
  },
  reminderThumb: {
    width: 48,
    height: 48,
    borderRadius: 8,
    marginRight: 10,
  },
  reminderBody: {
    flex: 1,
  },
  reminderTitle: {
    fontSize: 14,
    fontWeight: '700',
    color: '#4A2F28',
  },
  reminderPet: {
    fontSize: 12,
    color: '#8A6F64',
  },
  reminderDate: {
    fontSize: 12,
    color: '#6A4A40',
    marginLeft: 10,
  },
  addModalContainer: {
    position: 'absolute',
    top: 90,
    left: 18,
    right: 18,
    backgroundColor: '#fff',
    borderRadius: 12,
    maxHeight: '75%',
    shadowColor: '#E6CFC3',
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.18,
    shadowRadius: 12,
    elevation: 6,
  },
  inputLabel: {
    fontSize: 13,
    color: '#6A4A40',
    marginBottom: 6,
    fontWeight: '600',
  },
  input: {
    borderWidth: 1,
    borderColor: '#EFE6E0',
    backgroundColor: '#FFF',
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 8,
    marginBottom: 10,
  },
  personalityRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  personalityOption: {
    flex: 1,
    alignItems: 'center',
    paddingVertical: 8,
    marginHorizontal: 4,
    borderRadius: 10,
    backgroundColor: '#FFF8F2',
  },
  personalityOptionActive: {
    borderWidth: 1,
    borderColor: '#E6CFC3',
    shadowColor: '#E6CFC3',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.12,
    shadowRadius: 4,
  },
  personalitySwatch: {
    width: 36,
    height: 18,
    borderRadius: 6,
    marginBottom: 6,
  },
  personalityOptionText: {
    fontSize: 12,
    color: '#5A3E36',
    fontWeight: '600',
  },
  imagePickerRow: {
    flexDirection: 'row',
    marginTop: 8,
  },
  imageThumbWrap: {
    marginRight: 8,
    borderRadius: 8,
    overflow: 'hidden',
  },
  imageThumb: {
    width: 64,
    height: 64,
  },
  imageThumbActive: {
    borderWidth: 2,
    borderColor: '#FF8A65',
  },
  cancelButton: {
    paddingVertical: 10,
    paddingHorizontal: 18,
    borderRadius: 8,
    backgroundColor: '#fff',
    borderWidth: 1,
    borderColor: '#EFE6E0',
  },
  cancelText: {
    color: '#6A4A40',
    fontWeight: '700',
  },
  submitButton: {
    paddingVertical: 10,
    paddingHorizontal: 18,
    borderRadius: 8,
    backgroundColor: '#FF8A65',
  },
  submitText: {
    color: '#fff',
    fontWeight: '700',
  },
  detailModalContainer: {
    position: 'absolute',
    top: 80,
    left: 20,
    right: 20,
    borderRadius: 12,
    overflow: 'hidden',
    elevation: 8,
  },
  detailImage: {
    width: '100%',
    height: 180,
  },
  detailLabel: {
    fontSize: 12,
    color: '#8A6F64',
    marginBottom: 4,
  },
  detailValue: {
    fontSize: 16,
    color: '#4A2F28',
    fontWeight: '600',
  },
});
