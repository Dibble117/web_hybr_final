import React, { Component, useState, useEffect } from 'react';
import { Accelerometer } from 'expo-sensors';
import { Alert, StyleSheet, View, Dimensions, DeviceEventEmitter, Text, BackHandler } from 'react-native';
import { NavigationEvents } from 'react-navigation';

const { width: screenWidth, height: screenHeight } = Dimensions.get('window');
const blockSize = 30; // Size of each maze cell in pixels
const timerHeight = 80; // Height of the timer bar in pixels
const numCols = Math.floor(screenWidth / blockSize); // Number of columns
const numRows = Math.floor((screenHeight - timerHeight) / blockSize); // Number of rows
const gridWidth = numCols * blockSize;

class MazeScreen extends Component {
    constructor() {
      super();
      const maze = this.generateMaze(numRows, numCols);
      const ballPosition = this.findInitialBallPosition(maze);
      const farthestDiagonalWhiteBlock = this.findFarthestDiagonalWhiteBlock(maze);
      const deadEndWhiteBlock = this.findDeadEndWhiteBlock(maze);
      const finishLine = {
      x: Math.max(farthestDiagonalWhiteBlock.x, deadEndWhiteBlock.x),
      y: Math.max(farthestDiagonalWhiteBlock.y, deadEndWhiteBlock.y),
    };
      // Create an empty maze grid
      this.state = {
        maze: maze,
        ballPosition: ballPosition, // Initial ball position
        ballSpeedX: 0, // Ball speed in the x-axis
        ballSpeedY: 0, // Ball speed in the y-axis
        finishLine: finishLine, // Finish line coordinates
        timer: 0, // Timer in seconds
        deadEndWhiteBlock: deadEndWhiteBlock,
        gameInProgress: true, // Add this line
        gameCompleted: false, // Add this line
      };
      this.accelerometerData = { x: 0, y: 0 };
    }
  
    componentDidMount() {
        // Start listening to accelerometer events
        this.showAlert();
        this.accelerometerSubscription = Accelerometer.addListener(this.handleAccelerometerData);
        this.animationFrameId = requestAnimationFrame(this.updateGame);
        this.backHandler = BackHandler.addEventListener('hardwareBackPress', this.handleBackPress);
      }
    
      componentWillUnmount() {
        // Stop listening to accelerometer events
        this.accelerometerSubscription.remove();
        // Stop the timer
        clearInterval(this.timerInterval);
        cancelAnimationFrame(this.animationFrameId);
        this.backHandler.remove();
      }

      // Handle back button press
  handleBackPress = () => {
    Alert.alert(
      'Exit Game',
      'Are you sure you want to exit the game?',
      [
        {
          text: 'Cancel',
          onPress: () => {},
          style: 'cancel',
        },
        {
          text: 'Exit',
          onPress: () => {
            // Handle the exit action here, e.g., navigate to another screen
            this.props.navigation.navigate('Home');
          },
        },
      ],
      { cancelable: false }
    );
    return true; // Prevent default behavior (exit the app)
  };

      // Show an alert with an OK button
  showAlert = () => {
    Alert.alert(
      'Game Start',
      'Tilt your device to get the red ball to the finish as fast as you can!',
      [
        {
          text: 'START',
          onPress: () => {
            // Start the timer when OK is clicked
            this.timerInterval = setInterval(this.updateTimer, 1000); // Update timer every second
          },
        },
      ],
      { cancelable: false }
    );
  };

  checkCollision(newX, newY) {
    const { maze } = this.state;
    const ballRadius = 5; // Radius of the ball (half of its width)
  
    const ballLeft = newX - ballRadius - 5;
    const ballRight = newX + ballRadius + 3;
    const ballTop = newY - ballRadius + 3;
    const ballBottom = newY + ballRadius + 10;

    const cellXLeft = Math.floor(ballLeft / blockSize);
    const cellXRight = Math.floor(ballRight / blockSize);
    const cellYTop = Math.floor(ballTop / blockSize);
    const cellYBottom = Math.floor(ballBottom / blockSize);
  
    // Check for collision with adjacent maze cells
    for (let y = cellYTop; y <= cellYBottom; y++) {
      for (let x = cellXLeft; x <= cellXRight; x++) {
        if (maze[y] && maze[y][x]) {
          // Collision detected with a black block
          return true;
        }
      }
    }
  
    return false; // No collision
  }

  findInitialBallPosition(maze) {
    for (let y = 0; y < numRows; y++) {
      for (let x = 0; x < numCols; x++) {
        if (!maze[y][x]) {
          // Found the first white block
          const initialX = x * blockSize + blockSize / 2;
          const initialY = y * blockSize + blockSize / 2;
          return { x: initialX, y: initialY };
        }
      }
    }
    // Return a default position if no white block is found (should not happen)
    return { x: 0, y: 0 };
  }

    // Handle accelerometer data to move the ball
handleAccelerometerData = (data) => {
  const { ballPosition, gameInProgress } = this.state;
  const { x, y } = data;

  if (gameInProgress) {
    // Adjust the sensitivity factor as needed
    const sensitivityFactor = 20; // You can fine-tune this value

    // Calculate the change in position based on accelerometer data
    const deltaX = x * sensitivityFactor;
    const deltaY = y * sensitivityFactor;

    // Calculate the new position of the ball by gradually adjusting its position
    let newX = ballPosition.x - deltaX;
    let newY = ballPosition.y + deltaY;

    // Define a minimum distance from walls to prevent sticking
    const wallDistance = 15; // You can adjust this value

    if (
      newX >= 10 + wallDistance && // Ensure the ball stays within the left boundary
      newX <= numCols * blockSize - 10 - wallDistance && // Ensure the ball stays within the right boundary
      newY >= 10 + wallDistance && // Ensure the ball stays within the top boundary
      newY <= numRows * blockSize - 10 - wallDistance && // Ensure the ball stays within the bottom boundary
      !this.checkCollision(newX, newY)
    ) {
      newX = Math.max(10 + wallDistance, Math.min(newX, numCols * blockSize - 10 - wallDistance));
      newY = Math.max(10 + wallDistance, Math.min(newY, numRows * blockSize - 10 - wallDistance));
      this.setState({ ballPosition: { x: newX, y: newY} });
    }
  }
  };

