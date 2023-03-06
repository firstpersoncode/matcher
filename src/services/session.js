import AsyncStorage from '@react-native-async-storage/async-storage';

import fetcher from 'src/utils/fetcher';

export async function fetchUser() {
  const {data} = await fetcher('/participant/session', {
    method: 'GET',
  });
  return data;
}

export async function signIn(creds) {
  const {
    data: {token, user},
  } = await fetcher('/participant/signin', {
    method: 'POST',
    data: creds,
  });
  await AsyncStorage.setItem('token', token);
  return user;
}

export async function signUp(creds) {
  const {
    data: {token, user},
  } = await fetcher('/participant/signup', {
    method: 'POST',
    data: creds,
  });
  await AsyncStorage.setItem('token', token);
  return user;
}

export async function signOut() {
  await AsyncStorage.removeItem('token');
}

export async function setCoordinates(coordinates) {
  await fetcher('/participant/setting/coordinates', {
    method: 'PUT',
    data: {coordinates: coordinates.slice().reverse()},
  });
}
