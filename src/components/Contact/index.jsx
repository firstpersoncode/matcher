import {View, FlatList} from 'react-native';
import {
  Divider,
  FAB,
  HelperText,
  Searchbar,
  useTheme,
} from 'react-native-paper';

import {useAppContext} from 'src/context/App';
import {useMemo, useState} from 'react';
import {useSheetContext} from 'src/context/Sheet';
import Item from './Item';
import Add from './Add';

export default function Contact() {
  const {user, privateMessages} = useAppContext();
  const {displaySheet} = useSheetContext();
  const theme = useTheme();
  const [search, setSearch] = useState('');

  const contacts = useMemo(() => {
    let filtered = user?.contacts.filter(c => c.status === 'friend') || [];
    if (filtered.length) {
      filtered = filtered.map(item => {
        item.messages = [];
        item.lastMessage = null;

        let messages = privateMessages.filter(
          m =>
            String(m.owner._id) === String(item.contact._id) ||
            String(m.recipient._id) === String(item.contact._id),
        );

        if (messages.length) {
          item.messages = messages;
          item.lastMessage = messages[messages.length - 1];
        }

        return item;
      });
    }

    return filtered
      .filter(item => {
        if (search) {
          const searchFields =
            `${item.contact.name} ${item.contact.email} ${item.contact.idString}`.toLowerCase();
          return searchFields.includes(search.toLowerCase());
        }

        return true;
      })
      .sort((a, b) => {
        if (!a.lastMessage) return 1;
        else if (!b.lastMessage) return -1;

        return new Date(a.lastMessage?.createdAt) >
          new Date(b.lastMessage?.createdAt)
          ? -1
          : 1;
      });
  }, [user?.contacts, privateMessages, search]);

  function onAddContact() {
    displaySheet({content: <Add />});
  }

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
        renderItem={({item}) => <Item item={item} />}
        keyExtractor={item => item.contact._id}
      />

      <FAB
        color="#FFF"
        icon="plus"
        style={{
          position: 'absolute',
          right: 0,
          bottom: 0,
          backgroundColor: theme.colors.primary,
          borderRadius: 100,
          margin: 16,
        }}
        onPress={onAddContact}
      />
    </>
  );
}
