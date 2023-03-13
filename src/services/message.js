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

export async function postAnnouncement(message) {
  await fetcher('/api/v1/message/post-announcement', {
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

export async function fetchPrivateMessages() {
  const {data} = await fetcher(`/api/v1/private-message/list`, {
    method: 'GET',
  });
  return data;
}

export async function postPrivateMessage(message) {
  await fetcher(`/api/v1/private-message/post`, {
    method: 'POST',
    data: message,
  });
}
