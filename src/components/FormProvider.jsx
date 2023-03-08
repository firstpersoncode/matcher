import {useEffect, useState} from 'react';
import {FlatList, RefreshControl, View} from 'react-native';
import {
  IconButton,
  Divider,
  Searchbar,
  HelperText,
  useTheme,
} from 'react-native-paper';

import {useAppContext} from 'src/context/App';

import ProviderCard from './ProviderCard';

export default function FormProvider({onChangeForm, setStep}) {
  const {providers, getProviders} = useAppContext();
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
    setStep(1);
  }

  async function onRefresh() {
    setIsRefreshing(true);
    await getProviders();
    setIsRefreshing(false);
  }

  function selectProvider(provider) {
    return function () {
      onChangeForm('provider', provider);
      setStep(3);
    };
  }

  return (
    <>
      <View
        keyboardShouldPersistTaps="handled"
        style={{
          paddingRight: 16,
          paddingTop: 16,
          paddingBottom: 8,
        }}>
        <View style={{flexDirection: 'row'}}>
          <IconButton icon="arrow-left" onPress={onBack} />
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
    </>
  );
}
