import {useEffect, useMemo, useState} from 'react';
import {View, RefreshControl, FlatList} from 'react-native';
import {
  Button,
  Chip,
  Divider,
  HelperText,
  IconButton,
  Searchbar,
  useTheme,
} from 'react-native-paper';
import {useSheetRouter} from 'react-native-actions-sheet';

import {useAppContext} from 'src/context/App';
import {useSheetContext} from 'src/context/Sheet';
import ProviderCard from 'src/components/ProviderCard';
import {DAY_MAPS} from 'src/utils/constants';
import {useModalContext} from 'src/context/Modal';
import Map from 'src/components/Map';

export default function EditProvider() {
  const {providers, getProviders} = useAppContext();
  const {displayModal, hideModal} = useModalContext();
  const {setSheetState} = useSheetContext();
  const theme = useTheme();
  const route = useSheetRouter();
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [search, setSearch] = useState('');
  const [filter, setFilter] = useState({availability: null});

  const filteredProviders = useMemo(() => {
    return providers
      .filter(p => {
        if (search) {
          const searchFields = `${p.name} ${p.address}`.toLowerCase();
          return searchFields.includes(search.toLowerCase());
        }
        return true;
      })
      .filter(p => {
        if (filter.availability)
          return p.availabilities.find(a => a.day === filter.availability);
        return true;
      });
  }, [providers, search, filter.availability]);

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

  function onSubmitFilter(f) {
    setFilter(f);
    hideModal();
  }

  function onPressFilter() {
    displayModal({
      content: <Filter {...filter} onSubmit={onSubmitFilter} />,
      portal: true,
    });
  }

  function onRemoveFilterAvailabilty() {
    setFilter(v => ({...v, availability: null}));
  }

  function handleChangeSearch(text) {
    setSearch(text);
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
          paddingLeft: 16,
          paddingRight: 16,
          paddingTop: 16,
          paddingBottom: 8,
        }}>
        <View style={{flexDirection: 'row', alignItems: 'flex-start'}}>
          <IconButton
            style={{
              width: 75,
              margin: 0,
              backgroundColor: theme.colors.tertiaryContainer,
            }}
            size={20}
            mode="contained"
            icon="filter-variant"
            iconColor="#FFF"
            onPress={onPressFilter}
          />
          <View style={{flex: 1, paddingLeft: 8}}>
            <Searchbar
              clearButtonMode="always"
              style={{
                height: 40,
                backgroundColor: '#FFF',
                borderWidth: 1,
                borderColor: theme.colors.secondary,
              }}
              inputStyle={{fontSize: 12}}
              placeholder="Search..."
              value={search}
              onChangeText={handleChangeSearch}
            />
            <HelperText>By name, address</HelperText>
          </View>
        </View>

        <View style={{flexDirection: 'row'}}>
          {filter.availability && (
            <Chip
              icon="calendar"
              style={{marginRight: 8}}
              onPress={onPressFilter}
              onClose={onRemoveFilterAvailabilty}>
              {DAY_MAPS[filter.availability]}
            </Chip>
          )}
        </View>
      </View>
      <Divider />
      <FlatList
        data={filteredProviders}
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

function Filter({availability, onSubmit}) {
  const theme = useTheme();
  const [selectedAvailabilty, setselectedAvailabilty] = useState(availability);

  function onChangeAvailability(a) {
    return function () {
      setselectedAvailabilty(a);
    };
  }

  function handleSubmit() {
    onSubmit({
      availability: selectedAvailabilty,
    });
  }

  return (
    <View style={{padding: 16, backgroundColor: '#FFF'}}>
      {Object.keys(DAY_MAPS).map(a => (
        <Button
          mode="elevated"
          buttonColor={
            selectedAvailabilty === a
              ? theme.colors.primaryContainer
              : theme.colors.surface
          }
          textColor={
            selectedAvailabilty === a
              ? theme.colors.onPrimaryContainer
              : theme.colors.onSurface
          }
          style={{marginBottom: 16}}
          key={a}
          onPress={onChangeAvailability(a)}>
          {DAY_MAPS[a]}
        </Button>
      ))}
      <Button onPress={handleSubmit} style={{marginTop: 16}} mode="contained">
        Filter
      </Button>
    </View>
  );
}
