import React, {useEffect, useState, useRef} from 'react';
import {View, Text, TouchableOpacity, Image} from 'react-native';
import {
  mediaDevices,
  RTCPeerConnection,
  RTCView,
  RTCIceCandidate,
  RTCSessionDescription,
  MediaStream,
} from 'react-native-webrtc';
import socket from '../../utils/socket';
import constants from '../../utils/constants';
import {navigationRef} from '../../utils/navigationRef';
import {t} from 'i18next';
import images from '../../utils/images';
import colors from '../../utils/colors';
import {useNavigation} from '@react-navigation/native';
import CustomHeader from '../../components/CustomHeader';

const IncomingCall = ({route}: any) => {
  const navigation = useNavigation<any>();

  const {username, callType, currentUser} = route.params;

  const [type, setType] = useState(callType);

  const otherUserId = useRef(null);

  // Stream of local user
  const [localStream, setlocalStream] = useState(null);

  /* When a call is connected, the video stream from the receiver is appended to this state in the stream*/
  const [remoteStream, setRemoteStream] = useState(null);

  const servers = {
    iceServers: [
      {
        urls: 'stun:stun.l.google.com:19302',
      },
    ],
  };

  const peerConnection = useRef<RTCPeerConnection>();

  // const peerConnection = useRef(
  //   new RTCPeerConnection(
  //     servers,
  //     // {
  //     //   iceServers: [
  //     //     {
  //     //       urls: 'stun:stun.l.google.com:19302',
  //     //     },
  //     //     {
  //     //       urls: 'stun:stun1.l.google.com:19302',
  //     //     },
  //     //     {
  //     //       urls: 'stun:stun2.l.google.com:19302',
  //     //     },
  //     //   ],
  //     // },
  //   ),
  // );

  // Handling Mic status
  const [localMicOn, setlocalMicOn] = useState(true);

  // Handling Camera status
  const [localWebcamOn, setlocalWebcamOn] = useState(true);

  // Switch Camera
  function switchCamera() {
    localStream.getVideoTracks().forEach(track => {
      track._switchCamera();
    });
  }

  // Enable/Disable Camera
  function toggleCamera() {
    localWebcamOn ? setlocalWebcamOn(false) : setlocalWebcamOn(true);
    localStream.getVideoTracks().forEach(track => {
      localWebcamOn ? (track.enabled = false) : (track.enabled = true);
    });
  }

  // Enable/Disable Mic
  function toggleMic() {
    localMicOn ? setlocalMicOn(false) : setlocalMicOn(true);
    localStream.getAudioTracks().forEach(track => {
      localMicOn ? (track.enabled = false) : (track.enabled = true);
    });
  }

  //   useEffect(() => {
  //     InCallManager.start();
  //     InCallManager.setKeepScreenOn(true);
  //     InCallManager.setForceSpeakerphoneOn(true);

  //     return () => {
  //       InCallManager.stop();
  //     };
  //   }, []);

  function leave() {
    socket.emit('endCall', {
      callerId: otherUserId.current,
      calleeId: currentUser,
    });
    if (peerConnection.current) {
      peerConnection.current.close();
    }
    setlocalStream(null);
    streamCleanup();
    navigationRef.current?.goBack();
  }

  const streamCleanup = async () => {
    if (localStream) {
      localStream.getTracks().forEach(t => t.stop());
      localStream.release();
    }
    setlocalStream(null);
    setRemoteStream(null);
  };

  const WebrtcRoomScreen = () => {
    return (
      <>
        <CustomHeader title={username} navigation={navigationRef.current} />
        <View
          style={{
            flex: 1,
            backgroundColor: '#050A0E',
            paddingHorizontal: 12,
            paddingVertical: 12,
          }}>
          {remoteStream ? (
            <RTCView
              objectFit={'cover'}
              style={{
                flex: 1,
                backgroundColor: '#050A0E',
                marginTop: 8,
              }}
              streamURL={remoteStream.toURL()}
            />
          ) : null}
          {localStream ? (
            <View
              style={{
                backgroundColor: '#050A0E',
                width: 100,
                height: 150,
                position: 'absolute',
                bottom: 100,
                right: 0,
                borderRadius: 8,
                zIndex: 12,
                overflow: 'hidden',
              }}>
              <RTCView
                objectFit={'cover'}
                style={{
                  backgroundColor: '#050A0E',
                  flex: 1,
                  borderRadius: 8,
                  overflow: 'hidden',
                }}
                streamURL={localStream.toURL()}
              />
            </View>
          ) : null}
          <View
            style={{
              marginVertical: 12,
              flexDirection: 'row',
              justifyContent: 'space-evenly',
            }}>
            <TouchableOpacity
              style={{
                backgroundColor: colors.white,
                padding: 10,
                borderRadius: 8,
              }}
              onPress={() => {
                leave();
                setlocalStream(null);
              }}>
              <Image
                source={images.decline}
                style={{width: 30, height: 30, resizeMode: 'contain'}}
              />
            </TouchableOpacity>

            <TouchableOpacity
              style={{
                backgroundColor: colors.white,
                padding: 10,
                borderRadius: 8,
              }}
              onPress={() => {
                toggleMic();
              }}>
              <Image
                source={localMicOn ? images.micOn : images.micOff}
                style={{width: 30, height: 30, resizeMode: 'contain'}}
              />
            </TouchableOpacity>

            <TouchableOpacity
              style={{
                backgroundColor: colors.white,
                padding: 10,
                borderRadius: 8,
              }}
              onPress={() => {
                toggleCamera();
              }}>
              <Image
                source={localWebcamOn ? images.videoOn : images.videoOff}
                style={{width: 30, height: 30, resizeMode: 'contain'}}
              />
            </TouchableOpacity>

            <TouchableOpacity
              style={{
                backgroundColor: colors.white,
                padding: 10,
                borderRadius: 8,
              }}
              onPress={() => {
                switchCamera();
              }}>
              <Image
                source={localMicOn ? images.video : images.video}
                style={{width: 30, height: 30, resizeMode: 'contain'}}
              />
            </TouchableOpacity>
          </View>
        </View>
      </>
    );
  };

  const setupWebRTC = async () => {
    let isFront = false;

    peerConnection.current = new RTCPeerConnection(servers);

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

    if (stream) {
      setlocalStream(stream);
      // peerConnection.current.addStream(stream);
      stream.getTracks().forEach(track => {
        peerConnection.current.addTrack(track, stream);
      });
    }

    (peerConnection.current as any).ontrack = (event: any) => {
      console.log('Received remote track:', event.track);

      // Assuming setRemoteStream is a function to set the remote stream state
      setRemoteStream((prevRemoteStream: any) => {
        if (!prevRemoteStream) {
          // If the remote stream state is not set, create a new MediaStream
          const newRemoteStream = new MediaStream();
          newRemoteStream.addTrack(event.track);
          return newRemoteStream;
        } else {
          // If the remote stream state is set, add the track to the existing stream
          prevRemoteStream.addTrack(event.track);
          return prevRemoteStream;
        }
      });
    };

    peerConnection.current.onicecandidate = event => {
      if (event.candidate) {
        sendICEcandidate({
          calleeId: otherUserId.current,
          rtcMessage: {
            label: event.candidate.sdpMLineIndex,
            id: event.candidate.sdpMid,
            candidate: event.candidate.candidate,
          },
        });
      } else {
        console.log('End of candidates.');
      }
    };

    if (callType == constants.incomingCall) {
      remoteRTCMessage.current = route.params.message;
    }

    socket.on('callAnswered', data => {
      // 7. When Alice gets Bob's session description, she sets that as the remote description with `setRemoteDescription` method.

      remoteRTCMessage.current = data.rtcMessage;
      peerConnection.current.setRemoteDescription(
        new RTCSessionDescription(remoteRTCMessage.current),
      );
      setType(constants.webRTC);
    });

    socket.on('ICEcandidate', data => {
      let message = data.rtcMessage;

      if (peerConnection.current) {
        peerConnection?.current
          .addIceCandidate(
            new RTCIceCandidate({
              candidate: message.candidate,
              sdpMid: message.id,
              sdpMLineIndex: message.label,
            }),
          )
          .then(data => {
            console.log('SUCCESS');
          })
          .catch(err => {
            console.log('Error', err);
          });
      }
    });

    socket.on('callEnd', () => {
      if (peerConnection.current) {
        peerConnection.current.close();
      }
      streamCleanup();
      navigationRef.current?.goBack();
    });

    // Alice creates an RTCPeerConnection object with an `onicecandidate` handler, which runs when network candidates become available.
    peerConnection.current.onicecandidate = event => {
      if (event.candidate) {
        // Alice sends serialized candidate data to Bob using Socket
        sendICEcandidate({
          calleeId: otherUserId.current,
          callerId: currentUser,
          rtcMessage: {
            label: event.candidate.sdpMLineIndex,
            id: event.candidate.sdpMid,
            candidate: event.candidate.candidate,
          },
        });
      } else {
        console.log('End of candidates.');
      }
    };
  };

  useEffect(() => {
    let isFront = false;
    otherUserId.current = username;

    navigation.setOptions({title: username});

    /*The MediaDevices interface allows you to access connected media inputs such as cameras and microphones. We ask the user for permission to access those media inputs by invoking the mediaDevices.getUserMedia() method. */
    // mediaDevices.enumerateDevices().then((sourceInfos: any) => {
    //   let videoSourceId;
    //   for (let i = 0; i < sourceInfos.length; i++) {
    //     const sourceInfo = sourceInfos[i];
    //     if (
    //       sourceInfo.kind == 'videoinput' &&
    //       sourceInfo.facing == (isFront ? 'user' : 'environment')
    //     ) {
    //       videoSourceId = sourceInfo.deviceId;
    //     }
    //   }

    //   const remote = new MediaStream();
    //   setRemoteStream(remote);

    //   mediaDevices
    //     .getUserMedia({
    //       audio: true,
    //       video: {
    //         mandatory: {
    //           minWidth: 500, // Provide your own width, height and frame rate here
    //           minHeight: 300,
    //           minFrameRate: 30,
    //         },
    //         facingMode: isFront ? 'user' : 'environment',
    //         optional: videoSourceId ? [{sourceId: videoSourceId}] : [],
    //       },
    //     })
    //     .then(stream => {
    //       // Get local stream!
    //       setlocalStream(stream);

    //       console.log('====================================');
    //       console.log('STREADDDDD', stream);
    //       console.log('====================================');

    //       // setup stream listening

    //       //   stream
    //       //     .getTracks()
    //       //     .forEach(track => peerConnection.current.addTrack(track, stream));

    //       stream.getTracks().forEach(track => {
    //         const senders = peerConnection.current.getSenders();
    //         senders.forEach(sender => {
    //           if (sender.track) {
    //             sender.replaceTrack(track);
    //           }
    //         });
    //       });
    //     })
    //     .catch(error => {
    //       // Log error
    //       console.log('====================================');
    //       console.log('Error at line 251', error);
    //       console.log('====================================');
    //     });
    // });

    // (peerConnection.current as any).ontrack = event => {
    //   event.streams[0].getTracks().forEach(track => {
    //     remote.addTrack(track);
    //   });
    // };

    // peerConnection.current.ontrack = event => {
    //   event.streams[0].getTracks().forEach(track => {
    //     remote.addTrack(track);
    //   });
    // };

    // peerConnection.current.onaddstream = event => {
    //   console.log('====================================EVENT STREAM');
    //   console.log(event.stream);
    //   console.log('====================================');
    //   setRemoteStream(event.stream);
    // };

    // (peerConnection.current as any).ontrack = (event: any) => {
    //   console.log('====================================EVENT STREAM');
    //   console.log(event.streams[0]);
    //   console.log('====================================');
    //   setRemoteStream(event.streams[0]);
    // };

    setTimeout(() => {
      processCall();
    }, 1500);
  }, []);

  let remoteRTCMessage = useRef(null);

  useEffect(() => {
    // socket.on('newCall', data => {
    //   console.log('Data is here line 235', data);
    //   remoteRTCMessage.current = data.rtcMessage;
    //   otherUserId.current = data.callerId;
    //   setType(constants.incomingCall);
    // });
    // if (callType == constants.incomingCall) {
    //   remoteRTCMessage.current = route.params.message;
    // }
    // socket.on('callAnswered', data => {
    //   // 7. When Alice gets Bob's session description, she sets that as the remote description with `setRemoteDescription` method.
    //   remoteRTCMessage.current = data.rtcMessage;
    //   peerConnection.current.setRemoteDescription(
    //     new RTCSessionDescription(remoteRTCMessage.current),
    //   );
    //   setType(constants.webRTC);
    // });
    // socket.on('ICEcandidate', data => {
    //   let message = data.rtcMessage;
    //   if (peerConnection.current) {
    //     peerConnection?.current
    //       .addIceCandidate(
    //         new RTCIceCandidate({
    //           candidate: message.candidate,
    //           sdpMid: message.id,
    //           sdpMLineIndex: message.label,
    //         }),
    //       )
    //       .then(data => {
    //         console.log('SUCCESS');
    //       })
    //       .catch(err => {
    //         console.log('Error', err);
    //       });
    //   }
    // });
    // socket.on('callEnd', () => {
    //   peerConnection.current.close();
    //   setlocalStream(null);
    //   navigationRef.current?.goBack();
    // });
    // // Alice creates an RTCPeerConnection object with an `onicecandidate` handler, which runs when network candidates become available.
    // peerConnection.current.onicecandidate = event => {
    //   if (event.candidate) {
    //     // Alice sends serialized candidate data to Bob using Socket
    //     sendICEcandidate({
    //       calleeId: otherUserId.current,
    //       callerId: currentUser,
    //       rtcMessage: {
    //         label: event.candidate.sdpMLineIndex,
    //         id: event.candidate.sdpMid,
    //         candidate: event.candidate.candidate,
    //       },
    //     });
    //   } else {
    //     console.log('End of candidates.');
    //   }
    // };
  }, []);

  async function processCall() {
    await setupWebRTC();

    // 1. Alice runs the `createOffer` method for getting SDP.
    const sessionDescription = await peerConnection.current.createOffer();

    // 2. Alice sets the local description using `setLocalDescription`.
    await peerConnection.current.setLocalDescription(sessionDescription);

    // 3. Send this session description to Bob uisng socket
    sendCall({
      calleeId: username,
      callerId: currentUser,
      rtcMessage: sessionDescription,
    });
  }

  async function processAccept() {
    // 4. Bob sets the description, Alice sent him as the remote description using `setRemoteDescription()`
    peerConnection.current.setRemoteDescription(
      new RTCSessionDescription(remoteRTCMessage.current),
    );

    // 5. Bob runs the `createAnswer` method
    const sessionDescription = await peerConnection.current.createAnswer();

    // 6. Bob sets that as the local description and sends it to Alice
    await peerConnection.current.setLocalDescription(sessionDescription);
    answerCall({
      callerId: otherUserId.current,
      calleeId: currentUser,
      rtcMessage: sessionDescription,
    });
  }

  function answerCall(data) {
    socket.emit('answerCall', data);
  }

  function sendCall(data) {
    socket.emit('call', data);
  }

  function sendICEcandidate(data) {
    socket.emit('ICEcandidate', data);
  }

  // const JoinScreen = () => {
  //   return (
  //     <KeyboardAvoidingView
  //       behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
  //       style={{
  //         flex: 1,
  //         backgroundColor: '#050A0E',
  //         justifyContent: 'center',
  //         paddingHorizontal: 42,
  //       }}>
  //       <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
  //         <>
  //           <View
  //             style={{
  //               padding: 35,
  //               backgroundColor: '#1A1C22',
  //               justifyContent: 'center',
  //               alignItems: 'center',
  //               borderRadius: 14,
  //             }}>
  //             <Text
  //               style={{
  //                 fontSize: 18,
  //                 color: '#D0D4DD',
  //               }}>
  //               Your Caller ID
  //             </Text>
  //             <View
  //               style={{
  //                 flexDirection: 'row',
  //                 marginTop: 12,
  //                 alignItems: 'center',
  //               }}>
  //               <Text
  //                 style={{
  //                   fontSize: 32,
  //                   color: '#ffff',
  //                   letterSpacing: 6,
  //                 }}>
  //                 {callerId}
  //               </Text>
  //             </View>
  //           </View>

  //           <View
  //             style={{
  //               backgroundColor: '#1A1C22',
  //               padding: 40,
  //               marginTop: 25,
  //               justifyContent: 'center',
  //               borderRadius: 14,
  //             }}>
  //             <Text
  //               style={{
  //                 fontSize: 18,
  //                 color: '#D0D4DD',
  //               }}>
  //               Enter call id of another user
  //             </Text>
  //             <TextInputContainer
  //               placeholder={'Enter Caller ID'}
  //               value={otherUserId.current}
  //               setValue={(text: string) => {
  //                 otherUserId.current = text;
  //               }}
  //             />
  //             <TouchableOpacity
  //               onPress={() => {
  //                 processCall();
  //                 setType(constants.outgoingCall);
  //               }}
  //               style={{
  //                 height: 50,
  //                 backgroundColor: '#5568FE',
  //                 justifyContent: 'center',
  //                 alignItems: 'center',
  //                 borderRadius: 12,
  //                 marginTop: 16,
  //               }}>
  //               <Text
  //                 style={{
  //                   fontSize: 16,
  //                   color: '#FFFFFF',
  //                 }}>
  //                 Call Now
  //               </Text>
  //             </TouchableOpacity>
  //           </View>
  //         </>
  //       </TouchableWithoutFeedback>
  //     </KeyboardAvoidingView>
  //   );
  // };

  const OutgoingCallScreen = () => {
    return (
      <View
        style={{
          flex: 1,
          justifyContent: 'space-around',
          backgroundColor: '#050A0E',
        }}>
        <View
          style={{
            padding: 35,
            justifyContent: 'center',
            alignItems: 'center',
            borderRadius: 14,
          }}>
          <Text
            style={{
              fontSize: 16,
              color: '#D0D4DD',
            }}>
            Calling to...
          </Text>

          <Text
            style={{
              fontSize: 36,
              marginTop: 12,
              color: '#ffff',
              letterSpacing: 6,
            }}>
            {otherUserId.current}
          </Text>
        </View>
        <View
          style={{
            justifyContent: 'center',
            alignItems: 'center',
          }}>
          <TouchableOpacity
            onPress={() => {
              navigationRef.current?.goBack();
              otherUserId.current = null;
            }}
            style={{
              backgroundColor: '#FF5D5D',
              borderRadius: 30,
              height: 60,
              aspectRatio: 1,
              justifyContent: 'center',
              alignItems: 'center',
            }}>
            <Text>End call</Text>
          </TouchableOpacity>
        </View>
      </View>
    );
  };

  const IncomingCallScreen = () => {
    return (
      <View
        style={{
          flex: 1,
          justifyContent: 'space-around',
          backgroundColor: '#050A0E',
        }}>
        <View
          style={{
            padding: 35,
            justifyContent: 'center',
            alignItems: 'center',
            borderRadius: 14,
          }}>
          <Text
            style={{
              fontSize: 36,
              marginTop: 12,
              color: '#ffff',
            }}>
            {otherUserId.current} is calling..
          </Text>
        </View>
        <View
          style={{
            justifyContent: 'center',
            alignItems: 'center',
          }}>
          <TouchableOpacity
            onPress={() => {
              processAccept();
              setType(constants.webRTC);
            }}
            style={{
              backgroundColor: 'green',
              borderRadius: 30,
              height: 60,
              aspectRatio: 1,
              justifyContent: 'center',
              alignItems: 'center',
            }}>
            <Text>Answer call</Text>
          </TouchableOpacity>
        </View>
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

export default IncomingCall;
