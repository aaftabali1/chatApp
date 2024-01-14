import {
  Image,
  SafeAreaView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import colors from '../utils/colors';
import {useTranslation} from 'react-i18next';
import images from '../utils/images';

const CustomHeader = ({
  title,
  navigation,
}: {
  title: string;
  navigation: any;
}) => {
  const {t} = useTranslation();
  return (
    <SafeAreaView style={styles.header}>
      <TouchableOpacity onPress={() => navigation.goBack()}>
        <Image source={images.back} style={styles.backImage} />
      </TouchableOpacity>
      <Text style={styles.headerText}>{t(`${title}`)}</Text>
      <TouchableOpacity style={{opacity: 0}}>
        <Image source={images.back} style={styles.backImage} />
      </TouchableOpacity>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  header: {
    backgroundColor: colors.primary,
    flexDirection: 'row',
    alignItems: 'center',
  },
  headerText: {
    fontWeight: 'bold',
    color: colors.white,
    textAlign: 'center',
    flex: 1,
    fontSize: 18,
    marginVertical: 20,
  },
  backImage: {
    width: 44,
    height: 24,
    resizeMode: 'contain',
    paddingStart: 20,
  },
});

export default CustomHeader;
