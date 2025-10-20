import React, { useState } from "react";
import {
  View,
  Text,
  ScrollView,
  Image,
  StyleSheet,
  TouchableOpacity,
  FlatList,
} from "react-native";
import {
  mockPets,
  mockCareToday,
  mockCareUpcoming,
  mockCareLogs,
} from "../data/mockData";

export default function PetDetailScreen({ route, navigation }) {
  const { petId } = route.params;
  const pet = mockPets.find((p) => p.id === petId);
  const [activeTab, setActiveTab] = useState("overview");

  if (!pet) {
    return (
      <View style={styles.container}>
        <Text>Pet not found</Text>
      </View>
    );
  }

  const renderOverviewTab = () => (
    <ScrollView style={styles.tabContent}>
      <Image source={pet.mainPhoto} style={styles.mainImage} />
      <View style={styles.infoSection}>
        <Text style={styles.sectionTitle}>About {pet.name}</Text>
        <Text style={styles.description}>{pet.description}</Text>

        <View style={styles.detailRow}>
          <Text style={styles.detailLabel}>Breed:</Text>
          <Text style={styles.detailValue}>{pet.breed}</Text>
        </View>
        <View style={styles.detailRow}>
          <Text style={styles.detailLabel}>Age:</Text>
          <Text style={styles.detailValue}>
            {pet.age} {pet.age === 1 ? "year" : "years"} old
          </Text>
        </View>

        <Text style={styles.sectionTitle}>Temperament</Text>
        <View style={styles.tagsContainer}>
          {pet.temperament_tags.map((tag, index) => (
            <View key={index} style={styles.tag}>
              <Text style={styles.tagText}>{tag}</Text>
            </View>
          ))}
        </View>
      </View>
    </ScrollView>
  );

  const renderPhotosTab = () => (
    <ScrollView style={styles.tabContent}>
      <View style={styles.photoGrid}>
        {pet.photos.map((photo) => (
          <View key={photo.id} style={styles.photoContainer}>
            <Image source={photo.url} style={styles.gridPhoto} />
            {photo.is_main && (
              <View style={styles.mainBadge}>
                <Text style={styles.mainBadgeText}>Main</Text>
              </View>
            )}
          </View>
        ))}
      </View>
      <TouchableOpacity style={styles.uploadButton}>
        <Text style={styles.uploadButtonText}>+ Add Photos</Text>
      </TouchableOpacity>
    </ScrollView>
  );

  const renderCareTab = () => (
    <ScrollView style={styles.tabContent}>
      {/* Today Section */}
      <View style={styles.careSection}>
        <Text style={styles.careSectionTitle}>Today</Text>
        {mockCareToday.map((item) => (
          <View key={item.id} style={styles.careItem}>
            <View style={styles.careItemLeft}>
              <Text style={styles.careItemTitle}>{item.title}</Text>
              <Text style={styles.careItemTime}>{item.time}</Text>
            </View>
            <TouchableOpacity style={styles.doneButton}>
              <Text style={styles.doneButtonText}>Done</Text>
            </TouchableOpacity>
          </View>
        ))}
      </View>

      {/* Upcoming Section */}
      <View style={styles.careSection}>
        <Text style={styles.careSectionTitle}>Upcoming (7-14 days)</Text>
        {mockCareUpcoming.map((item) => (
          <View key={item.id} style={styles.careItem}>
            <View style={styles.careItemLeft}>
              <Text style={styles.careItemTitle}>{item.title}</Text>
              <Text style={styles.careItemTime}>Due: {item.dueDate}</Text>
            </View>
            <View style={[styles.typeBadge, { backgroundColor: getTypeColor(item.type) }]}>
              <Text style={styles.typeBadgeText}>{item.type}</Text>
            </View>
          </View>
        ))}
      </View>

      {/* Log Section */}
      <View style={styles.careSection}>
        <Text style={styles.careSectionTitle}>History</Text>
        {mockCareLogs.map((item) => (
          <View key={item.id} style={styles.logItem}>
            <Text style={styles.logTitle}>{item.title}</Text>
            <Text style={styles.logValue}>{item.value}</Text>
            <Text style={styles.logDate}>{item.occurred_at}</Text>
            {item.notes && <Text style={styles.logNotes}>{item.notes}</Text>}
          </View>
        ))}
      </View>

      <TouchableOpacity style={styles.quickAddButton}>
        <Text style={styles.quickAddButtonText}>+ Quick Add</Text>
      </TouchableOpacity>
    </ScrollView>
  );

  const getTypeColor = (type) => {
    const colors = {
      vaccination: "#4caf50",
      bath: "#2196f3",
      grooming: "#ff9800",
      medication: "#f44336",
    };
    return colors[type] || "#9e9e9e";
  };

  return (
    <View style={styles.container}>
      {/* Tab Bar */}
      <View style={styles.tabBar}>
        <TouchableOpacity
          style={[styles.tab, activeTab === "overview" && styles.activeTab]}
          onPress={() => setActiveTab("overview")}
        >
          <Text
            style={[
              styles.tabText,
              activeTab === "overview" && styles.activeTabText,
            ]}
          >
            Overview
          </Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.tab, activeTab === "photos" && styles.activeTab]}
          onPress={() => setActiveTab("photos")}
        >
          <Text
            style={[
              styles.tabText,
              activeTab === "photos" && styles.activeTabText,
            ]}
          >
            Photos
          </Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.tab, activeTab === "care" && styles.activeTab]}
          onPress={() => setActiveTab("care")}
        >
          <Text
            style={[
              styles.tabText,
              activeTab === "care" && styles.activeTabText,
            ]}
          >
            Care
          </Text>
        </TouchableOpacity>
      </View>

      {/* Tab Content */}
      {activeTab === "overview" && renderOverviewTab()}
      {activeTab === "photos" && renderPhotosTab()}
      {activeTab === "care" && renderCareTab()}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#f5f5f5",
  },
  tabBar: {
    flexDirection: "row",
    backgroundColor: "#fff",
    borderBottomWidth: 1,
    borderBottomColor: "#e0e0e0",
  },
  tab: {
    flex: 1,
    paddingVertical: 16,
    alignItems: "center",
  },
  activeTab: {
    borderBottomWidth: 2,
    borderBottomColor: "#1976d2",
  },
  tabText: {
    fontSize: 16,
    color: "#666",
  },
  activeTabText: {
    color: "#1976d2",
    fontWeight: "bold",
  },
  tabContent: {
    flex: 1,
  },
  mainImage: {
    width: "100%",
    height: 300,
    resizeMode: "cover",
  },
  infoSection: {
    padding: 20,
    backgroundColor: "#fff",
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: "bold",
    marginTop: 16,
    marginBottom: 12,
    color: "#333",
  },
  description: {
    fontSize: 16,
    lineHeight: 24,
    color: "#666",
    marginBottom: 16,
  },
  detailRow: {
    flexDirection: "row",
    marginBottom: 8,
  },
  detailLabel: {
    fontSize: 16,
    fontWeight: "600",
    color: "#333",
    width: 80,
  },
  detailValue: {
    fontSize: 16,
    color: "#666",
    flex: 1,
  },
  tagsContainer: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 8,
  },
  tag: {
    backgroundColor: "#e3f2fd",
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
  },
  tagText: {
    fontSize: 14,
    color: "#1976d2",
    fontWeight: "500",
  },
  photoGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    padding: 8,
  },
  photoContainer: {
    width: "50%",
    padding: 8,
    position: "relative",
  },
  gridPhoto: {
    width: "100%",
    aspectRatio: 1,
    borderRadius: 8,
  },
  mainBadge: {
    position: "absolute",
    top: 16,
    right: 16,
    backgroundColor: "#1976d2",
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 4,
  },
  mainBadgeText: {
    color: "#fff",
    fontSize: 12,
    fontWeight: "bold",
  },
  uploadButton: {
    margin: 16,
    padding: 16,
    backgroundColor: "#fff",
    borderRadius: 8,
    borderWidth: 2,
    borderColor: "#1976d2",
    borderStyle: "dashed",
    alignItems: "center",
  },
  uploadButtonText: {
    color: "#1976d2",
    fontSize: 16,
    fontWeight: "600",
  },
  careSection: {
    backgroundColor: "#fff",
    padding: 16,
    marginTop: 16,
  },
  careSectionTitle: {
    fontSize: 18,
    fontWeight: "bold",
    marginBottom: 12,
    color: "#333",
  },
  careItem: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: "#f0f0f0",
  },
  careItemLeft: {
    flex: 1,
  },
  careItemTitle: {
    fontSize: 16,
    fontWeight: "500",
    color: "#333",
    marginBottom: 4,
  },
  careItemTime: {
    fontSize: 14,
    color: "#666",
  },
  doneButton: {
    backgroundColor: "#4caf50",
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
  },
  doneButtonText: {
    color: "#fff",
    fontWeight: "600",
  },
  typeBadge: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 12,
  },
  typeBadgeText: {
    color: "#fff",
    fontSize: 12,
    fontWeight: "600",
  },
  logItem: {
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: "#f0f0f0",
  },
  logTitle: {
    fontSize: 16,
    fontWeight: "500",
    color: "#333",
    marginBottom: 4,
  },
  logValue: {
    fontSize: 14,
    color: "#666",
    marginBottom: 2,
  },
  logDate: {
    fontSize: 12,
    color: "#999",
  },
  logNotes: {
    fontSize: 14,
    color: "#666",
    marginTop: 4,
    fontStyle: "italic",
  },
  quickAddButton: {
    margin: 16,
    padding: 16,
    backgroundColor: "#1976d2",
    borderRadius: 8,
    alignItems: "center",
  },
  quickAddButtonText: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "600",
  },
});
