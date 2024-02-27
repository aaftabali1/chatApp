import React, {useRef, useState} from 'react';
import {SafeAreaView, Text, TouchableOpacity, View} from 'react-native';
import {Camera, useCameraDevice} from 'react-native-vision-camera';
import {CameraRoll} from '@react-native-camera-roll/camera-roll';
import styles from './styles';
import {NavigationProp, useNavigation} from '@react-navigation/native';
import {launchImageLibrary} from 'react-native-image-picker';

const PhotoVideo = ({route}: any) => {
  const navigation = useNavigation<NavigationProp<any>>();
  const device = useCameraDevice('back');
  const camera = useRef<Camera>(null);

  const [isPhoto, setIsPhoto] = useState(true);
  const [flash, setFlash] = useState('off');
  const [cameraUsed, setCameraUsed] = useState('back');

  // if (device == null) return <Text>Camera not avaiable</Text>;

  const capturePhoto = async () => {
    if (camera.current == null) return;

    const photo = await camera.current.takePhoto();
    await CameraRoll.saveAsset(`file://${photo.path}`, {
      type: 'photo',
    });
  };

  const hanldeGalleryImagePicker = async () => {
    try {
      const result = await launchImageLibrary({
        mediaType: isPhoto ? 'photo' : 'video',
        selectionLimit: 10,
      });
      if (result.assets) {
        if (result.assets.length > 0) {
          navigation.navigate('Messaging', {
            data: result.assets,
            item: route.params.item,
            receiver: route.params.receiver,
          });
        }
      }
    } catch (e) {
      console.log('====================================');
      console.log(e);
      console.log('====================================');
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.container}>
        {/* <Camera
          style={[StyleSheet.absoluteFill]}
          device={device}
          ref={camera}
          isActive={true}
          photo={isPhoto}
          video={!isPhoto}
        /> */}
        <View style={styles.topActionContainer}>
          <TouchableOpacity
            onPress={() => {
              navigation.goBack();
            }}>
            <Text style={{color: 'white'}}>close</Text>
          </TouchableOpacity>
          <TouchableOpacity onPress={() => {}}>
            <Text style={{color: 'white'}}>Flash</Text>
          </TouchableOpacity>
        </View>
        <View style={styles.bottomActionContainer}>
          <TouchableOpacity onPress={hanldeGalleryImagePicker}>
            <Text style={{color: 'white'}}>Gallery</Text>
          </TouchableOpacity>
          <TouchableOpacity
            onPress={() => capturePhoto()}
            style={styles.captureBtn}>
            <View
              style={[
                styles.captureBtnInner,
                !isPhoto && {backgroundColor: 'red'},
              ]}
            />
          </TouchableOpacity>
          <TouchableOpacity>
            <Text style={{color: 'white'}}>Chagne</Text>
          </TouchableOpacity>
        </View>
        <View style={styles.photoVideoBtmContainer}>
          <Text
            onPress={() => setIsPhoto(false)}
            style={[
              styles.photoVideoText,
              isPhoto && styles.videoNotSelected,
              !isPhoto && styles.videoSelected,
            ]}>
            Video
          </Text>
          <Text
            onPress={() => setIsPhoto(true)}
            style={[
              styles.photoVideoText,
              isPhoto && styles.photoSelectedText,
              !isPhoto && styles.photoNotSelectedText,
            ]}>
            Photo
          </Text>
        </View>
      </View>
    </SafeAreaView>
  );
};

export default PhotoVideo;
