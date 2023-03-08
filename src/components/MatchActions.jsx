import {useMemo, useState} from 'react';
import {View} from 'react-native';
import {Button, Text, useTheme} from 'react-native-paper';
import {useNavigation, useRoute} from '@react-navigation/native';

import {useAppContext} from 'src/context/App';
import {useModalContext} from 'src/context/Modal';
import {useSheetContext} from 'src/context/Sheet';

import Counter from './Counter';

export default function MatchActions() {
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
      {!isParticipant && (
        <Button
          disabled={maxJoined < 1 || Boolean(user?.match)}
          mode="contained"
          icon="handshake"
          onPress={openJoinMatch}>
          Join
        </Button>
      )}
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
