import {useCallback, useEffect, useMemo, useState} from 'react';
import {
  View,
  useWindowDimensions,
  ScrollView,
  FlatList,
  Linking,
} from 'react-native';
import {
  Avatar,
  Badge,
  Button,
  Card,
  Chip,
  Divider,
  IconButton,
  Menu,
  Text,
  TextInput,
  useTheme,
} from 'react-native-paper';
import Hyperlink from 'react-native-hyperlink';
import {useNavigation, useRoute} from '@react-navigation/native';
import {TabView, TabBar} from 'react-native-tab-view';
import {format} from 'date-fns';

import {useAppContext} from 'src/context/App';
import {useModalContext} from 'src/context/Modal';
import {useSheetContext} from 'src/context/Sheet';
import Map from 'src/components/Map';
import Counter from 'src/components/Counter';
import Message from 'src/components/Message';

export default function Match() {
  const {user, matches, messages, unreads, saveLastRead} = useAppContext();
  const layout = useWindowDimensions();
  const theme = useTheme();
  const navigation = useNavigation();
  const route = useRoute();
  const [index, setIndex] = useState(0);
  const [routes] = useState([
    {key: 'information-outline', title: 'Info'},
    {key: 'account-multiple', title: 'Participant'},
    {key: 'chat', title: 'Chat'},
    {key: 'map-marker', title: 'Location'},
  ]);
  const match = useMemo(
    () => matches.find(m => String(m._id) === String(route.params.matchRef)),
    [matches, route.params.matchRef],
  );

  const isParticipant = useMemo(
    () => user?.match && String(match?._id) === String(user.match._id),
    [user?.match, match?._id],
  );

  const joinedCount = useMemo(
    () =>
      match?.participants.map(p => p.count).reduce((sum, a) => sum + a, 0) || 0,
    [match?.participants],
  );

  const totalUnreads = useMemo(
    () => (isParticipant ? unreads : 0),
    [isParticipant, unreads],
  );

  useEffect(() => {
    if (!match?._id) navigation.navigate('Matcher');
  }, [match?._id]);

  useEffect(() => {
    if (isParticipant && index === 2) saveLastRead();
  }, [isParticipant, messages, index]);

  const renderScene = useCallback(
    ({route}) => {
      switch (route.key) {
        case 'information-outline':
          return <MatchInfo />;
        case 'account-multiple':
          return <MatchParticipant />;
        case 'chat':
          return isParticipant ? <MatchChat /> : <MatchChatNonParticipant />;
        case 'map-marker':
          return match ? (
            <Map
              liteMode={false}
              title={match.provider.name}
              description={match.provider.address}
              center={match.location.coordinates.slice().reverse()}
            />
          ) : null;
        default:
          return null;
      }
    },
    [
      isParticipant,
      match?.provider.name,
      match?.provider.address,
      match?.location.coordinates,
    ],
  );

  const renderTabBar = useCallback(
    props => {
      if (!match) return null;
      return (
        <TabBar
          {...props}
          style={{backgroundColor: theme.colors.primary}}
          tabStyle={{padding: 0}}
          getLabelText={() => null}
          indicatorStyle={{bottom: 'auto', top: 0}}
          renderIcon={({route, color}) => (
            <View style={{flexDirection: 'row', alignItems: 'center'}}>
              <Avatar.Icon
                icon={route.key}
                size={40}
                color={color}
                style={{backgroundColor: 'transparent'}}
              />
              {route.key === 'account-multiple' && (
                <Text style={{color}}>
                  {joinedCount} / {match.count}
                </Text>
              )}
              {route.key === 'chat' && totalUnreads > 0 && (
                <Badge
                  style={{position: 'absolute', top: 2, right: 0}}
                  size={18}>
                  {totalUnreads}
                </Badge>
              )}
            </View>
          )}
        />
      );
    },
    [match?.count, theme.colors.secondary, joinedCount, totalUnreads],
  );

  if (!match)
    return (
      <View style={{flex: 1, justifyContent: 'center', alignItems: 'center'}}>
        <Text>Match already removed</Text>
      </View>
    );

  return (
    <TabView
      lazy
      navigationState={{index, routes}}
      renderScene={renderScene}
      renderTabBar={renderTabBar}
      onIndexChange={setIndex}
      initialLayout={{width: layout.width}}
      tabBarPosition="bottom"
    />
  );
}

