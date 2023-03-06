import {useState} from 'react';
import {View} from 'react-native';
import {
  Button,
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
  const [visibleMap, setVisibleMap] = useState(false);

  function toggleVisibleMap() {
    setVisibleMap(v => !v);
  }

  return (
    <Card style={{margin: 16}}>
      <TouchableRipple onPress={onPress}>
        <Card.Content style={{padding: 16}}>
          <View style={{flexDirection: 'row', justifyContent: 'flex-end'}}>
            <Button
              mode="contained"
              icon="map-marker"
              onPress={toggleVisibleMap}>
              ~ {Math.floor(provider.distance / 1000)} km
            </Button>
          </View>

          <Text variant="titleLarge">{provider.name}</Text>
          <Text variant="bodyMedium">{provider.address}</Text>
        </Card.Content>
      </TouchableRipple>
      {visibleMap && (
        <Map
          title={provider.name}
          description={provider.address}
          center={provider.location.coordinates.slice().reverse()}
          height={300}
          liteMode={false}
        />
      )}
      <Divider />
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
