import {StyleSheet} from 'react-native';
import colors from './colors';
import {
  horizontalScale,
  moderateScale,
  verticalScale,
} from './commonnFunctions';
import fonts from './fonts';

export const styles = StyleSheet.create({
  loginscreen: {
    flex: 1,
    backgroundColor: '#EEF1FF',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 12,
    width: '100%',
  },
  loginheading: {
    fontSize: 26,
    marginBottom: 10,
  },
  logininputContainer: {
    width: '100%',
    alignItems: 'center',
    justifyContent: 'center',
  },
  logininput: {
    borderWidth: 1,
    width: '90%',
    padding: 8,
    borderRadius: 2,
  },
  loginbutton: {
    backgroundColor: 'green',
    padding: 12,
    marginVertical: 10,
    width: '60%',
    borderRadius: 200,
    elevation: 1,
  },
  loginbuttonText: {
    textAlign: 'center',
    color: '#fff',
    fontWeight: '600',
  },
  chatscreen: {
    backgroundColor: '#F7F7F7',
    flex: 1,
    padding: 10,
    position: 'relative',
  },
  chatheading: {
    fontSize: 24,
    fontWeight: 'bold',
    color: 'green',
  },
  chattopContainer: {
    backgroundColor: '#F7F7F7',
    height: 70,
    width: '100%',
    padding: 20,
    justifyContent: 'center',
    marginBottom: 15,
    elevation: 2,
  },
  chatheader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  chatlistContainer: {
    paddingHorizontal: 10,
  },
  chatemptyContainer: {
    width: '100%',
    height: '80%',
    alignItems: 'center',
    justifyContent: 'center',
  },
  chatemptyText: {fontWeight: 'bold', fontSize: 24, paddingBottom: 30},
  messagingscreen: {
    flex: 1,
  },
  messaginginputContainer: {
    width: '100%',
    minHeight: 100,
    backgroundColor: colors.tabBg,
    paddingVertical: 30,
    paddingHorizontal: 15,
    justifyContent: 'center',
    flexDirection: 'row',
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
  },
  messaginginput: {
    borderWidth: 1,
    padding: 15,
    flex: 1,
    marginRight: 10,
    borderRadius: 20,
  },
  messagingbuttonContainer: {
    width: '30%',
    backgroundColor: 'green',
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 50,
  },
  modalbutton: {
    width: '40%',
    height: 45,
    backgroundColor: 'green',
    borderRadius: 5,
    alignItems: 'center',
    justifyContent: 'center',
    color: '#fff',
  },
  modalbuttonContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 10,
  },
  modaltext: {
    color: '#fff',
  },
  modalContainer: {
    width: '100%',
    borderTopColor: '#ddd',
    borderTopWidth: 1,
    elevation: 1,
    height: 400,
    backgroundColor: '#fff',
    position: 'absolute',
    bottom: 0,
    zIndex: 10,
    paddingVertical: 50,
    paddingHorizontal: 20,
  },
  modalinput: {
    borderWidth: 2,
    padding: 15,
  },
  modalsubheading: {
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 15,
    textAlign: 'center',
  },
  mmessageWrapper: {
    width: '100%',
    alignItems: 'flex-start',
    marginBottom: 15,
  },
  mmessage: {
    maxWidth: '50%',
    backgroundColor: '#f5ccc2',
    padding: 15,
    borderRadius: 10,
    marginBottom: 2,
  },
  mvatar: {
    marginRight: 5,
  },
  cchat: {
    width: '100%',
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 15,
    paddingBottom: 10,
    paddingVertical: 10,
    borderTopWidth: StyleSheet.hairlineWidth,
    borderColor: colors.borderColor,
    backgroundColor: colors.bgColor,
  },
  cavatar: {
    marginRight: 15,
    width: 40,
    height: 40,
  },
  cusername: {
    fontSize: 18,
    marginBottom: 5,
    fontWeight: 'bold',
    color: colors.textColor,
  },
  cmessage: {
    fontSize: 14,
    opacity: 0.7,
    color: colors.textColor,
  },
  crightContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    flex: 1,
  },
  ctime: {
    opacity: 0.5,
  },
  mavatar: {
    width: 30,
    height: 30,
    borderRadius: 15,
  },
});

