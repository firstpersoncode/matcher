import {useNavigation} from '@react-navigation/native';
import {useEffect, useMemo, useRef, useState} from 'react';
import {Pressable, View} from 'react-native';
import {
  Badge,
  Button,
  Chip,
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

export default function Account() {
  const {user, handleSignOut, privateMessages} = useAppContext();
  const navigation = useNavigation();
  const theme = useTheme();
  const {displayModal} = useModalContext();
  const [visibleMenu, setVisibleMenu] = useState(false);
  const [displayNotif, setDisplayNotif] = useState(false);
  const timeoutRef = useRef();

  const waitingRequest = useMemo(
    () => user?.contacts.filter(c => c.status === 'waiting-req') || [],
    [user?.contacts],
  );

  const waitingInvitations = useMemo(
    () => user?.invitations || [],
    [user?.invitations],
  );

  useEffect(() => {
    if (
      waitingRequest.length ||
      privateMessages.length ||
      waitingInvitations.length
    ) {
      setDisplayNotif(true);
      if (timeoutRef.current) clearTimeout(timeoutRef.current);
      timeoutRef.current = setTimeout(() => {
        setDisplayNotif(false);
      }, 5000);
    }
  }, [waitingRequest, privateMessages, waitingInvitations]);

  function toggleVisibleMenu() {
    setVisibleMenu(v => !v);
  }

  function onPressAccount() {
    navigation.navigate('Profile');
    toggleVisibleMenu();
  }

  function onPressSignIn() {
    displayModal({content: <Auth />});
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

  function onPressNotif() {
    navigation.navigate('Profile');
    setDisplayNotif(false);
  }

  return (
    <>
      <Menu
        visible={visibleMenu}
        onDismiss={toggleVisibleMenu}
        anchor={
          <View
            style={{
              position: 'relative',
              marginVertical: 8,
              marginHorizontal: 16,
              backgroundColor: user ? theme.colors.secondaryContainer : '#ddd',
              borderRadius: 50,
            }}>
            <IconButton
              style={{margin: 0}}
              icon="account-circle"
              onPress={toggleVisibleMenu}
            />

            {user &&
              (waitingRequest.length > 0 ||
                privateMessages.length > 0 ||
                waitingInvitations.length > 0) && (
                <View
                  style={{
                    position: 'absolute',
                    top: 0,
                    right: 0,
                    height: 10,
                    width: 10,
                    backgroundColor: theme.colors.error,
                    borderRadius: 50,
                  }}
                />
              )}

            {user && displayNotif && (
              <Pressable
                onPress={onPressNotif}
                style={{
                  position: 'absolute',
                  top: 5,
                  right: 50,
                  backgroundColor: 'rgba(0,0,0,0.6)',
                  borderRadius: 5,
                  flexDirection: 'row',
                  alignItems: 'center',
                }}>
                {waitingRequest.length > 0 && (
                  <Button
                    textColor="#FFF"
                    labelStyle={{fontSize: 12}}
                    icon="account">
                    {waitingRequest.length}
                  </Button>
                )}
                {privateMessages.length > 0 && (
                  <Button
                    textColor="#FFF"
                    labelStyle={{fontSize: 12}}
                    icon="chat">
                    {privateMessages.length}
                  </Button>
                )}
                {waitingInvitations.length > 0 && (
                  <Button
                    textColor="#FFF"
                    labelStyle={{fontSize: 12}}
                    icon="medal">
                    {waitingInvitations.length}
                  </Button>
                )}
              </Pressable>
            )}
          </View>
        }>
        {user ? (
          <>
            <Menu.Item
              leadingIcon="account"
              onPress={onPressAccount}
              title="Account"
            />
            <Menu.Item
              leadingIcon="logout"
              onPress={onPressSignOut}
              title="Sign Out"
            />
          </>
        ) : (
          <Menu.Item
            leadingIcon="login"
            onPress={onPressSignIn}
            title="Sign In"
          />
        )}
      </Menu>
    </>
  );
}
