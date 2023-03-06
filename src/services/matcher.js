import fetcher from 'src/utils/fetcher';

export async function fetchMatches(coordinates) {
  const {data} = await fetcher(
    `/participant/match/list?coords=${coordinates.slice().reverse().join(',')}`,
    {
      method: 'GET',
    },
  );
  return data;
}

export async function createMatch(match) {
  await fetcher('/participant/match/create', {
    method: 'POST',
    data: match,
  });
}

export async function deleteMatch() {
  await fetcher('/participant/match/delete', {
    method: 'DELETE',
  });
}

export async function joinMatch(match) {
  await fetcher('/participant/match/join', {
    method: 'PUT',
    data: match,
  });
}

export async function leaveMatch() {
  await fetcher('/participant/match/leave', {
    method: 'PUT',
  });
}

export async function removeParticipant(participant) {
  await fetcher('/participant/match/remove', {
    method: 'PUT',
    data: participant,
  });
}

export async function fetchProviders() {
  const {data} = await fetcher('/participant/match/provider', {
    method: 'GET',
  });
  return data;
}
