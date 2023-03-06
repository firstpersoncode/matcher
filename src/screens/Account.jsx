import {ScrollView, Text} from 'react-native';

import {useAppContext} from 'src/context/App';

export default function Account() {
  const {user} = useAppContext();

  return (
    <ScrollView
      style={{
        flex: 1,
        backgroundColor: '#fff',
        padding: 16,
      }}>
      <Text>{JSON.stringify(user, null, 2)}</Text>
    </ScrollView>
  );
}
