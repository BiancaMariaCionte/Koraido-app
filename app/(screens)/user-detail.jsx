import DateTimePicker from '@react-native-community/datetimepicker';
import { View, Text, StyleSheet, ScrollView, ImageBackground, Image, Alert, Pressable, Platform, TouchableOpacity } from 'react-native';
import React, { useState , useEffect} from 'react';
import { SafeAreaView } from 'react-native-safe-area-context';
import FormField from '../../components/FormField';
import CustomButton from '../../components/CustomButton';
import { setDoc, doc ,getDoc} from 'firebase/firestore';
import { db, auth } from '../../services/config';
import { router } from 'expo-router';
import { useGlobalContext } from '@/context/GlobalProvider';
import { icons } from '../../constants';
import Ionicons from '@expo/vector-icons/Ionicons';
import { MultipleSelectList } from 'react-native-dropdown-select-list';


const UserDetails = () => {
  // State for form fields
  const [form, setForm] = useState({
    gender: '',
    nationality: '',
    dateOfBirth: ''
  });


  const [interests, setInterests] = useState([
    'K-Pop',
    'Food',
    'History',
    'Architecture',
    'Shopping',
    'Photography',
    'Dance',
    'Culture',
    'K-Drama',
    'Café',
    'Religion',
    'Park',
    'Nature',
  ]);


  const [selectedInterests, setSelectedInterests] = useState([]);
  const { updateUserData } = useGlobalContext();
  const [showInterestMessage, setShowInterestMessage] = useState(false);

  const [date, setDate] = useState(new Date()); // For the DatePicker
  const [showPicker, setShowPicker] = useState(false); // Show/hide date picker

  useEffect(() => {
    fetchUserData();
  }, []);

  const fetchUserData = async () => {
    const userId = auth?.currentUser?.uid;
    if (!userId) {
      Alert.alert('Error', 'User ID is missing');
      return;
    }
  
    try {
      const userDoc = await getDoc(doc(db, 'users', userId));
      if (userDoc.exists()) {
        const userData = userDoc.data();
        setForm({
          gender: userData.gender || '',
          nationality: userData.nationality || '',
          dateOfBirth: userData.dateOfBirth || '',
        });
      
        setSelectedInterests(userData.interests || []);
        }else{
          Alert.alert('Error', 'User data not found');
        }
    }catch (error) {
      console.error('Error fetching user data: ', error);
      Alert.alert('Error', 'Failed to load user data');
    }
  };


  // Function to toggle the date picker visibility
  const toggleDatepicker = () => {
    setShowPicker(!showPicker);
  };

  // Date picker change handler
  const onChange = ({ type }, selectedDate) => {
    if (type === 'set') {
      const currentDate = selectedDate || date;
      setDate(currentDate);
      setForm({ ...form, dateOfBirth: currentDate.toDateString() }); // Store date as string
      if (Platform.OS === 'android') {
        toggleDatepicker(); // Close date picker on Android
      }
    } else {
      toggleDatepicker(); // Close date picker if canceled
    }
  };

  // For iOS, confirm the selected date
  const confirmIOSDate = () => {
    setForm({ ...form, dateOfBirth: date.toDateString() });
    toggleDatepicker();
  };


  const toggleInterest = (interest) => {
    setSelectedInterests((prev) =>
      prev.includes(interest)
        ? prev.filter((item) => item !== interest)
        : [...prev, interest]
    );

    if (!showInterestMessage) {
      setShowInterestMessage(true);
      setTimeout(() => setShowInterestMessage(false), 4000);
    }
  };


  const handleSubmit = async () => {
    const userId = auth?.currentUser?.uid;
    if (!userId) {
      Alert.alert('Error', 'User ID is missing');
      return;
    }

    try {
      await setDoc(doc(db, 'users', userId), {
        gender: form.gender,
        dateOfBirth: form.dateOfBirth,
        nationality: form.nationality,
        interests: selectedInterests,
      }, { merge: true }); // Use merge to avoid overwriting existing data

      await updateUserData(userId);
      Alert.alert('Success', 'Details saved successfully!');
      // Navigate to home page after success
    } catch (error) {
      console.error('Error saving user details: ', error);
      Alert.alert('Error', 'Failed to save details. Please try again.');
    }
  };



  const profilePic = require('@/assets/images/profileDef.jpg'); 

  return (
    <SafeAreaView style={styles.safeArea}>
      <ScrollView contentContainerStyle={styles.scrollContainer}>



        {/* Logo at the top */}
        <View style={styles.logoContainer}>
        <TouchableOpacity onPress={() => console.log('Change Profile Picture')}>
        <ImageBackground
              source={profilePic}
              style={styles.profileImage}
              imageStyle={{ borderRadius: 50 }}
            >
               <View style={styles.cameraIconContainer}>
                <Image source={icons.camera} style={styles.cameraIcon} />
              </View>
        </ImageBackground>
        </TouchableOpacity>
        </View>




        {/* User Details Title */}
        <Text style={styles.titleText}>User Details</Text>

        {/* Gender Field */}
        
        <FormField
          placeholder="Gender(F/M/Non)"
          value={form.gender}
          handleChangeText={(e) => setForm({ ...form, gender: e })}
          otherStyles={styles.formField}
          keyboardType="default"
          icon={<Ionicons name="person-outline" size={24} color="#6b88c4" />}
        />

        {/* Date of Birth Field */}
        {showPicker && (
          <DateTimePicker
            mode="date"
            display="spinner"
            value={date}
            onChange={onChange}
            style={styles.datePicker}
            textColor='black'
          />
        )}

        {showPicker && Platform.OS === 'ios' && (
          <View style={styles.iosButtonContainer}>
            <TouchableOpacity
              onPress={toggleDatepicker}
            >
              <Text style={styles.iosButtonText}>Cancel</Text>
            </TouchableOpacity>

            <TouchableOpacity
              onPress={confirmIOSDate}
            >
              <Text style={styles.iosButtonText}>Confirm</Text>
            </TouchableOpacity>
          </View>
        )}

        {!showPicker && (
            <FormField
              placeholder="Date of Birth (DD/MM/YYYY)"
              value={form.dateOfBirth}
              handleChangeText={(e) => setForm({ ...form, dateOfBirth: e })}
              otherStyles={styles.formField}
              editable={false}
              icon={<Ionicons name="calendar-outline" size={24} color="#6b88c4" />}
              onPress={toggleDatepicker}
            />
        )}

        {/* Nationality Field */}
        <FormField
          placeholder="Country"
          value={form.nationality}
          handleChangeText={(e) => setForm({ ...form, nationality: e })}
          otherStyles={styles.formField}
          icon={<Ionicons name="earth-outline" size={24} color="#6b88c4" />}
        />

          {/* Message about interests (only displayed once)
          {showInterestMessage && (
          <Text style={styles.warningText }>Once you choose an interest, it cannot be changed.</Text>
        )} */}


 {/* Interests */}
 <Text style={styles.label}>Interests</Text>
        <View style={styles.interestsContainer}>
          {interests.map((interest) => (
            <TouchableOpacity
              key={interest}
              style={[
                styles.interestButton,
                selectedInterests.includes(interest) && styles.interestButtonSelected,
              ]}
              onPress={() => toggleInterest(interest)}
            >
              <Text
                style={[
                  styles.interestButtonText,
                  selectedInterests.includes(interest) && styles.interestButtonTextSelected,
                ]}
              >
                {interest}
              </Text>
            </TouchableOpacity>
          ))}
        </View>

        
        {/* Submit Button */}
        <CustomButton
          title="Submit"
          handlePress={handleSubmit}
          containerStyles="mt-7"
        />
      </ScrollView>
    </SafeAreaView>
  );
};

