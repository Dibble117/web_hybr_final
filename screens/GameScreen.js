import React, { Component, useState, useEffect } from 'react';
import { Accelerometer } from 'expo-sensors';
import { Alert, StyleSheet, View, Dimensions, DeviceEventEmitter, Text, BackHandler, TouchableOpacity, Modal, FlatList } from 'react-native';
import { NavigationEvents } from 'react-navigation';
import { withNavigation } from 'react-navigation';
import  AsyncStorage  from '@react-native-async-storage/async-storage';

const { width: screenWidth, height: screenHeight } = Dimensions.get('window');
const blockSize = 30; // Size of each maze cell in pixels
const timerHeight = 80; // Height of the timer bar in pixels
const numCols = Math.floor(screenWidth / blockSize); // Number of columns
const numRows = Math.floor((screenHeight - timerHeight) / blockSize); // Number of rows
const gridWidth = numCols * blockSize; // Width of the maze grid in pixels

//const STORAGE_KEY = `gameTime_${new Date().getTime()}`; // Unique key

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
        formattedTimer: '00:00',
        deadEndWhiteBlock: deadEndWhiteBlock,
        gameInProgress: false, // Add this line
        gameCompleted: false, // Add this line
        savedGameTimes: [], // Add this line
        values: [], // Initialize values as an empty array
        showSavedGameTimes: false, // Add this line
      };
      this.accelerometerData = { x: 0, y: 0 };
    }
/*
    reloadGameScreen = () => {
      // Navigate back to the GameScreen (replace 'GameScreen' with your screen name)
      this.props.navigation.navigate('Game');
    };
*/
/*
    saveGameTime = async (formattedTimer) => {
      try {
        // Retrieve the current savedGameTimes from state
        const { savedGameTimes } = this.state;

        // Add the new time to the array
        savedGameTimes.push(formattedTimer);

        // Save the updated array in AsyncStorage
        await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(savedGameTimes));

        // Update the state with the new savedGameTimes array
        this.setState({ savedGameTimes });

        console.log('Game time saved successfully:', formattedTimer);
      } catch (error) {
        console.error('Error saving game time:', error);
      }
    };
*/
                   // TÄMÄ
saveGameTime = async (formattedTimer) => {
  try {
 //   const key = `gameTime_${new Date().getTime()}`;
    const gameData = await AsyncStorage.getItem('gameData');
    let gameDataArray = gameData ? JSON.parse(gameData) : [];
    const gameNumber = gameDataArray.length + 1;
    const gameDataItem = { gameNumber, formattedTimer };
    gameDataArray.push(gameDataItem);

    // Save the game data array in AsyncStorage
    await AsyncStorage.setItem('gameData', JSON.stringify(gameDataArray));

    console.log('GAME TIME SAVED SUCCESSFULLY:', formattedTimer);
  } catch (error) {
    console.error('Error saving game time:', error);
  }
};

/*
    retrieveGameTimes = async () => {
      try {
        const savedGameTimesString = await AsyncStorage.getItem(STORAGE_KEY);
        if (savedGameTimesString !== null) {
          const savedGameTimes = JSON.parse(savedGameTimesString);
          this.setState({ savedGameTimes });
        }
        console.log('Game times retrieved successfully:', savedGameTimesString);
      } catch (error) {
        console.error('Error retrieving game times:', error);
      }
    };
*/
                  // TÄMÄ
retrieveGameTimes = async () => {
  try {
    const gameData = await AsyncStorage.getItem('gameData');
    const gameDataArray = gameData ? JSON.parse(gameData) : [];
    console.log('GAME TIMES RETRIEVED SUCCESSFULLY:', gameDataArray);

    this.setState({ values: gameDataArray });
  } catch (error) {
    console.error('Error retrieving game times:', error);
  }
};

                //  TÄMÄ
