import React, { useState, useEffect, useRef } from 'react';
import { Accelerometer } from 'expo-sensors';
import {
  Alert,
  StyleSheet,
  View,
  Dimensions,
  Text,
  TouchableOpacity,
  Modal,
  FlatList,
  BackHandler,
} from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';

const { width: screenWidth, height: screenHeight } = Dimensions.get('window');
const blockSize = 30;
const timerHeight = 80;
const numCols = Math.floor(screenWidth / blockSize);
const numRows = Math.floor((screenHeight - timerHeight) / blockSize);
const gridWidth = numCols * blockSize;

const STORAGE_KEY = `gameTime_${new Date().getTime()}`;

export default function MazeScreen({ navigation }) {
  const [maze, setMaze] = useState([]);
  const [ballPosition, setBallPosition] = useState({ x: 0, y: 0 });
  const [ballSpeedX, setBallSpeedX] = useState(0);
  const [ballSpeedY, setBallSpeedY] = useState(0);
  const [finishLine, setFinishLine] = useState({ x: 0, y: 0 });
  const [timer, setTimer] = useState(0);
  const [formattedTimer, setFormattedTimer] = useState('00:00');
  const [deadEndWhiteBlock, setDeadEndWhiteBlock] = useState({ x: 0, y: 0 });
  const [gameInProgress, setGameInProgress] = useState(false);
  const [gameCompleted, setGameCompleted] = useState(false);
  const [savedGameTimes, setSavedGameTimes] = useState([]);
  const [showSavedGameTimes, setShowSavedGameTimes] = useState(false);
  const accelerometerData = useRef({ x: 0, y: 0 });
  const timerInterval = useRef(null);

  const startAccelerometer = async () => {
    try {
      Accelerometer.setUpdateInterval(16);
      Accelerometer.addListener(accelerometerData.current);
    } catch (error) {
      console.error('Error starting accelerometer:', error);
    }
  };

  useEffect(() => {
    const accelerometerSubscription = Accelerometer.addListener((data) => {
      handleAccelerometerData(data);
    });

    return () => {
      accelerometerSubscription.remove();
    };
  }, []);

  const close = () => {
    navigation.navigate('Home');
    return true;
  };

  useEffect(() => {
    BackHandler.addEventListener('hardwareBackPress', close);
    return () => {
      BackHandler.removeEventListener('hardwareBackPress', close);
    };
  }, []);

  useEffect(() => {
    retrieveGameTimes();
  }, []);

  const saveGameTime = async (time) => {
    try {
      const updatedSavedGameTimes = [...savedGameTimes, time];
      await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(updatedSavedGameTimes));
      setSavedGameTimes(updatedSavedGameTimes);
      console.log('Game time saved successfully:', time);
    } catch (error) {
      console.error('Error saving game time:', error);
    }
  };

  const retrieveGameTimes = async () => {
    try {
      const savedGameTimesString = await AsyncStorage.getItem(STORAGE_KEY);
      if (savedGameTimesString !== null) {
        const savedGameTimes = JSON.parse(savedGameTimesString);
        setSavedGameTimes(savedGameTimes);
      }
      console.log('Game times retrieved successfully:', savedGameTimesString);
    } catch (error) {
      console.error('Error retrieving game times:', error);
    }
  };

  const renderSavedGameTimes = () => {
    return (
      <View style={styles.savedGameTimesContainer}>
        <Text style={styles.savedGameTimesHeader}>Your Game Times:</Text>
        <FlatList
          style={styles.list}
          data={savedGameTimes}
          keyExtractor={(item, index) => index.toString()}
          renderItem={({ item }) => <Text>{item}</Text>}
        />
        <TouchableOpacity style={styles.closeModalButton} onPress={() => setShowSavedGameTimes(false)}>
          <Text style={styles.closeModalButtonText}>Close</Text>
        </TouchableOpacity>
      </View>
    );
  };

  useEffect(() => {
    retrieveGameTimes();
  }, []);

  const handleBackPress = () => {
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
            clearInterval(timerInterval.current);
            setGameCompleted(true);
            setGameInProgress(false);
            navigation.navigate('Home');
          },
        },
      ],
      { cancelable: false }
    );
    return true;
  };

  useEffect(() => {
    const accelerometerSubscription = Accelerometer.addListener(handleAccelerometerData);

    return () => {
      accelerometerSubscription.remove();
    };
  }, []);

  const showAlert = () => {
    Alert.alert(
      'Game Start',
      'Tilt your device to get the red ball to the finish as fast as you can!',
      [
        {
          text: 'START',
          onPress: () => {
            const intervalId = setInterval(updateTimer, 1000);
            timerInterval.current = intervalId;
            setGameInProgress(true);
            setGameCompleted(false);
            setTimer(0);
            setBallPosition(findInitialBallPosition(maze));
            setBallSpeedX(0);
            setBallSpeedY(0);
            retrieveGameTimes();
            const accelerometerSubscription = Accelerometer.addListener(handleAccelerometerData);
            requestAnimationFrame(updateGame);
            const backHandler = BackHandler.addEventListener('hardwareBackPress', handleBackPress);
            return () => {
              accelerometerSubscription.remove();
              clearInterval(intervalId);
              setGameCompleted(true);
              setGameInProgress(false);
              backHandler.remove();
            };
          },
        },
      ],
      { cancelable: true }
    );
  };

  const checkCollision = (newX, newY) => {
    const ballRadius = 5;
    const ballLeft = newX - ballRadius - 5;
    const ballRight = newX + ballRadius + 3;
    const ballTop = newY - ballRadius + 3;
    const ballBottom = newY + ballRadius + 10;

    const cellXLeft = Math.floor(ballLeft / blockSize);
    const cellXRight = Math.floor(ballRight / blockSize);
    const cellYTop = Math.floor(ballTop / blockSize);
    const cellYBottom = Math.floor(ballBottom / blockSize);

    for (let y = cellYTop; y <= cellYBottom; y++) {
      for (let x = cellXLeft; x <= cellXRight; x++) {
        if (maze[y] && maze[y][x]) {
          return true;
        }
      }
    }

    return false;
  };

  const findInitialBallPosition = (maze) => {
    for (let y = 0; y < numRows; y++) {
      for (let x = 0; x < numCols; x++) {
        if (!maze[y][x]) {
          const initialX = x * blockSize + blockSize / 2;
          const initialY = y * blockSize + blockSize / 2;
          return { x: initialX, y: initialY };
        }
      }
    }
    return { x: 0, y: 0 };
  };

  useEffect(() => {
    const accelerometerSubscription = Accelerometer.addListener((data) => {
      accelerometerData.current = data;
      handleAccelerometerData(data);
    });

    return () => {
      accelerometerSubscription.remove();
    };
  }, []);

  const handleAccelerometerData = (data) => {
    const { x, y } = data;

    if (gameInProgress) {
      const sensitivityFactor = 20;
      const wallDistance = 15;
      const deltaX = x * sensitivityFactor;
      const deltaY = y * sensitivityFactor;
      let newX = ballPosition.x - deltaX;
      let newY = ballPosition.y + deltaY;

      newX = Math.max(10 + wallDistance, Math.min(newX, numCols * blockSize - 10 - wallDistance));
      newY = Math.max(10 + wallDistance, Math.min(newY, numRows * blockSize - 10 - wallDistance));

      if (!checkCollision(newX, newY)) {
        setBallPosition({ x: newX, y: newY });
      }
    }
  };

  const updateTimer = () => {
    if (gameInProgress) {
      const minutes = Math.floor(timer / 60);
      const seconds = timer % 60;
      const formattedTimer = `${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
      setTimer(timer + 1);
      setFormattedTimer(formattedTimer);
    }
  };

  const updateGame = () => {
    if (gameCompleted || !gameInProgress) {
      return;
    }
  
    const sensitivityFactor = 20;
    const wallDistance = 0;
    const newX = ballPosition.x + ballSpeedX * sensitivityFactor;
    const newY = ballPosition.y + ballSpeedY * sensitivityFactor;
  
    const isInsideXBounds = newX >= 10 + wallDistance && newX <= gridWidth - 10 - wallDistance;
    const isInsideYBounds = newY >= 10 + wallDistance && newY <= screenHeight - timerHeight - 10 - wallDistance;
  
    if (isInsideXBounds && isInsideYBounds && !checkCollision(newX, newY)) {
      setBallPosition({ x: newX, y: newY });
    }
  
    const isAtFinishLine =
      Math.abs(newX - finishLine.x * blockSize) <= blockSize / 2 &&
      Math.abs(newY - finishLine.y * blockSize) <= blockSize / 2;
  
    if (isAtFinishLine) {
      clearInterval(timerInterval.current);
      setGameCompleted(true);
      setGameInProgress(false);
  
      const minutes = Math.floor(timer / 60);
      const seconds = timer % 60;
      let message = `You completed the maze in ${minutes} ${minutes === 1 ? 'minute' : 'minutes'}`;
  
      if (seconds > 0) {
        message += `${minutes > 0 ? ' and ' : ''}${seconds} ${seconds === 1 ? 'second' : 'seconds'}`;
      }
  
      Alert.alert('Congratulations!', message, [
        {
          text: 'OK',
          onPress: () => {
            saveGameTime(timer);
          },
        },
      ], { cancelable: false });
  
      setBallPosition(findInitialBallPosition(maze));
      return;
    }
  
    // Update the timer
    updateTimer(); // Call the updateTimer function here
  
    requestAnimationFrame(updateGame);
  };
  

  useEffect(() => {
    const newMaze = generateMaze(numRows, numCols);
    setMaze(newMaze);
    setFinishLine(findFarthestDiagonalWhiteBlock(newMaze));
    setDeadEndWhiteBlock(findDeadEndWhiteBlock(newMaze));
  }, []);

  const generateMaze = (rows, cols) => {
    const maze = Array.from({ length: rows }, () => Array.from({ length: cols }, () => true));
    const stack = [];
    const startX = 1;
    const startY = 2;
    stack.push({ x: startX, y: startY });

    while (stack.length > 0) {
      const current = stack[stack.length - 1];
      const { x, y } = current;
      maze[y][x] = false;

      const neighbors = getNeighbors(x, y);
      const unvisitedNeighbors = neighbors.filter(({ x, y }) => x > 0 && x < cols - 1 && y > 0 && y < rows - 1 && maze[y][x]);

      if (unvisitedNeighbors.length === 0) {
        stack.pop();
      } else {
        const randomNeighbor = unvisitedNeighbors[Math.floor(Math.random() * unvisitedNeighbors.length)];
        const { x: nx, y: ny } = randomNeighbor;
        const wallX = x + (nx - x) / 2;
        const wallY = y + (ny - y) / 2;
        maze[wallY][wallX] = false;
        stack.push(randomNeighbor);
      }
    }

    let finishLine;
    do {
      finishLine = {
        x: Math.floor(Math.random() * (cols - 4)) + 2,
        y: Math.floor(Math.random() * (rows - 4)) + 2,
      };
    } while (!maze[finishLine.y][finishLine.x]);

    return maze;
  };

  const getNeighbors = (x, y) => {
    return [
      { x: x - 2, y },
      { x: x + 2, y },
      { x, y: y - 2 },
      { x, y: y + 2 },
    ];
  };

  const findFarthestDiagonalWhiteBlock = (maze) => {
    let farthestX = 0;
    let farthestY = 0;
    let maxDistance = 0;

    for (let y = 0; y < numRows; y++) {
      for (let x = 0; x < numCols; x++) {
        if (!maze[y][x]) {
          const distance = Math.sqrt(x * x + y * y);
          if (distance > maxDistance) {
            farthestX = x;
            farthestY = y;
            maxDistance = distance;
          }
        }
      }
    }

    return { x: farthestX, y: farthestY };
  };

  const findDeadEndWhiteBlock = (maze) => {
    for (let y = 0; y < numRows; y++) {
      for (let x = 0; x < numCols; x++) {
        if (!maze[y][x]) {
          const neighbors = getNeighbors(x, y);
          const numWalls = neighbors.filter(({ x, y }) => maze[y][x]).length;
          if (numWalls === 3) {
            return { x, y };
          }
        }
      }
    }
    return { x: 0, y: 0 };
  };

  return (
    <View style={styles.container}>
      {maze.map((row, rowIndex) => (
        <View key={rowIndex} style={styles.row}>
          {row.map((cell, colIndex) => (
            <View
              key={colIndex}
              style={[
                styles.cell,
                { backgroundColor: cell ? 'black' : 'white' },
                cell ? styles.wall : styles.path,
                colIndex === finishLine.x && rowIndex === finishLine.y ? styles.finishLine : null,
              ]}
            />
          ))}
        </View>
      ))}
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
            <TouchableOpacity style={styles.savedGameTimesButton} onPress={() => setShowSavedGameTimes(true)}>
              <Text style={styles.savedGameTimesButtonText}>Show Times</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.startButton} onPress={showAlert}>
              <Text style={styles.startButtonText}>Start Game</Text>
            </TouchableOpacity>
          </View>
        )}
        <Modal animationType="slide" transparent={true} visible={showSavedGameTimes} onRequestClose={() => setShowSavedGameTimes(false)}>
          <View style={styles.modalContainer}>
            <View style={styles.modalContent}>{renderSavedGameTimes()}</View>
          </View>
        </Modal>
      </View>
    </View>
  );
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
    width: 20,
    height: 20,
    backgroundColor: 'red',
    borderRadius: 20,
  },
  timerContainer: {
    position: 'absolute',
    bottom: 10,
  },
  timerText: {
    fontSize: 30,
    color: 'white',
    fontWeight: 'bold',
  },
  finishLine: {
    backgroundColor: 'green',
    borderColor: 'red',
    borderWidth: 2,
  },
  startButton: {
    backgroundColor: 'green',
    padding: 10,
    borderRadius: 8,
    alignSelf: 'center',
  },
  startButtonText: {
    color: 'white',
    fontSize: 18,
    fontWeight: 'bold',
  },
  savedGameTimesButton: {
    backgroundColor: 'blue',
    padding: 10,
    borderRadius: 8,
    marginRight: 10,
    alignSelf: 'center',
  },
  savedGameTimesButtonText: {
    color: 'white',
    fontSize: 18,
    fontWeight: 'bold',
  },
  modalContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
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
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
});
