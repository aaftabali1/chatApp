import React, {useEffect} from 'react';
import {Image, StyleSheet, Text, View} from 'react-native';
import Modal from 'react-native-modal';
import images from '../utils/images';
import {
  horizontalScale,
  moderateScale,
  verticalScale,
} from '../utils/commonnFunctions';
import colors from '../utils/colors';
import fonts from '../utils/fonts';

interface SuccessModelProps {
  descText: string;
  visible: boolean;
}

const SuccessModel = ({descText, visible}: SuccessModelProps) => {
  return (
    <Modal isVisible={visible}>
      <View style={styles.mainContainer}>
        <Image source={images.tick} style={styles.tickStyle} />
        <Text style={styles.descTextStyle}>{descText}</Text>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  mainContainer: {
    backgroundColor: colors.white,
    borderRadius: moderateScale(20),
    paddingVertical: verticalScale(10),
    paddingTop: verticalScale(50),
    paddingHorizontal: horizontalScale(20),
    paddingBottom: verticalScale(50),
  },
  descTextStyle: {
    color: colors.textColor,
    fontSize: moderateScale(22),
    fontFamily: fonts.light,
    textAlign: 'center',
    marginBottom: verticalScale(30),
  },
  orderNumberStyle: {
    fontFamily: fonts.regular,
  },
  tickStyle: {
    width: horizontalScale(80),
    height: horizontalScale(80),
    alignSelf: 'center',
    marginTop: verticalScale(30),
    marginBottom: verticalScale(40),
  },
});

export default SuccessModel;