renderSavedGameTimes = () => {
  const { values } = this.state; // Use values from the state
//  const gameNumber = values.length + 1; // Calculate game number based on the length of values

  return (
    <View style={styles.savedGameTimesContainer}>
      <Text style={styles.savedGameTimesHeader}>Your Game Times:</Text>
      {values.length > 0 && (
      <FlatList
        style={styles.list}
        data={values}
        keyExtractor={(item, index) => index.toString()}
        renderItem={({ item, index }) => (
          <Text>{`Game ${item.gameNumber}: ${item.formattedTimer}`}</Text>
        )}
      />
      )}
      <TouchableOpacity
        style={styles.closeModalButton}
        onPress={() => this.setState({ showSavedGameTimes: false })}
      >
        <Text style={styles.closeModalButtonText}>Close</Text>
      </TouchableOpacity>
    </View>
  );
};


/*
    // Function to render saved game times
  renderSavedGameTimes = () => {
    return (
      <View style={styles.savedGameTimesContainer}>
        <Text style={styles.savedGameTimesHeader}>Your Game Times:</Text>
        <FlatList
          style={styles.list}
          data={this.state.savedGameTimes}
          keyExtractor={(item, index) => index.toString()}
          renderItem={({ item }) => <Text>{item}</Text>}
        />
        <TouchableOpacity
          style={styles.closeModalButton}
          onPress={() => this.setState({ showSavedGameTimes: false })}
        >
          <Text style={styles.closeModalButtonText}>Close</Text>
        </TouchableOpacity>
      </View>
    );
    
  };
*/

    componentDidMount() {
      // Add the BackHandler event listener here
  //    this.backHandler = BackHandler.addEventListener('hardwareBackPress', this.handleBackPress);
      this.retrieveGameTimes();
    }

      componentWillUnmount() {
        // Stop listening to accelerometer events
    //    this.accelerometerSubscription.remove();
        // Stop the timer
    //    clearInterval(this.timerInterval);
    //    cancelAnimationFrame(this.animationFrameId);
    //    this.backHandler.remove();
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
            // Stop the timer
            clearInterval(this.timerInterval);
            // Set the game as completed and not in progress
            this.setState({ gameCompleted: true, gameInProgress: false });
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
            this.setState({
              gameInProgress: true,
              gameCompleted: false,
              timer: 0,
              ballPosition: this.findInitialBallPosition(this.state.maze),
              ballSpeedX: 0,
              ballSpeedY: 0,
            });
              this.retrieveGameTimes();
              this.accelerometerSubscription = Accelerometer.addListener(this.handleAccelerometerData);
              this.animationFrameId = requestAnimationFrame(this.updateGame);
              this.backHandler = BackHandler.addEventListener('hardwareBackPress', this.handleBackPress);

          },
        },
      ],
      { cancelable: true }
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


    if (Math.abs(x) < 10 && Math.abs(y) < 10) {
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
  }
  };

      // Update the timer
