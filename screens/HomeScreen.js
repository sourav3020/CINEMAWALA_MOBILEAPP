import React, { useState, useEffect, useCallback } from "react";
import { View, Text, StatusBar, TextInput, TouchableOpacity, Image, ActivityIndicator, Alert, StyleSheet, FlatList } from "react-native";


const BASE_URL = "https://api.themoviedb.org/3/";
const API_KEY = "api_key=151dfa1b4c6a83a02970c0c6612615b3";
const IMAGE_URL = "http://image.tmdb.org/t/p/w185";
const PLACEHOLDER_IMAGE = "https://s3-ap-southeast-1.amazonaws.com/popcornsg/placeholder-movieimage.png";
const PLACEHOLDER = "Enter movie title...";
const SEARCH_BUTTON = "Search";
const NO_DATA_MSG = "No data found.";
const MOVIES_PER_PAGE = 5;
const DEBOUNCE_DELAY = 500; 



const callRemoteMethod = async (endpoint, callback) => {
  try {
    const response = await fetch(endpoint);
    const responseJson = await response.json();
    callback(responseJson);
  } catch (error) {
    Alert.alert("Error", error.message);
  }
};

const debounce = (func, delay) => {
  let timeoutId;
  return (...args) => {
    if (timeoutId) {
      clearTimeout(timeoutId);
    }
    timeoutId = setTimeout(() => {
      func(...args);
    }, delay);
  };
};

const HomeScreen = ({ navigation }) => {
  const [movieList, setMovieList] = useState([]);
  const [searchText, setSearchText] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [noData, setNoData] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);

   //defult page
  useEffect(() => { 
    const defaultEndpoint = `${BASE_URL}movie/popular?${API_KEY}`;
    setIsLoading(true);
    callRemoteMethod(defaultEndpoint, defaultMoviesCallback);
  }, []);

  const defaultMoviesCallback = (response) => {
    if (response.results && response.results.length) {
      setMovieList(response.results);
      setNoData(false);
      setIsLoading(false);
    } else {
      setMovieList([]);
      setNoData(true);
      setIsLoading(false);
    }
  };

  const searchMovies = () => {
    if (searchText.length) {
      const endpoint = `${BASE_URL}search/movie?query=${searchText}&${API_KEY}`;
      setIsLoading(true);
      callRemoteMethod(endpoint, searchCallback);
    } else {
      const defaultEndpoint = `${BASE_URL}movie/popular?${API_KEY}`;
      setIsLoading(true);
      callRemoteMethod(defaultEndpoint, defaultMoviesCallback);
    }
  };

  const searchCallback = (response) => {
    if (response.results && response.results.length) {
      setMovieList(response.results);
      setNoData(false);
      setIsLoading(false);
      setCurrentPage(1);
    } else {
      setMovieList([]);
      setNoData(true);
      setIsLoading(false);
    }
  };

  
  const debouncedSearch = useCallback(
    debounce(() => {
      searchMovies();
    }, DEBOUNCE_DELAY),
    [searchText]
  );

  const handlePagination = (direction) => {
    const totalPages = Math.ceil(movieList.length / MOVIES_PER_PAGE);
    if (direction === "next" && currentPage < totalPages) {
      setCurrentPage(currentPage + 1);
    } else if (direction === "prev" && currentPage > 1) {
      setCurrentPage(currentPage - 1);
    }
  };

  const goToDetails = (movie) => {
    navigation.navigate("MovieDetail", { movie });
  };

  const renderMovieItem = ({ item }) => (
    <TouchableOpacity onPress={() => goToDetails(item)} style={styles.movieItem}>
      <Image
        source={{
          uri: item.poster_path ? `${IMAGE_URL}${item.poster_path}` : PLACEHOLDER_IMAGE,
        }}
        style={styles.movieImage}
      />
      <View style={styles.movieDetails}>
        <Text style={styles.movieTitle}>{item.original_title}</Text>
        <Text style={styles.movieText}>Release Date: {item.release_date}</Text>
        <Text style={styles.movieText}>Language: {item.original_language}</Text>
        <Text style={styles.movieText}>Popularity: {item.popularity} %</Text>
      </View>
    </TouchableOpacity>
  );

  const startIndex = (currentPage - 1) * MOVIES_PER_PAGE;
  const paginatedMovies = movieList.slice(startIndex, startIndex + MOVIES_PER_PAGE);
  const totalPages = Math.ceil(movieList.length / MOVIES_PER_PAGE);

  return (
    <View style={styles.container}>
      <StatusBar backgroundColor="#02ADAD" barStyle="light-content" />

      <View style={styles.cardView}>
        <TextInput
          style={styles.input}
          placeholder={PLACEHOLDER}
          onChangeText={(text) => {
            setSearchText(text);
            debouncedSearch(); // Trigger the debounced search
          }}
          value={searchText}
        />
      </View>

      {isLoading && <ActivityIndicator size="large" color="#02ADAD" />}

      {noData && <Text style={{ textAlign: 'center' }}>{NO_DATA_MSG}</Text>}

      <FlatList
        data={paginatedMovies}
        renderItem={renderMovieItem}
        keyExtractor={(item, index) => index.toString()}
        style={styles.movieList}
      />

      {movieList.length > MOVIES_PER_PAGE && (
        <View style={styles.pagination}>
          <TouchableOpacity
            style={styles.paginationButton}
            onPress={() => handlePagination("prev")}
            disabled={currentPage === 1}
          >
            <Text style={styles.paginationButtonText}>Previous</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={styles.paginationButton}
            onPress={() => handlePagination("next")}
            disabled={currentPage === totalPages}
          >
            <Text style={styles.paginationButtonText}>Next</Text>
          </TouchableOpacity>
        </View>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#fff" },
  cardView: { flexDirection: "row", padding: 10 },
  input: { flex: 1, borderColor: "#ccc", borderWidth: 1, padding: 10, borderRadius: 5 },
  movieList: { paddingHorizontal: 10, marginTop: 10 },
  movieItem: { flexDirection: "row", marginBottom: 15 },
  movieImage: { width: 100, height: 150 },
  movieDetails: { marginLeft: 10, flex: 1 },
  movieTitle: { fontWeight: "bold", fontSize: 16 },
  movieText: { fontSize: 14, color: "#666" },
  pagination: { flexDirection: "row", justifyContent: "space-between", padding: 20 },
  paginationButton: { padding: 10, backgroundColor: "#02ADAD", borderRadius: 5 },
  paginationButtonText: { color: "#fff" },
});

export default HomeScreen;
