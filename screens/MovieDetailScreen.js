import React, { useEffect, useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, Alert, FlatList, Image, StyleSheet } from 'react-native';
import { firestore } from '../config'; // Ensure you import firestore
import { collection, query, where, getDocs, setDoc, doc, getDoc, updateDoc } from 'firebase/firestore';
import AsyncStorage from '@react-native-async-storage/async-storage';

const IMAGE_URL = "http://image.tmdb.org/t/p/w185";
const PLACEHOLDER_IMAGE = "https://s3-ap-southeast-1.amazonaws.com/popcornsg/placeholder-movieimage.png";

const MovieDetailScreen = ({ route }) => {
    const { movie } = route.params; // Get movie data from route params

    const [reviewText, setReviewText] = useState('');
    const [reviews, setReviews] = useState([]);
    const [userName, setUserName] = useState('');
    const [likes, setLikes] = useState(0);
    const [dislikes, setDislikes] = useState(0);
    const [userReaction, setUserReaction] = useState(null); // Track user's reaction
    const [user, setuser] = useState({})

    useEffect(() => {
        fetchReviews(movie.id);
        fetchLikesDislikes(movie.id); // Fetch initial like/dislike counts
    }, [movie.id]);

    useEffect(() => {
        const getUser = async () => {
          const userData = await AsyncStorage.getItem('userData');
          console.log(userData)
          setUserName(userData.userName)
          return;
          if(userData){
            const user = JSON.parse(userData);
            setuser(user)
          }
          else{
            const usersRef = collection(firestore, "users");
            const q = query(usersRef, where("email", "==", auth.currentUser.email));
            const querySnapshot = await getDocs(q);
            querySnapshot.forEach((doc) => {
                const userData = doc.data();
                // console.log(userData)
                const { userName, user_id, email, dp_url } = userData;
                const loggedUserInfo = {
                    userRef: user_id,
                    userEmail: email,
                    userName: userName,
                      userProfilePic: dp_url
                };
                setUserName(userName)
              }
            );
          }
        }
        getUser()
      }, [])
    
      useEffect(() => {
       // fetchRatingsAndReviews()
      }, [user])

    const fetchReviews = async (movieId) => {
        try {
            const reviewsRef = collection(firestore, 'mreviews');
            const q = query(reviewsRef, where('movieId', '==', movieId));
            const querySnapshot = await getDocs(q);
            const fetchedReviews = querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
            setReviews(fetchedReviews);
        } catch (error) {
            console.error("Error fetching reviews: ", error);
        }
    };

    const fetchLikesDislikes = async (movieId) => {
        try {
            const movieDocRef = doc(firestore, 'movies', movieId.toString());
            const movieDoc = await getDoc(movieDocRef);

            if (movieDoc.exists()) {
                const movieData = movieDoc.data();
                setLikes(movieData.likes || 0);
                setDislikes(movieData.dislikes || 0);
            }
        } catch (error) {
            console.error("Error fetching likes/dislikes: ", error);
        }
    };

    const postReview = async () => {
        if (reviewText.length) {
            try {
                const movieDocRef = doc(firestore, 'movies', movie.id.toString());
                const movieDoc = await getDoc(movieDocRef);

                if (!movieDoc.exists()) {
                    const movieData = {
                        id: movie.id,
                        title: movie.original_title,
                        release_date: movie.release_date,
                        overview: movie.overview,
                        poster_path: movie.poster_path,
                        likes: 0, // Initialize likes
                        dislikes: 0, // Initialize dislikes
                    };
                    await setDoc(movieDocRef, movieData);
                }

                const reviewDocId = `${movie.id}_${Date.now()}`;
                const userDataString = await AsyncStorage.getItem('userData');
                console.log(userDataString); // Logs the raw string
                
                // Parse the userData to get the userName
                let userName;
                if (userDataString) {
                    const userData = JSON.parse(userDataString); // Parse the JSON string
                    userName = userData.userName; // Access the userName property
                    console.log('Fetched userData:', userData); // Log the entire userData object
                } else {
                    console.log('No user data found in AsyncStorage');
                }
                
                // Create reviewData with the fetched userName
                const reviewData = {
                    movieId: movie.id,
                    review: reviewText,
                    userName: userName, // Use the userName from the parsed userData
                    timestamp: new Date().toISOString(),
                };
                

                console.log(reviewData)

                await setDoc(doc(firestore, 'mreviews', reviewDocId), reviewData);
                
                Alert.alert('Review Posted', `Your review: "${reviewText}"`);
                setReviewText('');
                fetchReviews(movie.id);
            } catch (error) {
                console.error("Error posting review: ", error);
                Alert.alert('Error', 'Failed to post review. Please try again later.');
            }
        } else {
            Alert.alert('Error', 'Please write a review before posting.');
        }
    };

    const handleLike = async () => {
        try {
            const movieDocRef = doc(firestore, 'movies', movie.id.toString());

            if (userReaction === 'like') {
                Alert.alert('You already liked this movie');
                return;
            } else if (userReaction === 'dislike') {
                await updateDoc(movieDocRef, {
                    dislikes: dislikes - 1,
                    likes: likes + 1,
                });
                setUserReaction('like');
                setLikes(likes + 1);
                setDislikes(dislikes - 1);
            } else {
                await updateDoc(movieDocRef, {
                    likes: likes + 1,
                });
                setUserReaction('like');
                setLikes(likes + 1);
            }
        } catch (error) {
            console.error("Error liking the movie: ", error);
        }
    };

    const handleDislike = async () => {
        try {
            const movieDocRef = doc(firestore, 'movies', movie.id.toString());

            if (userReaction === 'dislike') {
                Alert.alert('You already disliked this movie');
                return;
            } else if (userReaction === 'like') {
                await updateDoc(movieDocRef, {
                    likes: likes - 1,
                    dislikes: dislikes + 1,
                });
                setUserReaction('dislike');
                setLikes(likes - 1);
                setDislikes(dislikes + 1);
            } else {
                await updateDoc(movieDocRef, {
                    dislikes: dislikes + 1,
                });
                setUserReaction('dislike');
                setDislikes(dislikes + 1);
            }
        } catch (error) {
            console.error("Error disliking the movie: ", error);
        }
    };

    const renderReviewItem = ({ item }) => (
        <View style={styles.reviewItem}>
            <Text style={{ fontWeight: 'bold' }}>{item.userName}:</Text> 
            <Text>{item.review}</Text>
        </View>
    );

    return (
        <View style={styles.container}>
            <Image
                source={{
                    uri: movie.poster_path
                        ? `${IMAGE_URL}${movie.poster_path}`
                        : PLACEHOLDER_IMAGE,
                }}
                style={styles.movieImage}
            />
            <Text style={styles.text}>
                <Text style={{ fontWeight: 'bold' }}>Title:</Text> {movie.original_title}
            </Text>
            <Text style={styles.text}>
                <Text style={{ fontWeight: 'bold' }}>Release Date:</Text> {movie.release_date}
            </Text>
            <Text style={styles.text}>
                <Text style={{ fontWeight: 'bold' }}>Overview:</Text> {movie.overview}
            </Text>

            {/* Like/Dislike Buttons */}
            <View style={styles.likeButton}>
                <TouchableOpacity onPress={handleLike}>
                    <Text style={styles.buttonText}>👍 Like</Text>
                </TouchableOpacity>
                <Text style={styles.likeText}>{likes}</Text>
            </View>
            <View style={styles.likeButton}>
                <TouchableOpacity onPress={handleDislike}>
                    <Text style={styles.buttonText}>👎 Dislike</Text>
                </TouchableOpacity>
                <Text style={styles.likeText}>{dislikes}</Text>
            </View>

            <TextInput
                style={styles.input}
                placeholder="Write your review here..."
                value={reviewText}
                onChangeText={setReviewText}
                multiline
            />
            <TouchableOpacity style={styles.buttonContainer} onPress={postReview}>
                <Text style={styles.buttonText}>Post Review</Text>
            </TouchableOpacity>

            <Text style={{ fontWeight: 'bold', marginTop: 20 }}>
                Username: {userName || 'Guest'}
            </Text>

            <Text style={{ fontWeight: 'bold', marginTop: 20 }}>Reviews:</Text>
            <FlatList
                data={reviews}
                renderItem={renderReviewItem}
                keyExtractor={(item) => item.id}
                style={{ marginTop: 10 }}
            />
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        padding: 20,
        backgroundColor: '#f0f0f0',
    },
    movieImage: {
        width: '100%',
        height: 300,
        resizeMode: 'cover',
    },
    text: {
        fontSize: 16,
        marginVertical: 5,
    },
    input: {
        height: 100,
        borderColor: 'gray',
        borderWidth: 1,
        marginVertical: 10,
        padding: 10,
        textAlignVertical: 'top',
    },
    buttonContainer: {
        backgroundColor: '#02ADAD',
        padding: 10,
        borderRadius: 5,
        alignItems: 'center',
    },
    buttonText: {
        color: '#fff',
        fontWeight: 'bold',
    },
    likeButton: {
        flexDirection: 'row',
        alignItems: 'center',
        marginVertical: 5,
    },
    likeText: {
        marginLeft: 10,
    },
    reviewItem: {
        marginVertical: 5,
        padding: 10,
        backgroundColor: '#fff',
        borderRadius: 5,
    },
});

export default MovieDetailScreen;
