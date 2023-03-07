import {useMemo, useState} from 'react';
import {View, ScrollView, Linking} from 'react-native';
import {
  Button,
  Card,
  Divider,
  IconButton,
  Text,
  useTheme,
} from 'react-native-paper';
import Hyperlink from 'react-native-hyperlink';
import {useNavigation, useRoute} from '@react-navigation/native';
import {format} from 'date-fns';

import {useAppContext} from 'src/context/App';
import {useModalContext} from 'src/context/Modal';
import {useSheetContext} from 'src/context/Sheet';

import Counter from './Counter';

export default function MatchInfo() {
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
    <ScrollView style={{flex: 1, backgroundColor: theme.colors.background}}>
      <View
        style={{padding: 16, flexDirection: 'row', alignItems: 'flex-start'}}>
        <View
          style={{
            flex: 1,
            flexDirection: 'row',
            alignItems: 'flex-start',
          }}>
          <Text variant="headlineLarge" style={{fontWeight: 'bold'}}>
            {match.name}
          </Text>
          {isOwner && <IconButton icon="pencil" />}
        </View>
        {!isOwner && isParticipant && (
          <Button
            mode="elevated"
            icon="location-exit"
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
            icon="handshake"
            textColor="#FFF"
            style={{backgroundColor: theme.colors.primary}}
            onPress={openJoinMatch}>
            Join
          </Button>
        )}
      </View>
      <View
        style={{
          padding: 16,
          flexDirection: 'row',
          alignItems: 'flex-start',
          backgroundColor: theme.colors.secondaryContainer,
        }}>
        <View style={{flex: 1}}>
          <Text variant="headlineMedium" style={{fontWeight: 'bold'}}>
            {match.provider.name}
          </Text>
          <Text variant="bodyLarge">{match.provider.address}</Text>
        </View>
        {isOwner && <IconButton icon="pencil" />}
      </View>
      <View style={{padding: 16, marginBottom: 32}}>
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
          {isOwner && <IconButton icon="pencil" />}
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
          {isOwner && <IconButton icon="pencil" />}
        </View>
      </View>
      {match.announcements.length > 0 && (
        <>
          <View style={{marginBottom: 32, position: 'relative'}}>
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
