import {View} from 'react-native';
import {
  Card,
  Chip,
  Divider,
  Text,
  TouchableRipple,
  useTheme,
} from 'react-native-paper';

import {DAY_MAPS} from 'src/utils/constants';

import Map from './Map';

export default function ProviderCard({provider, onPress}) {
  const theme = useTheme();

  return (
    <Card style={{margin: 16}}>
      <TouchableRipple onPress={onPress}>
        <Card.Content
          style={{
            padding: 16,
            backgroundColor: theme.colors.primary,
            borderTopLeftRadius: 10,
            borderTopRightRadius: 10,
          }}>
          <View style={{flexDirection: 'row', justifyContent: 'flex-end'}}>
            <Chip icon="map-marker">
              ~ {Math.floor(provider.distance / 1000)} km
            </Chip>
          </View>

          <Text style={{color: '#fff'}} variant="titleLarge">
            {provider.name}
          </Text>
          <Text style={{color: '#fff'}} variant="bodyMedium">
            {provider.address}
          </Text>
        </Card.Content>
      </TouchableRipple>
      <Divider />
      <Map
        title={provider.name}
        description={provider.address}
        center={provider.location.coordinates.slice().reverse()}
        height={200}
        liteMode={false}
      />
      <TouchableRipple onPress={onPress}>
        <Card.Content style={{padding: 16}}>
          {provider.availabilities.map(availability => (
            <View
              key={availability.day}
              style={{
                flexDirection: 'row',
                justifyContent: 'space-between',
                width: '60%',
              }}>
              <Text variant="bodyMedium">{DAY_MAPS[availability.day]}</Text>
              <Text variant="bodyMedium">
                {availability.start} - {availability.end}
              </Text>
            </View>
          ))}
        </Card.Content>
      </TouchableRipple>
    </Card>
  );
}
