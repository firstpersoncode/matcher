import {createNativeStackNavigator} from '@react-navigation/native-stack';

import Header from 'src/components/Header';

import Matcher from './Matcher';
import Match from './Match';
import Account from './Account';

const Stack = createNativeStackNavigator();

export default function Screens() {
  return (
    <Stack.Navigator>
      <Stack.Group screenOptions={{header: Header}}>
        <Stack.Screen name="Matcher" component={Matcher} />
        <Stack.Screen name="Match" component={Match} />
      </Stack.Group>

      <Stack.Screen
        name="Account"
        component={Account}
        options={{animation: 'slide_from_right'}}
      />
    </Stack.Navigator>
  );
}
