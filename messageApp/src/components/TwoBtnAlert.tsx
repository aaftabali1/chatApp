import React from 'react';
import {
  StyleSheet,
  Text,
  TextStyle,
  TouchableOpacity,
  View,
  ViewStyle,
} from 'react-native';
import Modal from 'react-native-modal';
import {globalStyles} from '../utils/commonStyles';
import {
  horizontalScale,
  moderateScale,
  verticalScale,
} from '../utils/commonnFunctions';
import colors from '../utils/colors';
import fonts from '../utils/fonts';

interface TwoBtnAlertProps {
  descText: string;
  orderNumber?: string;
  okText: string;
  cancelText: string;
  okAction(): void;
  cancelAction(): void;
  secondaryDesc?: string;
  secondDescStyle?: ViewStyle;
  cancelBtnStyle?: ViewStyle;
  cancelTextStyle?: TextStyle;
}

const TwoBtnAlert = ({
  descText,
  orderNumber,
  okText,
  cancelText,
  secondaryDesc,
  okAction,
  cancelAction,
  secondDescStyle,
  cancelBtnStyle,
  cancelTextStyle,
}: TwoBtnAlertProps) => {
  return (
    <Modal isVisible>
      <View style={styles.mainContainer}>
        <Text style={styles.descTextStyle}>
          {descText}
          <Text style={styles.orderNumberStyle}> {orderNumber}</Text>
        </Text>
        {secondaryDesc && (
          <Text style={[styles.secondDesc, secondDescStyle]}>
            {secondaryDesc}
          </Text>
        )}
        <View>
          <TouchableOpacity onPress={okAction} style={styles.okBtnStyle}>
            <Text style={globalStyles.submitBtnText}>{okText}</Text>
          </TouchableOpacity>
          <TouchableOpacity
            onPress={cancelAction}
            style={[styles.cancelBtnStyle, cancelBtnStyle]}>
            <Text style={[globalStyles.submitBtnText3, cancelTextStyle]}>
              {cancelText}
            </Text>
          </TouchableOpacity>
        </View>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  mainContainer: {
    ...globalStyles.whiteRoundContainer,
    paddingTop: verticalScale(50),
    paddingHorizontal: horizontalScale(20),
    paddingBottom: verticalScale(20),
  },
  descTextStyle: {
    color: colors.textColor,
    fontSize: moderateScale(22),
    fontFamily: fonts.light,
    textAlign: 'center',
  },
  orderNumberStyle: {
    fontFamily: fonts.regular,
  },
  okBtnStyle: {
    ...globalStyles.submitBtnContainerZeroMargin,
    marginTop: verticalScale(50),
  },
  cancelBtnStyle: {
    ...globalStyles.submitBtnContainerWhiteZeroMargin,
  },
  secondDesc: {
    ...globalStyles.lightText16Italic,
    fontSize: moderateScale(12),
    textAlign: 'center',
    marginTop: verticalScale(30),
    paddingHorizontal: horizontalScale(40),
  },
});

export default TwoBtnAlert;
