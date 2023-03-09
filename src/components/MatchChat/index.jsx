import {useEffect, useMemo, useState} from 'react';
import {View, FlatList} from 'react-native';
import {IconButton, Text, TextInput, useTheme} from 'react-native-paper';
import {useNavigation} from '@react-navigation/native';

import {useAppContext} from 'src/context/App';

import Message from './Message';

export default function MatchChat() {
  const {user, match, messages, sendMessage, saveLastRead} = useAppContext();
  const theme = useTheme();
  const navigation = useNavigation();
  const [message, setMessage] = useState('');
  const [isSending, setIsSending] = useState(false);

  const isParticipant = useMemo(
    () => user?.match && String(match?._id) === String(user.match._id),
    [user?.match, match?._id],
  );

  useEffect(() => {
    if (isParticipant) {
      const unsubscribe = navigation.addListener('focus', saveLastRead);
      return unsubscribe;
    }
  }, [isParticipant, messages, navigation]);

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
