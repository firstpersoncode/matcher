import {
  Image,
  View,
  Pressable,
  useWindowDimensions,
  FlatList,
} from 'react-native';
import {
  Badge,
  Button,
  Chip,
  Divider,
  FAB,
  HelperText,
  IconButton,
  Menu,
  ProgressBar,
  Searchbar,
  Text,
  TextInput,
  useTheme,
} from 'react-native-paper';

import {useAppContext} from 'src/context/App';
import Header from 'src/components/Header';
import {useEffect, useMemo, useRef, useState} from 'react';
import {useSheetContext} from 'src/context/Sheet';
import {SceneMap, TabBar, TabView} from 'react-native-tab-view';
import {useNavigation} from '@react-navigation/native';
import Cog from 'src/components/Cog';
import Counter from 'src/components/Counter';

const icons = {
  friend: 'contacts',
  'friend-request': 'human-greeting-proximity',
  'match-invitations': 'medal',
};

const renderScene = SceneMap({
  friend: Contact,
  'friend-request': ContactRequest,
  'match-invitations': MatchInvitations,
});

export default function Profile() {
  const {user, privateMessages} = useAppContext();
  const {displaySheet} = useSheetContext();
  const theme = useTheme();
  const layout = useWindowDimensions();
  const [index, setIndex] = useState(0);
  const [routes] = useState([
    {key: 'friend', title: 'Contacts'},
    {key: 'friend-request', title: 'Request'},
    {key: 'match-invitations', title: 'Invitation'},
  ]);

  const waitingRequest = useMemo(
    () => user?.contacts.filter(c => c.status === 'waiting-req') || [],
    [user?.contacts],
  );

  const waitingInvitations = useMemo(
    () => user?.invitations || [],
    [user?.invitations],
  );

  function onEditName() {
    displaySheet({content: <EditName />});
  }

  return (
    <View style={{flex: 1, backgroundColor: theme.colors.background}}>
      <Header
        back
        title={
          <View style={{flex: 1, flexDirection: 'row', alignItems: 'center'}}>
            <Text variant="titleLarge">{user.name}</Text>
            <IconButton size={15} icon="pencil" onPress={onEditName} />
          </View>
        }
        action={<Cog />}
      />
      <Divider />
      <View style={{flexDirection: 'row', padding: 16, alignItems: 'center'}}>
        <Image
          resizeMode="stretch"
          style={{width: 50, height: 50, marginRight: 16}}
          source={require('../assets/avatar.png')}
        />
        <View>
          <Text>
            ID: <Text variant="labelLarge">{user.idString}</Text>
          </Text>
          <Text>
            Email: <Text variant="labelLarge">{user.email}</Text>
          </Text>
        </View>
      </View>
      {/* <Text>{JSON.stringify(user, null, 4)}</Text> */}
      <TabView
        lazy
        navigationState={{index, routes}}
        renderScene={renderScene}
        onIndexChange={setIndex}
        initialLayout={{width: layout.width}}
        renderTabBar={props => (
          <TabBar
            {...props}
            indicatorStyle={{backgroundColor: theme.colors.primary}}
            style={{backgroundColor: theme.colors.background}}
            tabStyle={{flexDirection: 'row'}}
            renderIcon={({route, focused}) => (
              <IconButton
                style={{margin: 0}}
                icon={icons[route.key]}
                iconColor={focused ? theme.colors.onBackground : '#aaa'}
              />
            )}
            renderLabel={({route, focused}) => (
              <View style={{position: 'relative'}}>
                <Text
                  style={{
                    color: focused ? theme.colors.onBackground : '#aaa',
                    margin: 8,
                  }}>
                  {route.title}
                </Text>
                {route.key === 'friend' && privateMessages.length > 0 && (
                  <Badge
                    size={17}
                    style={{position: 'absolute', top: -7, right: 0}}>
                    {privateMessages.length}
                  </Badge>
                )}
                {route.key === 'friend-request' &&
                  waitingRequest.length > 0 && (
                    <Badge
                      size={17}
                      style={{position: 'absolute', top: -7, right: 0}}>
                      {waitingRequest.length}
                    </Badge>
                  )}
                {route.key === 'match-invitations' &&
                  waitingInvitations.length > 0 && (
                    <Badge
                      size={17}
                      style={{position: 'absolute', top: -7, right: 0}}>
                      {waitingInvitations.length}
                    </Badge>
                  )}
              </View>
            )}
          />
        )}
      />
    </View>
  );
}

