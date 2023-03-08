import {useNavigation, useRoute} from '@react-navigation/native';
import {View} from 'react-native';
import {Appbar, IconButton, useTheme} from 'react-native-paper';

export default function Header({
  logo,
  title,
  disableTitle = false,
  back,
  backIcon = 'arrow-left',
  children,
}) {
  const navigation = useNavigation();
  const route = useRoute();
  const theme = useTheme();

  return (
    <>
      <Appbar.Header style={{backgroundColor: theme.colors.background}}>
        <View style={{flex: 1, flexDirection: 'row', alignItems: 'center'}}>
          {back && <IconButton icon={backIcon} onPress={navigation.goBack} />}
          {logo}
          {!disableTitle && (
            <>
              {title || (
                <Appbar.Content title={route.params?.name || route.name} />
              )}
            </>
          )}
        </View>
        {children}
      </Appbar.Header>
    </>
  );
}
