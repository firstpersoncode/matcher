import {useMemo, useState} from 'react';
import {Card, Chip, IconButton, Menu, Text, useTheme} from 'react-native-paper';

import {useAppContext} from 'src/context/App';
import {useSheetContext} from 'src/context/Sheet';

import EditParticipant from './EditParticipant';

export default function Participant({match, participant, count}) {
  const {user, handleRemoveParticipant, addContact, acceptContact} =
    useAppContext();
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

  const isFriend = useMemo(
    () =>
      user?.contacts.find(
        item =>
          String(item.contact._id) === String(participant._id) &&
          item.status === 'friend',
      ),
    [user?.contacts, participant._id],
  );

  const isFriendRequested = useMemo(
    () =>
      user?.contacts.find(
        item =>
          String(item.contact._id) === String(participant._id) &&
          item.status === 'waiting-res',
      ),
    [user?.contacts, participant._id],
  );

  const isFriendWaiting = useMemo(
    () =>
      user?.contacts.find(
        item =>
          String(item.contact._id) === String(participant._id) &&
          item.status === 'waiting-req',
      ),
    [user?.contacts, participant._id],
  );

  const isSelf = useMemo(
    () => String(user?._id) === String(participant._id),
    [user?._id, participant._id],
  );

  function toggleVisibleMenu() {
    if (isSelf) return;
    setVisibleMenu(v => !v);
  }

  async function removeParticipant() {
    try {
      await handleRemoveParticipant({participantRef: participant._id});
      setVisibleMenu(false);
    } catch (err) {
      console.error(err.message || err);
    }
  }

  function onEditParticipant() {
    displaySheet({content: <EditParticipant />});
  }

  async function onAdd() {
    try {
      await addContact({contactRef: participant._id});
      setVisibleMenu(false);
    } catch (err) {
      console.error(err.message || err);
    }
  }

  async function onAccept() {
    try {
      await acceptContact({contactRef: participant._id});
      setVisibleMenu(false);
    } catch (err) {
      console.error(err.message || err);
    }
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
            {isFriend && <IconButton style={{margin: 0}} icon="contacts" />}
            {isFriendRequested && (
              <IconButton style={{margin: 0}} icon="contacts-outline" />
            )}
            {isFriendWaiting && (
              <IconButton style={{margin: 0}} icon="human-greeting-proximity" />
            )}
            {isOwner && <IconButton style={{margin: 0}} icon="medal" />}
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
            {isUserOwner && isSelf && (
              <IconButton
                style={{margin: 0}}
                onPress={onEditParticipant}
                size={15}
                icon="pencil"
              />
            )}
          </Card.Content>
        </Card>
      }>
      {isUserOwner && <Menu.Item title="Remove" onPress={removeParticipant} />}
      {!isFriend && !isFriendRequested && !isFriendWaiting && (
        <Menu.Item title="Add Friend" onPress={onAdd} />
      )}
      {isFriendWaiting && (
        <Menu.Item title="Accept Friend" onPress={onAccept} />
      )}
    </Menu>
  );
}
