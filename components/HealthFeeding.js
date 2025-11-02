import React from 'react';
import { View, Text, FlatList, Image, StyleSheet } from 'react-native';

const sampleFeedingAndVets = (pet) => {
  const idNum = parseInt(pet.id, 10) || 1;
  // feeding times: morning and evening, deterministic per pet
  const morningHour = 7 + (idNum % 3); // 7-9am
  const eveningHour = 18 + (idNum % 2); // 18-19

  // vet appointment every other pet
  const hasVet = idNum % 2 === 0;
  const now = new Date();
  const appointment = hasVet ? new Date(now.getFullYear(), now.getMonth(), now.getDate() + (idNum % 7) + 1, 10, 0, 0).toISOString() : null;

  return {
    feedingTimes: [`${morningHour}:00`, `${eveningHour}:00`],
    vetAppointment: appointment,
  };
};

export default function HealthFeeding({ pets = [], t }) {
  const data = pets.map((p) => ({ pet: p, meta: sampleFeedingAndVets(p) }));

  const renderItem = ({ item }) => (
    <View style={[styles.row, { backgroundColor: t.cardBg, shadowColor: t.cardShadow }]}> 
      <Image source={item.pet.image} style={styles.thumb} />
      <View style={styles.body}>
        <Text style={[styles.name, { color: t.textPrimary }]}>{item.pet.name}</Text>
        <Text style={[styles.breed, { color: t.textSecondary }]}>{item.pet.breed}</Text>

        <View style={styles.section}>
          <Text style={[styles.sectionTitle, { color: t.textPrimary }]}>Feeding times</Text>
          <View style={styles.feedingRow}>
            {item.meta.feedingTimes.map((ft) => (
              <View key={ft} style={styles.feedPill}>
                <Text style={[styles.feedText, { color: t.textPrimary }]}>{ft}</Text>
              </View>
            ))}
          </View>
        </View>

        <View style={styles.section}>
          <Text style={[styles.sectionTitle, { color: t.textPrimary }]}>Vet appointment</Text>
          {item.meta.vetAppointment ? (
            <Text style={[styles.appointment, { color: t.textSecondary }]}>{new Date(item.meta.vetAppointment).toLocaleString()}</Text>
          ) : (
            <Text style={[styles.appointment, { color: t.textSecondary }]}>No upcoming appointment</Text>
          )}
        </View>
      </View>
    </View>
  );

  return (
    <View style={{ flex: 1, padding: 12, backgroundColor: t.background }}>
      <Text style={[styles.header, { color: t.titleText }]}>Health & Feeding</Text>
      <FlatList
        data={data}
        keyExtractor={(d) => d.pet.id}
        renderItem={renderItem}
        ItemSeparatorComponent={() => <View style={{ height: 10 }} />}
        contentContainerStyle={{ paddingBottom: 24 }}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  header: {
    fontSize: 20,
    fontWeight: '700',
    marginBottom: 12,
  },
  row: {
    flexDirection: 'row',
    padding: 12,
    borderRadius: 10,
    alignItems: 'center',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.12,
    shadowRadius: 6,
    elevation: 2,
  },
  thumb: {
    width: 72,
    height: 72,
    borderRadius: 8,
    marginRight: 12,
  },
  body: {
    flex: 1,
  },
  name: {
    fontSize: 16,
    fontWeight: '700',
  },
  breed: {
    fontSize: 13,
    marginBottom: 8,
  },
  section: {
    marginTop: 8,
  },
  sectionTitle: {
    fontSize: 13,
    fontWeight: '600',
    marginBottom: 6,
  },
  feedingRow: {
    flexDirection: 'row',
  },
  feedPill: {
    backgroundColor: '#FFF',
    paddingHorizontal: 8,
    paddingVertical: 6,
    borderRadius: 8,
    marginRight: 8,
    borderWidth: 1,
    borderColor: '#EFE6E0',
  },
  feedText: {
    fontWeight: '700',
  },
  appointment: {
    fontSize: 13,
  },
});
