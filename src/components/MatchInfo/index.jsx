import {useEffect, useMemo, useRef, useState} from 'react';
import {View, ScrollView, Linking} from 'react-native';
import {
  Button,
  Card,
  Divider,
  IconButton,
  Text,
  TextInput,
  useTheme,
} from 'react-native-paper';
import Hyperlink from 'react-native-hyperlink';
import {format} from 'date-fns';

import {useAppContext} from 'src/context/App';
import {useModalContext} from 'src/context/Modal';
import {useSheetContext} from 'src/context/Sheet';
import Map from 'src/components/Map';

import EditProvider from './EditProvider';
import EditProviderSchedule from './EditProviderSchedule';
import EditSchedule from './EditSchedule';

export default function MatchInfo() {
  const {user, match} = useAppContext();
  const {displayModal} = useModalContext();
  const {displaySheet, displaySheetRoute} = useSheetContext();
  const theme = useTheme();

  const isOwner = useMemo(
    () => String(match?.owner._id) === String(user?._id),
    [user?._id, match?.owner._id],
  );

  function showMap() {
    displayModal({
      content: (
        <Map
          liteMode={false}
          title={match?.provider.name}
          description={match?.provider.address}
          center={match?.location.coordinates.slice().reverse()}
          height={450}
        />
      ),
    });
  }

  function onEditProvider() {
    displaySheetRoute({
      routes: [
        {
          name: 'provider',
          component: EditProvider,
        },
        {
          name: 'schedule',
          component: EditProviderSchedule,
        },
      ],
      initialRoute: 'provider',
      state: {provider: null, start: null, end: null},
    });
  }

  function onEditSchedule() {
    displaySheet({content: <EditSchedule />});
  }

  function onAddAnnouncement() {
    if (!isOwner) return;
    displaySheet({content: <Announcement />});
  }

  return (
    <ScrollView style={{flex: 1, backgroundColor: theme.colors.background}}>
      <View
        style={{
          padding: 16,
          paddingTop: 64,
          backgroundColor: theme.colors.secondaryContainer,
        }}>
        <View
          style={{
            flexDirection: 'row',
            justifyContent: 'space-between',
            alignItems: 'flex-start',
          }}>
          <View style={{flex: 1, paddingRight: 16}}>
            <View
              style={{
                marginBottom: 8,
                flexDirection: 'row',
                alignItems: 'center',
              }}>
              <Text variant="titleLarge" style={{fontWeight: 'bold'}}>
                {match?.provider.name}
              </Text>
              {isOwner && (
                <IconButton onPress={onEditProvider} size={15} icon="pencil" />
              )}
            </View>

            <Text variant="bodyLarge">{match?.provider.address}</Text>
          </View>
          <Button
            mode="contained"
            icon="map-marker"
            style={{
              marginBottom: 8,
              backgroundColor: theme.colors.tertiaryContainer,
            }}
            onPress={showMap}>
            <Text variant="labelLarge">
              ~ {Math.floor(match?.distance / 1000)} km
            </Text>
          </Button>
        </View>
      </View>

      <Divider />

      <View
        style={{
          padding: 16,
          paddingBottom: 64,
          marginBottom: 48,
          backgroundColor: theme.colors.secondaryContainer,
        }}>
        <View style={{flexDirection: 'row', alignItems: 'center'}}>
          <IconButton icon="calendar-check" />
          {match && (
            <Text
              variant="titleMedium"
              style={{
                color: theme.colors.onPrimaryContainer,
                fontWeight: 'bold',
              }}>
              {format(new Date(match?.start), 'iiii, do MMMM yyyy')}
            </Text>
          )}
          {isOwner && (
            <IconButton onPress={onEditSchedule} size={15} icon="pencil" />
          )}
        </View>
        <View style={{flexDirection: 'row', alignItems: 'center'}}>
          <IconButton icon="clock-outline" />
          {match && (
            <Text
              variant="titleMedium"
              style={{
                color: theme.colors.onPrimaryContainer,
                fontWeight: 'bold',
              }}>
              {format(new Date(match?.start), 'HH:mm')} -{' '}
              {format(new Date(match?.end), 'HH:mm')}
            </Text>
          )}
        </View>
      </View>

      <View style={{marginBottom: 32, position: 'relative'}}>
        <Divider style={{backgroundColor: theme.colors.secondary}} />
        <Button
          onPress={onAddAnnouncement}
          mode="contained"
          icon="bullhorn"
          style={{
            // backgroundColor: theme.colors.secondaryContainer,
            position: 'absolute',
            top: 0,
            transform: [{translateY: -16}],
            left: 16,
          }}>
          Announcement
        </Button>
      </View>

      <View style={{padding: 16}}>
        {match?.announcements.map(announcement => (
          <Card key={announcement._id} style={{marginBottom: 16}}>
            <Card.Content>
              <Text variant="titleMedium" style={{marginBottom: 16}}>
                {announcement.owner.name}
              </Text>
              <Hyperlink
                onPress={url => Linking.openURL(url)}
                linkStyle={{color: 'blue'}}>
                <Text variant="titleMedium">{announcement.text}</Text>
              </Hyperlink>
              <Text style={{textAlign: 'right', marginTop: 16}}>
                {format(new Date(announcement.updatedAt), 'iiii, do MMMM yyyy')}
              </Text>
            </Card.Content>
          </Card>
        ))}
      </View>
    </ScrollView>
  );
}

function Announcement() {
  const {sendAnnouncement} = useAppContext();
  const {hideSheet} = useSheetContext();
  const inputRef = useRef();
  const timeoutRef = useRef();
  const [message, setMessage] = useState('');
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
    setMessage(text);
  }

  async function onSubmit() {
    if (!Boolean(message.trim())) return;

    setIsSubmitting(true);
    try {
      await sendAnnouncement({text: message});
      inputRef.current?.blur();
      hideSheet();
    } catch (err) {
      console.error(err.message || err);
    }
    setIsSubmitting(false);
  }

  return (
    <View
      keyboardShouldPersistTaps="handled"
      style={{
        padding: 16,
        flexDirection: 'row',
        alignItems: 'flex-end',
        maxHeight: 200,
      }}>
      <TextInput
        ref={inputRef}
        style={{flex: 1}}
        mode="outlined"
        placeholder="Say something ..."
        value={message}
        onChangeText={onChange}
        multiline
        maxLength={500}
        right={<TextInput.Affix text={`${String(message.length)}/500`} />}
      />
      <IconButton
        disabled={isSubmitting}
        mode="contained"
        icon="send"
        onPress={onSubmit}
      />
    </View>
  );
}
