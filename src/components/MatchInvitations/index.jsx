import {FlatList} from 'react-native';

import {useAppContext} from 'src/context/App';
import {useMemo} from 'react';
import Item from './Item';

export default function MatchInvitations() {
  const {user, matches} = useAppContext();
  const invitations = useMemo(
    () =>
      matches.filter(m =>
        user.invitations.find(mi => String(mi._id) === String(m._id)),
      ),
    [user.invitations, matches],
  );

  return (
    <FlatList
      data={invitations}
      renderItem={({item}) => <Item match={item} />}
      keyExtractor={item => item._id}
    />
  );
}
