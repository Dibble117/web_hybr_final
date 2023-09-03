import React, { Component } from 'react';
import { StyleSheet, View, Dimensions } from 'react-native';

const { width: screenWidth, height: screenHeight } = Dimensions.get('window');
const blockSize = 30; // Size of each block in pixels
const gridWidth = screenWidth / blockSize;
const gridHeight = screenHeight / blockSize;

class GameScreen extends Component {
  constructor() {
    super();
    this.state = {
      grid: this.createEmptyGrid(),
      currentBlock: this.getRandomBlock(),
      gameInterval: null,
    };
  }

  componentDidMount() {
    this.startGame();
  }

  componentWillUnmount() {
    clearInterval(this.state.gameInterval);
  }

  createEmptyGrid() {
    const grid = [];
    for (let row = 0; row < gridHeight; row++) {
      const rowArray = [];
      for (let col = 0; col < gridWidth; col++) {
        rowArray.push(null);
      }
      grid.push(rowArray);
    }
    return grid;
  }

  getRandomBlock() {
    // Define different block shapes here
    const blocks = [
      [[1, 1], [1, 1]],
      [[1, 1, 1], [0, 1, 0]],
      // Add more block shapes as needed
    ];

    const randomIndex = Math.floor(Math.random() * blocks.length);
    return blocks[randomIndex];
  }

  startGame() {
    const gameInterval = setInterval(this.moveDown.bind(this), 1000); // Adjust speed as needed
    this.setState({ gameInterval });
  }

  moveDown() {
    // Implement logic to move the current block down
    // Update the grid and check for collisions
  }

  render() {
    const { grid } = this.state;
    return (
      <View style={styles.container}>
        {grid.map((row, rowIndex) => (
          <View key={rowIndex} style={styles.row}>
            {row.map((cell, colIndex) => (
              <View
                key={colIndex}
                style={[
                  styles.cell,
                  { backgroundColor: cell ? 'blue' : 'transparent' },
                ]}
              />
            ))}
          </View>
        ))}
      </View>
    );
  }
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'flex-start',
  },
  row: {
    flexDirection: 'row',
  },
  cell: {
    width: blockSize,
    height: blockSize,
    borderWidth: 1,
    borderColor: 'black',
  },
});

export default GameScreen;
