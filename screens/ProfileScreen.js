import React, { useState, useEffect } from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet, Image, Alert, ActivityIndicator } from 'react-native';
import { collection, where, query, getDocs, updateDoc, doc } from 'firebase/firestore';
import * as ImagePicker from 'expo-image-picker';  
import { auth, firestore } from '../config';
import AsyncStorage from '@react-native-async-storage/async-storage';


const ProfileScreen = ({ navigation }) => {
  const [userData, setUserData] = useState(null);
  const [imageUri, setImageUri] = useState(null);
  const [loading, setLoading] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [updatedName, setUpdatedName] = useState('');
  

  const storageUrl = 'cinemawala-fd658.appspot.com'; // Firebase Storage URL

  // Function to handle image picking
  const handleImagePick = async () => {
    const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (status !== 'granted') {
      Alert.alert('Permission Denied', 'We need camera roll permissions to upload a profile picture!');
      return;
    }
    
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      aspect: [1, 1],
      quality: 1,
    });

    if (!result.canceled) {
      try {
        const uri = result.assets[0].uri;
        setImageUri(uri);
        await uploadImageToFirebase(uri);
      } catch (error) {
        console.error('Error handling image pick:', error);
        Alert.alert('Error', 'Failed to process image. Please try again later.');
      }
    }
  };

  // Function to upload the selected image to Firebase Storage
  const uploadImageToFirebase = async (uri) => {
    setLoading(true);
    const fileName = `profileImages/${userData.userRef}.jpg`;
    const blob = await (await fetch(uri)).blob();

    try {
      const response = await fetch(`https://firebasestorage.googleapis.com/v0/b/${storageUrl}/o?name=${fileName}`, {
        method: 'POST',
        headers: {
          'Content-Type': blob.type,
        },
        body: blob,
      });

      if (response.ok) {
        await updateProfilePicture(fileName);
        Alert.alert('Success', 'Profile picture updated successfully!');
      } else {
        console.error('Error uploading image:', response.statusText);
        Alert.alert('Error', 'Failed to upload image. Please try again.');
      }
    } catch (error) {
      console.error('Error during image upload:', error);
      Alert.alert('Error', 'Error uploading image. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  // Function to update user profile picture in Firestore and AsyncStorage
  const updateProfilePicture = async (fileName) => {
    try {
      const updatedUserData = { ...userData, userProfilePic: fileName };
      setUserData(updatedUserData);
      
      // Update Firestore
      await updateDoc(doc(firestore, 'users', userData.userRef), { dp_url: fileName });

      // Update AsyncStorage
      await AsyncStorage.setItem('userData', JSON.stringify(updatedUserData));

      Alert.alert('Profile Information Updated');
    } catch (error) {
      console.error('Error updating profile picture in Firestore:', error);
      Alert.alert('Error', 'Failed to update profile picture. Please try again.');
    }
  };

  // Function to update the user's name
  const handleUpdateName = async () => {
    if (updatedName.trim() === '') {
      Alert.alert('Error', 'Name cannot be empty.');
      return;
    }

    try {
      const updatedUserData = { ...userData, userName: updatedName };
      setUserData(updatedUserData);

      // Update Firestore
      await updateDoc(doc(firestore, 'users', userData.userRef), { userName: updatedName });

      // Update AsyncStorage
      await AsyncStorage.setItem('userData', JSON.stringify(updatedUserData));

      Alert.alert('Success', 'Name updated successfully!');
      setIsEditing(false);  // Exit editing mode
    } catch (error) {
      console.error('Error updating name in Firestore:', error);
      Alert.alert('Error', 'Failed to update name. Please try again.');
    }
  };

  // Function to get image URL from Firebase Storage
  const getImageUrlToShow = (image) => {
    return `https://firebasestorage.googleapis.com/v0/b/${storageUrl}/o/${encodeURIComponent(image)}?alt=media`;
  };

  // Pre-fetch profile picture
  const preFetchDP = (userProfilePic) => {
    const imageRef = getImageUrlToShow(userProfilePic);
    setImageUri(imageRef);
  };
  const onToggleDarkMode = () => {
    const newMode = !darkModeEnabled;
    setDarkModeEnabled(newMode);
    // Save the new mode to AsyncStorage or your preferred storage
  };
   // Function to handle logout
  const onSignOutPress = async () => {
    try {
      await AsyncStorage.removeItem('userData'); // Clear user data from AsyncStorage
      await auth.signOut();
      navigation.replace('LogIn'); // Navigate back to the login screen or wherever appropriate
    } catch (error) {
      console.log('Error signing out:', error);
    }
  };


  // Fetch user data from Firestore or AsyncStorage
  useEffect(() => {
    const getUser = async () => {
      const storedUserData = await AsyncStorage.getItem('userData');
      if (storedUserData) {
        const user = JSON.parse(storedUserData);
        setUserData(user);
        setUpdatedName(user.userName);  // Set the initial value of the name
        preFetchDP(user.userProfilePic);
      } else {
        const usersRef = collection(firestore, 'users');
        const q = query(usersRef, where('email', '==', auth.currentUser.email));
        const querySnapshot = await getDocs(q);

        querySnapshot.forEach((doc) => {
          const data = doc.data();
          const user = {
            userRef: data.user_id,
            userEmail: data.email,
            userName: data.userName,
            userProfilePic: data.dp_url,
            birthday: data.birthday,
          };
          setUserData(user);
          setUpdatedName(user.userName);  // Set the initial value of the name
          preFetchDP(data.dp_url);
        });
      }
    };
    getUser();
  }, []);
  
  

  return (
    <View style={styles.container}>
      <Text style={styles.title}>CINEMAWALA</Text>
      {userData ? (
        <View style={styles.profileContainer}>
          <TouchableOpacity onPress={handleImagePick}>
            {loading ? (
              <ActivityIndicator size="large" color="#0bc0ed" />
            ) : (
              <Image source={{ uri: imageUri }} style={styles.image} />
            )}
          </TouchableOpacity>

          {/* Name Input */}
          <View style={styles.inputBox}>
            <Text style={styles.label}>User Name:</Text>
            <TextInput
              style={styles.textInput}
              value={updatedName}
              onChangeText={(text) => setUpdatedName(text)}
              editable={isEditing}
            />
          </View>

          {/* Toggle between editing and saving name */}
          {isEditing ? (
            <TouchableOpacity style={styles.saveButton} onPress={handleUpdateName}>
              <Text style={styles.buttonText}>Save</Text>
            </TouchableOpacity>
          ) : (
            <TouchableOpacity style={styles.editButton} onPress={() => setIsEditing(true)}>
              <Text style={styles.buttonText}>Edit</Text>
            </TouchableOpacity>
          )}

          {/* Other info */}
          <View style={styles.inputBox}>
            <Text style={styles.label}>Email:</Text>
            <TextInput
              style={styles.textInput}
              value={userData.userEmail}
              editable={false}
            />
          </View>
          <View style={styles.inputBox}>
            <Text style={styles.label}>Birth Date:</Text>
            <TextInput
              style={styles.textInput}
              value={userData.birthday}
              editable={false}
            />
          </View>
          
        {/* Logout Button */}
        <TouchableOpacity style={styles.logoutButton} onPress={onSignOutPress}>
            <Text style={styles.buttonText}>Logout</Text>
          </TouchableOpacity>
        </View>
      ) : (
        <ActivityIndicator size="large" color="#0000ff" />
      )}
    </View>
  );
};


const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    padding: 20,
    
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 20,
    backgroundColor:"#02ADAD",
    borderRadius:5,
    borderWidth: 2,
    padding:5,
  },
  profileContainer: {//cobi nicer outlook er jonno
    width: '100%',
    alignItems: 'center',
    
    
  },
  inputBox: {
    marginBottom: 15,
    borderWidth: 1,
    borderColor: '#02ADAD',
    borderRadius: 5,
    padding: 10,
    width: '100%',
    backgroundcolor:"#02ADAD",
  },
  label: {
    fontWeight: 'bold',
    marginBottom: 5,
    
  },
  textInput: {
    backgroundColor: '#fff',
    borderWidth: 1,
    borderColor: '#ccc',
    borderRadius: 5,
    padding: 10,
    width: '100%',
  },
  image: {
    width: 150,
    height: 150,
    borderRadius: 75,
    marginBottom: 20,
    backgroundColor:"#353e40",
    },
    
  editButton: {
    backgroundColor: '#02ADAD',
    padding: 10,
    borderRadius: 5,
    marginBottom: 15,
  },
  saveButton: {
    backgroundColor: '#02ADAD',
    padding: 10,
    borderRadius: 5,
    marginBottom: 15,
  },
  logoutButton: {
    backgroundColor: '#ff3e3e',
    padding: 10,
    borderRadius: 5,
    marginTop: 20,
  },
  buttonText: {
    color: '#fff',
    fontWeight: 'bold',
    
  },
});

export default ProfileScreen;
