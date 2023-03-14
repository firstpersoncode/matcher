import {View, Pressable} from 'react-native';
import {
  Button,
  Chip,
  IconButton,
  Menu,
  Text,
  useTheme,
} from 'react-native-paper';

import {useAppContext} from 'src/context/App';
import {useMemo, useState} from 'react';
import {useSheetContext} from 'src/context/Sheet';
import {useNavigation} from '@react-navigation/native';
import Counter from 'src/components/Counter';

export default function Item({match}) {
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
