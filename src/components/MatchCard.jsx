import {useMemo, useState} from 'react';
import {View} from 'react-native';
import {
  Card,
  Text,
  TouchableRipple,
  Chip,
  useTheme,
  IconButton,
  Badge,
  Divider,
  Button,
} from 'react-native-paper';
import {format} from 'date-fns';

import {useAppContext} from 'src/context/App';
import Map from './Map';

export default function MatchCard({match, onPress}) {
  const {user, unreads} = useAppContext();
  const theme = useTheme();
  const [visibleMap, setVisibleMap] = useState(false);

  const isParticipant = useMemo(
    () => String(match._id) === String(user?.match?._id),
    [user?.match?._id, match],
  );

  const joinedCount = useMemo(
    () => match.participants.map(p => p.count).reduce((sum, a) => sum + a, 0),
    [match.participants],
  );

  const totalUnreads = useMemo(
    () => (isParticipant ? unreads : 0),
    [isParticipant, unreads],
  );

  function toggleVisibleMap() {
    setVisibleMap(v => !v);
  }

  return (
    <Card
      elevation={isParticipant ? 3 : 1}
      style={{
        backgroundColor: isParticipant ? theme.colors.inversePrimary : '#FFF',
        padding: 0,
        margin: 16,
      }}>
      <TouchableRipple onPress={onPress}>
        <Card.Content style={{position: 'relative', padding: 16}}>
          {totalUnreads > 0 && (
            <Badge
              size={30}
              style={{position: 'absolute', top: -8, right: -8, zIndex: 1}}>
              {totalUnreads}
            </Badge>
          )}
          <View style={{flexDirection: 'row', justifyContent: 'flex-end'}}>
            <Chip icon="account" style={{marginRight: 8}}>
              {joinedCount} / {match.count}
            </Chip>

            <Button
              mode="contained"
              icon="map-marker"
              onPress={toggleVisibleMap}>
              ~ {Math.floor(match.distance / 1000)} km
            </Button>
          </View>

          <Text
            style={{
              color: theme.colors.onSecondaryContainer,
              fontWeight: 'bold',
            }}
            variant="titleLarge">
            {match.name}
          </Text>
        </Card.Content>
      </TouchableRipple>
      {visibleMap && (
        <Map
          title={match.provider.name}
          description={match.provider.address}
          center={match.location.coordinates.slice().reverse()}
          height={450}
          liteMode={false}
        />
      )}
      <Divider />
      <TouchableRipple onPress={onPress}>
        <Card.Content style={{padding: 16}}>
          <View style={{marginBottom: 16}}>
            <Text variant="titleMedium">{match.provider.name}</Text>
            <Text variant="bodyMedium">{match.provider.address}</Text>
          </View>

          <View
            style={{
              padding: 4,
              borderRadius: 10,
              backgroundColor: theme.colors.secondaryContainer,
              flexDirection: 'row',
              alignItems: 'center',
            }}>
            <IconButton icon="calendar-check" size={15} style={{padding: 0}} />
            <Text
              style={{
                flex: 1,
                color: theme.colors.onPrimaryContainer,
                fontWeight: 'bold',
              }}>
              {format(new Date(match.start), 'iiii | do MMM yyyy |')}{' '}
              {format(new Date(match.start), 'HH:mm')} -{' '}
              {format(new Date(match.end), 'HH:mm')}
            </Text>
          </View>
        </Card.Content>
      </TouchableRipple>
    </Card>
  );
}
