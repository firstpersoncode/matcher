import {useMemo, useState} from 'react';
import {View, FlatList} from 'react-native';
import {IconButton, Text, TextInput} from 'react-native-paper';
import {useRoute} from '@react-navigation/native';

import {useAppContext} from 'src/context/App';

import Message from './Message';

export default function MatchChat() {
  const {user, matches, messages, sendMessage} = useAppContext();
  const route = useRoute();
  const [message, setMessage] = useState('');
  const [isSending, setIsSending] = useState(false);

  const match = useMemo(
    () => matches.find(m => String(m._id) === String(route.params.matchRef)),
    [matches, route.params.matchRef],
  );

  const isParticipant = useMemo(
    () => user?.match && String(match?._id) === String(user.match._id),
    [user?.match, match?._id],
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
      console.log(err.message || err);
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
    <>
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
          maxLength={200}
        />
        <IconButton
          disabled={isSending}
          mode="contained"
          icon="send"
          onPress={onSubmitMessage}
        />
      </View>
    </>
  );
}
