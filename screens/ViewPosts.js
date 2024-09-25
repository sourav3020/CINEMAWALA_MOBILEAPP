
import React, { useState } from 'react';
import { View, Text, TouchableOpacity, StyleSheet ,Image} from 'react-native';
import Icon from 'react-native-vector-icons/FontAwesome';

const ViewPosts = ({ navigation }) => {
  const [likes, setLikes] = useState({});
  const [dislikes, setDislikes] = useState({});
  
  const posts = [
    {
      id: 1,
      username: 'Shanewaz',
      title: 'Cute Puppy',
      image: 'image', 
      desc: 'status' },
    
    {
      id: 2,
      username: 'Aurnob',
      title: 'Cute Dog',
      image: 'image', 
      desc: 'status '
    },
    
  ];

  const handleLike = (postId) => {
    setLikes((prevLikes) => ({ ...prevLikes, [postId]: (prevLikes[postId] || 0) + 1 }));
  };

  const handleDislike = (postId) => {
    setDislikes((prevDislikes) => ({ ...prevDislikes, [postId]: (prevDislikes[postId] || 0) + 1 }));
  };

  const handleViewPostDetail = (post) => {
    
    navigation.navigate('PostDetail', { post });
  };

  return (
    <View style={styles.container}>
      {posts.map((post) => (
        <TouchableOpacity
          key={post.id}
          style={styles.postCard}
          onPress={() => handleViewPostDetail(post)}>
          <View style={styles.header}>
            <Text style={styles.username}>{post.username}</Text>
          </View>
            <Image style={styles.img} source={require('../assets/icon.png')}/>
          <Text style={styles.postTitle}>{post.desc}</Text>
          

          <View style={styles.iconContainer}>
            <TouchableOpacity onPress={() => handleLike(post.id)}>
              <Icon name="thumbs-up" style={styles.icon} />
            </TouchableOpacity>
            <Text style={styles.iconText}>{likes[post.id] || 0}</Text>

            <TouchableOpacity onPress={() => handleDislike(post.id)}>
              <Icon name="thumbs-down" style={styles.icon} />
            </TouchableOpacity>
            <Text style={styles.iconText}>{dislikes[post.id] || 0}</Text>
          </View>
        </TouchableOpacity>
      ))}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#1D2B53',
    padding: 20,
  },
  postCard: {
    backgroundColor: 'white',
    borderRadius: 10,
    marginBottom: 20,
    overflow: 'hidden',
    width: '100%',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 10,
  },
  img:{
      width: 400,
      height: 150,
  },
  username: {
    fontSize: 16,
    fontWeight: 'bold',
    color: 'black',
  },
  postTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    padding: 10,
    color: 'black',
  },
  postImage: {
    
    fontSize: 16,
    padding: 10,
    color: 'black',
  },
  iconContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 10,
  },
  icon: {
    fontSize: 30,
    color: 'black',
  },
  iconText: {
    marginLeft: 5,
    color: 'black',
  },
});

export default ViewPosts;
