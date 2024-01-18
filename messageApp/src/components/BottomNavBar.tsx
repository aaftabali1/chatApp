// BottomNavBar.js
import React from 'react';
import {View, TouchableOpacity, Text, SafeAreaView, Image} from 'react-native';
import colors from '../utils/colors';
import images from '../utils/images';
import {useTranslation} from 'react-i18next';

const BottomNavBar = ({state, descriptors, navigation}: any) => {
  const {t} = useTranslation();

  return (
    <View
      style={{
        flexDirection: 'row',
        backgroundColor: colors.tabBg,
        paddingVertical: 15,
        borderTopLeftRadius: 20,
        borderTopRightRadius: 20,
      }}>
      {state.routes.map((route: any, index: any) => {
        const {options} = descriptors[route.key];

        const label =
          options.tabBarLabel !== undefined
            ? options.tabBarLabel
            : options.title !== undefined
            ? options.title
            : route.name;

        const isFocused = state.index === index;

        const onPress = () => {
          const event = navigation.emit({
            type: 'tabPress',
            target: route.key,
            canPreventDefault: true,
          });

          if (!isFocused && !event.defaultPrevented) {
            navigation.navigate(route.name);
          }
        };

        let image;

        if (label === 'messages') {
          image = images.message;
        } else if (label === 'calls') {
          image = images.phone;
        } else if (label === 'settings') {
          image = images.user;
        } else if (label === 'contacts') {
          image = images.network;
        }

        return (
          <TouchableOpacity
            key={index}
            accessibilityRole="button"
            accessibilityState={isFocused ? {selected: true} : {}}
            accessibilityLabel={options.tabBarAccessibilityLabel}
            testID={options.tabBarTestID}
            onPress={onPress}
            style={{flex: 1, alignItems: 'center'}}>
            <Image
              source={image}
              style={{
                width: 25,
                height: 25,
                marginBottom: 5,
                resizeMode: 'contain',
              }}
            />
            <Text
              style={{
                color: isFocused ? '#0000ff' : '#888888',
                marginBottom: 10,
              }}>
              {t(`${label}`)}
            </Text>
          </TouchableOpacity>
        );
      })}
      <SafeAreaView />
    </View>
  );
};

export default BottomNavBar;
