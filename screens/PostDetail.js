
// import React, { useState } from 'react';
// import { View, Text, TouchableOpacity, StyleSheet, Image, TextInput } from 'react-native';
// import Icon from 'react-native-vector-icons/FontAwesome';

// const PostDetail = ({ route }) => {
//   const { post } = route.params;
//   const [liked, setLiked] = useState(false);
//   const [comment, setComment] = useState('');
//   const [comments, setComments] = useState([]);

//   const handleLike = () => {
//     setLiked(!liked);
//   };

//   const handleComment = () => {
//     if (comment.trim() !== '') {
//       setComments([...comments, comment]);
//       setComment('');
//     }
//   };

//   return (
//     <View style={styles.container}>
//       <Image source={{ uri: post.image }} style={styles.postImage} />
//       <Text style={styles.postTitle}>{post.title}</Text>

//       <View style={styles.iconContainer}>
//         <TouchableOpacity style={styles.iconButton} onPress={handleLike}>
//           <Icon name={liked ? 'thumbs-up' : 'thumbs-o-up'} style={[styles.icon, liked && styles.likedIcon]} />
//           <Text style={styles.iconText}>{liked ? 'Liked' : 'Like'}</Text>
//         </TouchableOpacity>

//         <TouchableOpacity style={styles.iconButton} onPress={handleComment}>
//           <Icon name="comment-o" style={styles.icon} />
//           <Text style={styles.iconText}>Comment</Text>
//         </TouchableOpacity>
//       </View>

//       <Text style={styles.commentsHeading}>Comments:</Text>
//       {comments.map((comment, index) => (
//         <Text key={index} style={styles.commentText}>{comment}</Text>
//       ))}

//       <TextInput
//         style={styles.commentInput}
//         placeholder="Add a comment..."
//         value={comment}
//         onChangeText={(text) => setComment(text)}
//       />

//       <TouchableOpacity style={styles.commentButton} onPress={handleComment}>
//         <Text style={styles.commentButtonText}>Post Comment</Text>
//       </TouchableOpacity>
//     </View>
//   );
// };