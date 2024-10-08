import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import SignUp from './screens/SignUp';
import HomeScreen from './screens/HomeScreen';
import AppNavigator from './screens/AppNavigator';
import AboutUs from './screens/AboutUs';
import LoginScreen from './screens/LogIn';
import { ApolloClient, InMemoryCache, ApolloProvider, gql } from '@apollo/client';

import MovieDetailScreen from './screens/MovieDetailScreen';

const client = new ApolloClient({
  uri: 'https://countries.trevorblades.com/graphql',
  cache: new InMemoryCache(),
});

const Stack = createNativeStackNavigator();

export default function App() {
  return (

    <ApolloProvider client={client}>

    <NavigationContainer>
      <Stack.Navigator>
        <Stack.Screen name="LogIn" component={LoginScreen} />
        <Stack.Screen name="AppNav" component={AppNavigator} options={{ headerShown: false }} />
        <Stack.Screen name="AboutUs" component={AboutUs} options={{ headerShown: false }} />
        <Stack.Screen name="SignUp" component={SignUp} options={{ headerShown: false }} />
        <Stack.Screen name="Home" component={HomeScreen} options={{ headerShown: false }} />
        <Stack.Screen name="MovieDetail" component={MovieDetailScreen} options={{ title: 'Movie Details' }} />
        
        
      </Stack.Navigator>
    </NavigationContainer>
    </ApolloProvider>
   
  );
}