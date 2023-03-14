import {Pressable, FlatList} from 'react-native';
import {Menu, Text, useTheme} from 'react-native-paper';

import {useAppContext} from 'src/context/App';
import {useMemo, useState} from 'react';

export default function ContactRequest() {
  const {user, acceptContact} = useAppContext();
  const theme = useTheme();
  const [visibleMenu, setVisibleMenu] = useState(false);

  const contacts = useMemo(
    () =>
      user?.contacts
        .filter(c => c.status !== 'friend')
        .sort((a, b) => {
          if (a.status === 'waiting-req' || b.status === 'waiting-req')
            return 1;
          return -1;
        }) || [],
    [user?.contacts],
  );

  function toggleVisibleMenu() {
    setVisibleMenu(v => !v);
  }

  function onAccept(participant) {
    return async function () {
      try {
        await acceptContact({contactRef: participant._id});
        setVisibleMenu(false);
      } catch (err) {
        console.error(err.message || err);
      }
    };
  }

  return (
    <FlatList
      data={contacts}
      renderItem={({item}) => (
        <Menu
          visible={visibleMenu}
          onDismiss={toggleVisibleMenu}
          anchor={
            <Pressable
              onPress={
                item.status === 'waiting-req' ? toggleVisibleMenu : undefined
              }
              style={{
                flexDirection: 'row',
                alignItems: 'center',
                padding: 16,
                marginHorizontal: 16,
                marginVertical: 8,
                backgroundColor: theme.colors.secondaryContainer,
                borderRadius: 10,
                opacity: item.status === 'waiting-req' ? 1 : 0.3,
              }}>
              {/* <Image
                resizeMode="stretch"
                style={{width: 30, height: 30, marginRight: 16}}
                source={require('../assets/avatar.png')}
              /> */}
              <Text>{item.contact.name}</Text>
            </Pressable>
          }>
          <Menu.Item title="Accept Contact" onPress={onAccept(item.contact)} />
        </Menu>
      )}
      keyExtractor={item => item.contact._id}
    />
  );
}
