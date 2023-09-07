import React, { useState, useEffect } from "react";
import { View, Text, StyleSheet, BackHandler } from 'react-native';
import MapView, { Marker } from 'react-native-maps';
import * as Location from "expo-location";
import Weather from "../helpers/Weather";

export default function Position({ navigation }) {
  const [latitude, setLatitude] = useState(0);
  const [longitude, setLongitude] = useState(0);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    let isMounted = true; // To prevent memory leaks
    (async () => {
      let { status } = await Location.requestForegroundPermissionsAsync();
      try {
        if (status === "granted") {
          Location.watchPositionAsync(
            { accuracy: Location.Accuracy.BestForNavigation, distanceInterval: 10 },
            (location) => {
              if (isMounted) {
                setLatitude(location.coords.latitude);
                setLongitude(location.coords.longitude);
                setIsLoading(false);
              }
            }
          );
        } else {
          setIsLoading(false);
        }
      } catch (error) {
        alert(error);
        setIsLoading(false);
      }
    })();

    return () => {
      isMounted = false; // Cleanup function to prevent memory leaks
    };
  }, []);

  function close() {
    navigation.navigate('Home');
    return true;
  }

  BackHandler.addEventListener("hardwareBackPress", close);

   if (isLoading) {
    return <View style={styles.container}><Text>Retrieving location...</Text></View>;
  } else {
    return (
      <View style={styles.container}>
        <Text style={styles.label}>Your Location</Text>
        <Text style={styles.coordinate}>Latitude: {latitude.toFixed(3)}</Text>
        <Text style={styles.coordinate}>Longitude: {longitude.toFixed(3)}</Text>
        {/* Display Map */}
        <MapView
          style={styles.map}
          initialRegion={{
            latitude: latitude,
            longitude: longitude,
            latitudeDelta: 0.0922,
            longitudeDelta: 0.0421,
          }}
        >
          <Marker
            coordinate={{ latitude, longitude }}
            title="Your Location"
            description="You are here"
          />
        </MapView>
        <Weather latitude={latitude} longitude={longitude} />
      </View>
    );
  }
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "lightblue", // Background color
    alignItems: 'center',
    justifyContent: 'center',
  },
  label: {
    fontSize: 24, // Label font size
    fontWeight: 'bold',
    marginBottom: 10, // Spacing below label
  },
  coordinate: {
    fontSize: 18, // Coordinate text font size
    marginBottom: 5, // Spacing below coordinates
  },
  map: {
    width: '100%',
    height: 300, // Adjust the height as needed
    marginTop: 20, // Spacing above the map
  },
});
