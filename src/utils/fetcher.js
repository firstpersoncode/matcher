import axios from 'axios';
import AsyncStorage from '@react-native-async-storage/async-storage';
import Config from 'react-native-config';

async function fetcherGet(url, token) {
  return axios.get(url, {
    headers: {token},
  });
}

async function fetcherPost(url, data, token) {
  return axios.post(url, data, {
    headers: {token},
  });
}

async function fetcherPut(url, data, token) {
  return axios.put(url, data, {
    headers: {token},
  });
}

async function fetcherDelete(url, token) {
  return axios.delete(url, {
    headers: {token},
  });
}

export default async function fetcher(endpoint, options) {
  const token = await AsyncStorage.getItem('token');

  switch (options.method) {
    case 'GET':
      return fetcherGet(`${Config.API_URI}${endpoint}`, token);
    case 'POST':
      return fetcherPost(`${Config.API_URI}${endpoint}`, options.data, token);
    case 'PUT':
      return fetcherPut(`${Config.API_URI}${endpoint}`, options.data, token);
    case 'DELETE':
      return fetcherDelete(`${Config.API_URI}${endpoint}`, token);
  }
}
