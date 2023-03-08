import {useMemo} from 'react';
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
import {useRoute} from '@react-navigation/native';
import {format} from 'date-fns';

import {useAppContext} from 'src/context/App';
import {useModalContext} from 'src/context/Modal';
import Map from './Map';

export default function MatchInfo() {
  const {user, matches} = useAppContext();
  const {displayModal} = useModalContext();

  const theme = useTheme();
  const route = useRoute();
  const match = useMemo(
    () => matches.find(m => String(m._id) === String(route.params.matchRef)),
    [matches, route.params.matchRef],
  );

  const isOwner = useMemo(
    () => String(match?.owner._id) === String(user?._id),
    [user?._id, match?.owner._id],
  );

  function showMap() {
    displayModal(
      <Map
        liteMode={false}
        title={match.provider.name}
        description={match.provider.address}
        center={match.location.coordinates.slice().reverse()}
        height={400}
      />,
    );
  }

  return (
    <ScrollView style={{flex: 1}}>
      <View
        style={{
          padding: 16,
          paddingTop: 64,
          flexDirection: 'row',
          justifyContent: 'space-between',
          alignItems: 'flex-start',
          backgroundColor: theme.colors.secondaryContainer,
        }}>
        <View style={{flexDirection: 'row', alignItems: 'flex-start'}}>
          <Text variant="headlineLarge" style={{fontWeight: 'bold'}}>
            {match.name}
          </Text>
          {isOwner && <IconButton icon="pencil" />}
        </View>
        <Button
          mode="contained"
          icon="map-marker"
          style={{marginBottom: 8}}
          onPress={showMap}>
          ~ {Math.floor(match.distance / 1000)} km
        </Button>
      </View>

      <Divider />

      <View
        style={{
          padding: 16,
          paddingBottom: 64,
          marginBottom: 48,
          flexDirection: 'row',
          alignItems: 'flex-start',
          backgroundColor: theme.colors.secondaryContainer,
        }}>
        <View style={{flex: 1}}>
          <Text
            variant="titleLarge"
            style={{fontWeight: 'bold', marginBottom: 16}}>
            {match.provider.name}
          </Text>
          <Text variant="bodyLarge" style={{marginBottom: 16}}>
            {match.provider.address}
          </Text>
          <View style={{flexDirection: 'row', alignItems: 'center'}}>
            <IconButton icon="calendar-check" />
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
          <View style={{flexDirection: 'row', alignItems: 'center'}}>
            <IconButton icon="clock-outline" />
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
        {isOwner && <IconButton icon="pencil" />}
      </View>

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

      <View style={{padding: 16}}>
        {match.announcements.map(announcement => (
          <Card key={announcement._id} style={{marginBottom: 16}}>
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
                {format(new Date(announcement.updatedAt), 'iiii, do MMMM yyyy')}
              </Text>
            </Card.Content>
          </Card>
        ))}
      </View>
    </ScrollView>
  );
}
