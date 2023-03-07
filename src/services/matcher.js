import fetcher from 'src/utils/fetcher';

export async function fetchMatches(coordinates) {
  const {data} = await fetcher(
    `/api/v1/match/list?coords=${coordinates.slice().reverse().join(',')}`,
    {
      method: 'GET',
    },
  );
  return data;
}

export async function createMatch(match) {
  await fetcher('/api/v1/match/create', {
    method: 'POST',
    data: match,
  });
}

export async function deleteMatch() {
  await fetcher('/api/v1/match/delete', {
    method: 'DELETE',
  });
}

export async function joinMatch(match) {
  await fetcher('/api/v1/match/join', {
    method: 'PUT',
    data: match,
  });
}

export async function leaveMatch() {
  await fetcher('/api/v1/match/leave', {
    method: 'PUT',
  });
}

export async function removeParticipant(participant) {
  await fetcher('/api/v1/match/remove', {
    method: 'PUT',
    data: participant,
  });
}

export async function fetchProviders() {
  const {data} = await fetcher('/api/v1/match/provider', {
    method: 'GET',
  });
  return data;
}
