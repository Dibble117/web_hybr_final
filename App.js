import { StyleSheet, Text, View, StatusBar } from 'react-native';
import * as React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createStackNavigator } from '@react-navigation/stack';
import { useLayoutEffect, useState, useEffect } from "react";
// Import the functions you need from the SDKs you need
import { collection, query, onSnapshot, getFirestore, orderBy, addDoc } from 'firebase/firestore'; // Import necessary Firebase functions
import { initializeApp } from "firebase/app";
import { getAnalytics } from "firebase/analytics";
import { convertFirebaseTimeStampToJS } from './helpers/Functions';
//import { firebaseConfig } from "./FirestoreConfig";
import { createMaterialTopTabNavigator } from '@react-navigation/material-top-tabs';
import HomeScreen from "./HomeScreen";
import SecondScreen from "./SecondScreen";

const firebaseConfig = {
  apiKey: "AIzaSyBYOzPvrmtMrCFn4IRcZC02PAzSKy_R5b4",
  authDomain: "web-hybrid-teht-8.firebaseapp.com",
  projectId: "web-hybrid-teht-8",
  storageBucket: "web-hybrid-teht-8.appspot.com",
  messagingSenderId: "402183951635",
  appId: "1:402183951635:web:f4073f4cb0a7d12010f6e6",
  measurementId: "G-XWNCX16QPZ"
};

const Stack = createStackNavigator();
// Initialize Firebase
const app = initializeApp(firebaseConfig);
const analytics = getAnalytics(app);
const Tab = createMaterialTopTabNavigator();

export default function App() {
  return (
    <NavigationContainer>
      <StatusBar barStyle="auto" />
      <Tab.Navigator
        initialRouteName="Home"
        tabBarOptions={{
          labelStyle: { fontSize: 16, fontWeight: 'bold' },
          style: { backgroundColor: '#f0f0f0' },
          indicatorStyle: { backgroundColor: '#007AFF' },
        }}
      >
        <Tab.Screen name="Home" component={HomeScreen} />
        <Tab.Screen name="Messages" component={SecondScreen} />
      </Tab.Navigator>
    </NavigationContainer>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
    alignItems: 'center',
    justifyContent: 'center',
    paddingTop: StatusBar.currentHeight,
  },
});
