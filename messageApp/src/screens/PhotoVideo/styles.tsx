import {StyleSheet} from 'react-native';
import colors from '../../utils/colors';

export default StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.black,
  },
  captureBtn: {
    borderWidth: 3,
    borderColor: colors.white,
    width: 70,
    height: 70,
    borderRadius: 200,
    alignItems: 'center',
    justifyContent: 'center',
  },
  captureBtnInner: {
    backgroundColor: colors.white,
    width: 58,
    height: 58,
    borderRadius: 200,
  },
  bottomActionContainer: {
    bottom: 30,
    position: 'absolute',
    left: 0,
    right: 0,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 30,
  },
  topActionContainer: {
    top: 0,
    position: 'absolute',
    left: 0,
    right: 0,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 30,
  },
  photoVideoBtmContainer: {
    bottom: 0,
    left: 0,
    right: 0,
    position: 'absolute',
    backgroundColor: colors.black,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
  },
  photoVideoText: {
    color: colors.white,
    textTransform: 'uppercase',
  },
  videoNotSelected: {
    marginEnd: 30,
    marginStart: -70,
  },
  photoSelectedText: {
    color: colors.orange,
  },
  videoSelected: {
    color: colors.orange,
    marginStart: 60,
  },
  photoNotSelectedText: {
    marginStart: 20,
  },
});
