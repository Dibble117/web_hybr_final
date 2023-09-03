import React, { Component, useState, useEffect } from 'react';
import { Accelerometer } from 'expo-sensors';
import { StyleSheet, View, Dimensions, DeviceEventEmitter } from 'react-native';

const { width: screenWidth, height: screenHeight } = Dimensions.get('window');
const blockSize = 30; // Size of each maze cell in pixels
const numCols = Math.floor(screenWidth / blockSize); // Number of columns
const numRows = Math.floor(screenHeight / blockSize); // Number of rows

class MazeScreen extends Component {
    constructor() {
      super();
      // Create an empty maze grid
      this.state = {
        maze: this.generateMaze(numRows, numCols),
        ballPosition: { x: 0, y: 0 }, // Initial ball position
      };
    }
  
    componentDidMount() {
        // Start listening to accelerometer events
        this.accelerometerSubscription = Accelerometer.addListener(this.handleAccelerometerData);
      }
    
      componentWillUnmount() {
        // Stop listening to accelerometer events
        this.accelerometerSubscription.remove();
      }
  
    // Handle accelerometer data to move the ball
    handleAccelerometerData = (data) => {
      const { ballPosition } = this.state;
      const { x, y } = data;
    //  console.log('Accelerometer Data:', data);
  
      // Calculate the new position of the ball based on accelerometer data
      const sensitivityFactor = 30;
      const newX = ballPosition.x - x * sensitivityFactor; // Adjust sensitivity
      const newY = ballPosition.y + y * sensitivityFactor; // Adjust sensitivity
  
      // Check if the new position is within the bounds of the maze
      if (
        newX >= 0 &&
        newX < numCols * blockSize &&
        newY >= 0 &&
        newY < numRows * blockSize
      ) {
        this.setState({ ballPosition: { x: newX, y: newY } });
      }
    };

  generateMaze(rows, cols) {
    // Create an empty maze grid filled with walls
    const maze = Array.from({ length: rows }, () =>
      Array.from({ length: cols }, () => true)
    );

    // Initialize starting position and stack
    const stack = [];
    const startX = 1;
    const startY = 2;
    stack.push({ x: startX, y: startY });

    while (stack.length > 0) {
      const current = stack[stack.length - 1];
      const { x, y } = current;
      maze[y][x] = false; // Mark the current cell as open

      const neighbors = this.getNeighbors(x, y);
      const unvisitedNeighbors = neighbors.filter(
        ({ x, y }) =>
          x > 0 && x < cols - 1 && y > 0 && y < rows - 1 && maze[y][x]
      );

      if (unvisitedNeighbors.length === 0) {
        stack.pop(); // Backtrack if no unvisited neighbors
      } else {
        // Choose a random unvisited neighbor
        const randomNeighbor =
          unvisitedNeighbors[Math.floor(Math.random() * unvisitedNeighbors.length)];

        // Remove the wall between the current cell and the chosen neighbor
        const { x: nx, y: ny } = randomNeighbor;
        const wallX = x + (nx - x) / 2;
        const wallY = y + (ny - y) / 2;
        maze[wallY][wallX] = false;

        stack.push(randomNeighbor); // Move to the chosen neighbor
      }
    }

    return maze;
  }

  getNeighbors(x, y) {
    // Get neighboring cells of a given cell
    return [
      { x: x - 2, y },
      { x: x + 2, y },
      { x, y: y - 2 },
      { x, y: y + 2 },
    ];
  }

  render() {
    const { maze, ballPosition } = this.state;

    return (
      <View style={styles.container}>
        {/* Render the maze */}
        {maze.map((row, rowIndex) => (
          <View key={rowIndex} style={styles.row}>
            {row.map((cell, colIndex) => (
              <View
                key={colIndex}
                style={[
                  styles.cell,
                  { backgroundColor: cell ? 'black' : 'white' },
                ]}
              />
            ))}
          </View>
        ))}

        {/* Render the rolling ball */}
        <View
          style={[
            styles.ball,
            {
              left: ballPosition.x,
              top: ballPosition.y,
            },
          ]}
        />
      </View>
    );
  }
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
      },
      row: {
        flexDirection: 'row',
      },
      cell: {
        width: blockSize,
        height: blockSize,
        borderWidth: 1,
        borderColor: 'gray',
      },
      ball: {
        position: 'absolute',
        width: 20, // Ball size
        height: 20, // Ball size
        backgroundColor: 'red', // Ball color
        borderRadius: 20, // Make it round
      },
});

export default MazeScreen;
