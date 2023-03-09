import {useEffect, useState} from 'react';
import {FlatList, RefreshControl, View} from 'react-native';
import {useSheetRouter} from 'react-native-actions-sheet';
import {
  IconButton,
  Divider,
  Searchbar,
  HelperText,
  useTheme,
} from 'react-native-paper';

import {useAppContext} from 'src/context/App';
import {useSheetContext} from 'src/context/Sheet';

import ProviderCard from 'src/components/ProviderCard';

export default function FormProvider() {
  const {providers, getProviders} = useAppContext();
  const {setSheetState} = useSheetContext();
  const route = useSheetRouter();
  const theme = useTheme();
  const [isRefreshing, setIsRefreshing] = useState(false);

  useEffect(() => {
    if (!providers.length) loadProviders();
  }, [providers.length]);

  async function loadProviders() {
    try {
      await getProviders();
    } catch (err) {
      console.error(err.message || err);
    }
  }

  function onBack() {
    route.goBack();
  }

  async function onRefresh() {
    setIsRefreshing(true);
    await getProviders();
    setIsRefreshing(false);
  }

  function selectProvider(provider) {
    return function () {
      setSheetState('provider', provider);
      route.navigate('schedule');
    };
  }

  return (
    <View style={{height: '100%'}}>
      <View
        keyboardShouldPersistTaps="handled"
        style={{
          paddingRight: 16,
          paddingTop: 16,
          paddingBottom: 8,
        }}>
        <View style={{flexDirection: 'row'}}>
          <IconButton icon="chevron-left" onPress={onBack} />
          <View style={{flex: 1, paddingRight: 8}}>
            <Searchbar
              style={{
                backgroundColor: '#FFF',
                borderWidth: 1,
                borderColor: theme.colors.secondary,
              }}
              placeholder="Search Provider..."
            />
            <HelperText>By name, address</HelperText>
          </View>
          <IconButton mode="contained" icon="filter-variant" />
        </View>
      </View>
      <Divider />
      <FlatList
        data={providers}
        renderItem={({item}) => (
          <ProviderCard provider={item} onPress={selectProvider(item)} />
        )}
        keyExtractor={item => item._id}
        refreshControl={
          <RefreshControl refreshing={isRefreshing} onRefresh={onRefresh} />
        }
      />
    </View>
  );
}
