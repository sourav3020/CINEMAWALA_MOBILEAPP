import React, {useRef, useEffect, useState } from 'react';
import { View, Text, ScrollView, StyleSheet, Dimensions, Linking, TouchableOpacity, TextInput, Button, Alert } from 'react-native';
import { WebView } from 'react-native-webview';
import MapView, { Marker } from 'react-native-maps';
import { FontAwesome } from '@expo/vector-icons'; 
import firebase from 'firebase/app';
import { auth, firestore } from '../config';
import { collection, doc, serverTimestamp, setDoc, getDocs, query, orderBy, limit, aggregate, addDoc, where, updateDoc } from 'firebase/firestore';
import 'firebase/auth';
import { getAuth } from 'firebase/auth';
import * as Location from 'expo-location'; 
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Image } from 'react-native';
import { gsap, Back } from 'gsap-rn';
import { Ionicons } from '@expo/vector-icons';
import moment from 'moment';


const AboutUs = () => {
  const [user, setuser] = useState({})
  const [rating, setRating] = useState(0);
  const [reviewText, setReviewText] = useState('');
  const [reviews, setReviews] = useState([]);
  const [averageRating, setAverageRating] = useState(0);
  const [totalRatings, setTotalRatings] = useState(0);
  const [totalRatingUsers, setTotalRatingUsers] = useState(0);
  const [userLocation, setUserLocation] = useState(null); 
  const [userAlreadyReviewed, setuserAlreadyReviewed] = useState(false)
  const [userReviewDoc, setuserReviewDoc] = useState('')
  const viewRef = useRef(null);


  const fetchRatingsAndReviews = async () => {
    try {
      
      const reviewsSnapshot = await getDocs(query(collection(firestore, 'reviews'), orderBy('timestamp', 'desc')));

      const reviewsData = reviewsSnapshot.docs.map(doc => {
        const newDoc = doc.data()
        newDoc.id = doc.id
        return newDoc
      });
      
      let totalRatings = 0;
      reviewsData.forEach((item) => {
        totalRatings += item.rating;
        if(item.userId==user.userRef){
          setuserAlreadyReviewed(true)
          setRating(item.rating)
          setReviewText(item.reviewText)
          setuserReviewDoc(item.id)
        }
      });
      const averageRating = reviewsData.length > 0 ?( totalRatings / reviewsData.length) : 0;

      // Update state
      setReviews(reviewsData);
      setTotalRatings(totalRatings);
      setAverageRating(averageRating);
      setTotalRatingUsers(reviewsData.length)
    } catch (error) {
      console.error('Error fetching reviews:', error);
    }
  };

  useEffect(() => {

    fetchRatingsAndReviews();

    (async () => {
      let { status } = await Location.requestForegroundPermissionsAsync();
      if (status !== 'granted') {
        console.error('Permission to access location was denied');
        return;
      }

      let location = await Location.getCurrentPositionAsync({});
      setUserLocation(location.coords);
    })();
  }, []);


  const reviewedStar = (star)=>{
    const starTag = []
    for(let i=0;i<star;i++){
      starTag.push(i+1)
    }
    return starTag

  }

  const openLink = (url) => {
    Linking.openURL(url);
  };

  useEffect(() => {
    const getUser = async () => {
      const userData = await AsyncStorage.getItem('userData');
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
            setuser(loggedUserInfo)
          }
        );
      }
    }
    getUser()
  }, [])

  useEffect(() => {
    fetchRatingsAndReviews()
  }, [user])
  
  

  const submitRatingAndReview = async () => {
    try {
      const review = {
        userId: user.userRef,
        userName: user.userName,
        rating: rating,
        reviewText,
        timestamp: new Date(),
      };
      const reviewColRef = collection(firestore,'reviews')
      if(!userAlreadyReviewed){
        const docRef = await addDoc(reviewColRef,review);
        Alert.alert('Thank you for your review and rating!');
      }
      else{
        const updatedDoc = await updateDoc(doc(firestore,'reviews',userReviewDoc), review)
        Alert.alert("Thank you. Your Review has been updated!")
      }
      fetchRatingsAndReviews();
    } catch (error) {
      console.error('Error submitting review and rating:', error);
      Alert.alert('Error submitting review and rating. Please try again later.');
    }
  };
  useEffect(() => {
    const view = viewRef.current;
    gsap.to(view, { duration: 1, transform: { rotate: 360, scale: 1 }, ease: Back.easeInOut });
  }, []);

  return (
    <View style={styles.container}>
      <ScrollView style={{ backgroundColor: '#fff', height: '100%' }} showsVerticalScrollIndicator={false}>
        <Image
           ref={viewRef}
          style={styles.logo}
          source={require('../assets/L2.png')}
        />
        <Text style={styles.heading}>Cinemawala </Text>

          {/* Display Introduction */}
          <Text style={styles.subHeading}>About Us</Text>
        <Text style={styles.paragraph}>
        Cinemawala is your go-to app for honest and insightful movie reviews. We help you discover the best films, powered by a community of passionate movie lovers.
        </Text>

           {/* Display Contact Information */}
           <Text style={styles.subHeading}>Contact Information</Text>
        <Text style={styles.paragraph}>
          Email: souravtalukdar2017@gmail.com{'\n'}
          Phone: +8801866320055{'\n'}
          Address:Chittagong University, Chittagong, Bangladesh.
        </Text>


        

        {/* Display Location on Map */}
        <View style={styles.mapContainer}>
          <Text style={styles.subHeading}>Location</Text>
          {userLocation && (
            <MapView
              style={styles.map}
              region={{
                latitude: userLocation.latitude,
                longitude: userLocation.longitude,
                latitudeDelta: 0.05,
                longitudeDelta: 0.05,
              }}
            >
              <Marker
                coordinate={{ latitude: userLocation.latitude, longitude: userLocation.longitude }}
                title="Current Location"
              />
            </MapView>
          )}
        </View>
        {/* Display YouTube Video */}
        <View style={styles.videoContainer}>
          <Text style={styles.subHeading}>YouTube Video</Text>
          <WebView
            style={styles.video}
            javaScriptEnabled={true}
            source={{ uri: 'https://youtu.be/EX4ETsGcOKc?si=JGp-5H-aluIlO6zv' }}
          />
        </View>

      

     

        {/* Display FAQs */}
        {/* <Text style={styles.subHeading}>FAQs</Text>
        <Text style={styles.paragraph}>
          Q: What is PetEmote?{'\n'}
          A: PetEmote is a revolutionary app that helps you understand your pet's emotions better.
        </Text> */}

        {/* Display Ratings and Reviews */}
        {/* <View style={styles.ratingContainer}>
          <Text style={styles.subHeading}>Ratings</Text>
          <Text>Total Rating Users: {totalRatingUsers}</Text>
          <Text>Total Ratings: {totalRatings}</Text>
          
          <Text>Average Rating: {averageRating.toFixed(2)}</Text>

        </View> */}

        {/* Leave a Review */}
        <View style={styles.reviewContainer}>
          <Text style={styles.subHeading}>Leave a Review</Text>
          <View style={styles.starsContainer}>
            {[1, 2, 3, 4, 5].map((star, index) => (
              <TouchableOpacity 
                key={index} 
                onPress={() => setRating(star)}
              >
                <FontAwesome
                  name={star <= rating ? "star" : "star-o"}
                  size={40}
                  color={star <= rating ? "#FFD700" : "#ccc"}
                  style={styles.starIcon}
                />
              </TouchableOpacity>
            ))}
          </View>
          <TextInput
            style={styles.reviewInput}
            placeholder="Write your review here..."
            value={reviewText}
            onChangeText={text => setReviewText(text)}
            multiline
          />
          <Button title={(userAlreadyReviewed ?"Update " : "Submit ") + "Rating & Review"} onPress={submitRatingAndReview} />
        </View>

        {/* Display existing reviews */}
        <View style={styles.reviewsContainer}>
          <Text style={styles.subHeading}>User Reviews</Text>
          {}
          {reviews.map((review, index) => {
            if(index>2) return;
            return (
            <View key={index} style={styles.reviewItem}>
              <Text style={[styles.reviewRating, {fontSize:18,color:'red'}]}>{review.userName}</Text>
              {/* <Text style={styles.reviewRating}>{`${review.rating} stars`}</Text> */}
              <View style={[styles.starsContainer]}>
                {reviewedStar(review.rating).map((item)=> ( <FontAwesome key={item} name={"star"} size={15} color={"#FFD700"} style={{marginRight:2}} />))}
                {reviewedStar(5-review.rating).map((item)=> ( <FontAwesome key={item} name={"star-o"} size={15} color={"#FFD700"} style={{marginRight:2}} />))}
                </View>
              <Text style={styles.reviewText}>{review.reviewText}</Text>
            </View>
          )})}
        </View>
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  
  logo: {
    alignSelf: 'center',
    height: 150,
    width: 200,
    marginBottom: 20,
    marginTop: 30
  },
  container: {
    flex: 1,
    backgroundColor: '#f9f9f9', // Softer background
    paddingHorizontal: 20,
  },
  
  heading: {
    fontSize: 28,
    fontWeight: 'bold',
    marginBottom: 15,
    color: '#09d3ed', // Darker, neutral color
    paddingTop: 30,
    textAlign: 'center', // Center the heading
  },
  subHeading: {
    fontSize: 20,
    fontWeight: '600',
    marginVertical: 15,
    color: '#2c3e50',
    textAlign: 'left',
  },
  paragraph: {
    fontSize: 16,
    marginBottom: 20,
    lineHeight: 22, // Better readability with line height
    color: '#7f8c8d',
  },
  mapContainer: {
    backgroundColor: '#fff',
    marginVertical: 20,
    padding: 15,
    borderColor: '#dfe6e9', // Light border for clarity
    borderRadius: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 5,
  },
  map: {
    height: 200,
    borderRadius: 12,
  },
  videoContainer: {
    marginBottom: 25,
    backgroundColor: '#fff',
    padding: 10,
    borderRadius: 10,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 4,
  },
  video: {
    height: 200,
    borderRadius: 10,
    overflow: 'hidden', // Smooth edges for the video
    width: '100%', // Ensure the video takes up full width
  },
  starsContainer: {
    flexDirection: 'row',
    marginVertical: 10,
    justifyContent: 'center', // Center the stars
  },
  starIcon: {
    marginHorizontal: 3,
  },
  reviewContainer: {
    marginTop: 20,
    alignItems: 'center',
    backgroundColor: '#fff',
    padding: 15,
    borderRadius: 10,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 4,
  },
  reviewInput: {
    height: 100,
    borderColor: '#dfe6e9',
    borderWidth: 1,
    borderRadius: 10, // Rounder input box
    padding: 10,
    textAlignVertical: 'top',
    width: '100%',
    backgroundColor: '#fff', // Background for input
  },
  reviewsContainer: {
    marginTop: 20,
    backgroundColor: '#fff',
    padding: 15,
    borderRadius: 10,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 4,
  },
  reviewItem: {
    marginBottom: 15,
    borderBottomWidth: 1,
    borderBottomColor: '#dfe6e9',
    paddingBottom: 10,
  },
  reviewRating: {
    fontSize: 16,
    fontWeight: 'bold',
    marginBottom: 5,
    color: '#e74c3c', // Red to highlight user names
  },
  reviewText: {
    fontSize: 14,
    color: '#2c3e50', // Darker text for clarity
    lineHeight: 20, // Better readability for reviews
  },
});















export default AboutUs;
