import { createClient } from '@supabase/supabase-js';
import React, { useState, useEffect } from 'react';
import { StyleSheet, Text, View, Image, TouchableOpacity, Alert, Button } from 'react-native';
import { StatusBar } from 'expo-status-bar';
import { NavigationContainer } from '@react-navigation/native';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { createStackNavigator } from '@react-navigation/stack';


const supabaseUrl = 'https://ikbcsybkxkhxqwngczum.supabase.co';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImlrYmNzeWJreGtoeHF3bmdjenVtIiwicm9sZSI6ImFub24iLCJpYXQiOjE3MTI5NzE5NjUsImV4cCI6MjAyODU0Nzk2NX0.3PsDDeA0eDU3654oOrkx8nujxEZQW66EGu7ZvwGwgJ4';
const supabase = createClient(supabaseUrl, supabaseKey);

async function fetchTopRecoveryMethodsForParts(parts) {
  try {
    const results = {};
    for (const part of parts) {
      const { data, error } = await supabase
        .from('users')
        .select('recovery_method')
        .eq('muscle_group', part);

      if (error) {
        console.error(`Error fetching recovery methods for ${part}:`, error);
        continue;  // Skip to the next part if there's an error
      }

      const recoveryCount = data.reduce((acc, item) => {
        acc[item.recovery_method] = (acc[item.recovery_method] || 0) + 1;
        return acc;
      }, {});

      const topThreeMethods = Object.entries(recoveryCount)
        .sort((a, b) => b[1] - a[1])  // Sort by count descending
        .slice(0, 3)
        .map(([method, count]) => ({ method, count }));

      results[part] = topThreeMethods;
    }

    return results;
  } catch (err) {
    console.error('Unexpected error:', err);
    return {};
  }
}

const getStars = (index) => {
  if (index === 0) return '★★★★★';
  if (index === 1) return '★★★★☆';
  if (index === 2) return '★★★☆☆';
  return '';
}

function RecoveryScreen({ route, navigation }) {
  const { partsPressed } = route.params || { partsPressed: [] };
  const [recoveryMethods, setRecoveryMethods] = useState({});

  useEffect(() => {
    console.log("partsPressed changed:", partsPressed);
    fetchTopRecoveryMethodsForParts(partsPressed)
      .then(setRecoveryMethods)
      .catch(err => {
        console.error('Failed to fetch recovery methods:', err);
        setRecoveryMethods({});
      });
  }, [partsPressed]);

  const handleMethodPress = async (part, method) => {
    Alert.alert(`You selected ${method.method} for ${part}`);
    const { data, error } = await supabase
      .from('users')
      .insert([
        { muscle_group: part, recovery_method: method.method }
      ]);
  
    if (error) {
      console.error('Failed to insert recovery method:', error);
    } else {
      // Assuming you have a way to get the description of the method, you would pass it here
      navigation.navigate('MethodDescription', {
        part: part,
        method: method.method,
        description: "Here is how you perform the method: ..." // You need to provide this from your data
      });
    }
  
    fetchTopRecoveryMethodsForParts(partsPressed)
      .then(setRecoveryMethods)
      .catch(err => {
        console.error('Failed to fetch recovery methods:', err);
        setRecoveryMethods({});
      });
  }
  

  return (
    <View style={styles.container}>
      <Text>Top Recovery Methods for Selected Muscle Groups</Text>
      {Object.keys(recoveryMethods).length > 0 ? (
        Object.entries(recoveryMethods).map(([part, methods]) => (
          <View key={part}>
            <Text style={styles.partTitle}>{part}:</Text>
            {methods.map((method, index) => (
              <Button 
                key={index}
                title = {`${method.method} - Selected ${method.count} times ${getStars(index)}`}
                onPress = {() => handleMethodPress(part,method)}
              />
            ))}
          </View>
        ))
      ) : (
        <Text>No recovery methods to display.</Text>
      )}
    </View>
  );
}

let partsPressed = [];

