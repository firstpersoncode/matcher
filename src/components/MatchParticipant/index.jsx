import {ScrollView} from 'react-native';

import {useAppContext} from 'src/context/App';

import Participant from './Participant';

export default function MatchParticipant() {
  const {match} = useAppContext();

  return (
    <ScrollView style={{padding: 16}}>
      {match?.participants.map(({participant, count}) => (
        <Participant
          key={participant._id}
          participant={participant}
          count={count}
          match={match}
        />
      ))}
    </ScrollView>
  );
}
