import AsyncStorage from '@react-native-async-storage/async-storage';

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

export {getUsername};
