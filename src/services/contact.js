import fetcher from 'src/utils/fetcher';

export async function fetchContact(idString) {
  const {data} = await fetcher(`/api/v1/contact/search?id=${idString}`, {
    method: 'GET',
  });
  return data;
}

export async function requestContact(contact) {
  await fetcher(`/api/v1/contact/request`, {
    method: 'POST',
    data: contact,
  });
}

export async function confirmContact(contact) {
  await fetcher(`/api/v1/contact/confirm`, {
    method: 'POST',
    data: contact,
  });
}
