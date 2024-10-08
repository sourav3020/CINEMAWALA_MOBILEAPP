import React, { useEffect, useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, Alert, FlatList, Image, StyleSheet, ScrollView } from 'react-native';
import { firestore } from '../config'; // Ensure you import firestore
import { collection, query, where, getDocs, setDoc, doc, getDoc, updateDoc } from 'firebase/firestore';
import AsyncStorage from '@react-native-async-storage/async-storage';
import * as Animatable from 'react-native-animatable';

const IMAGE_URL = "http://image.tmdb.org/t/p/w185";
const PLACEHOLDER_IMAGE = "https://s3-ap-southeast-1.amazonaws.com/popcornsg/placeholder-movieimage.png";

const MovieDetailScreen = ({ route }) => {
    const { movie } = route.params;

    const [reviewText, setReviewText] = useState('');
    const [reviews, setReviews] = useState([]);
    const [userName, setUserName] = useState('');
    const [likes, setLikes] = useState(0);
    const [dislikes, setDislikes] = useState(0);
    const [userReaction, setUserReaction] = useState(null);

    useEffect(() => {
        fetchReviews(movie.id);
        fetchLikesDislikes(movie.id);
    }, [movie.id]);

    useEffect(() => {
        const getUser = async () => {
            const userDataString = await AsyncStorage.getItem('userData');
            if (userDataString) {
                const userData = JSON.parse(userDataString);
                setUserName(userData.userName);
            }
        };
        getUser();
    }, []);

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
                        likes: 0,
                        dislikes: 0,
                    };
                    await setDoc(movieDocRef, movieData);
                }

                const reviewDocId = `${movie.id}_${Date.now()}`;
                const userDataString = await AsyncStorage.getItem('userData');

                let userName;
                if (userDataString) {
                    const userData = JSON.parse(userDataString);
                    userName = userData.userName;
                }

                const reviewData = {
                    movieId: movie.id,
                    review: reviewText,
                    userName: userName,
                    timestamp: new Date().toISOString(),
                };

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

            const movieDoc = await getDoc(movieDocRef);
            if (!movieDoc.exists()) {
                const movieData = {
                    id: movie.id,
                    title: movie.original_title,
                    release_date: movie.release_date,
                    overview: movie.overview,
                    poster_path: movie.poster_path,
                    likes: 1,
                    dislikes: 0,
                };
                await setDoc(movieDocRef, movieData);
                setLikes(1);
                setUserReaction('like');
                return;
            }

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

            const movieDoc = await getDoc(movieDocRef);
            if (!movieDoc.exists()) {
                const movieData = {
                    id: movie.id,
                    title: movie.original_title,
                    release_date: movie.release_date,
                    overview: movie.overview,
                    poster_path: movie.poster_path,
                    likes: 0,
                    dislikes: 1,
                };
                await setDoc(movieDocRef, movieData);
                setDislikes(1);
                setUserReaction('dislike');
                return;
            }

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
        <Animatable.View animation="fadeInDown" duration={500} style={styles.reviewItem}>
            <Text style={{ fontWeight: 'bold' }}>{item.userName}:</Text>
            <Text>{item.review}</Text>
        </Animatable.View>
    );

    return (
        <ScrollView style={styles.container}>
            <Animatable.Image
                source={{
                    uri: movie.poster_path
                        ? `${IMAGE_URL}${movie.poster_path}`
                        : PLACEHOLDER_IMAGE,
                }}
                style={styles.movieImage}
                animation="fadeInDown"
                delay={500} duration={1000}
            />
            <Animatable.View animation="fadeInLeft" delay={500} duration={1000}>
                <Text style={styles.text}>
                    <Text style={{ fontWeight: 'bold' }}>Title:</Text> {movie.original_title}
                </Text>
                <Text style={styles.text}>
                    <Text style={{ fontWeight: 'bold' }}>Release Date:</Text> {movie.release_date}
                </Text>
                <Text style={styles.text}>
                    <Text style={{ fontWeight: 'bold' }}>Overview:</Text> {movie.overview}
                </Text>
            </Animatable.View>

            <Animatable.View animation="fadeIn" duration={500} style={styles.likeButton}>
                <TouchableOpacity onPress={handleLike}>
                    <Text style={styles.buttonText}>👍 Like</Text>
                </TouchableOpacity>
                <Text style={styles.likeText}>{likes}</Text>
            </Animatable.View>
            <Animatable.View animation="fadeIn" duration={500} style={styles.likeButton}>
                <TouchableOpacity onPress={handleDislike}>
                    <Text style={styles.buttonText}>👎 Dislike</Text>
                </TouchableOpacity>
                <Text style={styles.likeText}>{dislikes}</Text>
            </Animatable.View>

            <Animatable.View animation="fadeIn" duration={500}>
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
            </Animatable.View>

            <FlatList
                data={reviews}
                renderItem={renderReviewItem}
                keyExtractor={item => item.id}
                contentContainerStyle={styles.reviewList}
            />
        </ScrollView>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        padding: 10,
        backgroundColor: '#fff',
    },
    movieImage: {
        width: '100%',
        height: 450,
        borderRadius: 10,
        marginBottom: 10,
    },
    text: {
        fontSize: 16,
        marginVertical: 5,
    },
    likeButton: {
        flexDirection: 'row',
        alignItems: 'center',
        marginVertical: 10,
    },
    buttonText: {
        fontSize: 18,
        marginRight: 5,
    },
    likeText: {
        fontSize: 18,
        marginLeft: 5,
    },
    input: {
        borderWidth: 1,
        borderColor: '#ccc',
        borderRadius: 5,
        padding: 10,
        marginVertical: 10,
    },
    buttonContainer: {
        backgroundColor: '#007BFF',
        borderRadius: 5,
        padding: 10,
        alignItems: 'center',
    },
    reviewList: {
        paddingBottom: 20,
    },
    reviewItem: {
        padding: 10,
        borderBottomWidth: 1,
        borderBottomColor: '#ccc',
    },
});

export default MovieDetailScreen;
