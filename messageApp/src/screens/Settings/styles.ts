import {StyleSheet} from 'react-native';
import colors from '../../utils/colors';

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
});
