import {useEffect, useMemo, useState} from 'react';
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
import AsyncStorage from '@react-native-async-storage/async-storage';

export default function Chat() {
  const {
    user,
    inbox,
    privateMessages,
    sendPrivateMessage,
    setPrivateMessagesLastRead,
  } = useAppContext();
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

  useEffect(() => {
    let lastMessage =
      filteredPrivateMessages[filteredPrivateMessages.length - 1];
    if (lastMessage) {
      AsyncStorage.getItem('private-messages-last-read').then(res => {
        let currMessagesLastRead = res ? JSON.parse(res) : [];

        let lastRead = currMessagesLastRead.find(
          m => String(m.inbox) === String(inbox._id),
        );

        if (lastRead) {
          currMessagesLastRead = currMessagesLastRead.map(m => {
            if (String(m.inbox) === String(inbox._id))
              m.message = lastMessage._id;
            return m;
          });
        } else
          currMessagesLastRead = [
            ...currMessagesLastRead,
            {inbox: inbox._id, message: lastMessage._id},
          ];

        AsyncStorage.setItem(
          'private-messages-last-read',
          JSON.stringify(currMessagesLastRead),
        );
      });

      setPrivateMessagesLastRead(inbox._id, lastMessage._id);
    }
  }, [inbox, filteredPrivateMessages]);

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
