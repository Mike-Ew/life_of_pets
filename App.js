import { StatusBar } from "expo-status-bar";
import { StyleSheet, Text, View, ScrollView } from "react-native";

export default function App() {
  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>Pet Care Mobile Application</Text>
      </View>

      <ScrollView style={styles.content}>
        <View style={styles.card}>
          <Text style={styles.cardTitle}>Project Description</Text>
          <Text style={styles.cardText}>
            In this project, you will develop a mobile application for tracking
            pet care activities, including feeding, vaccinations, and other
            information related to care of pets.
          </Text>
        </View>

        <View style={styles.card}>
          <Text style={styles.cardTitle}>Requirements</Text>
          <Text style={styles.bulletPoint}>
            • A feeding schedule can be created for a pet, with the ability to
            add and edit meals.
          </Text>
          <Text style={styles.bulletPoint}>
            • Vaccination information for a pet can be recorded, such as the
            date and type of vaccine.
          </Text>
          <Text style={styles.bulletPoint}>
            • Other events, like vet visits and grooming appointments, can be
            tracked with notes.
          </Text>
          <Text style={styles.bulletPoint}>
            • A list of all pets is displayed, with the option to add a new pet.
          </Text>
        </View>
      </ScrollView>

      <StatusBar style="auto" />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#f5f5f5",
  },
  header: {
    backgroundColor: "#fff",
    paddingTop: 60,
    paddingBottom: 20,
    paddingHorizontal: 20,
    borderBottomWidth: 1,
    borderBottomColor: "#e0e0e0",
  },
  title: {
    fontSize: 28,
    fontWeight: "bold",
    textAlign: "center",
  },
  content: {
    flex: 1,
    padding: 20,
  },
  card: {
    backgroundColor: "#fff",
    borderRadius: 8,
    padding: 20,
    marginBottom: 16,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  cardTitle: {
    fontSize: 20,
    fontWeight: "bold",
    marginBottom: 12,
  },
  cardText: {
    fontSize: 16,
    lineHeight: 24,
    color: "#333",
  },
  bulletPoint: {
    fontSize: 16,
    lineHeight: 24,
    color: "#333",
    marginBottom: 8,
  },
});
