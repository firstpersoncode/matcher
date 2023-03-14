import {useNavigation} from '@react-navigation/native';
import {useState} from 'react';
import {Divider, IconButton, Menu} from 'react-native-paper';

import {useAppContext} from 'src/context/App';

export default function Cog() {
  const {handleSignOut} = useAppContext();
  const navigation = useNavigation();
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
      <Menu.Item leadingIcon="star" onPress={onPress} title="Rate Us!" />
      <Menu.Item leadingIcon="email" onPress={onPress} title="Contact Us" />
      <Divider />
      <Menu.Item
        leadingIcon="logout"
        onPress={onPressSignOut}
        title="Sign Out"
      />
    </Menu>
  );
}
