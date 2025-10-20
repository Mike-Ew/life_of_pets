import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  ScrollView,
  Image,
  StyleSheet,
  TouchableOpacity,
  ActivityIndicator,
  Alert,
} from "react-native";
import { petAPI, careAPI } from "../services/api";

export default function PetDetailScreen({ route, navigation }) {
  const { petId } = route.params;
  const [pet, setPet] = useState(null);
  const [activeTab, setActiveTab] = useState("overview");
  const [loading, setLoading] = useState(true);
  const [careToday, setCareToday] = useState([]);
  const [careUpcoming, setCareUpcoming] = useState([]);
  const [careLogs, setCareLogs] = useState([]);

  useEffect(() => {
    loadPetDetails();
  }, [petId]);

  useEffect(() => {
    if (activeTab === "care" && pet) {
      loadCareData();
    }
  }, [activeTab, pet]);

  const loadPetDetails = async () => {
    try {
      setLoading(true);
      const petData = await petAPI.getById(petId);
      setPet(petData);
    } catch (error) {
      console.error('Error loading pet:', error);
      Alert.alert('Error', 'Failed to load pet details');
      navigation.goBack();
    } finally {
      setLoading(false);
    }
  };

  const loadCareData = async () => {
    try {
      const [today, upcoming, logs] = await Promise.all([
        careAPI.getTodayTasks(petId),
        careAPI.getUpcomingEvents(petId),
        careAPI.getLogs(petId),
      ]);
      setCareToday(today);
      setCareUpcoming(upcoming);
      setCareLogs(logs);
    } catch (error) {
      console.error('Error loading care data:', error);
    }
  };

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#007AFF" />
      </View>
    );
  }

  if (!pet) {
    return (
      <View style={styles.container}>
        <Text>Pet not found</Text>
      </View>
    );
  }

  const renderOverviewTab = () => (
    <ScrollView style={styles.tabContent}>
      {pet.main_photo_url ? (
        <Image source={{ uri: pet.main_photo_url }} style={styles.mainImage} />
      ) : (
        <View style={[styles.mainImage, styles.placeholderMainImage]}>
          <Text style={styles.placeholderMainText}>
            {pet.name.charAt(0).toUpperCase()}
          </Text>
        </View>
      )}
      <View style={styles.infoSection}>
        <Text style={styles.sectionTitle}>About {pet.name}</Text>
        <Text style={styles.description}>
          {pet.description || "No description available"}
        </Text>

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

        {pet.temperament_tags && pet.temperament_tags.length > 0 && (
          <>
            <Text style={styles.sectionTitle}>Temperament</Text>
            <View style={styles.tagsContainer}>
              {pet.temperament_tags.map((tag, index) => (
                <View key={index} style={styles.tag}>
                  <Text style={styles.tagText}>{tag}</Text>
                </View>
              ))}
            </View>
          </>
        )}
      </View>
    </ScrollView>
  );

  const renderPhotosTab = () => (
    <ScrollView style={styles.tabContent}>
      {pet.photos && pet.photos.length > 0 ? (
        <View style={styles.photoGrid}>
          {pet.photos.map((photo) => (
            <View key={photo.id} style={styles.photoContainer}>
              <Image source={{ uri: photo.photo_url }} style={styles.gridPhoto} />
              {photo.is_main && (
                <View style={styles.mainBadge}>
                  <Text style={styles.mainBadgeText}>Main</Text>
                </View>
              )}
            </View>
          ))}
        </View>
      ) : (
        <View style={styles.emptyPhotos}>
          <Text style={styles.emptyText}>No photos yet</Text>
        </View>
      )}
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
        {careToday.length > 0 ? (
          careToday.map((item) => (
            <View key={item.id} style={styles.careItem}>
              <View style={styles.careItemLeft}>
                <Text style={styles.careItemTitle}>{item.care_type}</Text>
                <Text style={styles.careItemTime}>{new Date(item.scheduled_time).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</Text>
              </View>
              <TouchableOpacity
                style={styles.doneButton}
                onPress={() => handleMarkDone(item.id)}
              >
                <Text style={styles.doneButtonText}>Done</Text>
              </TouchableOpacity>
            </View>
          ))
        ) : (
          <Text style={styles.emptyText}>No tasks for today</Text>
        )}
      </View>

      {/* Upcoming Section */}
      <View style={styles.careSection}>
        <Text style={styles.careSectionTitle}>Upcoming (7-14 days)</Text>
        {careUpcoming.length > 0 ? (
          careUpcoming.map((item) => (
            <View key={item.id} style={styles.careItem}>
              <View style={styles.careItemLeft}>
                <Text style={styles.careItemTitle}>{item.care_type}</Text>
                <Text style={styles.careItemTime}>Due: {new Date(item.scheduled_time).toLocaleDateString()}</Text>
              </View>
              <View style={[styles.typeBadge, { backgroundColor: getTypeColor(item.care_type) }]}>
                <Text style={styles.typeBadgeText}>{item.care_type}</Text>
              </View>
            </View>
          ))
        ) : (
          <Text style={styles.emptyText}>No upcoming events</Text>
        )}
      </View>

      {/* Log Section */}
      <View style={styles.careSection}>
        <Text style={styles.careSectionTitle}>History</Text>
        {careLogs.length > 0 ? (
          careLogs.map((item) => (
            <View key={item.id} style={styles.logItem}>
              <Text style={styles.logTitle}>{item.care_type}</Text>
              {item.value && <Text style={styles.logValue}>{item.value}</Text>}
              <Text style={styles.logDate}>{new Date(item.occurred_at).toLocaleString()}</Text>
              {item.notes && <Text style={styles.logNotes}>{item.notes}</Text>}
            </View>
          ))
        ) : (
          <Text style={styles.emptyText}>No history yet</Text>
        )}
      </View>

      <TouchableOpacity style={styles.quickAddButton}>
        <Text style={styles.quickAddButtonText}>+ Quick Add</Text>
      </TouchableOpacity>
    </ScrollView>
  );

  const handleMarkDone = async (eventId) => {
    try {
      await careAPI.updateEvent(eventId, true, '');
      Alert.alert('Success', 'Task marked as done!');
      loadCareData(); // Reload care data
    } catch (error) {
      console.error('Error marking done:', error);
      Alert.alert('Error', 'Failed to mark task as done');
    }
  };

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
  loadingContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
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
  placeholderMainImage: {
    backgroundColor: "#e0e0e0",
    justifyContent: "center",
    alignItems: "center",
  },
  placeholderMainText: {
    fontSize: 80,
    fontWeight: "bold",
    color: "#999",
  },
  emptyText: {
    fontSize: 14,
    color: "#999",
    textAlign: "center",
    marginTop: 20,
    marginBottom: 20,
  },
  emptyPhotos: {
    padding: 40,
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
