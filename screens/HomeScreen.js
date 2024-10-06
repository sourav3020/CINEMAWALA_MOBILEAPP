import React, { Component } from "react";
import { View, Text, StatusBar, TextInput, TouchableOpacity, ScrollView, Image, ActivityIndicator, Alert } from "react-native";

// Constants
const BASE_URL = "https://api.themoviedb.org/3/";
const API_KEY = "api_key=151dfa1b4c6a83a02970c0c6612615b3";
const IMAGE_URL = "http://image.tmdb.org/t/p/w185";
const PLACEHOLDER_IMAGE = "https://s3-ap-southeast-1.amazonaws.com/popcornsg/placeholder-movieimage.png";
const PLACEHOLDER = "Enter movie title...";
const SEARCH_BUTTON = "Search";
const NO_DATA_MSG = "No data found.";
const MOVIES_PER_PAGE = 3; // Movies per page

// Styles
const styles = {
  container: { flex: 1, padding: 10, backgroundColor: '#f0f0f0' },
  cardView: { padding: 10, backgroundColor: '#fff', borderRadius: 8, marginBottom: 10 },
  input: { borderBottomWidth: 1, borderColor: '#ccc', padding: 8 },
  buttonContainer: { backgroundColor: '#02ADAD', padding: 10, borderRadius: 5, marginTop: 10 },
  buttonText: { color: '#fff', textAlign: 'center', fontSize: 16 },
  movieList: { marginTop: 10 },
  movieItem: { flexDirection: 'row', marginBottom: 10 },
  movieImage: { width: 100, height: 150, marginRight: 10 },
  movieDetails: { flex: 1 },
  movieTitle: { fontSize: 16, fontWeight: 'bold' },
  movieText: { color: '#555' },
  pagination: { flexDirection: 'row', justifyContent: 'space-between', marginTop: 20 },
  paginationButton: { backgroundColor: '#02ADAD', padding: 10, borderRadius: 5 },
  paginationButtonText: { color: '#fff', fontSize: 14 },
};

// Fetching helper function
const callRemoteMethod = async (endpoint, callback) => {
  try {
    const response = await fetch(endpoint);
    const responseJson = await response.json();
    callback(responseJson);
  } catch (error) {
    Alert.alert("Error", error.message);
  }
};

class HomeScreen extends Component {
  state = {
    movieList: [],
    searchText: "",
    isLoading: false,
    noData: false,
    currentPage: 1, // Track the current page
  };

  searchMovies = () => {
    const { searchText } = this.state;
    if (searchText.length) {
      const endpoint = `${BASE_URL}search/movie?query=${searchText}&${API_KEY}`;
      this.setState({ isLoading: true });
      callRemoteMethod(endpoint, this.searchCallback);
    } else {
      Alert.alert("Validation", "Search field is required.");
    }
  };

  searchCallback = (response) => {
    if (response.results && response.results.length) {
      this.setState({ movieList: response.results, noData: false, isLoading: false, currentPage: 1 });
    } else {
      this.setState({ movieList: [], noData: true, isLoading: false });
    }
  };

  // Handle Previous and Next pagination
  handlePagination = (direction) => {
    const { currentPage, movieList } = this.state;
    const totalPages = Math.ceil(movieList.length / MOVIES_PER_PAGE);

    if (direction === "next" && currentPage < totalPages) {
      this.setState({ currentPage: currentPage + 1 });
    } else if (direction === "prev" && currentPage > 1) {
      this.setState({ currentPage: currentPage - 1 });
    }
  };

  goToDetails = (movie) => {
    this.props.navigation.navigate("MovieDetail", { movie });
  };

  render() {
    const { movieList, isLoading, noData, currentPage } = this.state;
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
            onChangeText={(text) => this.setState({ searchText: text })}
          />
          <TouchableOpacity style={styles.buttonContainer} onPress={this.searchMovies}>
            <Text style={styles.buttonText}>{SEARCH_BUTTON}</Text>
          </TouchableOpacity>
        </View>

        {isLoading && <ActivityIndicator size="large" color="#02ADAD" />}

        {noData && <Text style={{ textAlign: 'center' }}>{NO_DATA_MSG}</Text>}

        <ScrollView style={styles.movieList}>
          {paginatedMovies.map((movie, index) => (
            <TouchableOpacity key={index} onPress={() => this.goToDetails(movie)} style={styles.movieItem}>
              <Image
                source={{
                  uri: movie.poster_path
                    ? `${IMAGE_URL}${movie.poster_path}`
                    : PLACEHOLDER_IMAGE,
                }}
                style={styles.movieImage}
              />
              <View style={styles.movieDetails}>
                <Text style={styles.movieTitle}>{movie.original_title}</Text>
                <Text style={styles.movieText}>Release Date: {movie.release_date}</Text>
                <Text style={styles.movieText}>Language: {movie.original_language}</Text>
                <Text style={styles.movieText}>Popularity: {movie.popularity} %</Text>
              </View>
            </TouchableOpacity>
          ))}
        </ScrollView>

        {movieList.length > MOVIES_PER_PAGE && (
          <View style={styles.pagination}>
            <TouchableOpacity
              style={styles.paginationButton}
              onPress={() => this.handlePagination("prev")}
              disabled={currentPage === 1}
            >
              <Text style={styles.paginationButtonText}>Previous</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={styles.paginationButton}
              onPress={() => this.handlePagination("next")}
              disabled={currentPage === totalPages}
            >
              <Text style={styles.paginationButtonText}>Next</Text>
            </TouchableOpacity>
          </View>
        )}
      </View>
    );
  }
}

export default HomeScreen;
