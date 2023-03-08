import {createMaterialTopTabNavigator} from '@react-navigation/material-top-tabs';
import {createNativeStackNavigator} from '@react-navigation/native-stack';

import Matcher from './Matcher';
import Match from './Match';
import Account from './Account';

const Tab = createMaterialTopTabNavigator();
const Stack = createNativeStackNavigator();

export default function Screens() {
  return (
    <Tab.Navigator tabBar={() => null}>
      <Tab.Screen name="Root" component={Root} />
      <Tab.Screen name="Account" component={Account} />
    </Tab.Navigator>
  );
}

function Root() {
  return (
    <Stack.Navigator screenOptions={{header: () => null}}>
      <Stack.Screen name="Matcher" component={Matcher} />
      <Stack.Screen name="Match" component={Match} />
    </Stack.Navigator>
  );
}
