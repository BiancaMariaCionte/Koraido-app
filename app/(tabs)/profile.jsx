import { View, Text, TouchableOpacity, Image, SafeAreaView, ScrollView } from 'react-native';
import React, { useEffect } from 'react';
import { useGlobalContext } from '@/context/GlobalProvider';
import { router } from 'expo-router';
import CustomButton from '@/components/CustomButton';
import { icons } from '../../constants';


const Profile = () => {
  const { isLoggedIn, logout, user } = useGlobalContext();

  useEffect(() => {
    // Redirect to sign-in if not logged in
    if (!isLoggedIn) {
      router.replace('/sign-in');
    }
  }, [isLoggedIn]);

  const handleLogout = async () => {
    const result = await logout();
    if (result.success) {
      router.replace('/sign-in'); // Redirect to login page after logout
    } else {
      console.error("Logout failed:", result.msg);
    }
  };

  const profilePic = require('@/assets/images/profileDef.jpg'); // Adjust the path as necessary

  const navigateToUserDetail = () => {
    router.push('/user-detail'); // Navigate to the user-detail page
  };


  return (
    <SafeAreaView style={{flex:1}}>
      <ScrollView
      style={styles.container}
      contentContainerStyle={{justifyContent: 'center', alignItems: 'center'}}
      showsVerticalScrollIndicator={false}
      >
    
      <Image
        source={profilePic}
        style={{ width: 100, height: 100, borderRadius: 50, marginBottom: 20 }}
      />
      <Text style={{ fontSize: 24, fontWeight: 'bold', marginBottom: 10, fontFamily: 'Montserrat-Bold', }}>
        {user?.username || 'User'}
      </Text>

   {/* Nationality Section */}
   <View style={styles.infoRow}>
          <Image source={icons.earth} style={styles.icon} />
          <Text style={styles.infoText}>{user?.nationality || 'Unknown'}</Text>
        </View>

        {/* Email Section */}
        <View style={styles.infoRow}>
          <Image source={icons.email} style={styles.icon} />
          <Text style={styles.infoText}>{user?.email || 'No Email'}</Text>
        </View>

         {/* Interests Section */}
         <View style={styles.interestsSection}>
          <View style={styles.infoRow}>
            <Image source={icons.star} style={styles.icon} />
            <Text style={styles.infoText}>Interests</Text>
          </View>
          <View style={styles.interestsList}>
            {user?.interests?.map((interest, index) => (
              <View key={index} style={styles.interestItem}>
                <Image source={icons.star} style={styles.interestIcon} />
                <Text style={styles.interestText}>{interest}</Text>
              </View>
            )) || <Text style={styles.infoText}>No Interests</Text>}
          </View>
        </View>

   

      
     <View style={styles.buttonRow}>
          <CustomButton 
            title="Sign out" 
            handlePress={handleLogout} 
            containerStyles={styles.button} 
          />
          <CustomButton 
            title="Edit profile" 
            handlePress={navigateToUserDetail} 
            containerStyles={styles.button} 
          />
        </View> 

      
    
    </ScrollView>
    </SafeAreaView>
  );

};
const styles = {
  container: {
    flex: 1,
    padding: 20,
  },
  buttonRow: {
    flexDirection: 'row',
    justifyContent: 'center',
    marginTop: 20, // Space from top section
    width: '50%',
    gap: 15, // Add space between buttons
  },
  button: {
    flex: 1,
    marginHorizontal: 10,
  },
  icon: {
    width: 24,
    height: 24,
    marginRight: 8, 
    marginLeft: -10,
  },
  infoText: {
    fontFamily: 'Montserrat-Regular',
    fontSize: 16,
    color: '#333',
    flexShrink: 1,
  },
  infoRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 10,
    width: '90%',
    justifyContent: 'flex-start',
  },
  interestsSection: {
    width: '90%',
    marginTop: 1,
  },
  interestsList: {
    marginTop: 10,
    flexDirection: 'row',
    flexWrap: 'wrap',
  },
  interestItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginRight: 10,
    marginBottom: 10,
  },
  interestIcon: {
    width: 16,
    height: 16,
    marginRight: 5,
  },
  interestText: {
    fontFamily: 'Montserrat-Regular',
    fontSize: 16,
    color: '#333',
  },
};

export default Profile;
