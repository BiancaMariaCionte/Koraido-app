import { View, Text, TextInput, Image, StyleSheet, SafeAreaView,Dimensions, Modal,ScrollView, FlatList, TouchableOpacity } from 'react-native';
import React, { useState, useEffect } from 'react';
import { useLocalSearchParams } from 'expo-router';
import { doc, getDoc,setDoc,getDocs,query, where, deleteDoc,arrayRemove, arrayUnion, increment, orderBy, onSnapshot,addDoc ,updateDoc, collection} from 'firebase/firestore';
import { db } from '../../services/config.js'; // Update this path to your actual config file
import { useGlobalContext } from '@/context/GlobalProvider';
import {Ionicons} from '@expo/vector-icons'
import { LinearGradient } from 'expo-linear-gradient';
import { Linking } from 'react-native';
import ReviewForm from '../../components/ReviewForm';
import CustomButton from '../../components/CustomButton'; // Adjust the path if needed
import { useRouter } from 'expo-router'; 

const screenWidth = Dimensions.get('window').width;


const LocationDetail = () => {
  const [location, setLocation] = useState(null);
  const [newReviewText, setNewReviewText] = useState('');
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [selectedImageIndex, setSelectedImageIndex] = useState(0);
  const { id } = useLocalSearchParams(); // Get the document ID from route params
  const { user } = useGlobalContext(); // Assume user is available in context
  const [isFavorite, setIsFavorite] = useState(false);
  const [wishlistDocId, setWishlistDocId] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [isReviewFormVisible, setIsReviewFormVisible] = useState(false);

  const [reviews, setReviews] = useState([]);

  const router = useRouter(); // Hook for navigation


   // Check if user is not loaded
   if (!user) {
    return <Text>Loading user...</Text>;
  }

  // Function to fetch location details from Firestore
  const fetchLocationDetails = async () => {
    try {
      const docRef = doc(db, 'locations', id); // Reference to the document in 'locations' collection
      const docSnap = await getDoc(docRef);

      if (docSnap.exists()) {
        setLocation({ id: docSnap.id, ...docSnap.data() });
      } else {
        console.log("No such document!");
      }
    } catch (error) {
      console.error("Error fetching location:", error);
    }
  };

   // Fetch reviews for the location
   const fetchReviews = () => {
    const reviewsQuery = query(collection(db, 'locations', id, 'reviews'), 
    orderBy('overallRating', 'desc'),
    orderBy('timestamp', 'desc'));
    const unsubscribe = onSnapshot(reviewsQuery, (querySnapshot) => {
      const reviewsArray = querySnapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      }));
      setReviews(reviewsArray);
    });

    return () => unsubscribe();
  };
  
   // Add a new review
   const addReview = async () => {
    if (newReviewText.trim() === '') return; // Prevent empty reviews

    try {
      const reviewRef = await addDoc(collection(db, 'locations', id, 'reviews'), {
        userId: user.userId,
        reviewText: newReviewText,
        timestamp: new Date(),
        likes: 0,
        likedBy: [] // To track who liked the review
      });
      await updateDoc(reviewRef, { reviewId: reviewRef.id });
      setNewReviewText(''); // Clear the input field
    } catch (error) {
      console.log('Error adding review: ', error);
    }
  };



   // Like or unlike a review
  const handleLikeToggle = async (reviewId, isLiked) => {
    const reviewRef = doc(db, 'locations', id, 'reviews', reviewId);
    const userId = user.userId;

    try {
      if (isLiked) {
        await updateDoc(reviewRef, {
          likedBy: arrayRemove(userId),
          likes: increment(-1)
        });
      } else {
        await updateDoc(reviewRef, {
          likedBy: arrayUnion(userId),
          likes: increment(1)
        });
      }
    } catch (error) {
      console.log('Error toggling like: ', error);
    }
  };

  useEffect(() => {
    if (id) {
      fetchLocationDetails();
      fetchReviews();
      checkIfFavorite(id); // Check if the location is a favorite
    }
  }, [id]);

  const checkIfFavorite = async (locationId) => {
    if (!user) return;
    try {
      const q = query(collection(db, "wishlist"), where("userId", "==", user.userId), where("location.id", "==", locationId));
      const querySnapshot = await getDocs(q);
      if (!querySnapshot.empty) {
        setIsFavorite(true);
        setWishlistDocId(querySnapshot.docs[0].id); // Store the document ID for deletion
      } else {
        setIsFavorite(false);
        setWishlistDocId(null);
      }
    } catch (error) {
      console.error("Error checking favorite status:", error);
    }
  };

  if (!location) return <Text>Loading...</Text>;
  
  const openModal = (index) => {
    setSelectedImageIndex(index);
    setIsModalVisible(true);
  };

  const closeModal = () => {
    setIsModalVisible(false);
  };

  const renderImage = ({ item, index }) => (
    <View style={styles.imageContainer}>
    <TouchableOpacity onPress={() => openModal(index)}>
      <Image source={{ uri: item }} style={styles.imageStyle} resizeMode="cover" />
    </TouchableOpacity>
    <LinearGradient
    colors={['transparent', 'rgba(0, 0, 0, 0.7)']}
    style={styles.bottomOverlay}
  />
    <TouchableOpacity style={styles.wishlistButton}
        onPress={handleFavoriteToggle}
        disabled={isLoading}
        //  onPress={() => onSetFavourite(location)
        >
      <Ionicons name={isFavorite ? "heart" : "heart-outline"} size={30} color={isFavorite ? "#becbe5" : "white"} />
      </TouchableOpacity>
    </View>
  );

  const handleFavoriteToggle = async () => {
    if (!user || !location || isLoading) return;

    setIsLoading(true);

    try {
      if (isFavorite) {
        // Remove from wishlist
        if (wishlistDocId) {
          await deleteDoc(doc(db, "wishlist", wishlistDocId));
          console.log("Removed from wishlist");
          setIsFavorite(false);
        }
      } else {
        // Add to wishlist
        const wishlistRef = collection(db, "wishlist");
        const newDoc = await addDoc(wishlistRef, {
          location: location,
          userId: user.userId,
        });
        console.log("Added to wishlist");
        setIsFavorite(true);
        setWishlistDocId(newDoc.id);
      }
    } catch (error) {
      console.error("Error toggling favorite status:", error);
    } finally{
      setIsLoading(false)
    }
  };

  const handleSeeMoreReviews = () => {
    router.push({ pathname: '/all-reviews', params: { id } });
  };

  const renderReviewItem = ({ item }) => {
    const isLiked = item.likedBy?.includes(user.userId);

    return (
      <View style={styles.reviewContainer}>
        <View style={styles.reviewHeader}>
          <Text style={styles.username}>{item.username}</Text>
          <Text style={styles.timestamp}>{new Date(item.timestamp.seconds * 1000).toLocaleString()}</Text>
        </View>

        <Text style={styles.reviewText}>{item.reviewText}</Text>
       
        {/* Mood words */}
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
            name={isLiked ? "heart" : "heart-outline"}
            size={20}
            color={isLiked ? "#becbe5" : "#aaa"}
          />
        </TouchableOpacity>
        <Text style={styles.likeCount}>
          {item.likes} {item.likes === 1 ? "Like" : "Likes"}
        </Text>
        </View>

          {/* Rating and star */}
          <View style={styles.ratingContainer}>
          <Text style={styles.ratingText}>{item.overallRating}</Text>
          <Ionicons name="star" size={16} color="gold" />
        </View>
      </View>
    </View>
    );
  };






  return (
   
    <ScrollView style={styles.container}
    contentContainerStyle={styles.contentContainer}>
       <SafeAreaView style={styles.container}>
     <Text className="text-2xl font-bold"style={{ fontFamily: 'Montserrat-Bold',  marginHorizontal: 10, marginTop:20}}>{location.name}</Text>
     <Text style={styles.textStyle} >{location.type}</Text>

      <FlatList
        data={location.photoUrl}
        renderItem={renderImage}
        style={styles.newsImg}
        horizontal
        keyExtractor={(item, index) => index.toString()}
        pagingEnabled // Snap images to screen width
        showsHorizontalScrollIndicator={false}
        
      />

      {/* <Image source={{ uri: location.photoUrl }} className="w-full h-48" resizeMode="cover" /> */}
     
      <View style={styles.row}>
      <Ionicons name="star-outline" size={24} color="black" style={styles.iconStyle} />
      <Text style={styles.textStyle}> {location.rating} </Text>
    </View>
      {/* <Text  style={styles.textStyle}>Rating: {location.rating} ★</Text> */}
      <View style={styles.row}>
      <Ionicons name="pin-outline" size={24} color="black" style={styles.iconStyle} />
      <Text style={styles.textStyle}> {location.address}</Text>
    </View>
    <View style={styles.row}>
      <Ionicons name="wallet-outline" size={24} color="black" style={styles.iconStyle} />
      <Text style={styles.textStyle}>{location.price}</Text>
    </View>
    <View style={styles.row}>
      <Ionicons name="brush-outline" size={24} color="black" style={styles.iconStyle} />
      <Text style={styles.textStyle}> {location.theme +" "}</Text>
    </View>


    <CustomButton
  title={isReviewFormVisible ? "Cancel" : "Write a Review"}
  handlePress={() => setIsReviewFormVisible(!isReviewFormVisible)}
  containerStyles="w-full my-4" // Optional Tailwind or custom styles for the button
  textStyles="text-lg font-bold" // Optional additional text styling
  isLoading={false} // Update this to handle loading state if required
  disabled={false} // Update this to disable the button when needed
/>


{isReviewFormVisible && (

<ReviewForm
  onSubmitReview={(review) => {
    const reviewRef = collection(db, 'locations', id, 'reviews');
    addDoc(reviewRef, {
      ...review,
      userId: user.userId,
      username: user.username,
    }).then(() => {
    console.log('Review submitted!');
    setIsReviewFormVisible(false);
    }) // Hide form after submission
  }}
/>
)}

{/* 
           <FlatList
          data={reviews}
          renderItem={renderReviewItem}
          keyExtractor={(item) => item.id}
        /> */}

{/* <Text style={styles.textStyle}>Reviews</Text> */}
 {/* Reviews Header */}
 <View style={styles.reviewsHeader}>
          <Text style={styles.textStyle}>Reviews</Text>
          {reviews.length > 3 && (
            <TouchableOpacity onPress={handleSeeMoreReviews}>
              <Text style={styles.seeMoreButton}>See More</Text>
            </TouchableOpacity>
          )}
        </View>
<View>
  {reviews.slice(0, 3).map((review) => (
    <View key={review.id} style={styles.reviewContainer}>
      {renderReviewItem({ item: review })}
    </View>
  ))}
</View>
{/* {reviews.length > 3 && (
  <TouchableOpacity onPress={handleSeeMoreReviews}>
    <Text style={styles.seeMoreButton}>See More</Text>
  </TouchableOpacity> */}
{/* )} */}
      

     {/* Full-screen image modal */}
     <Modal visible={isModalVisible} transparent={true}>
        <View style={{ flex: 1, backgroundColor: 'black', justifyContent: 'center', alignItems: 'center' }}>
          <Image
            source={{ uri: location.photoUrl[selectedImageIndex] }}
            style={{ width: '100%', height: '80%' }}
            resizeMode="contain"
          />
           {/* Close Button */}
           <TouchableOpacity onPress={closeModal} style={{ position: 'absolute', top: 40, right: 20 }}>
            <Text style={{ color: 'white', fontSize: 24 }}>✕</Text>
          </TouchableOpacity>
          {/* Navigation Buttons */}
          {selectedImageIndex > 0 && (
            <TouchableOpacity
              onPress={() => setSelectedImageIndex(selectedImageIndex - 1)}
              style={{ position: 'absolute', left: 20 }}
            >
              <Text style={{ color: 'white', fontSize: 32 }}>‹</Text>
            </TouchableOpacity>
          )}
          {selectedImageIndex < location.photoUrl.length - 1 && (
            <TouchableOpacity
              onPress={() => setSelectedImageIndex(selectedImageIndex + 1)}
              style={{ position: 'absolute', right: 20 }}
            >
              <Text style={{ color: 'white', fontSize: 32 }}>›</Text>
            </TouchableOpacity>
          )}
        </View>
      </Modal>
      
      </SafeAreaView>
    </ScrollView>
   
  );
};

