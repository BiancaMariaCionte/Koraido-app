import { TouchableOpacity, Text } from 'react-native'
import React from 'react'


const CustomButton = ({ title, handlePress, containerStyles, textStyles, isLoading}) => {
  return (
    <TouchableOpacity
      onPress={handlePress}
      activeOpacity={0.7}
      className={`bg-[#4e71b8] rounded-lg h-16 w-3/4 justify-center items-center ${containerStyles} ${
        isLoading ? "opacity-50" : ""
      }`}
     // disabled={isLoading || disabled}
    >
      <Text className={`text-white text-lg font-semibold ${textStyles}`} style={{ fontFamily: 'Montserrat-Regular' }}>
        {title}
      </Text>
    </TouchableOpacity>
  )
}

export default CustomButton;
