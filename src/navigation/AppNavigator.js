import React from "react";
import { NavigationContainer } from "@react-navigation/native";
import { createNativeStackNavigator } from "@react-navigation/native-stack";
import HomeScreen from "../screens/HomeScreen";
import PetDetailScreen from "../screens/PetDetailScreen";
import AddEditPetScreen from "../screens/AddEditPetScreen";

const Stack = createNativeStackNavigator();

export default function AppNavigator() {
  return (
    <NavigationContainer>
      <Stack.Navigator
        initialRouteName="Home"
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
      </Stack.Navigator>
    </NavigationContainer>
  );
}
