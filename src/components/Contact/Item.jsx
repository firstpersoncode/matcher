import {Pressable} from 'react-native';
import {Badge, Menu, Text, useTheme} from 'react-native-paper';

import {useAppContext} from 'src/context/App';
import {useMemo, useState} from 'react';
import {useNavigation} from '@react-navigation/native';

export default function Item({item}) {
  const {user, matches, selectInbox, handleInviteParticipant} = useAppContext();
  const navigation = useNavigation();
  const theme = useTheme();
  const [visibleMenu, setVisibleMenu] = useState(false);

  const isParticipant = useMemo(
    () =>
      matches.find(m =>
        m.participants.find(
          p => String(p.participant._id) === String(item.contact._id),
        ),
      ),
    [matches],
  );

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
          {item.messages.length > 0 && (
            <Badge
              style={{
                position: 'absolute',
                right: 8,
                top: -8,
              }}>
              {item.messages.length}
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
