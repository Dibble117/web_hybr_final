import { Text, View, StatusBar } from 'react-native';
import * as React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { initializeApp } from "firebase/app";
import { createMaterialTopTabNavigator } from '@react-navigation/material-top-tabs';
import { Ionicons } from '@expo/vector-icons';
import HomeScreen from "./screens/HomeScreen";
import MessageScreen from "./screens/MessageScreen";
import LocationScreen from "./screens/LocationScreen";
import GameScreen from './screens/GameScreen';
import { firestoreConfig } from "./FirestoreConfig";
//import AsyncStorageTestScreen from './AsyncStorageTest';

// Initialize Firebase
const app = initializeApp(firestoreConfig);
const Tab = createMaterialTopTabNavigator();

export default function App() {

  return (
    <NavigationContainer>
      <StatusBar barStyle="auto" />
      <Tab.Navigator
        initialRouteName="Home"
        tabBarOptions={{
          activeTintColor: 'blue',
          inactiveTintColor: 'gray',
          labelStyle: { fontSize: 13, fontWeight: 'bold' },
          style: { backgroundColor: '#f0f0f0' },
          indicatorStyle: { backgroundColor: '#007AFF' },
        }}
      // Set the order of screens
      screenOptions={({ route }) => ({
        tabBarIcon: ({ focused, color, size }) => {
          let iconName;

          if (route.name === 'Home') {
            iconName = focused ? 'home' : 'home-outline';
          } else if (route.name === 'Messages') {
            iconName = focused ? 'chatbubble' : 'chatbubble-outline';
          }
          else if (route.name === 'Weather') {
            iconName = focused ? 'partly-sunny' : 'partly-sunny-outline';
          }
          else if (route.name === 'Game') {
            iconName = focused ? 'game-controller' : 'game-controller-outline';
          }

          return (
          <View style={{ alignItems: 'center' }}>
            <Ionicons name={iconName} size={20} color={color} />
            <Text style={{ color, marginTop: 4 }}></Text>
          </View>
          );
        },
      })}
    >
      <Tab.Screen name="Home" component={HomeScreen} />
      <Tab.Screen name="Game" component={GameScreen} />
      <Tab.Screen name="Weather" component={LocationScreen} />
      <Tab.Screen name="Messages" component={MessageScreen} />
    {/*  <Tab.Screen name="Async" component={AsyncStorageTestScreen} /> */}
      </Tab.Navigator>
    </NavigationContainer>
  );
}
