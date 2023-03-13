import {useNavigation} from '@react-navigation/native';
import {useEffect, useMemo, useRef, useState} from 'react';
import {Pressable, View} from 'react-native';
import {
  Badge,
  Button,
  Chip,
  Divider,
  IconButton,
  Menu,
  Portal,
  Text,
  Tooltip,
  useTheme,
} from 'react-native-paper';

import {useAppContext} from 'src/context/App';
import {useModalContext} from 'src/context/Modal';

import Auth from './Auth';

export default function Cog() {
  const {user, handleSignOut} = useAppContext();
  const navigation = useNavigation();
  const theme = useTheme();
  const {displayModal} = useModalContext();
  const [visibleMenu, setVisibleMenu] = useState(false);

  function toggleVisibleMenu() {
    setVisibleMenu(v => !v);
  }

  function onPress() {
    navigation.navigate('Profile');
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
    <>
      <Menu
        visible={visibleMenu}
        onDismiss={toggleVisibleMenu}
        anchor={
          <IconButton
            style={{marginVertical: 8, marginHorizontal: 8}}
            icon="cog"
            onPress={toggleVisibleMenu}
          />
        }>
        <Menu.Item
          leadingIcon="logout"
          onPress={onPressSignOut}
          title="Sign Out"
        />
        <Divider />
        <Menu.Item leadingIcon="star" onPress={onPress} title="Rate Us!" />
        <Menu.Item leadingIcon="email" onPress={onPress} title="Contact Us" />
      </Menu>
    </>
  );
}
