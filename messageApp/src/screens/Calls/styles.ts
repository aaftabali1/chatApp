import {StyleSheet} from 'react-native';
import colors from '../../utils/colors';
import {globalStyles} from '../../utils/commonStyles';
import {
  horizontalScale,
  moderateScale,
  verticalScale,
} from '../../utils/commonnFunctions';

export default StyleSheet.create({
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
  callItemContainer: {
    flex: 1,
    flexDirection: 'row',
    paddingVertical: 10,
    alignItems: 'center',
  },
  userImage: {width: 40, height: 40},
  username: {
    fontWeight: 'bold',
    fontSize: 14,
  },
  bottomBorder: {
    height: 1,
    backgroundColor: colors.borderColor,
  },
  callStatus: {
    fontWeight: '300',
    fontStyle: 'italic',
    fontSize: 13,
  },
  callIcons: {
    width: 15,
    height: 15,
    resizeMode: 'contain',
    marginEnd: 5,
  },
  callStatusMissed: {
    fontWeight: '300',
    fontStyle: 'italic',
    fontSize: 13,
    color: 'red',
  },
  topTabContainer: {
    flexDirection: 'row',
    marginHorizontal: 20,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 8,
    overflow: 'hidden',
    backgroundColor: colors.blueLight,
    padding: 2,
  },
  tabs: {
    flex: 1,
    alignItems: 'center',
    paddingVertical: 6,
  },
  selectedTab: {
    backgroundColor: colors.white,
    borderRadius: 8,
    margin: 1,
  },
  tabText: {
    ...globalStyles.regularText16,
  },
  initiateCallContainer: {
    ...globalStyles.whiteRoundContainer,
    marginTop: verticalScale(20),
    paddingVertical: 0,
  },
  newCallContainer: {
    flexDirection: 'row',
    paddingVertical: verticalScale(14),
    alignItems: 'center',
  },
  newCallIcon: {
    width: moderateScale(20),
    height: moderateScale(20),
    resizeMode: 'contain',
    marginStart: horizontalScale(3),
    marginEnd: horizontalScale(36),
  },
  newCallText: {
    flex: 1,
    ...globalStyles.lightText14,
  },
  nextArrow: {
    width: moderateScale(16),
    height: moderateScale(16),
    resizeMode: 'contain',
  },
  divider: {
    ...globalStyles.divider,
    marginVertical: 0,
    backgroundColor: colors.offWhite,
  },
});
