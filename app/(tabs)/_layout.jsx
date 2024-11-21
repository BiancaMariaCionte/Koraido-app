import { View, Image } from 'react-native';
import { Tabs } from 'expo-router';
import React from 'react';

const TabIcon = ({ icon, color, focused }) => {
  return (
    <View>
      <Image
        source={icon}
        style={{
          width: 24,
          height: 24,
          tintColor: focused ? '#95aad5' : 'gray', // Optional to change color when focused
        }}
      />
    </View>
  );
};

const TabsLayout = () => {
  return (
    <>
      <Tabs
      
        screenOptions={{
          tabBarStyle: {
            backgroundColor: "#ffffff", 
            borderTopColor: "#e7edf5", 
            borderRadius: 25, 
            marginHorizontal: 20, 
            marginBottom: 10, // Space above the bottom edge
            height: 60, 
            paddingBottom: 8, // Padding for icon alignment
            justifyContent: 'center',
          },
           tabBarShowLabel: false
        }}
      >
        <Tabs.Screen
          name="home"
          options={{
            headerShown: false,
            tabBarIcon: ({ color, focused }) => (
              <TabIcon
                icon={require('C:/Users/Bianca/Desktop/3rdYear/Licenta/Koraido/assets/icons/home.png')} 
                color={color}
                focused={focused}
              />
            ),
          }}
        />
        <Tabs.Screen
          name="wishList"
          options={{
            headerShown: false,
            tabBarIcon: ({ color, focused }) => (
              <TabIcon
                icon={require('C:/Users/Bianca/Desktop/3rdYear/Licenta/Koraido/assets/icons/heart.png')} 
                color={color}
                focused={focused}
              />
            ),
          }}
        />
        <Tabs.Screen
          name="profile"
          options={{
            headerShown: false,
            tabBarIcon: ({ color, focused }) => (
              <TabIcon
                icon={require('@/assets/icons/user.png')} 
                color={color}
                focused={focused}
              />
            ),
          }}
        />
      </Tabs>
    </>
  );
};

export default TabsLayout;
