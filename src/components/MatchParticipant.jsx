import {useMemo, useState} from 'react';
import {ScrollView} from 'react-native';
import {Card, Chip, IconButton, Menu, Text, useTheme} from 'react-native-paper';
import {useRoute} from '@react-navigation/native';

import {useAppContext} from 'src/context/App';

export default function MatchParticipant() {
  const {matches} = useAppContext();
  const theme = useTheme();
  const route = useRoute();
  const match = useMemo(
    () => matches.find(m => String(m._id) === String(route.params.matchRef)),
    [matches, route.params.matchRef],
  );

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
            {isUserOwner && <IconButton mode="contained" icon="pencil" />}
          </Card.Content>
        </Card>
      }>
      <Menu.Item title="Remove" onPress={removeParticipant(participant)} />
    </Menu>
  );
}
