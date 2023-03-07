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
    <Card style={{margin: 16, backgroundColor: '#FFF'}}>
      <TouchableRipple onPress={onPress}>
        <Card.Content style={{padding: 16}}>
          <View
            style={{
              flexDirection: 'row',
              justifyContent: 'space-between',
              alignItems: 'flex-start',
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
              style={{width: 150}}
              onPress={toggleVisibleMap}>
              ~ {Math.floor(provider.distance / 1000)} km
            </Button>
          </View>
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
