import {useMemo, useState} from 'react';
import {View, Image, FlatList, RefreshControl} from 'react-native';
import {
  Button,
  Chip,
  Divider,
  HelperText,
  IconButton,
  ProgressBar,
  Searchbar,
  useTheme,
} from 'react-native-paper';
import {useNavigation} from '@react-navigation/native';

import {useAppContext} from 'src/context/App';
import {useModalContext} from 'src/context/Modal';
import Header from 'src/components/Header';
import Account from 'src/components/Account';
import MatcherCreator from 'src/components/MatcherCreator';
import MatchCard from 'src/components/MatchCard';
import Map from 'src/components/Map';
import CalendarPicker from 'src/components/CalendarPicker';
import Counter from 'src/components/Counter';
import {format, isSameDay, startOfDay} from 'date-fns';

export default function MatchList() {
  const {user, online, matches, init, selectMatch} = useAppContext();
  const {displayModal, hideModal} = useModalContext();
  const navigation = useNavigation();
  const theme = useTheme();
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [search, setSearch] = useState('');
  const [filter, setFilter] = useState({date: null, count: 0});

  const filteredMatches = useMemo(() => {
    return matches
      .filter(m =>
        !user?.match ? true : String(m._id) !== String(user.match._id),
      )
      .filter(m => {
        if (search) {
          const searchFields =
            `${m.name} ${m.provider.name} ${m.provider.address} ${m.owner.name}`.toLowerCase();
          return searchFields.includes(search.toLowerCase());
        }

        return true;
      })
      .filter(m =>
        filter.date
          ? isSameDay(startOfDay(new Date(m.start)), new Date(filter.date))
          : true,
      )
      .filter(m => {
        if (filter.count > 0) {
          const totalJoined = m.participants
            .map(p => p.count)
            .reduce((sum, a) => sum + a, 0);

          const remainingSlot = m.count - totalJoined;
          return remainingSlot >= filter.count;
        }

        return true;
      });
  }, [user?.match, matches, search, filter.date, filter.count]);

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

  function onRemoveFilterDate() {
    setFilter(v => ({...v, date: null}));
  }

  function onRemoveFilterCount() {
    setFilter(v => ({...v, count: 0}));
  }

  function handleChangeSearch(text) {
    setSearch(text);
  }

  async function onRefresh() {
    setIsRefreshing(true);
    await init();
    setIsRefreshing(false);
  }

  function navigateToMatch(match) {
    return function () {
      selectMatch(match);
      navigation.navigate('Match', {name: match.name});
    };
  }

  function showMap(match) {
    return function () {
      displayModal({
        content: (
          <Map
            liteMode={false}
            title={match?.provider.name}
            description={match?.provider.address}
            center={match?.location.coordinates.slice().reverse()}
            region={match?.location.coordinates.slice().reverse()}
            height={450}
          />
        ),
        portal: true,
      });
    };
  }

  return (
    <View style={{flex: 1, backgroundColor: theme.colors.background}}>
      <Header
        disableTitle
        logo={
          <View
            style={{
              flex: 1,
              paddingLeft: 16,
              flexDirection: 'row',
              alignItems: 'center',
            }}>
            <Image
              resizeMode="contain"
              style={{width: 120, height: 60, marginRight: 8}}
              source={require('../assets/matcher-logo.png')}
            />
            <View
              style={{
                width: 10,
                height: 10,
                backgroundColor: online
                  ? theme.colors.primaryContainer
                  : '#bbb',
                borderRadius: 50,
              }}
            />
          </View>
        }
        action={<Account />}
      />

      <View
        keyboardShouldPersistTaps="handled"
        style={{
          paddingLeft: 16,
          paddingRight: 16,
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
              placeholder="Search..."
              value={search}
              onChangeText={handleChangeSearch}
            />
            <HelperText>By name, provider, address, owner</HelperText>
          </View>
        </View>

        <View style={{flexDirection: 'row'}}>
          {filter.date && (
            <Chip
              icon="calendar"
              style={{marginRight: 8}}
              onPress={onPressFilter}
              onClose={onRemoveFilterDate}>
              {format(filter.date, 'dd MMM yyyy')}
            </Chip>
          )}
          {filter.count > 0 && (
            <Chip
              icon="account"
              onPress={onPressFilter}
              onClose={onRemoveFilterCount}>
              {'>= '}
              {filter.count}
            </Chip>
          )}
        </View>
      </View>

      {isRefreshing && <ProgressBar indeterminate />}
      <Divider />

      <FlatList
        refreshControl={
          <RefreshControl refreshing={isRefreshing} onRefresh={onRefresh} />
        }
        data={filteredMatches}
        renderItem={({item}) => (
          <MatchCard
            match={item}
            onPress={navigateToMatch(item)}
            onPressMap={showMap(item)}
          />
        )}
        keyExtractor={item => item._id}
      />

      {user?.match && (
        <View
          style={{
            backgroundColor: theme.colors.secondaryContainer,
            paddingVertical: 8,
          }}>
          <MatchCard
            mini
            match={matches.find(m => String(m._id) === String(user.match._id))}
            onPress={navigateToMatch(
              matches.find(m => String(m._id) === String(user.match._id)),
            )}
          />
        </View>
      )}

      {!user?.match && <MatcherCreator />}
    </View>
  );
}

function Filter({date, count, onSubmit}) {
  const [selectedDate, setSelectedDate] = useState(date);
  const [selectedCount, setSelectedCount] = useState(count);

  function onChangeDate(d) {
    setSelectedDate(d);
  }

  function onChangeCount(c) {
    setSelectedCount(c);
  }

  function handleSubmit() {
    onSubmit({date: selectedDate, count: selectedCount});
  }

  return (
    <View style={{backgroundColor: '#FFF'}}>
      <CalendarPicker
        minDate={new Date()}
        selectedDate={selectedDate}
        onChangeDate={onChangeDate}
      />
      <View style={{padding: 16}}>
        <Counter
          value={selectedCount}
          label="Min Availability"
          onDecrement={onChangeCount}
          onIncrement={onChangeCount}
        />
        <Button onPress={handleSubmit} style={{marginTop: 16}} mode="contained">
          Filter
        </Button>
      </View>
    </View>
  );
}
