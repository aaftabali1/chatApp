import {StyleSheet} from 'react-native';
import colors from '../../utils/colors';

export default StyleSheet.create({
  messagingscreen: {
    flex: 1,
  },
  messaginginputContainer: {
    width: '100%',
    backgroundColor: colors.tabBg,
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    paddingBottom: 15,
  },
  messaginginput: {
    padding: 0,
    flex: 1,
    marginHorizontal: 10,
    borderRadius: 20,
    backgroundColor: colors.white,
    paddingVertical: 12,
    paddingHorizontal: 10,
  },
  messagingbuttonContainer: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  avtar: {
    width: 30,
    height: 30,
    resizeMode: 'contain',
  },
  messaginginputContainerInner: {
    width: '100%',
    paddingHorizontal: 15,
    justifyContent: 'center',
    flexDirection: 'row',
    paddingTop: 10,
    alignItems: 'center',
  },
  sendImage: {
    width: 20,
    height: 20,
    resizeMode: 'contain',
  },
  profileContainer: {
    backgroundColor: colors.blueLight,
    padding: 15,
    borderRadius: 20,
    flexDirection: 'row',
    opacity: 1,
  },
  profileImage: {
    width: 40,
    height: 40,
    resizeMode: 'contain',
  },
  userDetailsContainer: {
    marginStart: 10,
    flex: 1,
  },
  userFullName: {
    fontSize: 16,
    color: colors.textColor,
  },
  username: {
    fontWeight: '300',
    fontSize: 14,
    marginTop: 5,
  },
  goToProfile: {
    fontWeight: '500',
    fontSize: 14,
    color: colors.primaryBlue,
    marginTop: 5,
    textDecorationLine: 'underline',
  },
  videoCallImage: {
    width: 25,
    height: 25,
    resizeMode: 'contain',
  },
  voiceCallImage: {
    width: 25,
    height: 25,
    resizeMode: 'contain',
    marginStart: 20,
  },
  downArrow: {
    backgroundColor: colors.primaryBlue,
    position: 'absolute',
    right: 10,
    bottom: 140,
    zIndex: 12,
    paddingVertical: 10,
    paddingHorizontal: 13,
    borderRadius: 220,
  },
  downArrowImg: {
    color: colors.white,
  },
  extraOptions: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-evenly',
    marginTop: 10,
  },
  micImage: {
    width: 32,
    height: 32,
    resizeMode: 'contain',
  },
  videoPhoto: {
    width: 51,
    height: 36,
    resizeMode: 'contain',
  },
  recordTime: {
    color: colors.textColor,
    fontSize: 16,
  },
  trashImage: {
    width: 30,
    height: 30,
    resizeMode: 'contain',
    tintColor: colors.orange,
    marginStart: -10,
  },
});
