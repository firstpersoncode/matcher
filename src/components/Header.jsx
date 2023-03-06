import {useState} from 'react';
import {View} from 'react-native';
import {
  Appbar,
  IconButton,
  Menu,
  Modal,
  Portal,
  useTheme,
} from 'react-native-paper';

import {useAppContext} from 'src/context/App';
import {useModalContext} from 'src/context/Modal';

import SignInForm from './SignInForm';
import SignUpForm from './SignUpForm';

export default function Header({back, navigation, route, options}) {
  const {user, online, handleSignIn, handleSignUp, handleSignOut} =
    useAppContext();
  const {displayModal, hideModal} = useModalContext();

  const theme = useTheme();
  const [visibleMenu, setVisibleMenu] = useState(false);

  function toggleVisibleMenu() {
    setVisibleMenu(v => !v);
  }

  function onPressAccount() {
    navigation.navigate('Account');
    toggleVisibleMenu();
  }

  function onPressSignIn() {
    displayModal(
      <Auth
        handleSignIn={handleSignIn}
        handleSignUp={handleSignUp}
        hideModal={hideModal}
      />,
    );
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
      <Appbar.Header style={{backgroundColor: theme.colors.secondary}}>
        {back && <Appbar.BackAction color="#fff" onPress={navigation.goBack} />}
        <Appbar.Content
          color="#fff"
          title={route.params?.name || options?.title || route.name}
        />
        <Menu
          visible={visibleMenu}
          onDismiss={toggleVisibleMenu}
          anchor={
            <View style={{position: 'relative'}}>
              <Appbar.Action
                color="#fff"
                icon="account-circle"
                onPress={toggleVisibleMenu}
              />
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
      </Appbar.Header>
    </>
  );
}

function Auth({handleSignIn, handleSignUp, hideModal}) {
  const [authType, setAuthType] = useState('signin');

  function toggleAuthType(type) {
    return function () {
      setAuthType(type);
    };
  }

  async function onSignIn(form) {
    try {
      await handleSignIn(form);
      hideModal();
    } catch (err) {
      console.error(err.message || err);
    }
  }

  async function onSignUp(form) {
    try {
      await handleSignUp(form);
      hideModal();
    } catch (err) {
      console.error(err.message || err);
    }
  }

  return (
    <View style={{backgroundColor: '#FFF', padding: 16}}>
      {authType === 'signin' ? (
        <SignInForm onSubmit={onSignIn} onSignUp={toggleAuthType('signup')} />
      ) : (
        <SignUpForm onSubmit={onSignUp} onSignIn={toggleAuthType('signin')} />
      )}
    </View>
  );
}
