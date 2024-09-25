import React, { useEffect, useState } from 'react';
import { View, Text, ActivityIndicator, StyleSheet } from 'react-native';
import { useQuery, gql } from '@apollo/client';
// import { ScrollView } from 'react-native-gesture-handler';

const CountryQuery = gql`
  query CountryQuery {
    countries {
      name
      capital
      currency
    }
  }
`;

const CountryInfo = () => {
  const { data, loading } = useQuery(CountryQuery);
  const [countries, setCountries] = useState([]);

  useEffect(() => {
    if (data) {
      setCountries(data.countries);
    }
  }, [data]);

  if (loading) return <ActivityIndicator />;
  if (!countries || countries.length === 0) return <Text>No countries found.</Text>;

  return (
    <View contentContainerStyle={styles.container}>
      {countries.map((country, index) => (
        <View key={index} style={styles.countryContainer}>
          <Text style={styles.heading}>Country Name:</Text>
          <Text style={styles.text}>{country.name}</Text>
          <Text style={styles.heading}>Capital:</Text>
          <Text style={styles.text}>{country.capital}</Text>
          <Text style={styles.heading}>Currency:</Text>
          <Text style={styles.text}>{country.currency}</Text>
        </View>
      ))}
    </View>
    
  );
};

const styles = StyleSheet.create({
  container: {
    padding: 20,
  },
  countryContainer: {
    borderWidth: 1,
    borderColor: '#ccc',
    borderRadius: 5,
    padding: 10,
    marginBottom: 10,
  },
  heading: {
    fontSize: 16,
    fontWeight: 'bold',
    marginBottom: 5,
  },
  text: {
    fontSize: 16,
  },
});

export default CountryInfo;