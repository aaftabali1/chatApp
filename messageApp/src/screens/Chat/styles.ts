import {StyleSheet} from 'react-native';
import colors from '../../utils/colors';
import {
  horizontalScale,
  moderateScale,
  verticalScale,
} from '../../utils/commonnFunctions';
import {globalStyles} from '../../utils/commonStyles';

export default StyleSheet.create({
  chatscreen: {
    backgroundColor: colors.bgColor,
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
    backgroundColor: colors.bgColor,
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
    marginTop: 20,
  },
  chatemptyContainer: {
    width: '100%',
    height: '80%',
    alignItems: 'center',
    justifyContent: 'center',
  },
  chatemptyText: {
    fontWeight: 'bold',
    fontSize: 24,
    paddingBottom: 30,
  },
  searchInputContainer: {
    backgroundColor: colors.white,
    borderRadius: 120,
    marginHorizontal: 20,
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 15,
  },
  searchIcon: {
    width: 25,
    height: 25,
    resizeMode: 'contain',
  },
  searchInput: {
    flex: 1,
    paddingVertical: 0,
    paddingHorizontal: 15,
  },
  header: {
    paddingHorizontal: 20,
    marginTop: 20,
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  discussHeadign: {
    fontSize: 16,
    color: colors.textColor,
  },
  filterImage: {
    width: 24,
    height: 24,
  },
  editButton: {
    backgroundColor: colors.orange,
    borderRadius: 240,
    position: 'absolute',
    bottom: 30,
    right: 20,
    zIndex: 12,
    padding: 15,
  },
  editImage: {
    width: 25,
    height: 25,
  },
  leftHiddenItems: {
    flex: 1,
    padding: 0,
  },
  rightFirstItem: {
    position: 'absolute',
    right: 0,
    width: 60,
    backgroundColor: colors.orange,
    bottom: 0,
    top: 0,
    alignItems: 'center',
    justifyContent: 'center',
  },
  trashImage: {
    width: 30,
    height: 30,
    resizeMode: 'contain',
  },
  rightSecondItem: {
    position: 'absolute',
    right: 60,
    width: 60,
    backgroundColor: colors.primary,
    bottom: 0,
    top: 0,
    alignItems: 'center',
    justifyContent: 'center',
  },
  archiveImage: {
    width: 25,
    height: 25,
    resizeMode: 'contain',
  },
  rightThirdItem: {
    position: 'absolute',
    right: 120,
    width: 60,
    backgroundColor: colors.pinYellow,
    bottom: 0,
    top: 0,
    alignItems: 'center',
    justifyContent: 'center',
  },
  pinnedOuter: {
    borderRadius: 10,
    padding: 10,
    backgroundColor: colors.blueTransparent,
    marginHorizontal: 20,
    marginTop: 20,
  },
  profileImage: {
    width: 30,
    height: 30,
    resizeMode: 'contain',
    borderRadius: 200,
  },
  pinnedItemOuter: {
    marginTop: verticalScale(10),
    marginEnd: horizontalScale(15),
    alignItems: 'center',
  },
  pinnedUsername: {
    maxWidth: 60,
    marginTop: 5,
    ...globalStyles.lightText14,
  },
  removePin: {
    backgroundColor: colors.textColor,
    paddingHorizontal: 5,
    paddingVertical: 3,
    borderRadius: 100,
    position: 'absolute',
    right: 5,
    zIndex: 5,
    top: 0,
  },
  closeText: {
    color: colors.white,
    fontSize: moderateScale(8),
  },
});
