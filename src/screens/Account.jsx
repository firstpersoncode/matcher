import {ScrollView, Text, View} from 'react-native';
import {Divider, IconButton, useTheme} from 'react-native-paper';

import {useAppContext} from 'src/context/App';
import Header from 'src/components/Header';

export default function Account() {
  const {user} = useAppContext();
  const theme = useTheme();

  return (
    <View style={{flex: 1, backgroundColor: theme.colors.background}}>
      <Header back>
        <IconButton icon="cog" />
      </Header>
      <Divider />
      <ScrollView style={{padding: 16}}>
        <Text>{JSON.stringify(user, null, 2)}</Text>
      </ScrollView>
    </View>
  );
}
