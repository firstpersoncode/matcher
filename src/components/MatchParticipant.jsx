import {useMemo, useState} from 'react';
import {ScrollView} from 'react-native';
import {
  Button,
  Card,
  Chip,
  HelperText,
  IconButton,
  Menu,
  Text,
  TextInput,
  useTheme,
} from 'react-native-paper';
import {useRoute} from '@react-navigation/native';

import {useAppContext} from 'src/context/App';
import {useSheetContext} from 'src/context/Sheet';

import Counter from './Counter';

export default function MatchParticipant() {
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
    displaySheet({content: <FormParticipant />});
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

function FormParticipant() {
  const {user, handleUpdateMatchParticipant} = useAppContext();
  const {hideSheet} = useSheetContext();
  const [form, setForm] = useState({
    count: user.match.count,
    pcount: user.match.participants.find(
      p => String(p.participant._id) === String(user._id),
    ).count,
  });
  const [errors, setErrors] = useState({});
  const [isSubmitting, setIsSubmitting] = useState(false);

  const joinedCount = useMemo(
    () =>
      user.match.participants.map(p => p.count).reduce((sum, a) => sum + a, 0),
    [user.match.participants],
  );

  function handleDecrement(field) {
    return function (value) {
      setForm(v => ({...v, [field]: value}));
      setErrors(v => ({...v, count: undefined, pcount: undefined}));
    };
  }

  function handleIncrement(field) {
    return function (value) {
      setForm(v => ({...v, [field]: value}));
      setErrors(v => ({...v, count: undefined, pcount: undefined}));
    };
  }

  function validate() {
    let errors = {};

    if (!form.count) errors = {...errors, count: 'required'};
    else if (form.count < form.pcount) errors = {...errors, count: 'invalid'};

    if (!form.pcount) errors = {...errors, pcount: 'required'};
    else if (form.pcount > form.count) errors = {...errors, pcount: 'invalid'};

    setErrors(errors);

    return errors;
  }

  async function handleSubmit() {
    const isValid = !Object.keys(validate()).length;
    if (!isValid) return;

    setIsSubmitting(true);
    try {
      await handleUpdateMatchParticipant(form);
      hideSheet();
    } catch (err) {
      console.error(err.message || err);
    }
    setIsSubmitting(false);
  }

  return (
    <ScrollView style={{padding: 16}} keyboardShouldPersistTaps="handled">
      <Counter
        label="Needed"
        min={joinedCount}
        value={form.count}
        onDecrement={handleDecrement('count')}
        onIncrement={handleIncrement('count')}
        error={errors.count}
      />

      <Counter
        label="Available"
        value={form.pcount}
        onDecrement={handleDecrement('pcount')}
        onIncrement={handleIncrement('pcount')}
        error={errors.pcount}
      />

      <Button disabled={isSubmitting} mode="contained" onPress={handleSubmit}>
        Update
      </Button>
    </ScrollView>
  );
}
