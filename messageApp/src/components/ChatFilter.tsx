import React, {useState} from 'react';
import {View, Text, StyleSheet, Image, TouchableOpacity} from 'react-native';
import Modal from 'react-native-modal';
import colors from '../utils/colors';
import {moderateScale, verticalScale} from '../utils/commonnFunctions';
import images from '../utils/images';
import {useTranslation} from 'react-i18next';
import {globalStyles} from '../utils/commonStyles';
import RadioButton from './RadioButton';

const ChatFilter = ({
  isVisible,
  hideFilter,
  filterValue,
  setFilterValue,
}: {
  isVisible: boolean;
  hideFilter: () => void;
  filterValue: number;
  setFilterValue: (_: number) => void;
}) => {
  const {t} = useTranslation();

  const [selectedFilter, setSelectedFilter] = useState(filterValue);

  return (
    <Modal isVisible={isVisible} style={styles.container}>
      <View style={styles.filterOuter}>
        <View style={styles.filterHeader}>
          <Image source={images.filter} style={styles.filterImage} />
          <Text style={styles.filterText}>{t('filters')}</Text>
          <TouchableOpacity
            onPress={() => {
              setSelectedFilter(filterValue);
              hideFilter();
            }}>
            <Image source={images.cross} style={styles.crossImage} />
          </TouchableOpacity>
        </View>
        <View style={styles.radioContainer}>
          <RadioButton
            checked={selectedFilter == 0}
            setChecked={() => {
              setSelectedFilter(0);
            }}
            title={`${t('all')} (63)`}
          />
          <RadioButton
            checked={selectedFilter == 1}
            setChecked={() => {
              setSelectedFilter(1);
            }}
            title={`${t('archivedMessages')} (27)`}
          />
          <RadioButton
            checked={selectedFilter == 2}
            setChecked={() => {
              setSelectedFilter(2);
            }}
            title={`${t('unreadMessages')} (2)`}
          />
          <RadioButton
            checked={selectedFilter == 3}
            setChecked={() => {
              setSelectedFilter(3);
            }}
            title={`${t('mutedMessages')} (1)`}
          />
          <RadioButton
            checked={selectedFilter == 4}
            setChecked={() => {
              setSelectedFilter(4);
            }}
            title={`${t('merchantMessages')} (0)`}
          />
          <RadioButton
            checked={selectedFilter == 5}
            setChecked={() => {
              setSelectedFilter(5);
            }}
            title={`${t('contactMessages')} (63)`}
          />

          <TouchableOpacity
            style={styles.applyTextContainer}
            onPress={() => {
              setFilterValue(selectedFilter);
              hideFilter();
            }}>
            <Text style={styles.applyText}>{t('apply')}</Text>
          </TouchableOpacity>
        </View>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  container: {
    justifyContent: 'center',
    flex: 1,
  },
  filterOuter: {
    backgroundColor: colors.white,
    borderRadius: moderateScale(20),
    overflow: 'hidden',
  },
  filterHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 18,
    backgroundColor: colors.offWhite,
  },
  filterImage: {
    width: moderateScale(24),
    height: moderateScale(24),
    resizeMode: 'contain',
    tintColor: colors.primaryBlue,
  },
  filterText: {
    marginStart: 20,
    ...globalStyles.regularText14,
    color: colors.primaryBlue,
    flex: 1,
  },
  crossImage: {
    width: moderateScale(15),
    height: moderateScale(15),
    resizeMode: 'contain',
  },
  radioContainer: {
    padding: 20,
  },
  applyTextContainer: {
    alignSelf: 'center',
  },
  applyText: {
    ...globalStyles.regularText16,
    color: colors.primaryBlue,
    textDecorationLine: 'underline',
    marginVertical: verticalScale(10),
  },
});

export default ChatFilter;
