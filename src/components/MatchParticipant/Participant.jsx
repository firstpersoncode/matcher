import {useMemo, useState} from 'react';
import {Card, Chip, IconButton, Menu, Text, useTheme} from 'react-native-paper';

import {useAppContext} from 'src/context/App';
import {useSheetContext} from 'src/context/Sheet';

import EditParticipant from './EditParticipant';

export default function Participant({match, participant, count}) {
  const {user, handleRemoveParticipant} = useAppContext();
  const {displaySheet} = useSheetContext();
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

  function onEditParticipant() {
    displaySheet({content: <EditParticipant />});
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
            {isUserOwner && (
              <IconButton
                onPress={onEditParticipant}
                mode="contained"
                size={18}
                icon="pencil"
              />
            )}
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
