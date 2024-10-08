import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Switch, useColorScheme } from 'react-native';
import { AntDesign } from '@expo/vector-icons';
import { auth } from '../config';
import AsyncStorage from '@react-native-async-storage/async-storage';


const SettingsScreen = ({ navigation }) => {
 

  const onSignOutPress = async () => {
    try {
      await AsyncStorage.removeItem('userData'); 
      await auth.signOut();
      navigation.replace('LogIn'); 
    } catch (error) {
      console.log('Error signing out:', error);
    }
  };

  //const handleGraphQl = () => {
   // navigation.navigate('CountryInfo');
  //};


  return (
    <View style={[styles.container ]}>
      
      <TouchableOpacity onPress={onSignOutPress} style={styles.button}>
        <AntDesign name="logout" size={24}  />
        <Text style={[styles.buttonTitle,  ]}>Logout</Text>
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 20,
    backgroundColor:'#02ADAD',
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 20,
  },
  
  button: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor:'#02ADAD',
    paddingVertical: 15,
    paddingHorizontal: 20,
    borderRadius: 10,
    marginBottom: 10,
  },
  buttonTitle: {
    fontSize: 18,
    marginLeft: 10,
  },
});

export default SettingsScreen;
