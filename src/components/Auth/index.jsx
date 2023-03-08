import {useState} from 'react';
import {View} from 'react-native';

import {useAppContext} from 'src/context/App';
import {useModalContext} from 'src/context/Modal';

import SignInForm from './SignInForm';
import SignUpForm from './SignUpForm';

export default function Auth() {
  const {handleSignIn, handleSignUp} = useAppContext();
  const {hideModal} = useModalContext();
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
