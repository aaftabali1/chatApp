import React from 'react';
import {View, Text, StyleSheet, Image, TouchableOpacity} from 'react-native';
import Modal from 'react-native-modal';
import colors from '../utils/colors';
import {moderateScale, verticalScale} from '../utils/commonnFunctions';
import images from '../utils/images';
import {useTranslation} from 'react-i18next';
import {globalStyles} from '../utils/commonStyles';

const ChatAction = ({
  isVisible,
  hideActionMenu,
  onPresspinUnpinChat,
  onPressSecretChat,
  onPressMarkRead,
  onPressContactDetails,
  onPressDeleteMessages,
  onPressDeleteConversation,
}: {
  isVisible: boolean;
  hideActionMenu: () => void;
  onPresspinUnpinChat: () => void;
  onPressSecretChat: () => void;
  onPressMarkRead: () => void;
  onPressContactDetails: () => void;
  onPressDeleteMessages: () => void;
  onPressDeleteConversation: () => void;
}) => {
  const {t} = useTranslation();

  return (
    <Modal isVisible={isVisible} style={styles.container}>
      <View style={styles.filterOuter}>
        <View style={styles.filterHeader}>
          <Image source={images.filterCircel} style={styles.filterImage} />
          <Text style={styles.filterText}>{t('chatOptions')}</Text>
          <TouchableOpacity onPress={hideActionMenu}>
            <Image source={images.cross} style={styles.crossImage} />
          </TouchableOpacity>
        </View>
        <View style={styles.menuMainContainer}>
          <TouchableOpacity
            onPress={onPresspinUnpinChat}
            style={styles.menuItemContainer}>
            <Image source={images.pin} style={styles.pinImage} />
            <Text style={styles.menuItemText}>{t('pinConversation')}</Text>
          </TouchableOpacity>
          <TouchableOpacity
            onPress={onPressSecretChat}
            style={styles.menuItemContainer}>
            <Image source={images.lockChat} style={styles.pinImage} />
            <Text style={styles.menuItemText}>{t('activeSecretMode')}</Text>
          </TouchableOpacity>
          <TouchableOpacity
            onPress={onPressMarkRead}
            style={styles.menuItemContainer}>
            <Image source={images.unreadMessages} style={styles.pinImage} />
            <Text style={styles.menuItemText}>{t('markUnread')}</Text>
          </TouchableOpacity>
          <TouchableOpacity
            onPress={onPressContactDetails}
            style={styles.menuItemContainer}>
            <Image source={images.account} style={styles.pinImage} />
            <Text style={styles.menuItemText}>{t('accessContactDetails')}</Text>
          </TouchableOpacity>
          <TouchableOpacity
            onPress={onPressDeleteMessages}
            style={styles.menuItemContainer}>
            <Image source={images.eraser} style={styles.pinImage} />
            <Text style={styles.menuItemText}>{t('deleteAllMessage')}</Text>
          </TouchableOpacity>
          <TouchableOpacity
            onPress={onPressDeleteConversation}
            style={styles.menuItemContainer}>
            <Image
              source={images.trash}
              style={[styles.pinImage, {tintColor: colors.textColor}]}
            />
            <Text style={styles.menuItemText}>{t('deleteConversation')}</Text>
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
  pinImage: {
    width: moderateScale(20),
    height: moderateScale(20),
    resizeMode: 'contain',
    marginEnd: 10,
  },
  menuItemContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: verticalScale(20),
  },
  menuMainContainer: {
    padding: moderateScale(20),
  },
  menuItemText: {
    ...globalStyles.lightText14,
  },
});
export default ChatAction;
