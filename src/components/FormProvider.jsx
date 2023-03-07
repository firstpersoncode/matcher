import {useEffect, useState} from 'react';
import {FlatList, RefreshControl} from 'react-native';
import {IconButton, Divider} from 'react-native-paper';

import {useAppContext} from 'src/context/App';

import ProviderCard from './ProviderCard';

export default function FormProvider({onChangeForm, setStep}) {
  const {providers, getProviders} = useAppContext();
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
      <IconButton icon="arrow-left" onPress={onBack} />
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
