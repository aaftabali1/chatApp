import {View, Text, Image} from 'react-native';
import React from 'react';
import {styles} from '../utils/commonStyles';

export default function MessageComponent({item, user}: any) {
  const status = item.sender_id != user;
  return (
    <View>
      <View
        style={
          status
            ? styles.mmessageWrapper
            : [styles.mmessageWrapper, {alignItems: 'flex-end'}]
        }>
        <View style={{flexDirection: 'row', alignItems: 'center'}}>
          <Image
            source={require('../assets/images/user.png')}
            style={styles.mavatar}
          />
          <View
            style={
              status
                ? styles.mmessage
                : [styles.mmessage, {backgroundColor: 'rgb(194, 243, 194)'}]
            }>
            <Text>{item.content}</Text>
          </View>
        </View>
        <Text style={{marginLeft: 40}}>
          {new Date(item.date).toLocaleTimeString([], {
            hour: '2-digit',
            minute: '2-digit',
          })}
        </Text>
      </View>
    </View>
  );
}
