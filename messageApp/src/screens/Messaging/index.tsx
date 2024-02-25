import React, {
  useCallback,
  useEffect,
  useLayoutEffect,
  useRef,
  useState,
} from 'react';
import {
  View,
  TextInput,
  Text,
  FlatList,
  Pressable,
  KeyboardAvoidingView,
  Platform,
  Image,
  SafeAreaView,
  TouchableOpacity,
  Alert,
} from 'react-native';
import MessageComponent from '../../components/MessageComponent';
import styles from './styles';
import socket from '../../utils/socket';
import {useTranslation} from 'react-i18next';
import {NavigationProp, useNavigation} from '@react-navigation/native';
import images from '../../utils/images';
import constants from '../../utils/constants';
import {useSelector} from 'react-redux';
import {selectUserId, selectUsername} from '../../redux/slices/authSlice';
import AudioRecorderPlayer, {
  AVEncoderAudioQualityIOSType,
  AVEncodingOption,
  AVModeIOSOption,
  AudioEncoderAndroidType,
  AudioSourceAndroidType,
} from 'react-native-audio-recorder-player';
import RNFS from 'react-native-fs';
import WaveForm from 'react-native-audiowaveform';
import colors from '../../utils/colors';

const audioRecorderPlayer = new AudioRecorderPlayer();

