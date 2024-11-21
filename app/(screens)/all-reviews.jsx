import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  FlatList,
  StyleSheet,
  TouchableOpacity,
} from 'react-native';
import { useLocalSearchParams } from 'expo-router';
import { collection, query, orderBy, onSnapshot, updateDoc, doc, arrayUnion, arrayRemove, increment } from 'firebase/firestore';
import { db } from '../../services/config';
import { Ionicons } from '@expo/vector-icons';
import { useGlobalContext } from '@/context/GlobalProvider';

const AllReviews = () => {
  const { id } = useLocalSearchParams(); // the location ID passed as a param
  const [reviews, setReviews] = useState([]);
  const { user } = useGlobalContext(); 
  useEffect(() => {
    const fetchReviews = () => {
      const reviewsQuery = query(
        collection(db, 'locations', id, 'reviews'),
        orderBy('overallRating','desc'),
        orderBy('timestamp', 'desc')
      );

      const unsubscribe = onSnapshot(reviewsQuery, (querySnapshot) => {
        const reviewsArray = querySnapshot.docs.map((doc) => ({
          id: doc.id,
          ...doc.data(),
        }));
        setReviews(reviewsArray);
      });

      return unsubscribe;
    };

    if (id) {
      fetchReviews();
    }
  }, [id]);

  const handleLikeToggle = async (reviewId, isLiked) => {
    const reviewRef = doc(db, 'locations', id, 'reviews', reviewId);
    const userId = user.userId;

    try {
      if (isLiked) {
        await updateDoc(reviewRef, {
          likedBy: arrayRemove(userId),
          likes: increment(-1),
        });
      } else {
        await updateDoc(reviewRef, {
          likedBy: arrayUnion(userId),
          likes: increment(1),
        });
      }
    } catch (error) {
      console.log('Error toggling like: ', error);
    }
  };

  const renderReviewItem = ({ item }) => {
    const isLiked = item.likedBy?.includes(user.userId);

    return (
      <View style={styles.reviewContainer}>
        <View style={styles.reviewHeader}>
          <Text style={styles.username}>{item.username}</Text>
          <Text style={styles.timestamp}>
            {new Date(item.timestamp.seconds * 1000).toLocaleString()}
          </Text>
        </View>

        <Text style={styles.reviewText}>{item.reviewText}</Text>

        {/* Mood bubbles */}
        <View style={styles.moodContainer}>
          {item.selectedMoods?.map((mood, index) => (
            <View key={index} style={styles.moodTag}>
              <Text style={styles.moodText}>{mood}</Text>
            </View>
          ))}
        </View>

        <View style={styles.bottomRow}>
          {/* Like Button */}
          <View style={styles.likeContainer}>
            <TouchableOpacity
              onPress={() => handleLikeToggle(item.id, isLiked)}
              style={[styles.likeButton, isLiked ? styles.liked : null]}
            >
              <Ionicons
                name={isLiked ? 'heart' : 'heart-outline'}
                size={20}
                color={isLiked ? '#becbe5' : '#aaa'}
              />
            </TouchableOpacity>
            <Text style={styles.likeCount}>
              {item.likes} {item.likes === 1 ? 'Like' : 'Likes'}
            </Text>
          </View>

          {/* Rating display */}
          <View style={styles.ratingContainer}>
            <Text style={styles.ratingText}>{item.overallRating}</Text>
            <Ionicons name="star" size={16} color="gold" />
          </View>
        </View>
      </View>
    );
  };

  return (
    <FlatList
      data={reviews}
      renderItem={renderReviewItem}
      keyExtractor={(item) => item.id}
      contentContainerStyle={styles.container}
    />
  );
};

export default AllReviews;

const styles = StyleSheet.create({
  container: {
    padding: 10,
    backgroundColor: '#fff',
  },
  reviewContainer: {
    backgroundColor: '#f9f9f9',
    padding: 10,
    marginBottom: 15,
    borderRadius: 10,
    borderColor: '#ddd',
    borderWidth: 1,
  },
  reviewHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 5,
  },
  username: {
    fontWeight: 'bold',
    fontFamily: 'Montserrat-Bold',
  },
  timestamp: {
    color: '#888',
    fontSize: 12,
  },
  reviewText: {
    fontSize: 16,
    marginBottom: 10,
    fontFamily: 'Montserrat-Regular',
  },
  likeContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  likeButton: {
    marginRight: 10,
  },
  liked: {
    color: '#becbe5',
  },
  likeCount: {
    fontSize: 14,
    color: '#555',
    fontFamily: 'Montserrat-Bold',
  },
  bottomRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: 10,
  },
  ratingContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  ratingText: {
    fontSize: 14,
    fontFamily: 'Montserrat-Bold',
    color: '#333',
    marginRight: 5,
  },
  moodContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginVertical: 5,
  },
  moodTag: {
    backgroundColor: '#4e71b8',
    paddingVertical: 5,
    paddingHorizontal: 10,
    borderRadius: 15,
    marginRight: 5,
    marginBottom: 5,
  },
  moodText: {
    color: 'white',
    fontSize: 12,
    fontWeight: '600',
    fontFamily: 'Montserrat-Bold',
  },
});
