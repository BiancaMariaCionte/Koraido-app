import { View, TouchableOpacity, Text , Image, FlatList, StyleSheet} from 'react-native'
import React from 'react'
import { icons } from '../constants';
import { useNavigation } from 'expo-router'; 

const categoriesData = [
    { id: '1', name: 'City', icon: icons.city, route: '(screens)/city' },
    { id: '2', name: 'Landmark', icon: icons.landmark, route: '(screens)/landmark' },
    { id: '3', name: 'Food', icon: icons.food, route: '(screens)/food' },
    { id: '4', name: 'K-Pop', icon: icons.kpop, route: '(screens)/kpop' },
    { id: '5', name: 'Shopping', icon: icons.shopping, route: '(screens)/shopping' },
  ];

  const Cathegories = () => {
    const navigation = useNavigation();

    return (
        <FlatList
            data={categoriesData}
            horizontal
            keyExtractor={(item) => item.id}
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={{ paddingHorizontal: 16 }}
            renderItem={({ item }) => (
                <TouchableOpacity
                    style={styles.categoryButton}
                    onPress={() => navigation.push(item.route)}  // Use push for a new screen
                >
                    <Image source={item.icon} style={styles.icon} />
                    <Text style={styles.categoryText}>{item.name}</Text>
                </TouchableOpacity>
            )}
        />
    );
};

const styles = StyleSheet.create({
  categoryButton: {
    width: 85,
    height: 85,
    borderRadius: 40,
    backgroundColor: '#ccd6eb',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 16,
   
  },
  icon: {
    width: 40,
    height: 40,
    marginBottom: 4,
  },
  categoryText: {
    fontSize: 11,
    fontFamily: 'Montserrat-Regular',
    color: '#333',
  },
});


export default Cathegories