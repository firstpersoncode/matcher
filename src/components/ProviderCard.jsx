import {View} from 'react-native';
import {
  Button,
  Card,
  Text,
  TouchableRipple,
  useTheme,
} from 'react-native-paper';

import {DAY_MAPS} from 'src/utils/constants';

export default function ProviderCard({provider, onPress, onPressMap}) {
  const theme = useTheme();

  return (
    <Card style={{margin: 16, backgroundColor: '#FFF'}}>
      <TouchableRipple onPress={onPress}>
        <Card.Content style={{padding: 16}}>
          <View
            style={{
              flexDirection: 'row',
              justifyContent: 'space-between',
              alignItems: 'flex-start',
              marginBottom: 16,
            }}>
            <View style={{flex: 1, paddingRight: 16}}>
              <Text
                style={{fontWeight: 'bold', marginBottom: 8}}
                variant="titleLarge">
                {provider.name}
              </Text>
              <Text variant="bodyMedium">{provider.address}</Text>
            </View>
            <Button
              mode="contained"
              icon="map-marker"
              style={{backgroundColor: theme.colors.tertiaryContainer}}
              onPress={onPressMap}>
              <Text variant="labelSmall">
                ~ {Math.floor(provider.distance / 1000)} km
              </Text>
            </Button>
          </View>
          <View
            style={{
              padding: 16,
              borderRadius: 10,
              backgroundColor: theme.colors.secondaryContainer,
            }}>
            {provider.availabilities.map(availability => (
              <View
                key={availability.day}
                style={{
                  flexDirection: 'row',
                  justifyContent: 'space-between',
                  width: '60%',
                  marginTop: 4,
                  marginBottom: 4,
                }}>
                <Text variant="labelMedium" style={{fontWeight: 'bold'}}>
                  {DAY_MAPS[availability.day]}
                </Text>
                <Text variant="labelMedium">
                  {availability.start} - {availability.end}
                </Text>
              </View>
            ))}
          </View>
        </Card.Content>
      </TouchableRipple>
    </Card>
  );
}
