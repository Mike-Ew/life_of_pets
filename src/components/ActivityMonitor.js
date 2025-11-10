import React from 'react';
import { View, Text, FlatList, Image, StyleSheet } from 'react-native';

// Create simple deterministic sample activity per pet so values are stable across reloads
const sampleActivityForPet = (pet) => {
  const idNum = parseInt(pet.id, 10) || 1;
  const walkingMinutes = (idNum * 17) % 60 + 20; // 20-79
  const steps = (idNum * 1234) % 7000 + 500; // 500-7499
  const playMinutes = (idNum * 13) % 45 + 10; // 10-54
  return {
    walkingMinutes,
    steps,
    playMinutes,
  };
};

export default function ActivityMonitor({ pets = [], t }) {
  const data = pets.map((p) => ({ pet: p, activity: sampleActivityForPet(p) }));

  const renderItem = ({ item }) => (
    <View style={[styles.row, { backgroundColor: t.cardBg, shadowColor: t.cardShadow }]}> 
      <Image source={item.pet.image} style={styles.thumb} />
      <View style={styles.body}>
        <Text style={[styles.name, { color: t.textPrimary }]}>{item.pet.name}</Text>
        <Text style={[styles.breed, { color: t.textSecondary }]}>{item.pet.breed}</Text>
        <View style={styles.metricsRow}>
          <View style={styles.metric}>
            <Text style={[styles.metricValue, { color: t.textPrimary }]}>{item.activity.walkingMinutes} min</Text>
            <Text style={[styles.metricLabel, { color: t.textSecondary }]}>Walk today</Text>
          </View>
          <View style={styles.metric}>
            <Text style={[styles.metricValue, { color: t.textPrimary }]}>{item.activity.steps}</Text>
            <Text style={[styles.metricLabel, { color: t.textSecondary }]}>Steps</Text>
          </View>
          <View style={styles.metric}>
            <Text style={[styles.metricValue, { color: t.textPrimary }]}>{item.activity.playMinutes} min</Text>
            <Text style={[styles.metricLabel, { color: t.textSecondary }]}>Playtime</Text>
          </View>
        </View>
      </View>
    </View>
  );

  return (
    <View style={{ flex: 1, padding: 12, backgroundColor: t.background }}>
      <Text style={[styles.header, { color: t.titleText }]}>Activity Monitor</Text>
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
  metricsRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  metric: {
    alignItems: 'flex-start',
  },
  metricValue: {
    fontSize: 14,
    fontWeight: '700',
  },
  metricLabel: {
    fontSize: 12,
  },
});