      // Update the timer
  updateTimer = () => {
    const { timer } = this.state;
    this.setState({ timer: timer + 1 });
  };

  // Update the game state
updateGame = () => {
  const {
    ballPosition,
    finishLine,
    timer,
    gameCompleted,
    gameInProgress,
    ballSpeedX,
    ballSpeedY,
  } = this.state;

  // Check if the game is already completed or not in progress
  if (gameCompleted || !gameInProgress) {
    return; // Don't update the game if it's completed or not in progress
  }

  // Calculate the new position of the ball based on its speed and direction
  const newX = ballPosition.x + ballSpeedX;
  const newY = ballPosition.y + ballSpeedY;

  // Define a minimum distance from walls to prevent sticking during movement
  const wallDistance = 5; // You can adjust this value

  // Check if the new position is within the bounds of the maze
  if (
    newX >= 10 + wallDistance && // Ensure the ball stays within the left boundary
    newX <= gridWidth - 10 - wallDistance && // Ensure the ball stays within the right boundary
    newY >= 10 + wallDistance && // Ensure the ball stays within the top boundary
    newY <= screenHeight - timerHeight - 10 - wallDistance && // Ensure the ball stays within the bottom boundary
    !this.checkCollision(newX, newY)
  ) {
    this.setState({ ballPosition: { x: newX, y: newY } });
  }

  // Check if the ball has reached the finish line
  if (
    Math.abs(newX - finishLine.x * blockSize) <= blockSize / 2 &&
    Math.abs(newY - finishLine.y * blockSize) <= blockSize / 2
  ) {
    // Stop the timer
    clearInterval(this.timerInterval);

    // Set the game as completed and not in progress
    this.setState({ gameCompleted: true, gameInProgress: false });

    // Show an alert message with the timer value
    Alert.alert(
      'Congratulations!',
      `You completed the maze in ${timer} seconds.`,
      [
        {
          text: 'OK',
          onPress: () => {
            // Handle the alert OK button press
          },
        },
      ],
      { cancelable: false }
    );

    // Cancel the animation frame to stop the ball from moving
    cancelAnimationFrame(this.animationFrameId);
  }

  // Request the next animation frame
  this.animationFrameId = requestAnimationFrame(this.updateGame);
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
  
    // Ensure that the finish line is not too close to walls
    let finishLine;
    do {
      finishLine = {
        x: Math.floor(Math.random() * (cols - 4)) + 2,
        y: Math.floor(Math.random() * (rows - 4)) + 2,
      };
    } while (!maze[finishLine.y][finishLine.x]);
  
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

  findFarthestDiagonalWhiteBlock(maze) {
    let farthestX = 0;
    let farthestY = 0;
    let maxDistance = 0;
  
    for (let y = 0; y < numRows; y++) {
      for (let x = 0; x < numCols; x++) {
        if (!maze[y][x]) {
          // Found a white block
          const distance = Math.sqrt(x * x + y * y); // Calculate Euclidean distance
          if (distance > maxDistance) {
            // Update farthest coordinates
            farthestX = x;
            farthestY = y;
            maxDistance = distance;
          }
        }
      }
    }
  
    return { x: farthestX, y: farthestY };
  }

  findDeadEndWhiteBlock(maze) {
    for (let y = 0; y < numRows; y++) {
      for (let x = 0; x < numCols; x++) {
        if (!maze[y][x]) {
          // Found a white block
          const neighbors = this.getNeighbors(x, y);
          const numWalls = neighbors.filter(({ x, y }) => maze[y][x]).length;
          if (numWalls === 3) {
            // This white block has three walls, making it a dead-end
            return { x, y };
          }
        }
      }
    }
    // Return a default position if no dead-end white block is found (should not happen)
    return { x: 0, y: 0 };
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
                cell ? styles.wall : styles.path,
                colIndex === this.state.finishLine.x
                  && rowIndex === this.state.finishLine.y
                //  || colIndex === this.state.deadEndWhiteBlock.x
                //  && rowIndex === this.state.deadEndWhiteBlock.y)
                  ? styles.finishLine
                  : null,
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

        {/* Render the timer at the bottom */}
        <View style={styles.timerContainer}>
            <Text style={styles.timerText}>Timer: {this.state.timer} seconds</Text>
        </View>
      </View>
    );
  }
}
/*
function close() {
    navigation.navigate('Home');
    return true;
  }

  BackHandler.addEventListener("hardwareBackPress", close);
*/
const styles = StyleSheet.create({
    container: {
        flex: 1,
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
      },
      grid: {
        width: gridWidth,
        flexDirection: 'column', // Adjust this to your layout needs
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
      timerContainer: {
        position: 'absolute',
        bottom: 10, // Adjust the position as needed
      },
      timerText: {
        fontSize: 30,
        color: 'white',
        fontWeight: 'bold',
      },
      finishLine: {
        backgroundColor: 'green', // Change this to 'green' to make the finish line green
        borderColor: 'red', // Add a red border to the finish line cell
        borderWidth: 2, // Adjust the border width as needed
      },
});

export default MazeScreen;
