import AsyncStorage from '@react-native-async-storage/async-storage';
import {useFocusEffect} from '@react-navigation/native';
import {useCallback, useEffect, useMemo, useRef, useState} from 'react';
import {View, FlatList} from 'react-native';
import {IconButton, Text, TextInput, useTheme} from 'react-native-paper';

import {useAppContext} from 'src/context/App';

import Message from './Message';

export default function MatchChat() {
  const {user, match, messages, sendMessage, setMessagesLastRead} =
    useAppContext();
  const theme = useTheme();
  const [message, setMessage] = useState('');
  const [isSending, setIsSending] = useState(false);

  const isParticipant = useMemo(
    () => user?.match && String(match?._id) === String(user.match._id),
    [user?.match, match?._id],
  );

  useFocusEffect(
    useCallback(() => {
      if (match) {
        let lastMessage = messages[messages.length - 1];
        if (lastMessage) {
          AsyncStorage.getItem('messages-last-read').then(res => {
            let currMessagesLastRead = res ? JSON.parse(res) : [];

            let lastRead = currMessagesLastRead.find(
              m => String(m.match) === String(match._id),
            );

            if (lastRead) {
              currMessagesLastRead = currMessagesLastRead.map(m => {
                if (String(m.match) === String(match._id))
                  m.message = lastMessage._id;
                return m;
              });
            } else
              currMessagesLastRead = [
                ...currMessagesLastRead,
                {match: match._id, message: lastMessage._id},
              ];

            AsyncStorage.setItem(
              'messages-last-read',
              JSON.stringify(currMessagesLastRead),
            );
          });

          setMessagesLastRead(match._id, lastMessage._id);
        }
      }
    }, [match, messages]),
  );

  function onTypingMessage(text) {
    setMessage(text);
  }

  async function onSubmitMessage() {
    if (!message?.trim()) return;
    setMessage('');
    setIsSending(true);
    try {
      await sendMessage({text: message});
    } catch (err) {
      console.error(err.message || err);
    }
    setIsSending(false);
  }

  if (!isParticipant)
    return (
      <View style={{flex: 1, justifyContent: 'center', alignItems: 'center'}}>
        <Text>You are not a participant in this match</Text>
      </View>
    );

  return (
    <View style={{flex: 1, backgroundColor: theme.colors.background}}>
      <FlatList
        inverted
        data={messages.slice().reverse()}
        renderItem={({item}) => <Message message={item} />}
        keyExtractor={item => item._id}
      />
      <View
        keyboardShouldPersistTaps="handled"
        style={{
          margin: 16,
          flexDirection: 'row',
          alignItems: 'flex-end',
          maxHeight: 200,
        }}>
        <TextInput
          style={{flex: 1}}
          mode="outlined"
          placeholder="Say something ..."
          value={message}
          onChangeText={onTypingMessage}
          multiline
          maxLength={500}
          right={<TextInput.Affix text={`${String(message.length)}/500`} />}
        />
        <IconButton
          disabled={isSending}
          mode="contained"
          icon="send"
          onPress={onSubmitMessage}
        />
      </View>
    </View>
  );
}
