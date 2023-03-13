import {useMemo, useState} from 'react';
import {View, FlatList} from 'react-native';
import {
  Divider,
  IconButton,
  Text,
  TextInput,
  useTheme,
} from 'react-native-paper';

import {useAppContext} from 'src/context/App';

import Header from 'src/components/Header';
import Message from 'src/components/Message';

export default function Chat() {
  const {user, inbox, privateMessages, sendPrivateMessage} = useAppContext();
  const theme = useTheme();
  const [message, setMessage] = useState('');
  const [isSending, setIsSending] = useState(false);

  const filteredPrivateMessages = useMemo(
    () =>
      privateMessages.filter(
        m =>
          String(m.owner._id) === String(inbox._id) ||
          String(m.recipient._id) === String(inbox._id),
      ),
    [privateMessages, inbox._id],
  );

  function onTypingMessage(text) {
    setMessage(text);
  }

  async function onSubmitMessage() {
    if (!message?.trim()) return;
    setMessage('');
    setIsSending(true);
    try {
      await sendPrivateMessage({text: message, recipientRef: inbox._id});
    } catch (err) {
      console.error(err.message || err);
    }
    setIsSending(false);
  }

  return (
    <View style={{flex: 1, backgroundColor: theme.colors.background}}>
      <Header
        back
        title={
          <Text style={{flex: 1}} variant="titleLarge">
            {inbox.name}
          </Text>
        }
        // title={
        //   <Text style={{flex: 1}} variant="titleLarge">
        //     {user.name}
        //   </Text>
        // }
      />
      <Divider />

      <FlatList
        inverted
        data={filteredPrivateMessages.slice().reverse()}
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