function HomeScreen({ navigation }) {
  const [imageSource, setImageSource] = useState(require('./assets/humanPicture.png'));
  const [selectedParts, setSelectedParts] = useState('');

  const handleRecovery = () => {
    console.log('Attempting to navigate to Recovery');
    navigation.navigate('Recovery', { partsPressed });
  };

  const handleBicepPress = () => {
    console.log('Bicep pressed');
    // Toggle the image source
    let nextImage;
    if(imageSource === require('./assets/humanPicture.png')){
      nextImage = require('./assets/humanPicture2.png');
    }else if(imageSource === require('./assets/humanPicture2.png')){
      nextImage = require('./assets/humanPicture.png');
    }else if(imageSource === require('./assets/humanPicture3.png')){
      nextImage = require('./assets/humanPicture4.png');
    }else{
      nextImage = require('./assets/humanPicture3.png');
    }
    setImageSource(nextImage);
    addOrRemoveBodyPart('Arms');
  };

  const handleChestPress = () => {
    console.log('Chest pressed');
    // Toggle the image source
    if(imageSource === require('./assets/humanPicture4.png')){
      nextImage = require('./assets/humanPicture.png');
    }else if(imageSource === require('./assets/humanPicture.png')){
      nextImage = require('./assets/humanPicture4.png');
    }else if(imageSource === require('./assets/humanPicture3.png')){
      nextImage = require('./assets/humanPicture2.png');
    }else{
      nextImage = require('./assets/humanPicture3.png');
    }
    setImageSource(nextImage);
    addOrRemoveBodyPart('Chest');
  };

  function addOrRemoveBodyPart(part) {
    let index = partsPressed.indexOf(part); // Check if the body part exists in the list
    console.log(`${part} pressed`);
    if (index !== -1) {
      // If the body part exists, remove it
      partsPressed.splice(index, 1);
    } else {
      // If the body part doesn't exist, add it
      partsPressed.push(part);
    }
    displayParts();
  }

  function displayParts() {
    const partsString = partsPressed.join(', '); // Join the parts with a comma and space
    console.log('Pressed Parts:', partsString); // Log the joined string
    setSelectedParts(partsString);
  }

  return (
    <View style={styles.container}>
      <Text style={styles.partsText}>{selectedParts}</Text>
      <Text style={styles.selectedText}>Selected</Text>
      <View style={styles.imageContainer}>
        <Image source={imageSource} style={styles.image} resizeMode="contain" />
        <TouchableOpacity style={styles.rightBicep} onPress={() => handleBicepPress()} />
        <TouchableOpacity style={styles.leftBicep} onPress={() => handleBicepPress()} />
        <TouchableOpacity style={styles.chest} onPress={() => handleChestPress()} />
        <TouchableOpacity style={styles.abs} onPress={() => addOrRemoveBodyPart("Core")} />
        <TouchableOpacity style={styles.recovery} onPress={handleRecovery}>
          <Text style={styles.buttonText}>Recovery</Text>
        </TouchableOpacity>
      </View>
      <StatusBar style="auto" />
    </View>
  );
}


function SettingsScreen() {
  return (
    <View style={styles.container}>
      <Text>History</Text>
      <StatusBar style="auto" />
    </View>
  );
}

const Stack = createStackNavigator();
const Tab = createBottomTabNavigator();

function HomeStackScreen() {
  return (
    <Stack.Navigator>
      <Stack.Screen 
        name="Home" 
        component={HomeScreen} 
      />
      <Stack.Screen 
        name="Recovery" 
        component={RecoveryScreen} 
      />
      <Stack.Screen 
        name="MethodDescription" 
        component={RecoveryMethodDescriptionScreen} 
      />
    </Stack.Navigator>
  );
}


function RecoveryMethodDescriptionScreen({ route }) {
  const { part, method, description } = route.params;

  return (
    <View style={styles.container}>
      <Text style={styles.title}>{method}</Text>
      <Text style={styles.description}>{description}</Text>
    </View>
  );
}

export default function App() {
  return (
    <NavigationContainer>
      <Tab.Navigator screenOptions={{ headerShown: false }}>
        <Tab.Screen name="Home" component={HomeStackScreen} />
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
  leftBicep: {
    position: 'absolute',
    top: 380, // Adjust this to move the button over the bicep
    left: 150, // Adjust this to align with the bicep horizontally
    width: 50, // Width of the tappable area
    height: 40, // Height of the tappable area
    backgroundColor: 'rgba(255, 0, 0, 0.5)', // Changed to green for better visibility
    justifyContent: 'center',
    alignItems: 'center',
  },
  chest: {
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
  abs: {
    position: 'absolute',
    top: 440, // Adjust this to move the button over the bicep
    left: 215, // Adjust this to align with the bicep horizontally
    width: 70, // Width of the tappable area
    height: 60, // Height of the tappable area
    backgroundColor: 'rgba(12, 125, 125, 0.5)', // Changed to green for better visibility
    justifyContent: 'center',
    alignItems: 'center',
  },
  recovery: {
    position: 'absolute',
    top: 740, // Adjust this to move the button over the bicep
    left: 165, // Adjust this to align with the bicep horizontally
    width: 170, // Width of the tappable area
    height: 60, // Height of the tappable area
    borderRadius: 25,
    backgroundColor: 'rgba(12, 125, 125, 0.5)', // Changed to green for better visibility
    justifyContent: 'center',
    alignItems: 'center',
  },
  buttonText: {
    color: 'white', // Text color
    fontSize: 18, // Adjust the font size as needed
    fontWeight: 'bold', // Make the text bold
  },
  bicepSelected: {
    fontSize: 24, // Adjust the font size as needed
    fontWeight: 'bold', // Make the text bold
    marginBottom: 20, // Optional spacing
    position: 'absolute', // Position the text absolutely
    top: 20, // Adjust the distance from the top
    left: 150, // Adjust the distance from the left
  },
  selectedText: {
    fontSize: 24, // Adjust the font size as needed
    fontWeight: 'bold', // Make the text bold
    marginBottom: 20, // Optional spacing
    position: 'absolute', // Position the text absolutely
    top: 20, // Adjust the distance from the top
    left: 150, // Adjust the distance from the left
  },
  partsText: {
    fontSize: 18, // Adjust the font size as needed
    fontWeight: '', // Make the text bold
    marginBottom: 20, // Optional spacing
    position: 'absolute', // Position the text absolutely
    top: 50, // Adjust the distance from the top
    left: '50%', // Adjust the distance from the left
    transform: [{ translateX: -50 }],
    textAlign: 'center',
  },
  partTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    marginTop: 20,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 10,
  },
  description: {
    fontSize: 18,
    marginBottom: 20,
  }
});