function EditName() {
  const {user, handleUpdateName} = useAppContext();
  const {hideSheet} = useSheetContext();
  const inputRef = useRef();
  const timeoutRef = useRef();
  const [name, setName] = useState(user.name);
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    if (timeoutRef.current) clearTimeout(timeoutRef.current);
    timeoutRef.current = setTimeout(() => {
      inputRef.current?.focus();
    }, 50);
    return () => {
      timeoutRef.current && clearTimeout(timeoutRef.current);
      inputRef.current?.blur();
    };
  }, []);

  function onChange(text) {
    setName(text);
  }

  async function onSubmit() {
    if (!Boolean(name.trim())) return;

    if (name === user.name) {
      inputRef.current?.blur();
      hideSheet();
    }

    setIsSubmitting(true);
    try {
      await handleUpdateName(name);
      inputRef.current?.blur();
      hideSheet();
    } catch (err) {
      console.error(err.message || err);
    }
    setIsSubmitting(false);
  }

  return (
    <View style={{padding: 16}}>
      <TextInput
        ref={inputRef}
        mode="outlined"
        value={name}
        onChangeText={onChange}
        onSubmitEditing={onSubmit}
        maxLength={50}
        right={<TextInput.Affix text={`${String(name.length)}/50`} />}
        error={!Boolean(name)}
      />
      <HelperText type="error" visible={!Boolean(name)}>
        Required
      </HelperText>

      <Button disabled={isSubmitting} mode="contained" onPress={onSubmit}>
        Update
      </Button>
    </View>
  );
}

function Contact() {
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
    displaySheet({content: <AddContact />});
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

function ContactItem({item}) {
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

function AddContact() {
  const {getContact, addContact} = useAppContext();
  const {hideSheet} = useSheetContext();
  const theme = useTheme();
  const inputRef = useRef();
  const timeoutRef = useRef();
  const [idString, setIdString] = useState('');
  const [result, setResult] = useState(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [visibleMenu, setVisibleMenu] = useState(false);

  useEffect(() => {
    if (timeoutRef.current) clearTimeout(timeoutRef.current);
    timeoutRef.current = setTimeout(() => {
      inputRef.current?.focus();
    }, 50);
    return () => {
      timeoutRef.current && clearTimeout(timeoutRef.current);
      inputRef.current?.blur();
    };
  }, []);

  function onChange(text) {
    setIdString(text);
  }

  async function onSubmit() {
    if (isSubmitting) return;
    if (!Boolean(idString.trim())) return;

    inputRef.current?.blur();
    setIsSubmitting(true);
    try {
      let contact = await getContact(idString);
      setResult(contact);
    } catch (err) {
      console.error(err.message || err);
    }
    setIsSubmitting(false);
  }

  function toggleVisibleMenu() {
    setVisibleMenu(v => !v);
  }

  async function onAdd() {
    setIsSubmitting(true);
    try {
      await addContact({contactRef: result._id});
      hideSheet();
      setVisibleMenu(false);
      setResult(null);
    } catch (err) {
      console.error(err.message || err);
    }
    setIsSubmitting(false);
  }

  return (
    <View style={{padding: 16}}>
      <View
        style={{flexDirection: 'row', alignItems: 'center', marginBottom: 16}}>
        <Searchbar
          clearButtonMode="never"
          clearIcon={() => null}
          ref={inputRef}
          style={{
            flex: 1,
            height: 40,
            backgroundColor: '#FFF',
            borderWidth: 1,
            borderColor: theme.colors.secondary,
            marginRight: 16,
          }}
          placeholder="User ID"
          value={idString}
          onChangeText={onChange}
          onSubmitEditing={onSubmit}
        />
        <IconButton
          style={{margin: 0}}
          disabled={isSubmitting}
          icon="magnify"
          mode="contained"
          onPress={onSubmit}
        />
      </View>
      <Divider />
      {isSubmitting && <ProgressBar indeterminate />}
      <Text variant="labelLarge" style={{marginVertical: 16}}>
        Result:
      </Text>
      {result && (
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
                backgroundColor: theme.colors.secondaryContainer,
                borderRadius: 10,
              }}>
              <Image
                resizeMode="stretch"
                style={{width: 30, height: 30, marginRight: 16}}
                source={require('../assets/avatar.png')}
              />
              <Text>{result.name}</Text>
            </Pressable>
          }>
          <Menu.Item title="Add Contact" onPress={onAdd} />
        </Menu>
      )}
    </View>
  );
}

