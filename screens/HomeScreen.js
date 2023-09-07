import React, { useLayoutEffect, useState } from "react";
import { StyleSheet, Text, View, TouchableOpacity } from "react-native";
import { AntDesign } from '@expo/vector-icons';

export default function HomeScreen({ navigation }) {
  const [backgroundColor, setBackgroundColor] = useState("#f0f0f0");
  const [textColor, setTextColor] = useState("#333"); // Initial text color

  // Function to generate a random color
  const getRandomColor = () => {
    const letters = "0123456789ABCDEF";
    let color = "#";
    for (let i = 0; i < 6; i++) {
      color += letters[Math.floor(Math.random() * 16)];
    }
    return color;
  };

  // Function to change the background color and text color
  const changeBackgroundColor = () => {
    const randomBackgroundColor = getRandomColor();
    const randomTextColor = getRandomColor();

    setBackgroundColor(randomBackgroundColor);
    setTextColor(randomTextColor);
  };

  useLayoutEffect(() => {
    navigation.setOptions({
      headerStyle: {
        backgroundColor: backgroundColor,
      },
    });
  }, [backgroundColor]);

  return (
    <View style={[styles.container, { backgroundColor: backgroundColor }]}>
      <Text style={[styles.greetingText, { color: textColor }]}>Welcome to the App</Text>
      <Text style={[styles.madeByText, { color: textColor }]}>Made by Niko Kolehmainen</Text>
      <TouchableOpacity style={styles.colorChangeButton} onPress={changeBackgroundColor}>
        <AntDesign name="star" size={24} color="white" />
        <Text style={styles.buttonText}>Change Colors</Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  greetingText: {
    fontSize: 24,
    fontWeight: "bold",
    marginBottom: 20,
  },
    madeByText: {
    fontSize: 18,
    fontWeight: "bold",
    marginBottom: 20,
    },
  colorChangeButton: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#007AFF",
    borderRadius: 5,
    padding: 10,
    marginTop: 10,
  },
  buttonText: {
    color: "white",
    marginLeft: 10,
  },
});
