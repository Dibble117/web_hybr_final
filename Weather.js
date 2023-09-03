import React, { useState, useEffect } from "react";
import { StyleSheet, Text, Image } from "react-native";

const API_URL = "https://api.openweathermap.org/data/2.5/weather?";
const API_KEY = "a01c3a3ceac8e9ae65a0f70205d467d3";
const ICON_URL = "http://openweathermap.org/img/wn/";

export default function Weather({ latitude, longitude }) {
    const [temp, setTemp] = useState(0);
    const [description, setDescription] = useState("");
    const [icon, setIcon] = useState(" ");

    useEffect(() => {
        const url = API_URL +
        "lat=" + latitude +
        "&lon=" + longitude +
        "&units=metric" +
        "&appid=" + API_KEY;
        fetch(url)
        .then((response) => response.json())
        .then(
            (result) => {
                setTemp(result.main.temp);
                setDescription(result.weather[0].description);
                setIcon(ICON_URL + result.weather[0].icon + "@2x.png");
            },
            (error) => {
                alert(error);
            }
        );
    }, []);

    return (
        <>
        <Text style={styles.label}>Temperature</Text>
        <Text>{temp.toFixed(1)} °C</Text>
        <Text style={styles.label}>Description</Text>
        <Text>{description.charAt(0).toUpperCase() + description.slice(1)}</Text>
        <Image source={{uri: icon}} style={{width: 100, height: 100}} />
        </>
    );
}

const styles = StyleSheet.create({
    label: {
        fontWeight: "bold",
        marginTop: 10,
    },
});