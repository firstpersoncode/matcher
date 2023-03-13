import {useMemo} from 'react';
import {View} from 'react-native';
import {
  Card,
  Text,
  TouchableRipple,
  useTheme,
  IconButton,
  Badge,
  Button,
} from 'react-native-paper';
import {format} from 'date-fns';

import {useAppContext} from 'src/context/App';

export default function MatchCard({mini = false, match, onPress, onPressMap}) {
  const {user, messages} = useAppContext();
  const theme = useTheme();

  const isParticipant = useMemo(
    () => String(match._id) === String(user?.match?._id),
    [user?.match?._id, match],
  );

  const joinedCount = useMemo(
    () => match.participants.map(p => p.count).reduce((sum, a) => sum + a, 0),
    [match.participants],
  );

  return (
    <Card
      elevation={isParticipant ? 3 : 1}
      style={{
        backgroundColor: isParticipant ? theme.colors.inversePrimary : '#FFF',
        padding: 0,
        marginHorizontal: 16,
        marginVertical: 8,
      }}>
      <TouchableRipple onPress={onPress}>
        <Card.Content style={{position: 'relative', padding: 16}}>
          {messages.length > 0 && (
            <Badge
              style={{position: 'absolute', top: -8, right: -8, zIndex: 1}}>
              {messages.length}
            </Badge>
          )}
          <View
            style={{
              flexDirection: 'row',
              justifyContent: 'space-between',
              marginBottom: 8,
            }}>
            <View style={{flex: 1, paddingRight: 16}}>
              <Text
                style={{
                  color: theme.colors.onSecondaryContainer,
                  fontWeight: 'bold',
                  marginBottom: 8,
                }}
                variant={mini ? 'labelLarge' : 'titleLarge'}>
                {match.name}
              </Text>
              <Text
                style={{marginBottom: 8}}
                variant={mini ? 'labelSmall' : 'titleMedium'}>
                {match.provider.name}
              </Text>
              {!mini && (
                <Text variant="bodySmall">{match.provider.address}</Text>
              )}
            </View>
            <View>
              {!mini && (
                <Button
                  style={{backgroundColor: theme.colors.tertiaryContainer}}
                  mode="contained"
                  icon="map-marker"
                  onPress={onPressMap}>
                  <Text variant="labelSmall">
                    ~ {Math.floor(match.distance / 1000)} km
                  </Text>
                </Button>
              )}

              {mini && (
                <Button mode="contained-tonal" icon="account">
                  <Text variant="labelSmall">
                    {joinedCount} / {match.count}
                  </Text>
                </Button>
              )}
            </View>
          </View>
          {!mini && (
            <View
              style={{
                padding: 8,
                borderRadius: 10,
                backgroundColor: theme.colors.secondaryContainer,
                flexDirection: 'row',
                alignItems: 'center',
              }}>
              <IconButton icon="calendar-check" size={15} style={{margin: 0}} />
              <Text
                variant="labelMedium"
                style={{
                  flex: 1,
                  color: theme.colors.onPrimaryContainer,
                  fontWeight: 'bold',
                  paddingRight: 8,
                }}>
                {format(new Date(match.start), 'iiii | do MMM yyyy |')}{' '}
                {format(new Date(match.start), 'HH:mm')} -{' '}
                {format(new Date(match.end), 'HH:mm')}
              </Text>
              <View
                style={{
                  flexDirection: 'row',
                  alignItems: 'center',
                  paddingRight: 8,
                }}>
                <IconButton icon="account" size={15} style={{margin: 0}} />
                <Text variant="labelSmall">
                  {joinedCount} / {match.count}
                </Text>
              </View>
            </View>
          )}
        </Card.Content>
      </TouchableRipple>
    </Card>
  );
}
