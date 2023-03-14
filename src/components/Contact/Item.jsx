import {Pressable} from 'react-native';
import {Badge, Menu, Text, useTheme} from 'react-native-paper';

import {useAppContext} from 'src/context/App';
import {useEffect, useMemo, useState} from 'react';
import {useNavigation} from '@react-navigation/native';
import AsyncStorage from '@react-native-async-storage/async-storage';

export default function Item({item}) {
  const {
    user,
    matches,
    privateMessagesLastRead,
    selectInbox,
    handleInviteParticipant,
  } = useAppContext();
  const navigation = useNavigation();
  const theme = useTheme();
  const [visibleMenu, setVisibleMenu] = useState(false);
  const [unreadCounts, setUnreadCounts] = useState(0);

  const isParticipant = useMemo(
    () =>
      matches.find(m =>
        m.participants.find(
          p => String(p.participant._id) === String(item.contact._id),
        ),
      ),
    [matches],
  );

  useEffect(() => {
    if (!item.messages.length) return;
    (async () => {
      let messageLastRead = privateMessagesLastRead.find(
        m => String(m.inbox) === String(item.contact._id),
      );

      if (!messageLastRead) {
        let res = await AsyncStorage.getItem('private-messages-last-read');
        let currMessagesLastRead = res ? JSON.parse(res) : [];
        messageLastRead = currMessagesLastRead.find(
          m => String(m.inbox) === String(item.contact._id),
        );
      }

      let lastRead = messageLastRead?.message;
      if (lastRead) {
        let index = item.messages.findIndex(
          m => String(m._id) === String(lastRead),
        );
        if (index !== -1) {
          let counts = item.messages.slice(index + 1).length;
          setUnreadCounts(counts);
        }
      } else setUnreadCounts(item.messages.length);
    })();
  }, [item.messages, privateMessagesLastRead, item.contact._id]);

  function onPressMessage(inbox) {
    return function () {
      selectInbox(inbox);
      navigation.navigate('Chat', {name: inbox.name});
      setVisibleMenu(false);
    };
  }

  function onPressInvite(participant) {
    return async function () {
      try {
        await handleInviteParticipant(participant._id);
        setVisibleMenu(false);
      } catch (err) {
        console.error(err.message || err);
      }
    };
  }

  function toggleVisibleMenu() {
    setVisibleMenu(v => !v);
  }

  return (
    <Menu
      visible={visibleMenu}
      onDismiss={toggleVisibleMenu}
      anchor={
        <Pressable
          onPress={toggleVisibleMenu}
          style={{
            flexDirection: 'row',
            alignItems: 'center',
            padding: 16,
            marginHorizontal: 16,
            marginVertical: 8,
            backgroundColor: theme.colors.secondaryContainer,
            borderRadius: 10,
            position: 'relative',
          }}>
          {/* <Image
                resizeMode="stretch"
                style={{width: 30, height: 30, marginRight: 16}}
                source={require('../assets/avatar.png')}
              /> */}
          <Text>{item.contact.name}</Text>
          {unreadCounts > 0 && (
            <Badge
              style={{
                position: 'absolute',
                right: 8,
                top: -8,
              }}>
              {unreadCounts}
            </Badge>
          )}
        </Pressable>
      }>
      <Menu.Item title="Message" onPress={onPressMessage(item.contact)} />
      {user.match && !isParticipant && (
        <Menu.Item title="Invite" onPress={onPressInvite(item.contact)} />
      )}
    </Menu>
  );
}
