import {ScrollView, Text} from 'react-native';
import {Divider, IconButton, useTheme} from 'react-native-paper';
import {SafeAreaView} from 'react-native-safe-area-context';

import {useAppContext} from 'src/context/App';
import Header from 'src/components/Header';

export default function Account() {
  const {user} = useAppContext();
  const theme = useTheme();

  return (
    <SafeAreaView style={{flex: 1, backgroundColor: theme.colors.background}}>
      <Header back>
        <IconButton icon="cog" />
      </Header>
      <Divider />
      <ScrollView style={{padding: 16}}>
        <Text>{JSON.stringify(user, null, 2)}</Text>
      </ScrollView>
    </SafeAreaView>
  );
}