function MatchInfo() {
  const {user, matches, handleLeaveMatch, handleDeleteMatch, handleJoinMatch} =
    useAppContext();
  const {displayModal, hideModal} = useModalContext();
  const {displaySheet, hideSheet} = useSheetContext();
  const theme = useTheme();
  const navigation = useNavigation();
  const route = useRoute();
  const match = useMemo(
    () => matches.find(m => String(m._id) === String(route.params.matchRef)),
    [matches, route.params.matchRef],
  );

  const isOwner = useMemo(
    () => String(match?.owner._id) === String(user?._id),
    [user?._id, match?.owner._id],
  );

  const isParticipant = useMemo(
    () => user?.match && String(match?._id) === String(user.match._id),
    [user?.match, match?._id],
  );

  const joinedCount = useMemo(
    () =>
      match?.participants.map(p => p.count).reduce((sum, a) => sum + a, 0) || 0,
    [match?.participants],
  );

  const maxJoined = useMemo(
    () => (match?.count ? match.count - joinedCount : 0),
    [match?.count, joinedCount],
  );

  function onLeaveMatch() {
    displayModal(
      <View style={{backgroundColor: '#FFF', padding: 16}}>
        <Text
          style={{marginBottom: 16, textAlign: 'center'}}
          variant="titleLarge">
          Are you sure?
        </Text>
        <Button
          onPress={leaveMatch}
          textColor="#FFF"
          style={{backgroundColor: theme.colors.error}}>
          Leave
        </Button>
      </View>,
    );
  }

  async function leaveMatch() {
    navigation.navigate('Matcher');
    hideModal();
    await handleLeaveMatch();
  }

  function onDeleteMatch() {
    displayModal(
      <View style={{backgroundColor: '#FFF', padding: 16}}>
        <Text
          style={{marginBottom: 16, textAlign: 'center'}}
          variant="titleLarge">
          Are you sure?
        </Text>
        <Button
          onPress={deleteMatch}
          textColor="#FFF"
          style={{backgroundColor: theme.colors.error}}>
          Delete
        </Button>
      </View>,
    );
  }

  async function deleteMatch() {
    navigation.navigate('Matcher');
    hideModal();
    await handleDeleteMatch();
  }

  function openJoinMatch() {
    displaySheet(<MatchJoin maxJoined={maxJoined} onSubmit={joinMatch} />);
  }

  async function joinMatch(count) {
    await handleJoinMatch({matchRef: match._id, count});
    hideSheet();
  }

  return (
    <>
      <ScrollView style={{flex: 1}}>
        <View
          style={{
            padding: 16,
            flexDirection: 'row',
            justifyContent: 'flex-end',
          }}>
          {!isOwner && isParticipant && (
            <Button
              mode="elevated"
              icon="arrow-left"
              textColor="#FFF"
              style={{backgroundColor: theme.colors.error}}
              onPress={onLeaveMatch}>
              Leave
            </Button>
          )}
          {isOwner && (
            <Button
              mode="elevated"
              icon="delete"
              textColor="#FFF"
              style={{backgroundColor: theme.colors.error}}
              onPress={onDeleteMatch}>
              Delete
            </Button>
          )}
          {user && !user.match && maxJoined > 0 && (
            <Button
              mode="elevated"
              icon="exit-run"
              textColor="#FFF"
              style={{backgroundColor: theme.colors.primary}}
              onPress={openJoinMatch}>
              Join
            </Button>
          )}
        </View>
        <Divider style={{marginBottom: 16}} />
        <View style={{marginBottom: 32, padding: 16}}>
          <Text
            variant="headlineLarge"
            style={{fontWeight: 'bold', marginBottom: 16}}>
            {match.provider.name}
          </Text>
          <Text variant="bodyLarge">{match.provider.address}</Text>
        </View>
        <View style={{padding: 16}}>
          <View
            style={{
              padding: 4,
              borderRadius: 10,
              marginBottom: 16,
              backgroundColor: theme.colors.secondaryContainer,
              flexDirection: 'row',
              alignItems: 'center',
            }}>
            <IconButton icon="calendar-check" size={15} style={{padding: 0}} />
            <Text
              variant="titleMedium"
              style={{
                flex: 1,
                color: theme.colors.onPrimaryContainer,
                fontWeight: 'bold',
              }}>
              {format(new Date(match.start), 'iiii, do MMMM yyyy')}
            </Text>
          </View>

          <View
            style={{
              padding: 4,
              borderRadius: 10,
              backgroundColor: theme.colors.secondaryContainer,
              flexDirection: 'row',
              alignItems: 'center',
            }}>
            <IconButton icon="clock-outline" size={15} style={{padding: 0}} />
            <Text
              variant="titleMedium"
              style={{
                flex: 1,
                color: theme.colors.onPrimaryContainer,
                fontWeight: 'bold',
              }}>
              {format(new Date(match.start), 'HH:mm')} -{' '}
              {format(new Date(match.end), 'HH:mm')}
            </Text>
          </View>
        </View>
        {match.announcements.length > 0 && (
          <>
            <View
              style={{marginTop: 64, marginBottom: 32, position: 'relative'}}>
              <Divider style={{backgroundColor: theme.colors.secondary}} />
              <IconButton
                size={20}
                icon="bullhorn"
                style={{
                  backgroundColor: theme.colors.secondaryContainer,
                  position: 'absolute',
                  top: 0,
                  transform: [{translateY: -25}],
                  left: 16,
                }}
              />
            </View>
            <View style={{marginBottom: 16, padding: 16}}>
              {match.announcements.map(announcement => (
                <Card key={announcement._id} style={{marginBottom: 8}}>
                  <Card.Content>
                    <Text variant="titleMedium" style={{marginBottom: 16}}>
                      {match.owner.name}
                    </Text>
                    <Hyperlink
                      onPress={url => Linking.openURL(url)}
                      linkStyle={{color: 'blue'}}>
                      <Text variant="titleMedium">{announcement.text}</Text>
                    </Hyperlink>
                    <Text style={{textAlign: 'right', marginTop: 16}}>
                      {format(
                        new Date(announcement.updatedAt),
                        'iiii, do MMMM yyyy',
                      )}
                    </Text>
                  </Card.Content>
                </Card>
              ))}
            </View>
          </>
        )}
      </ScrollView>
    </>
  );
}

