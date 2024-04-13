import React, { useState } from 'react';
import { StyleSheet, Text, View, Image, TouchableOpacity, Alert , Button} from 'react-native';
import { StatusBar } from 'expo-status-bar';
import { NavigationContainer } from '@react-navigation/native';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';

function HomeScreen() {
  const [imageSource, setImageSource] = useState(require('./assets/humanPicture.png'));
  const [showButtons, setShowButtons] = useState(false);  // New state for controlling button visibility

  const handlePress = () => {
    // Toggle the image source
    const nextImage = imageSource === require('./assets/humanPicture.png')
      ? require('./assets/humanPicture2.png')
      : require('./assets/humanPicture.png');
    setImageSource(nextImage);
  };

  const toggleButtons = () => {
    setShowButtons(!showButtons);  // Toggle the visibility of the buttons
  };

  return (
    <View style={styles.container}>
      <View style={styles.imageContainer}>
        <Image
          source={imageSource}
          style={styles.image}
          resizeMode="contain"
        />
        {/* Touchable area for the right bicep, toggles buttons */}
        <TouchableOpacity
          style={styles.rightBicep}
          onPress={toggleButtons}
        />
        {/* Other touchable areas change the image */}
        <TouchableOpacity
          style={styles.leftBicep}
          onPress={handlePress}
        />
        <TouchableOpacity
          style={styles.chest}
          onPress={handlePress}
        />
        <TouchableOpacity
          style={styles.abs}
          onPress={handlePress}
        />
      </View>
      {/* Conditional rendering of buttons based on state */}
      {showButtons && (
        <View style={styles.buttonsContainer}>
          <Button title="Button 1" onPress={() => Alert.alert('Button 1 pressed')} />
          <Button title="Button 2" onPress={() => Alert.alert('Button 2 pressed')} />
          <Button title="Button 3" onPress={() => Alert.alert('Button 3 pressed')} />
        </View>
      )}
      <StatusBar style="auto" />
    </View>
  );
}




function SettingsScreen() {
  return (
    <View style={styles.container}>
      <Text>Settings</Text>
      <StatusBar style="auto" />
    </View>
  );
}

const Tab = createBottomTabNavigator();

export default function App() {
  return (
    <NavigationContainer>
      <Tab.Navigator>
        <Tab.Screen name="Home" component={HomeScreen} />
        <Tab.Screen name="History" component={SettingsScreen} />
      </Tab.Navigator>
    </NavigationContainer>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: 'rgb(250, 250, 250)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  imageContainer: {
    width: 500, // The same as your image width
    height: 1000, // The same as your image height
    position: 'relative',
  },
  image: {
    width: 500, // Adjust the width as needed
    height: 1000, // Adjust the height as needed
    marginBottom: 20, // Optional spacing
  },
  rightBicep: {
    position: 'absolute',
    top: 380, // Adjust this to move the button over the bicep
    left: 295, // Adjust this to align with the bicep horizontally
    width: 50, // Width of the tappable area
    height: 40, // Height of the tappable area
    backgroundColor: 'rgba(255, 0, 0, 0.5)', // Changed to green for better visibility
    justifyContent: 'center',
    alignItems: 'center',
  },
  leftBicep:{
    position: 'absolute',
    top: 380, // Adjust this to move the button over the bicep
    left: 150, // Adjust this to align with the bicep horizontally
    width: 50, // Width of the tappable area
    height: 40, // Height of the tappable area
    backgroundColor: 'rgba(0, 255, 0, 0.5)', // Changed to green for better visibility
    justifyContent: 'center',
    alignItems: 'center', 
  },
  chest:{
    position: 'absolute',
    top: 380, // Adjust this to move the button over the bicep
    left: 210, // Adjust this to align with the bicep horizontally
    width: 75, // Width of the tappable area
    height: 60, // Height of the tappable area
    backgroundColor: 'rgba(0, 0, 255, 0.5)', // Changed to green for better visibility
    justifyContent: 'center',
    alignItems: 'center', 
  },
  buttonsContainer: {
    width: '100%', // Take the full width of the screen
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 20, // Add some margin at the top to separate from the image
  },
  abs:{
    position: 'absolute',
    top: 440, // Adjust this to move the button over the bicep
    left: 215, // Adjust this to align with the bicep horizontally
    width: 70, // Width of the tappable area
    height: 60, // Height of the tappable area
    backgroundColor: 'rgba(12, 125, 125, 0.5)', // Changed to green for better visibility
    justifyContent: 'center',
    alignItems: 'center', 
  }
});