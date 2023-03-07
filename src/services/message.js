import AsyncStorage from '@react-native-async-storage/async-storage';
import fetcher from 'src/utils/fetcher';

export async function fetchMessages() {
  const {data} = await fetcher('/api/v1/message/list', {
    method: 'GET',
  });
  return data;
}

export async function postMessage(message) {
  await fetcher('/api/v1/message/post', {
    method: 'POST',
    data: message,
  });
}

export async function announce(message) {
  await fetcher('/api/v1/message/announce', {
    method: 'PUT',
    data: message,
  });
}

export async function unannounce(message) {
  await fetcher('/api/v1/message/unannounce', {
    method: 'PUT',
    data: message,
  });
}

export async function setLastRead(lastMessage) {
  await AsyncStorage.setItem('lastRead', lastMessage);
}

export async function getLastRead() {
  const lastMessage = await AsyncStorage.getItem('lastRead');
  return lastMessage;
}
