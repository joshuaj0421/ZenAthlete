import { createClient } from '@supabase/supabase-js';
import React, { useState, useEffect } from 'react';
import { StyleSheet, Text, View, Image, TouchableOpacity, Alert, Button, TextInput, ActivityIndicator } from 'react-native';
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
        continue;
      }

      const recoveryCount = data.reduce((acc, item) => {
        acc[item.recovery_method] = acc[item.recovery_method] || { count: 0, description: methodDescriptions[item.recovery_method] };
        acc[item.recovery_method].count++;
        return acc;
      }, {});

      results[part] = Object.entries(recoveryCount).map(([method, { count, description }]) => ({
        method,
        count,
        description  // Now including description from predefined object
      })).sort((a, b) => b.count - a.count).slice(0, 3);
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
        { user_id: userID, muscle_group: part, recovery_method: method.method }
      ]);
  
    if (error) {
      console.error('Failed to insert recovery method:', error);
    } else {
      // Assuming you have a way to get the description of the method, you would pass it here
      navigation.navigate('MethodDescription', {
        part: part,
        method: method.method,
        description: method.description // You need to provide this from your data
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

function LoginScreen({ navigation }) {
  const [userId, setUserId] = useState('');
  const [loading, setLoading] = useState(false);
  const [userName, setUserName] = useState('');

  const fetchUserName = async (userId) => {
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from('userdetails')
        .select('name')
        .eq('user_id', userId)
        .maybeSingle();
  
      if (error) {
        console.error('Error fetching user:', error);
        alert('Failed to fetch user details.');
      } else if (data) {
        setUserName(data.name);
        setTimeout(() => {
          navigation.navigate('Home', { userId, name: data.name });
        }, 3000);
      } else {
        // No user found, prompt to enter name
        Alert.prompt(
          'New User',
          'Enter your name:',
          [
            {
              text: 'Cancel',
              style: 'cancel',
              onPress: () => console.log('User creation cancelled'),
            },
            {
              text: 'OK',
              onPress: (name) => createNewUser(userId, name),
            },
          ],
          'plain-text'
        );
      }
    } catch (error) {
      console.error('Unexpected error:', error);
      alert('An unexpected error occurred.');
    } finally {
      setLoading(false); // Ensures loading is always turned off
    }
  };

  const createNewUser = async (userId, name) => {
    if (!name.trim()) {
      alert('Please enter a valid name.');
      return;
    }
    setLoading(true);
    try {
      const { error } = await supabase
        .from('userdetails')
        .insert([{ user_id: userId, name: name }]);
  
      if (error) {
        console.error('Error creating new user:', error);
        alert('Failed to create new user.');
      } else {
        setUserName(name);
        setTimeout(() => {
          navigation.navigate('Home', { userId, name });
        }, 3000);
      }
    } catch (error) {
      console.error('Unexpected error when creating user:', error);
      alert('An unexpected error occurred while creating user.');
    } finally {
      setLoading(false); // Ensures loading is always turned off
    }
  };


  const handleLogin = () => {
    if (userId.trim())
    {
      fetchUserName(userId);
    }
    else{
      alert('Please enter a valid User ID');
    }
  };

  return (
    <View style={styles.loginContainer}>
    <Text style={styles.loginTitle}>Enter Your User ID</Text>
    <TextInput
      style={styles.input}
      onChangeText={setUserId}
      value={userId}
      placeholder="User ID"
      keyboardType="numeric"
    />
    <Button title="Enter" onPress={handleLogin} disabled={loading} />
    {loading && <ActivityIndicator size="large" color="#0000ff" />}
    {userName && <Text>Welcome, {userName}!</Text>}
  </View>
  )
}

let partsPressed = [];
let shift = 0;
let userID = "";

function HomeScreen({ route, navigation }) {
  const [imageSource, setImageSource] = useState(require('./assets/humanPicture.png'));
  const [selectedParts, setSelectedParts] = useState('');
  userID = route.params?.userId;

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
      shift = shift - 25;
    } else {
      // If the body part doesn't exist, add it
      partsPressed.push(part);
      shift = shift + 25;
    }
    console.log(shift);
    displayParts();
  }

  function displayParts() {
    const partsString = partsPressed.join(', '); // Join the parts with a comma and space
    console.log('Pressed Parts:', partsString); // Log the joined string
    setSelectedParts(partsString);
  }

  return (
    <View style={styles.container}>
      <Text style={[styles.partsText, { transform: [{ translateX: -shift }] }]}>{selectedParts}</Text>
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
    <Stack.Navigator initialRouteName="Login">
      <Stack.Screen 
        name="Login" 
        component={LoginScreen}
        options={{ title: 'Login' }}
      />
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

const methodDescriptions = {
  "Hot/Cold therapy": "Hot/Cold Therapy involves alternating hot and cold temperatures to reduce inflammation and improve circulation. Apply a heat pack for 3-5 minutes followed by an ice pack for the same duration, repeating several times.",
  "Massage therapy": "Massage therapy helps relax muscle tissue, reduce pain, and increase circulation. Schedule regular sessions focusing on affected areas to help release tension and promote recovery.",
  "Stretching": "Stretching exercises improve muscle elasticity and achieve comfortable muscle tone. Incorporate a routine of dynamic stretches before activities and static stretches after to maximize benefits.",
  "Electrotherapy": "Electrotherapy uses electrical energy for medical treatment, such as pain relief and promoting healing. Use devices like TENS units for sessions of 15-30 minutes to alleviate pain and enhance tissue repair.",
  "Active recovery": "Active recovery involves light physical activity that doesn't stress the body, instead helping to reduce stiffness and speed up muscle recovery. Engage in low-impact activities such as walking or gentle cycling for 20-30 minutes the day after intense exercise.",
  "Sleep": "Sleep is essential for physical and mental recovery, allowing the body to repair itself and consolidate memories. Aim for 7-9 hours of quality sleep per night, maintaining a consistent bedtime and wake-up schedule.",
  "Hydrotherapy": "Hydrotherapy utilizes water's therapeutic properties to treat various conditions and boost recovery. Try alternating between hot and cold showers or soaking in a whirlpool bath to relieve muscle soreness.",
  "Yoga": "Yoga combines physical postures, breathing exercises, and meditation to enhance flexibility and reduce stress. Practice yoga for at least 30 minutes daily, focusing on poses that target your specific areas of tension.",
  "Nutrition": "Nutrition plays a critical role in muscle recovery and overall health. Consume a balanced diet rich in proteins, healthy fats, and carbohydrates, and time your meals to support energy levels and recovery.",
  "Compression therapy": "Compression therapy involves wearing specially designed garments that help improve circulation and reduce swelling. Use compression clothing during and after workouts to minimize muscle fatigue and accelerate recovery.",
  "Foam rolling": "Foam rolling helps release muscle tightness and improve blood flow. Spend 5-10 minutes daily rolling out major muscle groups, focusing on areas that feel particularly tight.",
  "Contrast therapy": "Contrast therapy combines hot and cold treatments to enhance recovery by flushing out toxins and promoting blood flow. Alternate between hot and cold immersions for 1-2 minutes each for a total of 15 minutes.",
  "Hydration": "Hydration is crucial for optimal body function, especially to compensate for fluid loss during exercise. Drink at least 8-10 glasses of water daily, more if you are active, to maintain hydration levels.",
  "Breathing excersizes": "Breathing exercises can help reduce stress and improve oxygen delivery to muscles. Practice techniques like diaphragmatic breathing for 10-15 minutes daily to enhance relaxation and recovery."
  // Add more methods and their descriptions as needed
};


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
    fontWeight: 'bold', // Make the text bold
    marginBottom: 20, // Optional spacing
    position: 'absolute', // Position the text absolutely
    top: 50, // Adjust the distance from the top
    left: '50%', // Adjust the distance from the left
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
  },
  loginContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    padding: 20,
  },
  loginTitle: {
    fontSize: 24,
    marginBottom: 20,
  },
  input: {
    height: 40,
    margin: 12,
    borderWidth: 1,
    padding: 10,
    width: '80%',
  },
});