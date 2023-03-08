import {useNavigation, useRoute} from '@react-navigation/native';
import {Appbar, useTheme} from 'react-native-paper';

export default function Header({back, children}) {
  const navigation = useNavigation();
  const route = useRoute();
  const theme = useTheme();

  return (
    <>
      <Appbar.Header style={{backgroundColor: theme.colors.background}}>
        {back && <Appbar.BackAction onPress={navigation.goBack} />}
        <Appbar.Content title={route.params?.name || route.name} />
        {children}
      </Appbar.Header>
    </>
  );
}
