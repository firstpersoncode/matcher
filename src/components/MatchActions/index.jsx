import {useMemo} from 'react';
import {View} from 'react-native';
import {Button, Text, useTheme} from 'react-native-paper';
import {useNavigation, useRoute} from '@react-navigation/native';

import {useAppContext} from 'src/context/App';
import {useModalContext} from 'src/context/Modal';
import {useSheetContext} from 'src/context/Sheet';
import Auth from 'src/components/Auth';

import JoinForm from './JoinForm';

export default function MatchActions() {
  const {user, match, handleLeaveMatch, handleDeleteMatch, handleJoinMatch} =
    useAppContext();
  const {displayModal, hideModal} = useModalContext();
  const {displaySheet, hideSheet} = useSheetContext();
  const theme = useTheme();
  const navigation = useNavigation();

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
    displayModal({
      content: (
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
        </View>
      ),
    });
  }

  async function leaveMatch() {
    navigation.navigate('MatchList');
    hideModal();
    await handleLeaveMatch();
  }

  function onDeleteMatch() {
    displayModal({
      content: (
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
        </View>
      ),
    });
  }

  async function deleteMatch() {
    navigation.navigate('MatchList');
    hideModal();
    await handleDeleteMatch();
  }

  function openJoinMatch() {
    if (!user) return displayModal({content: <Auth />});
    displaySheet({
      content: <JoinForm maxJoined={maxJoined} onSubmit={joinMatch} />,
    });
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
          style={{
            marginVertical: 8,
            marginHorizontal: 16,
            backgroundColor: theme.colors.error,
          }}
          onPress={onLeaveMatch}>
          Leave
        </Button>
      )}
      {isOwner && (
        <Button
          mode="elevated"
          icon="delete"
          textColor="#FFF"
          style={{
            marginVertical: 8,
            marginHorizontal: 16,
            backgroundColor: theme.colors.error,
          }}
          onPress={onDeleteMatch}>
          Delete
        </Button>
      )}
      {!isParticipant && maxJoined > 0 && !user?.match && (
        <Button
          style={{
            marginVertical: 8,
            marginHorizontal: 16,
            backgroundColor: theme.colors.primary,
          }}
          mode="contained"
          icon="handshake"
          onPress={openJoinMatch}>
          Join
        </Button>
      )}
    </>
  );
}
