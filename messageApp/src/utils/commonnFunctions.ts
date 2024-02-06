import AsyncStorage from '@react-native-async-storage/async-storage';
import {Dimensions} from 'react-native';

const {width, height} = Dimensions.get('window');

const guidelineBaseWidth = 375;
const guidelineBaseHeight = 812;

const horizontalScale = (size: number) => (width / guidelineBaseWidth) * size;
const verticalScale = (size: number) => (height / guidelineBaseHeight) * size;
const moderateScale = (size: number, factor = 0.5) =>
  size + (horizontalScale(size) - size) * factor;

const getUsername = async () => {
  try {
    const value = await AsyncStorage.getItem('username');
    if (value !== null) {
      return value;
    }
  } catch (e) {
    console.error('Error while loading username!');
    return '';
  }
};

export {getUsername, horizontalScale, verticalScale, moderateScale};
