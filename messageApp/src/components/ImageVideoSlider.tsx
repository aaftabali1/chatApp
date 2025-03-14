import React from 'react';
import {
  Image,
  SafeAreaView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import Swiper from 'react-native-swiper';
import Modal from 'react-native-modal';
import images from '../utils/images';
import colors from '../utils/colors';
import constants from '../utils/constants';
import Video from 'react-native-video';

type ImageVideoSliderProps = {
  data: any[];
  showSlider: boolean;
  toggleSlider: () => void;
};

const ImageVideoSlider = ({
  data,
  showSlider,
  toggleSlider,
}: ImageVideoSliderProps) => {
  return (
    <Modal backdropColor="black" backdropOpacity={1} isVisible={showSlider}>
      <SafeAreaView />
      <TouchableOpacity onPress={toggleSlider}>
        <Image source={images.back} style={styles.closeIcon} />
      </TouchableOpacity>
      <Swiper horizontal loop={false}>
        {data.map((item: any, index: number) => {
          return (
            <View key={index}>
              {item.attachment_type == 0 && (
                <Image
                  source={{
                    uri: `${constants.ip}/uploads/${item.attachment_url}`,
                  }}
                  style={{width: '100%', height: '100%', resizeMode: 'contain'}}
                />
              )}
              {item.attachment_type == 1 && (
                <Video
                  source={{
                    uri: `${constants.ip}/uploads/${item.attachment_url}`,
                  }}
                  style={{width: 200, height: 400}}
                  controls={true}
                  onError={e => console.log('e', e)}
                />
                // <Image
                //   source={{
                //     uri: `${constants.ip}/uploads/${item.attachment_url}`,
                //   }}
                //   style={{width: '100%', height: '100%', resizeMode: 'contain'}}
                // />
              )}
            </View>
          );
        })}
      </Swiper>
      <SafeAreaView />
    </Modal>
  );
};

const styles = StyleSheet.create({
  closeIcon: {
    tintColor: colors.white,
    width: 30,
    height: 30,
    resizeMode: 'contain',
    marginTop: 20,
  },
});

export default ImageVideoSlider;
