import {useNavigation, useRoute} from '@react-navigation/native';
import {View} from 'react-native';
import {IconButton, Text, useTheme} from 'react-native-paper';

export default function Header({
  logo,
  title,
  disableTitle = false,
  back,
  backIcon = 'chevron-left',
  action,
}) {
  const navigation = useNavigation();
  const route = useRoute();
  const theme = useTheme();

  return (
    <>
      <View
        style={{
          backgroundColor: theme.colors.background,
          flexDirection: 'row',
          alignItems: 'center',
          minHeight: 60,
        }}>
        {back && (
          <IconButton
            style={{margin: 0}}
            icon={backIcon}
            onPress={navigation.goBack}
          />
        )}
        {logo}
        {!disableTitle && (
          <>
            {title || (
              <Text style={{flex: 1}}>{route.params?.name || route.name}</Text>
            )}
          </>
        )}
        {action}
      </View>
    </>
  );
}