const Messaging = ({route}: any) => {
  const {t} = useTranslation();
  const {item, receiver} = route.params;
  const username = useSelector(selectUsername);
  const userId = useSelector(selectUserId);
  const navigation = useNavigation<NavigationProp<any>>();
  const flatListRef = useRef<any>();

  const [recordTime, setRecordTime] = useState<any>();
  const [chatMessages, setChatMessages] = useState<any>([]);
  const [message, setMessage] = useState('');
  const [offset, setOffset] = useState(0);
  const [showDownArrow, setShowDownArrow] = useState(false);
  const [audioFile, setAudioFile] = useState<any>('');
  const [audioPath, setAudioPath] = useState('');
  const [audioBase, setAudioBase] = useState<any>('');
  const [audioRecording, setAudioRecording] = useState(false);
  const [isPlaying, setIsPlaying] = useState(false);

  useLayoutEffect(() => {
    navigation.setOptions({title: item.receiver_name});
  }, []);

  const findUserCallback = useCallback(
    (roomChats: any) => {
      setChatMessages((prevData: any) => [...prevData, ...roomChats]);
    },
    [socket],
  );

  const getNewMessageCallback = useCallback(
    (chats: any) => {
      setChatMessages(chats);
    },
    [socket],
  );

  const fetchMessages = () => {
    socket.emit('findUser', {
      chatId: item.chat_id,
      sender: userId,
      receiver: item.receiver_id,
      offset,
    });
  };

  // fetching messages when user open screen
  useEffect(() => {
    fetchMessages();
  }, [offset]);

  const markMessagesRead = () => {
    socket.emit('messageRead', {
      chatId: item.chat_id,
      userId: item.receiver_id,
    });
  };

  // marking message as read when user open screen
  useEffect(() => {
    markMessagesRead();

    return () => {
      audioRecorderPlayer.removePlayBackListener();
      audioRecorderPlayer.removeRecordBackListener();
    };
  }, []);

  const generateRandomWaveform = () => {
    const numPoints = 100;
    const scaleFactor = 40 / 2; // Scale factor for the analog waveform
    const analogWave = [];
    for (let i = 0; i < numPoints; i++) {
      const x = i * 10;
      const y =
        20 +
        Math.sin((x / 100) * Math.PI * 2 + Date.now() / 1000) * scaleFactor;
      analogWave.push(`${x},${y}`);
    }
    return analogWave;
  };

  // handling socket response
  useEffect(() => {
    socket.on('foundUser', findUserCallback);
    socket.on('getNewMessage', getNewMessageCallback);

    return () => {
      socket.off('foundUser', findUserCallback);
      socket.off('getNewMessage', getNewMessageCallback);
    };
  }, [findUserCallback, socket, getNewMessageCallback]);

  //Sending new message
  const handleNewMessage = () => {
    const messageObject = {
      message,
      chat_id: item.chat_id,
      receiver: receiver,
      sender: userId,
      offset: 0,
    };

    socket.emit('newChatMessage', messageObject);
    setMessage('');
  };

  const onStartRecord = async () => {
    const audioSet = {
      AudioEncoderAndroid: AudioEncoderAndroidType.AAC,
      AudioSourceAndroid: AudioSourceAndroidType.MIC,
      AVModeIOS: AVModeIOSOption.measurement,
      AVEncoderAudioQualityKeyIOS: AVEncoderAudioQualityIOSType.high,
      AVNumberOfChannelsKeyIOS: 2,
      AVFormatIDKeyIOS: AVEncodingOption.aac,
    };
    const meteringEnabled = false;
    // await setRecordTime(0);
    try {
      // Start the recording and get the audio URI
      const uri = await audioRecorderPlayer?.startRecorder(
        undefined,
        audioSet,
        meteringEnabled,
      );
      setRecordTime('00:00:00');
      setAudioRecording(true);
      audioRecorderPlayer.addRecordBackListener(e => {
        setRecordTime(
          audioRecorderPlayer.mmssss(Math.floor(e.currentPosition)),
        );
        return;
      });
      setAudioPath(uri);
    } catch (error) {
      console.log('Uh-oh! Failed to start recording:', error);
    }
  };

  const prepRecording = async () => {
    try {
      const path = `recording-${Math.random().toString(36).substring(2, 5)}`;
      await audioRecorderPlayer?.stopRecorder();
      const fileContent = await RNFS.readFile(audioPath, 'base64');
      const fileInfo = await RNFS.stat(audioPath);
      const vnData = {
        fileCopyUri: fileInfo?.path,
        size: fileInfo?.size,
        type: 'audio/mpeg',
        name: `${path}.aac`,
      };
      const vnBase = `data:application/audio;base64,${fileContent}`;
      setAudioFile(vnData);
      setAudioBase(vnBase);
    } catch (error) {
      console.log('Uh-oh! Failed to stop and send recording:', error);
    }
  };

  // const playAudio = async (newAudioUrl:string) => {
  //   if (active === newAudioUrl) {
  //   try {
  //   if (isPlaying) {
  //   await SoundPlayer.pause(); // Pause the audio if already playing
  //   setIsPlaying(false);
  //   } else {
  //   await SoundPlayer.resume(); // Resume playing the audio if paused
  //   setIsPlaying(true);
  //   }
  //   } catch (error) {
  //   console.log('Oh no! An error occurred while pausing/resuming audio:', error);
  //   }
  //   } else {
  //   try {
  //   if (isPlaying) {
  //   await SoundPlayer.stop(); // Stop the currently playing audio
  //   }
  //   dispatch(setPlaying(newAudioUrl)); // Set the new audio URL
  //   setIsPlaying(true);
  //   const soundData = await SoundPlayer.getInfo();
  //   setTotalDuration(soundData?.duration);
  //   SoundPlayer.addEventListener('FinishedPlaying', () => {
  //   setIsPlaying(false); // Reset the playing state when audio finishes playing
  //   dispatch(clearPlaying(newAudioUrl));
  //   });
  //  await SoundPlayer.playUrl(newAudioUrl); // Play the new audio
  //   const audio = await SoundPlayer.getInfo();
  //   setTotalDuration(audio?.duration);
  //   } catch (error) {
  //   console.log('Oops! An error occurred while playing audio:', error);
  //   }
  //   }
  //  };

  const onStopRecord = async () => {
    const result = await audioRecorderPlayer.stopRecorder();
    audioRecorderPlayer.removeRecordBackListener();
    prepRecording();
    setAudioRecording(false);
    console.log(result);
  };

  const onDeleteRecord = async () => {
    const result = await audioRecorderPlayer.stopRecorder();
    audioRecorderPlayer.removeRecordBackListener();
    setAudioPath('');
    console.log(result);
  };

  const onStartPlay = async () => {
    console.log('onStartPlay');
    const msg = await audioRecorderPlayer.startPlayer();
    console.log(msg);
    audioRecorderPlayer.addPlayBackListener(e => {
      return;
    });
  };

  const onStopPlay = async () => {
    console.log('onStopPlay');
    audioRecorderPlayer.stopPlayer();
    audioRecorderPlayer.removePlayBackListener();
  };

  const userProfile = () => {
    return (
      <View
        style={[
          styles.profileContainer,
          {backgroundColor: 'white', flexDirection: 'column', padding: 0},
        ]}>
        <View style={styles.profileContainer}>
          <Image source={images.user} style={styles.profileImage} />
          <View style={styles.userDetailsContainer}>
            <Text style={styles.userFullName}>{receiver}</Text>
            <Text style={styles.goToProfile}>{t('profile')}</Text>
          </View>
          <TouchableOpacity
            onPress={() => {
              navigation.navigate('IncomingVideoCall', {
                username: receiver,
                callType: constants.outgoingCall,
                currentUser: username,
                callId: 0,
              });
            }}>
            <Image source={images.video} style={styles.videoCallImage} />
          </TouchableOpacity>
          <TouchableOpacity
            onPress={() => {
              navigation.navigate('IncomingVoiceCall', {
                username: receiver,
                callType: constants.outgoingCall,
                currentUser: username,
              });
            }}>
            <Image source={images.phoneCall} style={styles.voiceCallImage} />
          </TouchableOpacity>
        </View>
      </View>
    );
  };

  const handleScroll = (event: any) => {
    const offsetY = event.nativeEvent.contentOffset.y;
    setShowDownArrow(offsetY > 0);
  };

  const scrollToTop = () => {
    if (flatListRef.current) {
      flatListRef.current.scrollToOffset({offset: 0, animated: true});
    }
  };

  const handleSendAudio = async () => {
    onDeleteRecord();
    try {
      socket.emit('sendAudio', {
        chatId: item.chat_id,
        audioData: audioBase,
        senderId: userId,
        receiverId: item.receiver_id,
        offset,
      });
    } catch (error) {
      console.error('Error sending audio:', error);
      Alert.alert('Error', 'Failed to send audio');
    }
  };

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === 'ios' ? 'padding' : 'padding'}
      keyboardVerticalOffset={Platform.OS === 'ios' ? 120 : 20}
      style={styles.messagingscreen}>
      <View
        style={[
          styles.messagingscreen,
          {paddingVertical: 15, paddingHorizontal: 10},
        ]}>
        {userProfile()}
        <FlatList
          onEndReached={() => {
            setOffset(prevOffset => prevOffset + 1);
          }}
          ref={flatListRef}
          onEndReachedThreshold={0.2}
          data={chatMessages?.length > 0 ? chatMessages : []}
          inverted
          onScroll={handleScroll}
          showsVerticalScrollIndicator={false}
          renderItem={({item}) => (
            <MessageComponent item={item} user={userId} />
          )}
          keyExtractor={(item: any, i: number) => `${i}-${item.id}`}
        />
      </View>

      {showDownArrow && (
        <TouchableOpacity style={styles.downArrow} onPress={scrollToTop}>
          <Text style={styles.downArrowImg}>▼</Text>
        </TouchableOpacity>
      )}
      <SafeAreaView style={styles.messaginginputContainer}>
        {audioPath == '' && (
          <View style={styles.messaginginputContainerInner}>
            <Image source={images.user} style={styles.avtar} />
            <TextInput
              style={styles.messaginginput}
              value={message}
              placeholder={t('writeYourComment')}
              onChangeText={value => setMessage(value)}
            />
            <Pressable
              style={styles.messagingbuttonContainer}
              onPress={handleNewMessage}>
              <Image source={images.send} style={styles.sendImage} />
            </Pressable>
          </View>
        )}
        {audioPath == '' && (
          <View style={styles.extraOptions}>
            <TouchableOpacity onPress={() => onStartRecord()}>
              <Image source={images.mic} style={styles.micImage} />
            </TouchableOpacity>
            <TouchableOpacity onPress={() => onStopRecord()}>
              <Image source={images.emoji} style={styles.micImage} />
            </TouchableOpacity>
            <TouchableOpacity onPress={() => onStartPlay()}>
              <Image source={images.videoPhoto} style={styles.videoPhoto} />
            </TouchableOpacity>
            <TouchableOpacity onPress={() => onStopPlay()}>
              <Image source={images.gif} style={styles.micImage} />
            </TouchableOpacity>
          </View>
        )}
        {audioPath != '' && (
          <View style={styles.messaginginputContainerInner}>
            <TouchableOpacity
              onPress={onDeleteRecord}
              style={styles.closeIconContainer}>
              <Image source={images.close} style={styles.closeIcon} />
            </TouchableOpacity>

            {!audioRecording ? (
              <View style={[styles.waveformContainer]}>
                <TouchableOpacity onPress={() => setIsPlaying(prev => !prev)}>
                  <Image
                    source={isPlaying ? images.pause : images.play}
                    style={styles.playIcon}
                  />
                </TouchableOpacity>
                <WaveForm
                  onFinishPlay={() => setIsPlaying(false)}
                  play={isPlaying}
                  autoPlay={false}
                  style={[styles.waveform]}
                  waveFormStyle={{
                    waveColor: colors.blueLight,
                    scrubColor: colors.primaryBlue,
                  }}
                  source={{
                    uri: audioPath,
                  }}
                />
              </View>
            ) : (
              <View style={{flex: 1}}>
                <Text style={styles.recordTime}>
                  {recordTime?.substring(0, 5)}
                </Text>
              </View>
            )}
            {audioRecording ? (
              <TouchableOpacity onPress={onStopRecord}>
                <Image source={images.stop} style={styles.stopImage} />
              </TouchableOpacity>
            ) : (
              <Pressable
                style={styles.messagingbuttonContainer}
                onPress={handleSendAudio}>
                <Image source={images.send} style={styles.sendImage} />
              </Pressable>
            )}
          </View>
          // <View
          //   style={{
          //     flexDirection: 'row',
          //     alignItems: 'center',
          //     justifyContent: 'space-around',
          //     marginTop: 20,
          //   }}>
          //   <Text style={styles.recordTime}>{recordTime?.substring(0, 5)}</Text>
          //   <TouchableOpacity onPress={() => onDeleteRecord()}>
          //     <Image source={images.trash} style={styles.trashImage} />
          //   </TouchableOpacity>
          //   <TouchableOpacity onPress={() => onStopRecord()}>
          //     <Text>Stop</Text>
          //   </TouchableOpacity>
          //   <TouchableOpacity onPress={handleSendAudio}>
          //     <Image
          //       source={images.send}
          //       style={{width: 20, height: 20, resizeMode: 'contain'}}
          //     />
          //   </TouchableOpacity>
          // </View>
        )}
      </SafeAreaView>
    </KeyboardAvoidingView>
  );
};

export default Messaging;
