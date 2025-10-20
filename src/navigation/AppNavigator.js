import React from "react";
import { NavigationContainer } from "@react-navigation/native";
import { createNativeStackNavigator } from "@react-navigation/native-stack";
import { ActivityIndicator, View } from "react-native";
import { useAuth } from "../contexts/AuthContext";
import HomeScreen from "../screens/HomeScreen";
import PetDetailScreen from "../screens/PetDetailScreen";
import AddEditPetScreen from "../screens/AddEditPetScreen";
import LoginScreen from "../screens/LoginScreen";
import RegisterScreen from "../screens/RegisterScreen";

const Stack = createNativeStackNavigator();

export default function AppNavigator() {
  const { isAuthenticated, loading } = useAuth();

  if (loading) {
    return (
      <View style={{ flex: 1, justifyContent: "center", alignItems: "center" }}>
        <ActivityIndicator size="large" color="#007AFF" />
      </View>
    );
  }

  return (
    <NavigationContainer>
      <Stack.Navigator
        screenOptions={{
          headerStyle: {
            backgroundColor: "#fff",
          },
          headerTintColor: "#333",
          headerTitleStyle: {
            fontWeight: "bold",
          },
        }}
      >
        {!isAuthenticated ? (
          // Auth Stack
          <>
            <Stack.Screen
              name="Login"
              component={LoginScreen}
              options={{ headerShown: false }}
            />
            <Stack.Screen
              name="Register"
              component={RegisterScreen}
              options={{ title: "Sign Up" }}
            />
          </>
        ) : (
          // App Stack
          <>
            <Stack.Screen
              name="Home"
              component={HomeScreen}
              options={{ title: "My Pets" }}
            />
            <Stack.Screen
              name="PetDetail"
              component={PetDetailScreen}
              options={({ route }) => ({ title: route.params?.petName || "Pet" })}
            />
            <Stack.Screen
              name="AddEditPet"
              component={AddEditPetScreen}
              options={({ route }) => ({
                title: route.params?.petId ? "Edit Pet" : "Add Pet",
              })}
            />
          </>
        )}
      </Stack.Navigator>
    </NavigationContainer>
  );
}
