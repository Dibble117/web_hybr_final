/*
import React, { Component } from 'react';
import { View, Text, Button, FlatList } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';

class AsyncStorageTestScreen extends Component {
  constructor() {
    super();
    this.state = {
      values: [], // Initialize values as an empty array
      gameNumber: 1, // Initialize the game number
    };
  }

  saveGameTime = async (time) => {
    const key = `gameTime_${new Date().getTime()}`;
    try {
      await AsyncStorage.setItem(key, time.toString());
      console.log('Game time saved successfully:', time);
    } catch (error) {
      console.error('Error saving game time:', error);
    }
  };

  getGameTime = async () => {
    try {
      const keys = await AsyncStorage.getAllKeys();
      const filteredKeys = keys.filter((key) => key.startsWith('gameTime_'));
      const values = await AsyncStorage.multiGet(filteredKeys);
      const gameTimes = values.map((value) => value[1]);
      console.log('Game times retrieved successfully:', gameTimes);
      this.setState((prevState) => ({
        values: gameTimes,
        gameNumber: prevState.gameNumber + 1, // Increment the game number
      }));
    } catch (error) {
      console.error('Error retrieving game times:', error);
    }
  };

  render() {
    const { values, gameNumber } = this.state; // Use values from the state
    return (
      <View>
        <Text>AsyncStorage Test Screen</Text>
        <Button title="Save Game Time" onPress={() => this.saveGameTime(666)} />
        <Button title="Get Game Time" onPress={() => this.getGameTime()} />
        {values.length > 0 && (
          <FlatList
            data={values}
            keyExtractor={(item, index) => index.toString()}
            renderItem={({ item, index }) => (
              <Text>{`Game ${gameNumber - index}: ${item}`}</Text>
            )}
          />
        )}
      </View>
    );
  }
}

export default AsyncStorageTestScreen;
*/

import React, { Component } from 'react';
import { View, Text, Button, FlatList } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';

class AsyncStorageTestScreen extends Component {
  constructor() {
    super();
    this.state = {
      formattedTimer: '00:00',
      values: [], // Initialize values as an empty array
    };
  }
/*
  saveGameTime = async (time) => {
    const key = `gameTime_${new Date().getTime()}`;
    try {
      await AsyncStorage.setItem(key, JSON.stringify(time));
      console.log('Game time saved successfully:', time);
    } catch (error) {
      console.error('Error saving game time:', error);
    }
  };
*/
  saveGameTime = async (formattedTimer) => {
    try {
  //    const key = `gameTime_${new Date().getTime()}`;
      const gameData = await AsyncStorage.getItem('gameData');
      let gameDataArray = gameData ? JSON.parse(gameData) : [];
      const gameNumber = gameDataArray.length + 1;
      const gameDataItem = { gameNumber, formattedTimer };
      gameDataArray.push(gameDataItem);
  
      // Save the game data array in AsyncStorage
      await AsyncStorage.setItem('gameData', JSON.stringify(gameDataArray));
  
      console.log('Game time saved successfully:', formattedTimer);
    } catch (error) {
      console.error('Error saving game time:', error);
    }
  };
  
  getGameTime = async () => {
    try {
      const gameData = await AsyncStorage.getItem('gameData');
      const gameDataArray = gameData ? JSON.parse(gameData) : [];
      console.log('Game times retrieved successfully:', gameDataArray);
  
      this.setState({ values: gameDataArray });
    } catch (error) {
      console.error('Error retrieving game times:', error);
    }
  };
  

  render() {
    const { values } = this.state; // Use values from the state
 //   const gameNumber = values.length + 1; // Calculate game number based on the length of values

    return (
      <View>
        <Text>AsyncStorage Test Screen</Text>
        <Button title="Save Game Time" onPress={() => this.saveGameTime(666)} />
        <Button title="Get Game Time" onPress={() => this.getGameTime()} />
        <Button title="Clear Game Times" onPress={() => AsyncStorage.clear()} />
        {values.length > 0 && (
          <FlatList
            data={values}
            keyExtractor={(item, index) => index.toString()}
            renderItem={({ item, index }) => (
              <Text>{`Game ${item.gameNumber}: ${item.formattedTimer}`}</Text>
            )}
          />
        )}
      </View>
    );
  }
}

export default AsyncStorageTestScreen;
