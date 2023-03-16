import {AppRegistry} from 'react-native';
import Geolocation from '@react-native-community/geolocation';

import App from './src/App';
import {name as appName} from './app.json';

Geolocation.setRNConfiguration({
  skipPermissionRequests: false,
  authorizationLevel: 'whenInUse',
  locationProvider: 'auto',
});

AppRegistry.registerComponent(appName, () => App);
