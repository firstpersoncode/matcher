import {useNavigation} from '@react-navigation/native';
import {useState} from 'react';
import {View} from 'react-native';
import {IconButton, Menu} from 'react-native-paper';

import {useAppContext} from 'src/context/App';
import {useModalContext} from 'src/context/Modal';

import Auth from './Auth';

export default function Account() {
  const {user, online, handleSignOut} = useAppContext();
  const navigation = useNavigation();
  const {displayModal} = useModalContext();
  const [visibleMenu, setVisibleMenu] = useState(false);

  function toggleVisibleMenu() {
    setVisibleMenu(v => !v);
  }

  function onPressAccount() {
    navigation.navigate('Account');
    toggleVisibleMenu();
  }

  function onPressSignIn() {
    displayModal(<Auth />);
    toggleVisibleMenu();
  }

  async function onPressSignOut() {
    try {
      await handleSignOut();
      toggleVisibleMenu();
    } catch (err) {
      console.error(err.message || err);
    }
  }

  return (
    <Menu
      visible={visibleMenu}
      onDismiss={toggleVisibleMenu}
      anchor={
        <View style={{position: 'relative'}}>
          <IconButton icon="account-circle" onPress={toggleVisibleMenu} />
          <View
            style={{
              position: 'absolute',
              bottom: 10,
              right: 10,
              width: 10,
              height: 10,
              backgroundColor: user && online ? '#63cf80' : '#bbb',
              borderRadius: 50,
            }}
          />
        </View>
      }>
      {user ? (
        <>
          <Menu.Item onPress={onPressAccount} title="Account" />
          <Menu.Item onPress={onPressSignOut} title="Sign Out" />
        </>
      ) : (
        <Menu.Item onPress={onPressSignIn} title="Sign In" />
      )}
    </Menu>
  );
}
