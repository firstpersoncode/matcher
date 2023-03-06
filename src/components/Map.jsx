import MapView, {Marker, PROVIDER_GOOGLE} from 'react-native-maps';

export default function Map({
  center,
  title,
  description,
  height = '100%',
  liteMode = true,
}) {
  return (
    <MapView
      style={{height}}
      liteMode={liteMode}
      provider={PROVIDER_GOOGLE}
      showsUserLocation
      showsCompass
      showsMyLocationButton={false}
      showsBuildings={false}
      showsTraffic={false}
      showsIndoors={false}
      showsIndoorLevelPicker={false}
      region={{
        latitude: center[0],
        longitude: center[1],
        latitudeDelta: 0.025,
        longitudeDelta: 0.025,
      }}>
      <Marker
        coordinate={{
          latitude: center[0],
          longitude: center[1],
        }}
        title={title}
        description={description}
      />
    </MapView>
  );
}
