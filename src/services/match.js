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

export async function updateMatchName(name) {
  await fetcher('/api/v1/match/update/name', {
    method: 'PUT',
    data: name,
  });
}

export async function updateMatchProvider(providerAndSchedule) {
  await fetcher('/api/v1/match/update/provider', {
    method: 'PUT',
    data: providerAndSchedule,
  });
}

export async function updateMatchSchedule(slot) {
  await fetcher('/api/v1/match/update/schedule', {
    method: 'PUT',
    data: slot,
  });
}

export async function updateMatchParticipant(participant) {
  await fetcher('/api/v1/match/update/participant', {
    method: 'PUT',
    data: participant,
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

export async function invitation(participantRef) {
  await fetcher('/api/v1/match/invite', {
    method: 'PUT',
    data: {participantRef},
  });
}

export async function rejectInvitation(matchRef) {
  await fetcher('/api/v1/match/reject-invite', {
    method: 'PUT',
    data: {matchRef},
  });
}