export const globalStyles = StyleSheet.create({
  shadow: {
    shadowColor: '#333',
    shadowOffset: {width: 0, height: 1},
    shadowOpacity: 0.5,
    shadowRadius: 2,
    elevation: 3,
  },
  scrollContentContainer: {
    flexGrow: 1,
  },
  divider: {
    height: 1,
    width: '100%',
    marginVertical: 10,
    backgroundColor: 'grey',
  },
  flexRow: {flexDirection: 'row'},
  flexOne: {flex: 1},
  heading14: {
    fontFamily: fonts.bold,
    fontSize: moderateScale(14),
    color: colors.textColor,
  },
  heading16: {
    fontFamily: fonts.bold,
    fontSize: moderateScale(16),
    color: colors.textColor,
  },
  lightText14: {
    fontFamily: fonts.light,
    color: colors.textColor,
    fontSize: moderateScale(14),
  },
  lightText16: {
    fontFamily: fonts.light,
    color: colors.textColor,
    fontSize: moderateScale(16),
  },
  regularText14: {
    fontFamily: fonts.regular,
    color: colors.textColor,
    fontSize: moderateScale(14),
  },
  regularText16: {
    fontFamily: fonts.regular,
    color: colors.textColor,
    fontSize: moderateScale(16),
  },
  heading14Italic: {
    fontFamily: fonts.boldItalic,
    fontSize: moderateScale(14),
    color: colors.textColor,
  },
  heading16Italic: {
    fontFamily: fonts.boldItalic,
    fontSize: moderateScale(16),
    color: colors.textColor,
  },
  lightText14Italic: {
    fontFamily: fonts.lightItalic,
    color: colors.textColor,
    fontSize: moderateScale(14),
  },
  lightText16Italic: {
    fontFamily: fonts.lightItalic,
    color: colors.textColor,
    fontSize: moderateScale(16),
  },
  regularText14Italic: {
    fontFamily: fonts.italic,
    color: colors.textColor,
    fontSize: moderateScale(14),
  },
  regularText16Italic: {
    fontFamily: fonts.italic,
    color: colors.textColor,
    fontSize: moderateScale(16),
  },
  mediumText14: {
    fontFamily: fonts.medium,
    color: colors.textColor,
    fontSize: moderateScale(14),
  },
  mediumText16: {
    fontFamily: fonts.medium,
    color: colors.textColor,
    fontSize: moderateScale(16),
  },
  submitBtnText: {
    fontSize: moderateScale(16),
    width: '100%',
    textAlign: 'center',
    fontFamily: fonts.regular,
    color: colors.offWhite,
  },
  submitBtnText3: {
    fontSize: moderateScale(16),
    width: '100%',
    textAlign: 'center',
    fontFamily: fonts.regular,
    color: colors.textColor,
  },
  whiteRoundContainer: {
    backgroundColor: colors.white,
    borderRadius: moderateScale(20),
    paddingHorizontal: horizontalScale(20),
    paddingVertical: verticalScale(10),
  },
  submitBtnContainerZeroMargin: {
    width: '90%',
    borderRadius: moderateScale(30),
    alignSelf: 'center',
    marginTop: verticalScale(5),
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 13,
    backgroundColor: colors.orange,
    shadowColor: '#333',
    shadowOffset: {width: 0, height: 1},
    shadowOpacity: 0.5,
    shadowRadius: 2,
    elevation: 3,
    marginBottom: verticalScale(5),
    borderWidth: 2,
    borderColor: colors.orange,
  },
  submitBtnContainerWhiteZeroMargin: {
    width: '90%',
    borderRadius: moderateScale(30),
    alignSelf: 'center',
    marginTop: verticalScale(5),
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 13,
    backgroundColor: colors.white,
    shadowColor: '#333',
    shadowOffset: {width: 0, height: 1},
    shadowOpacity: 0.5,
    shadowRadius: 2,
    elevation: 3,
    marginBottom: verticalScale(5),
    borderWidth: 2,
    borderColor: colors.orange,
  },
});
