import {useMemo, useState} from 'react';
import {FlatList, Pressable, ScrollView, View} from 'react-native';
import {
  Button,
  Divider,
  HelperText,
  Menu,
  Searchbar,
  Text,
  useTheme,
} from 'react-native-paper';

import {useAppContext} from 'src/context/App';
import {useSheetContext} from 'src/context/Sheet';

import Participant from './Participant';

export default function MatchParticipant() {
  const {user, match} = useAppContext();
  const {displaySheet} = useSheetContext();
  const theme = useTheme();

  const isParticipant = useMemo(
    () => String(match._id) === String(user?.match?._id),
    [user?.match?._id, match],
  );

  const joinedCount = useMemo(
    () => match.participants.map(p => p.count).reduce((sum, a) => sum + a, 0),
    [match.participants],
  );

  const remainingSlot = useMemo(
    () => match.count - joinedCount,
    [match.count, joinedCount],
  );

  function onInvite() {
    displaySheet({content: <Invitation />});
  }

  return (
    <ScrollView style={{padding: 16, backgroundColor: theme.colors.background}}>
      {match.participants.map(({participant, count}) => (
        <Participant
          key={participant._id}
          participant={participant}
          count={count}
          match={match}
        />
      ))}

      {isParticipant && remainingSlot > 0 && (
        <Button onPress={onInvite} icon="plus">
          Invite
        </Button>
      )}
    </ScrollView>
  );
}

function Invitation() {
  const {user, match} = useAppContext();
  const theme = useTheme();
  const [search, setSearch] = useState('');
  const contacts = useMemo(
    () =>
      user?.contacts
        .filter(item => item.status === 'friend')
        .filter(
          item =>
            !match.participants.find(
              p => String(p.participant._id) === String(item.contact._id),
            ),
        )
        .filter(item => {
          if (search) {
            const searchFields =
              `${item.contact.name} ${item.contact.email} ${item.contact.idString}`.toLowerCase();
            return searchFields.includes(search.toLowerCase());
          }

          return true;
        }) || [],
    [user?.contacts, search],
  );

  function handleChangeSearch(text) {
    setSearch(text);
  }

  return (
    <>
      <View keyboardShouldPersistTaps="handled" style={{padding: 16}}>
        <Searchbar
          clearButtonMode="always"
          style={{
            height: 40,
            backgroundColor: '#FFF',
            borderWidth: 1,
            borderColor: theme.colors.secondary,
          }}
          inputStyle={{fontSize: 12}}
          placeholder="Search..."
          value={search}
          onChangeText={handleChangeSearch}
        />
        <HelperText>By name, email, id</HelperText>
      </View>
      <Divider />
      <FlatList
        data={contacts}
        renderItem={({item}) => <ContactItem item={item} />}
        keyExtractor={item => item.contact._id}
      />
    </>
  );
}

function ContactItem({item}) {
  const {handleInviteParticipant} = useAppContext();
  const {hideSheet} = useSheetContext();
  const theme = useTheme();
  const [visibleMenu, setVisibleMenu] = useState(false);

  function onPressInvite(participant) {
    return async function () {
      try {
        await handleInviteParticipant(participant._id);
        setVisibleMenu(false);
        hideSheet();
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
          <Text>{item.contact.name}</Text>
        </Pressable>
      }>
      <Menu.Item title="Invite" onPress={onPressInvite(item.contact)} />
    </Menu>
  );
}