export default LocationDetail;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 10, // Add padding to the main container if needed
    backgroundColor: '#fff',
    
    //paddingBottom: 20, 
    
  },
  
  newsImg: {
  
    borderRadius: 10,
    marginVertical: 10,
  },
  contentContainer:{
    paddingBottom: 20, 
  
  },

  imageContainer: {
    width: screenWidth - 40, // Adjust width to accommodate margins
    height: 240,
    marginHorizontal: 10, // Margin on both sides for images
    borderWidth: 2, // Add a border width
    borderColor: '#ccc', // Set border color
    borderRadius: 10, // Optional: round corners of the border
    overflow: 'hidden', // Ensure content inside respects the border radius
  },
  imageStyle: {
    width: '100%',
    height: '100%',
  },
  textStyle: {
    fontSize: 18,
    fontFamily: 'Montserrat-Regular',
    marginVertical: 10, // Adjust for vertical spacing
    marginHorizontal: 10
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    marginVertical: 5, // Space between rows
    marginHorizontal:5
  },
  iconStyle: {
    marginRight: -1, // Space between icon and text
  },

  bottomOverlay: {
    position: 'absolute',
    bottom: 0,
    width: '100%',
    height: 60, // Adjust height as needed
    borderRadius: 9, // Match the image border radius
  },
  wishlistButton: {
    position: 'absolute',
    bottom: 10, // Adjust based on desired position
    right: 10,
    zIndex: 1,
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
    fontFamily: 'Montserrat-Bold'
  },
  timestamp: {
    color: '#888',
    fontSize: 12,
  },
  reviewText: {
    fontSize: 16,
    marginBottom: 10,
    fontFamily: 'Montserrat-Regular'
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
  addReviewContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 20,
  },
  input: {
    flex: 1,
    padding: 10,
    borderColor: '#ccc',
    borderWidth: 1,
    borderRadius: 5,
    marginRight: 10,
  },
  submitButton: {
    backgroundColor: '#007bff',
    padding: 10,
    borderRadius: 5,
  },
  submitButtonText: {
    color: '#fff',
    fontWeight: 'bold',
    
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
    fontFamily: 'Montserrat-Bold'
  },
  seeMoreButton:{
    fontSize: 15,
  fontFamily: 'Montserrat-Bold',
   color: '#6b88c4' ,
   marginRight: 10
  },
  reviewsHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: 10,
    marginBottom: 10,
  },
 

})