function MatchJoin({maxJoined, onSubmit}) {
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

      <Button disabled={isSubmitting} mode="contained" onPress={handleSubmit}>
        Join
      </Button>
    </View>
  );
}

function MatchParticipant() {
  const {matches} = useAppContext();
  const route = useRoute();
  const match = useMemo(
    () => matches.find(m => String(m._id) === String(route.params.matchRef)),
    [matches, route.params.matchRef],
  );

  return (
    <ScrollView style={{padding: 16}}>
      {match.participants.map(({participant, count}) => (
        <Participant
          key={participant._id}
          participant={participant}
          count={count}
          match={match}
        />
      ))}
    </ScrollView>
  );
}

function Participant({match, participant, count}) {
  const {user, handleRemoveParticipant} = useAppContext();
  const theme = useTheme();
  const [visibleMenu, setVisibleMenu] = useState(false);

  const isOwner = useMemo(
    () => String(match.owner._id) === String(participant._id),
    [match.owner._id, participant._id],
  );

  const isUserOwner = useMemo(
    () => String(match.owner._id) === String(user?._id),
    [match.owner._id, user?._id],
  );

  const isSelf = useMemo(
    () => String(user?._id) === String(participant._id),
    [user?._id, participant._id],
  );

  function toggleVisibleMenu() {
    if (!isUserOwner || isSelf) return;
    setVisibleMenu(v => !v);
  }

  function removeParticipant(participant) {
    return function () {
      handleRemoveParticipant({participantRef: participant._id});
      setVisibleMenu(false);
    };
  }

  return (
    <Menu
      visible={visibleMenu}
      onDismiss={toggleVisibleMenu}
      anchor={
        <Card
          onPress={toggleVisibleMenu}
          style={{
            backgroundColor: isSelf
              ? theme.colors.primaryContainer
              : theme.colors.secondaryContainer,
            marginBottom: 16,
          }}>
          <Card.Content
            style={{
              flexDirection: 'row',
              alignItems: 'center',
              borderRadius: 10,
            }}>
            {isOwner ? (
              <IconButton icon="medal" />
            ) : (
              <IconButton icon="circle-small" />
            )}
            <Text style={{flex: 1}}>{participant.name}</Text>
            <Chip
              icon="account"
              style={{
                backgroundColor: isSelf
                  ? theme.colors.primaryContainer
                  : theme.colors.secondaryContainer,
              }}>
              {count}
            </Chip>
          </Card.Content>
        </Card>
      }>
      <Menu.Item title="Remove" onPress={removeParticipant(participant)} />
    </Menu>
  );
}

function MatchChat() {
  const {messages, sendMessage} = useAppContext();
  const [message, setMessage] = useState('');
  const [isSending, setIsSending] = useState(false);

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

  return (
    <>
      <FlatList
        inverted
        data={messages.slice().reverse()}
        renderItem={({item}) => <Message message={item} />}
        keyExtractor={item => item._id}
      />
      <View
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

function MatchChatNonParticipant() {
  return (
    <View style={{flex: 1, justifyContent: 'center', alignItems: 'center'}}>
      <Text>You are not a participant in this match</Text>
    </View>
  );
}