function ContactRequest() {
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

function MatchInvitations() {
  const {user, matches} = useAppContext();
  const invitations = useMemo(
    () =>
      matches.filter(m =>
        user.invitations.find(mi => String(mi._id) === String(m._id)),
      ),
    [user.invitations, matches],
  );

  return (
    <FlatList
      data={invitations}
      renderItem={({item}) => <Match match={item} />}
      keyExtractor={item => item._id}
    />
  );
}

function Match({match}) {
  const {handleJoinMatch, handleRejectInvite, selectMatch} = useAppContext();
  const {displaySheet, hideSheet} = useSheetContext();
  const navigation = useNavigation();
  const theme = useTheme();
  const [visibleMenu, setVisibleMenu] = useState(false);

  const joinedCount = useMemo(
    () =>
      match?.participants.map(p => p.count).reduce((sum, a) => sum + a, 0) || 0,
    [match?.participants],
  );

  const maxJoined = useMemo(
    () => (match?.count ? match.count - joinedCount : 0),
    [match?.count, joinedCount],
  );

  function toggleVisibleMenu() {
    setVisibleMenu(v => !v);
  }

  function onOpen() {
    selectMatch(match);
    navigation.navigate('Match', {name: match.name});
    setVisibleMenu(false);
  }

  function onAccept() {
    displaySheet({
      content: <JoinForm maxJoined={maxJoined} onSubmit={joinMatch} />,
    });
    setVisibleMenu(false);
  }

  async function joinMatch(count) {
    await handleJoinMatch({matchRef: match._id, count});
    hideSheet();
  }

  async function onReject() {
    await handleRejectInvite(match._id);
    setVisibleMenu(false);
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
          }}>
          <IconButton style={{margin: 0}} icon="star" />
          <Text style={{flex: 1}}>{match.name}</Text>
          <Chip icon="account">
            {joinedCount} / {match.count}
          </Chip>
        </Pressable>
      }>
      <Menu.Item title="Open" onPress={onOpen} />
      <Menu.Item title="Accept" onPress={onAccept} />
      <Menu.Item title="Reject" onPress={onReject} />
    </Menu>
  );
}

function JoinForm({maxJoined, onSubmit}) {
  const [value, setValue] = useState(1);
  const [isSubmitting, setIsSubmitting] = useState(false);

  function onCountChange(v) {
    setValue(v);
  }

  async function handleSubmit() {
    setIsSubmitting(true);
    try {
      await onSubmit(value);
    } catch (err) {
      console.error(err.message || err);
    }
    setIsSubmitting(false);
  }

  return (
    <View style={{padding: 16}}>
      <Counter
        label="Player"
        min={1}
        max={maxJoined}
        value={value}
        onDecrement={onCountChange}
        onIncrement={onCountChange}
      />

      <Button
        style={{marginTop: 16}}
        disabled={isSubmitting}
        mode="contained"
        onPress={handleSubmit}>
        Join
      </Button>
    </View>
  );
}
