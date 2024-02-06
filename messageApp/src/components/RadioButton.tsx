import React from 'react';
import {StyleSheet, Text, TouchableOpacity, View} from 'react-native';
import colors from '../utils/colors';
import {moderateScale, verticalScale} from '../utils/commonnFunctions';
import {globalStyles} from '../utils/commonStyles';

const RadioButton = ({
  checked,
  setChecked,
  title,
}: {
  checked: boolean;
  setChecked: () => void;
  title: string;
}) => {
  return (
    <TouchableOpacity
      onPress={() => setChecked()}
      style={styles.radioContainer}>
      <View style={styles.radioBtnOuter}>
        {checked && <View style={styles.radioBtnInner} />}
      </View>
      <Text style={styles.titleText}>{title}</Text>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  radioContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: verticalScale(15),
  },
  radioBtnOuter: {
    borderWidth: 1,
    width: moderateScale(20),
    height: moderateScale(20),
    borderRadius: 200,
    borderColor: colors.primaryBlue,
    alignItems: 'center',
    justifyContent: 'center',
    marginEnd: 10,
  },
  radioBtnInner: {
    backgroundColor: colors.primaryBlue,
    width: moderateScale(16),
    height: moderateScale(16),
    borderRadius: 200,
  },
  titleText: {
    ...globalStyles.lightText14,
  },
});

export default RadioButton;
