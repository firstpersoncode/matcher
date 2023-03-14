import {Image, View, useWindowDimensions} from 'react-native';
import {
  Badge,
  Button,
  Divider,
  HelperText,
  IconButton,
  Text,
  TextInput,
  useTheme,
} from 'react-native-paper';

import {useAppContext} from 'src/context/App';
import Header from 'src/components/Header';
import {useEffect, useMemo, useRef, useState} from 'react';
import {useSheetContext} from 'src/context/Sheet';
import {SceneMap, TabBar, TabView} from 'react-native-tab-view';
import Cog from 'src/components/Cog';
import Contact from 'src/components/Contact';
import ContactRequest from 'src/components/ContactRequest';
import MatchInvitations from 'src/components/MatchInvitations';

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
