import {View} from 'react-native';
import {Divider, IconButton, Modal} from 'react-native-paper';
import {createNativeStackNavigator} from '@react-navigation/native-stack';

import {useModalContext} from 'src/context/Modal';
import Header from 'src/components/Header';

import Matcher from './Matcher';
import Match from './Match';
import Account from './Account';

const Stack = createNativeStackNavigator();

export default function Screens() {
  const {visible, content, hideModal} = useModalContext();

  return (
    <>
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

      <Modal
        style={{margin: 16, zIndex: 10000}}
        visible={visible}
        onDismiss={hideModal}>
        <View
          style={{
            backgroundColor: '#fff',
            alignItems: 'flex-end',
          }}>
          <IconButton icon="close" onPress={hideModal} />
        </View>
        <Divider />
        {content}
      </Modal>
    </>
  );
}
