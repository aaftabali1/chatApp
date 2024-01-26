import React, {useEffect, useState, useRef, useCallback} from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  Image,
  SafeAreaView,
  ImageBackground,
} from 'react-native';
import {mediaDevices, RTCView} from 'react-native-webrtc';
import socket from '../../utils/socket';
import constants from '../../utils/constants';
import {navigationRef} from '../../utils/navigationRef';
import images from '../../utils/images';
import colors from '../../utils/colors';
import {useNavigation} from '@react-navigation/native';
import peer from '../../utils/peer';
import styles from './styles';
import InCallManager from 'react-native-incall-manager';

const IncomingVideoCall = ({route}: any) => {
  const navigation = useNavigation<any>();

  const {username, callType, currentUser, callId} = route.params;

  const [type, setType] = useState(callType);
  const otherUserId = useRef(null);
  // Stream of local user
  const [localStream, setlocalStream] = useState<any>(null);
  /* When a call is connected, the video stream from the receiver is appended to this state in the stream*/
  const [remoteStream, setRemoteStream] = useState<any>(null);
  // Handling Mic status
  const [localMicOn, setlocalMicOn] = useState(true);
  // Handling Camera status
  const [localWebcamOn, setlocalWebcamOn] = useState(true);

  // Switch Camera
  function switchCamera() {
    localStream.getVideoTracks().forEach((track: any) => {
      track._switchCamera();
    });
  }

  // Enable/Disable Camera
  function toggleCamera() {
    localWebcamOn ? setlocalWebcamOn(false) : setlocalWebcamOn(true);
    localStream.getVideoTracks().forEach((track: any) => {
      localWebcamOn ? (track.enabled = false) : (track.enabled = true);
    });
  }

  // Enable/Disable Mic
  function toggleMic() {
    localMicOn ? setlocalMicOn(false) : setlocalMicOn(true);
    localStream.getAudioTracks().forEach((track: any) => {
      localMicOn ? (track.enabled = false) : (track.enabled = true);
    });
  }

  function leave() {
    socket.emit('endCall', {
      callerId: username,
      calleeId: currentUser,
    });
    streamCleanup();
    // if (navigationRef.current?.canGoBack()) navigationRef.current?.goBack();
  }

  const streamCleanup = async () => {
    if (localStream) {
      localStream.getTracks().forEach((t: any) => t.stop());
      localStream.release();
    }
    if (remoteStream) {
      remoteStream.getTracks().forEach((t: any) => t.stop());
      remoteStream.release();
    }
    setlocalStream(null);
    setRemoteStream(null);
    peer.close();
    if (navigationRef.current?.canGoBack()) navigationRef.current?.goBack();
  };

  const sendStreams = useCallback(() => {
    if (localStream) {
      for (const track of localStream.getTracks()) {
        peer?.peer?.addTrack(track, localStream);
      }
    }
  }, [localStream]);

  const handleNegoNeedIncomming = useCallback(
    async ({from, offer}: any) => {
      const ans = await peer.getAnswer(offer);
      socket.emit('peer:nego:done', {to: from, ans});
    },
    [socket],
  );

  const handleNegoNeedFinal = useCallback(async ({ans}: any) => {
    await peer.setLocalDescription(ans);
  }, []);

  const handleCallAnswered = useCallback(
    async (data: any) => {
      peer.setLocalDescription(data.rtcMessage);
      setType(constants.webRTC);
      sendStreams();
    },
    [sendStreams, socket],
  );

  const handleCallEnd = useCallback(() => {
    streamCleanup();
    // if (navigationRef.current?.canGoBack()) navigationRef.current?.goBack();
  }, [socket, streamCleanup]);

  useEffect(() => {
    socket.on('callAnswered', handleCallAnswered);

    socket.on('callEnd', handleCallEnd);

    socket.on('peer:nego:needed', handleNegoNeedIncomming);
    socket.on('peer:nego:final', handleNegoNeedFinal);

    return () => {
      socket.off('callAnswered', handleCallAnswered);
      socket.off('callEnd', handleCallEnd);
      socket.off('peer:nego:needed', handleNegoNeedIncomming);
      socket.off('peer:nego:final', handleNegoNeedFinal);
    };
  }, [
    socket,
    handleNegoNeedFinal,
    handleNegoNeedIncomming,
    handleCallAnswered,
    handleCallEnd,
  ]);

  const setupWebRTC = async () => {
    let isFront = true;

    const sourceInfos: any = await mediaDevices.enumerateDevices();

    let videoSourceId;
    for (let i = 0; i < sourceInfos.length; i++) {
      const sourceInfo = sourceInfos[i];
      if (
        sourceInfo.kind == 'videoinput' &&
        sourceInfo.facing == (isFront ? 'user' : 'environment')
      ) {
        videoSourceId = sourceInfo.deviceId;
      }
    }
    const stream = await mediaDevices.getUserMedia({
      audio: true,
      video: {
        minWidth: 500,
        minHeight: 300,
        minFrameRate: 30,
        facingMode: isFront ? 'user' : 'environment',
        deviceId: videoSourceId,
      },
    });

    setlocalStream(stream);
  };

  useEffect(() => {
    otherUserId.current = username;

    navigation.setOptions({title: username});

    setupWebRTC();

    if (callType == constants.outgoingCall) {
      processCall();
    } else {
      InCallManager.start();
      InCallManager.startRingtone();
      InCallManager.setForceSpeakerphoneOn(true);
      // InCallManager.startProximitySensor();
      InCallManager.setKeepScreenOn(true);
    }

    return () => {
      InCallManager.stop();
      // InCallManager.stopProximitySensor();
      InCallManager.setKeepScreenOn(false);
    };
  }, []);

  const handleNegoNeeded = useCallback(async () => {
    const offer = await peer.getOffer();
    console.log('NEG NEEEEDDED');

    socket.emit('peer:nego:needed', {offer, to: username});
  }, [socket, username]);

  useEffect(() => {
    peer?.peer?.addEventListener('negotiationneeded', handleNegoNeeded);
    return () => {
      peer?.peer?.removeEventListener('negotiationneeded', handleNegoNeeded);
    };
  }, [handleNegoNeeded]);

  useEffect(() => {
    peer?.peer?.addEventListener('track', async ev => {
      const remoteStream = ev.streams;
      console.log('GOT TRACKS!!');
      setRemoteStream(remoteStream[0]);
    });
  }, []);

  async function processCall() {
    const offer = await peer.getOffer();

    sendCall({
      callId,
      calleeId: username,
      callerId: currentUser,
      rtcMessage: offer,
    });
  }

  async function processAccept() {
    const ans = await peer.getAnswer(route.params.message);
    answerCall({
      callId,
      callerId: username,
      calleeId: currentUser,
      rtcMessage: ans,
    });
    setTimeout(() => {
      sendStreams();
    }, 500);
  }

  function answerCall(data: any) {
    socket.emit('answerCall', data);
  }

  function sendCall(data: any) {
    socket.emit('call', data);
  }

  const WebrtcRoomScreen = () => {
    return (
      <View style={styles.callingContainer}>
        <SafeAreaView />
        <View style={styles.headerContainer}>
          <Text style={styles.callTitle}>{username}</Text>
          <View style={styles.timeContainer}>
            <Image
              style={styles.ongoingCallImage}
              source={images.ongoingCall}
            />
            <Text>05:33</Text>
          </View>
        </View>
        {/* <CustomHeader title={username} navigation={navigationRef.current} /> */}
        <View style={styles.container}>
          <View style={styles.callViewContainer}>
            <View style={styles.remoteContainer}>
              {remoteStream ? (
                <RTCView
                  objectFit={'cover'}
                  style={{
                    flex: 1,
                  }}
                  streamURL={remoteStream.toURL()}
                />
              ) : null}
            </View>
            <View style={styles.localContainer}>
              {remoteStream && localStream ? (
                <RTCView
                  objectFit={'cover'}
                  style={{
                    flex: 1,
                  }}
                  streamURL={localStream.toURL()}
                />
              ) : null}
            </View>
          </View>
          <View style={styles.bottomBtnContainer}>
            <TouchableOpacity
              style={styles.btnContainer}
              onPress={() => {
                // leave();
              }}>
              <Image source={images.audioOn} style={styles.btnImage} />
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.btnContainer}
              onPress={() => {
                toggleCamera();
              }}>
              <Image
                source={localWebcamOn ? images.videoOn : images.videoOff}
                style={styles.btnImage}
              />
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.btnContainer}
              onPress={() => {
                toggleMic();
              }}>
              <Image
                source={localMicOn ? images.micOn : images.micOff}
                style={styles.btnImage}
              />
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.btnContainer}
              onPress={() => {
                switchCamera();
              }}>
              <Image source={images.switchCamera} style={styles.btnImage} />
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.btnContainer}
              onPress={() => {
                leave();
              }}>
              <Image source={images.decline} style={styles.btnImage} />
            </TouchableOpacity>
          </View>
        </View>
        <SafeAreaView />
      </View>
    );
  };

  const OutgoingCallScreen = () => {
    return (
      <View style={styles.callingContainer}>
        <SafeAreaView />
        <View style={styles.headerContainer}>
          <Text style={styles.callTitle}>Calling to {username}...</Text>
        </View>
        <View style={styles.container}>
          <View style={styles.callViewContainer}>
            {localStream ? (
              <View style={styles.remoteContainer}>
                <RTCView
                  objectFit={'cover'}
                  style={{
                    flex: 1,
                    borderRadius: 10,
                  }}
                  streamURL={localStream.toURL()}
                />
              </View>
            ) : null}
          </View>
          <View style={styles.bottomBtnContainer}>
            <TouchableOpacity
              style={styles.btnContainer}
              onPress={() => {
                // leave();
              }}>
              <Image source={images.audioOn} style={styles.btnImage} />
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.btnContainer}
              onPress={() => {
                toggleCamera();
              }}>
              <Image
                source={localWebcamOn ? images.videoOn : images.videoOff}
                style={styles.btnImage}
              />
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.btnContainer}
              onPress={() => {
                toggleMic();
              }}>
              <Image
                source={localMicOn ? images.micOn : images.micOff}
                style={styles.btnImage}
              />
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.btnContainer}
              onPress={() => {
                switchCamera();
              }}>
              <Image source={images.switchCamera} style={styles.btnImage} />
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.btnContainer}
              onPress={() => {
                leave();
              }}>
              <Image source={images.decline} style={styles.btnImage} />
            </TouchableOpacity>
          </View>
        </View>
        <SafeAreaView />
      </View>
    );
  };

  const IncomingCallScreen = () => {
    return (
      <View style={styles.callingContainer}>
        <SafeAreaView />
        <ImageBackground
          style={styles.incommingCallContainer}
          source={images.user}>
          <View style={styles.incommingCallInner}>
            <Image style={styles.incommingCallUserImage} source={images.user} />
            <Text
              style={{
                fontSize: 36,
                marginTop: 12,
                color: colors.white,
              }}>
              {username} is calling...
            </Text>
          </View>
        </ImageBackground>
        <View style={styles.responseIcons}>
          <TouchableOpacity
            onPress={() => {
              leave();
            }}
            style={[styles.callAnswerBtnContainer, {backgroundColor: 'red'}]}>
            <Image source={images.videoOn} style={styles.callPickIcon} />
          </TouchableOpacity>
          <TouchableOpacity
            onPress={() => {
              processAccept();
              InCallManager.stopRingtone();
              setType(constants.webRTC);
            }}
            style={[styles.callAnswerBtnContainer, {backgroundColor: 'green'}]}>
            <Image source={images.videoOn} style={styles.callPickIcon} />
          </TouchableOpacity>
        </View>
        <SafeAreaView />
      </View>
    );
  };

  switch (type) {
    // case 'JOIN':
    //   return JoinScreen();
    case constants.incomingCall:
      return IncomingCallScreen();
    case constants.outgoingCall:
      return OutgoingCallScreen();
    case constants.webRTC:
      return WebrtcRoomScreen();
    default:
      return null;
  }
};

export default IncomingVideoCall;
