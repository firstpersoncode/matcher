import AsyncStorage from '@react-native-async-storage/async-storage';
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
  const {user, handleSignOut, privateMessages, privateMessagesLastRead} =
    useAppContext();
  const navigation = useNavigation();
  const theme = useTheme();
  const {displayModal} = useModalContext();
  const [visibleMenu, setVisibleMenu] = useState(false);
  const [displayNotif, setDisplayNotif] = useState(false);
  const timeoutRef = useRef();
  const [unreadCounts, setUnreadCounts] = useState(0);

  const waitingRequest = useMemo(
    () => user?.contacts.filter(c => c.status === 'waiting-req') || [],
    [user?.contacts],
  );

  const waitingInvitations = useMemo(
    () => user?.invitations || [],
    [user?.invitations],
  );

  useEffect(() => {
    if (!(user?.contacts.length && privateMessages.length)) return;
    (async () => {
      let counts = 0;

      for (let item of user.contacts.filter(i => i.status === 'friend')) {
        let messageLastRead = privateMessagesLastRead.find(
          m => String(m.inbox) === String(item.contact._id),
        );

        if (!messageLastRead) {
          let res = await AsyncStorage.getItem('private-messages-last-read');
          let currMessagesLastRead = res ? JSON.parse(res) : [];
          messageLastRead = currMessagesLastRead.find(
            m => String(m.inbox) === String(item.contact._id),
          );
        }

        let lastRead = messageLastRead?.message;
        let messages = privateMessages.filter(
          m =>
            String(m.owner._id) === String(item.contact._id) ||
            String(m.recipient._id) === String(item.contact._id),
        );

        if (lastRead) {
          let index = messages.findIndex(
            m => String(m._id) === String(lastRead),
          );
          if (index !== -1) {
            let mcounts = messages.slice(index + 1).length;
            counts += mcounts;
          }
        } else counts += messages.length;
      }

      setUnreadCounts(counts);
    })();
  }, [privateMessages, privateMessagesLastRead, user?.contacts]);

  useEffect(() => {
    if (waitingRequest.length || unreadCounts || waitingInvitations.length) {
      setDisplayNotif(true);
      if (timeoutRef.current) clearTimeout(timeoutRef.current);
      timeoutRef.current = setTimeout(() => {
        setDisplayNotif(false);
      }, 5000);
    }
  }, [waitingRequest, unreadCounts, waitingInvitations]);

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
                unreadCounts > 0 ||
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
                {unreadCounts > 0 && (
                  <Button
                    textColor="#FFF"
                    labelStyle={{fontSize: 12}}
                    icon="chat">
                    {unreadCounts}
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
              title={
                <View style={{flexDirection: 'row'}}>
                  <Text style={{marginRight: 8}}>Account</Text>
                  {(waitingRequest.length > 0 ||
                    unreadCounts > 0 ||
                    waitingInvitations.length > 0) && (
                    <View
                      style={{
                        height: 10,
                        width: 10,
                        backgroundColor: theme.colors.error,
                        borderRadius: 50,
                      }}
                    />
                  )}
                </View>
              }
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
