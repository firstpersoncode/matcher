import {ScrollView} from 'react-native';
import {useTheme} from 'react-native-paper';

import {useAppContext} from 'src/context/App';

import Participant from './Participant';

export default function MatchParticipant() {
  const {match} = useAppContext();
  const theme = useTheme();

  return (
    <ScrollView style={{padding: 16, backgroundColor: theme.colors.background}}>
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