export default UserDetails;

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
  },
  scrollContainer: {
    flexGrow: 1,
    justifyContent: 'flex-start',
    alignItems: 'center',
    paddingHorizontal: 16,
  },
  logoContainer: {
    marginTop: 30,
    alignItems: 'center',
    marginBottom: 35,
  },
  logo: {
    width: 300,
    height: 300,
  },
  titleText: {
    fontSize: 24,
    fontWeight: '600',
    marginTop: -15,
    marginBottom: 1,
    fontFamily: 'Montserrat-Regular',
    textAlign: 'left',
    alignSelf: 'flex-start',
  },
  formField: {
    width: '100%',
    marginBottom: 5,
    fontFamily: 'Montserrat-Bold',
  },
  datePicker: {
    height: 120,
    marginTop: -10,
    color:'black'
  },
  iosButtonContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingHorizontal: 40,
    marginVertical: 10,
   
  },
  iosButtonText: {
    color: '#6b88c4',
    fontSize: 16,
    fontWeight: '600',
    marginRight: 20
  },
  profileImage: {
    width: 100,
    height: 100,
    justifyContent: 'center',
    alignItems: 'center',
  },
  cameraIconContainer: {
    position: 'absolute',
    bottom: 0,
    right: 0,
    backgroundColor: 'white',
    padding: 5,
    borderRadius: 50,
  },
  cameraIcon: {
    width: 20,
    height: 20,
    tintColor: '#6b88c4', // Change icon color as needed
  },
  interestsContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginBottom: 20,
  },
  interestButton: {
    backgroundColor: '#e6e6e6',
    paddingVertical: 8,
    paddingHorizontal: 15,
    borderRadius: 20,
    margin: 5,
  },
  interestButtonSelected: {
    backgroundColor: '#94a9d4',
  },
  interestButtonText: {
    color: '#555',
    fontSize: 14,
    fontFamily: 'Montserrat-Regular',
  },
  interestButtonTextSelected: {
    color: '#fff',
  },
  label: {
    fontSize: 18,
    fontWeight: '600',
    marginBottom: 10,
    marginTop: 15,
    fontFamily: 'Montserrat-Bold',
  
  },
});
