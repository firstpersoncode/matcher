import {createMaterialTopTabNavigator} from '@react-navigation/material-top-tabs';
import {createNativeStackNavigator} from '@react-navigation/native-stack';

import {useAppContext} from 'src/context/App';
import MatchList from './MatchList';
import Match from './Match';
import Profile from './Profile';
import Chat from './Chat';

const Tab = createMaterialTopTabNavigator();
const Stack = createNativeStackNavigator();

export default function Screens() {
  const {user} = useAppContext();

  return (
    <Tab.Navigator tabBar={() => null}>
      <Tab.Screen name="Matcher" component={Matcher} />
      {user && <Tab.Screen name="Account" component={Account} />}
    </Tab.Navigator>
  );
}

function Matcher() {
  return (
    <Stack.Navigator screenOptions={{header: () => null}}>
      <Stack.Screen name="MatchList" component={MatchList} />
      <Stack.Screen name="Match" component={Match} />
    </Stack.Navigator>
  );
}

function Account() {
  return (
    <Stack.Navigator screenOptions={{header: () => null}}>
      <Stack.Screen name="Profile" component={Profile} />
      <Stack.Screen name="Chat" component={Chat} />
    </Stack.Navigator>
  );
}
