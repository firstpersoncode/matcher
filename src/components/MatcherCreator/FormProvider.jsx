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
import {useModalContext} from 'src/context/Modal';
import {useSheetContext} from 'src/context/Sheet';

import ProviderCard from 'src/components/ProviderCard';
import Map from 'src/components/Map';

export default function FormProvider() {
  const {providers, getProviders} = useAppContext();
  const {displayModal} = useModalContext();
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

  function showMap(provider) {
    return function () {
      displayModal({
        content: (
          <Map
            liteMode={false}
            title={provider.name}
            description={provider.address}
            center={provider.location.coordinates.slice().reverse()}
            region={provider.location.coordinates.slice().reverse()}
            height={450}
          />
        ),
        portal: true,
      });
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
          <ProviderCard
            provider={item}
            onPress={selectProvider(item)}
            onPressMap={showMap(item)}
          />
        )}
        keyExtractor={item => item._id}
        refreshControl={
          <RefreshControl refreshing={isRefreshing} onRefresh={onRefresh} />
        }
      />
    </View>
  );
}