updateTimer = () => {
  const { timer } = this.state;
  const minutes = Math.floor(timer / 60); // Calculate minutes
  const seconds = timer % 60; // Calculate seconds

  // Format the timer value as "MM:SS"
  const formattedTimer = `${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;

  this.setState({ timer: timer + 1, formattedTimer }); // Update the formatted timer
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
    formattedTimer
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
    this.saveGameTime(this.state.formattedTimer);

    // Calculate minutes and seconds
  const minutes = Math.floor(timer / 60);
  const seconds = (timer % 60) - 1;

  let message = `You completed the maze in `;
  if (minutes > 0) {
    message += `${minutes} ${minutes === 1 ? 'minute' : 'minutes'}`;
  }
  if (seconds > 0) {
    message += `${minutes > 0 ? ' and ' : ''}${seconds} ${seconds === 1 ? 'second' : 'seconds'}`;
  }

  Alert.alert(
    'Congratulations!',
    message,
    [
      {
        text: 'OK',
        onPress: () => {
          // Handle the alert OK button press
       //   this.saveGameTime(this.state.formattedTimer);
          this.retrieveGameTimes();
        //  this.props.navigation.navigate('Game'); // Call the function to reload GameScreen
        //  this.retrieveGameTimes();
        },
      },
    ],
    this.ballPosition = this.findInitialBallPosition(this.state.maze),
    { cancelable: false }
  );

    // Cancel the animation frame to stop the ball from moving
    cancelAnimationFrame(this.animationFrameId);
  }

  // Request the next animation frame
  this.animationFrameId = requestAnimationFrame(this.updateGame);
};

  generateMaze(numRows, numCols) {
    // Create an empty maze grid filled with walls
    const maze = Array.from({ length: numRows }, () =>
      Array.from({ length: numCols }, () => true)
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
          x > 0 && x < numCols - 1 && y > 0 && y < numRows - 1 && maze[y][x]
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
        x: Math.floor(Math.random() * (numCols - 4)) + 2,
        y: Math.floor(Math.random() * (numRows - 4)) + 2,
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
    const { maze, ballPosition, gameInProgress, formattedTimer, savedGameTimes, showSavedGameTimes } = this.state;

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

<View style={styles.timerContainer}>
        {gameInProgress ? (
          <Text style={styles.timerText}>Time: {formattedTimer}</Text>
        
      ) : (
        <View style={styles.buttonContainer}>
              <TouchableOpacity
                style={styles.savedGameTimesButton}
                onPress={() => this.setState({ showSavedGameTimes: true })}
              >
                <Text style={styles.savedGameTimesButtonText}>Show Times</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={styles.startButton}
                onPress={this.showAlert}
              >
                <Text style={styles.startButtonText}>Start Game</Text>
              </TouchableOpacity>
            </View>
      )}

      {/* Use Modal to display saved game times */}
          <Modal
            animationType="slide"
            transparent={true}
            visible={showSavedGameTimes}
            onRequestClose={() => { this.setState({ showSavedGameTimes: false }); }}
          >
            <View style={styles.modalContainer}>
            
              <View style={styles.modalContent}>
                
                {this.renderSavedGameTimes()}
              </View>
            </View>
          </Modal>
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
    startButton: {
      backgroundColor: 'green', // Background color of the button
      padding: 10, // Padding around the button text
      borderRadius: 8, // Border radius to make it rounded
      alignSelf: 'center', // Align to center of screen
    },
    startButtonText: {
      color: 'white', // Text color of the button
      fontSize: 18, // Font size of the button text
      fontWeight: 'bold', // Font weight of the button text
    },
    savedGameTimesContainer: {
      backgroundColor: 'lightgray',
      marginTop: 20,
      marginLeft: 10,
    },
    savedGameTimesHeader: {
      color: 'black',
      fontSize: 20,
      fontWeight: 'bold',
      marginBottom: 10,
    },
    savedGameTime: {
      backgroundColor: 'lightgray',
      fontSize: 16,
      marginBottom: 5,
    },
    savedGameTimesButton: {
      backgroundColor: 'blue', // Background color of the button
      padding: 10, // Padding around the button text
      borderRadius: 8, // Border radius to make it rounded
      marginRight: 10, // Adjust the margin as needed
      alignSelf: 'center', // Align to center of screen
    },
    savedGameTimesButtonText: {
      color: 'white', // Text color of the button
      fontSize: 18, // Font size of the button text
      fontWeight: 'bold', // Font weight of the button text
    },
    modalContainer: {
      flex: 1,
      justifyContent: 'center',
      alignItems: 'center',
      backgroundColor: 'rgba(0, 0, 0, 0.5)', // Semi-transparent background
    },
    modalContent: {
      backgroundColor: 'white',
      padding: 20,
      borderRadius: 10,
      width: '80%',
    },
    closeModalButton: {
      backgroundColor: 'red',
      padding: 10,
      borderRadius: 8,
      alignSelf: 'center',
      marginTop: 10,
    },
    closeModalButtonText: {
      color: 'white',
      fontSize: 18,
      fontWeight: 'bold',
    },
    buttonContainer: {
      flexDirection: 'row', // Display buttons in a row
      justifyContent: 'space-between', // Space evenly between buttons
      alignItems: 'center', // Center vertically
    },
});

export default MazeScreen;