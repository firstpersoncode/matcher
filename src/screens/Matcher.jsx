import {useEffect, useMemo, useState} from 'react';
import {FlatList, RefreshControl, View} from 'react-native';
import {
  Divider,
  FAB,
  HelperText,
  IconButton,
  Searchbar,
  useTheme,
} from 'react-native-paper';
import {useNavigation} from '@react-navigation/native';
import {SafeAreaView} from 'react-native-safe-area-context';

import {useAppContext} from 'src/context/App';
import {useSheetContext} from 'src/context/Sheet';
import Header from 'src/components/Header';
import Account from 'src/components/Account';
import MatchCard from 'src/components/MatchCard';
import MatchCreator from 'src/components/MatchCreator';
import FormParticipant from 'src/components/FormParticipant';
import FormProvider from 'src/components/FormProvider';
import FormScheduler from 'src/components/FormScheduler';

export default function Matcher() {
  const {user, matches, init} = useAppContext();
  const {displaySheetRoute} = useSheetContext();
  const navigation = useNavigation();
  const theme = useTheme();
  const [isRefreshing, setIsRefreshing] = useState(false);
  // const filteredMatches = useMemo(() => {
  //   if (!user?.match) return matches;
  //   return matches.filter(m => String(m._id) !== String(user.match._id));
  // }, [user?.match, matches]);

  useEffect(() => {
    if (user?.match?._id)
      navigation.navigate('Match', {
        name: user.match.name,
        matchRef: user.match._id,
      });
  }, [user?.match?._id, user?.match?.name]);

  async function onRefresh() {
    setIsRefreshing(true);
    await init();
    setIsRefreshing(false);
  }

  function selectMatch(match) {
    return function () {
      navigation.navigate('Match', {name: match.name, matchRef: match._id});
    };
  }

  function openMatchCreator() {
    displaySheetRoute({
      routes: [
        {
          name: 'participant',
          component: FormParticipant,
        },
        {
          name: 'provider',
          component: FormProvider,
        },
        {
          name: 'schedule',
          component: FormScheduler,
        },
      ],
      initialRoute: 'participant',
      height: '75%',
      state: {
        name: '',
        count: 0,
        pcount: 0,
        provider: null,
        start: null,
        end: null,
      },
    });
  }

  return (
    <SafeAreaView style={{flex: 1, backgroundColor: theme.colors.background}}>
      <Header>
        <Account />
      </Header>

      <View
        keyboardShouldPersistTaps="handled"
        style={{
          paddingLeft: 16,
          paddingRight: 16,
          paddingBottom: 8,
        }}>
        <View style={{flexDirection: 'row'}}>
          <View style={{flex: 1, paddingRight: 8}}>
            <Searchbar
              style={{
                backgroundColor: '#FFF',
                borderWidth: 1,
                borderColor: theme.colors.secondary,
              }}
              placeholder="Search match..."
            />
            <HelperText>By name, provider, address, owner</HelperText>
          </View>
          <IconButton mode="contained" icon="filter-variant" />
        </View>
      </View>

      <Divider />

      <FlatList
        refreshControl={
          <RefreshControl refreshing={isRefreshing} onRefresh={onRefresh} />
        }
        data={matches}
        renderItem={({item}) => (
          <MatchCard match={item} onPress={selectMatch(item)} />
        )}
        keyExtractor={item => item._id}
      />

      {Boolean(user && !user.match) && (
        <FAB
          color="#FFF"
          icon="plus"
          style={{
            position: 'absolute',
            margin: 16,
            right: 0,
            bottom: 0,
            backgroundColor: theme.colors.primary,
            borderRadius: 100,
          }}
          onPress={openMatchCreator}
        />
      )}

      {user?.match && (
        <View style={{backgroundColor: theme.colors.primary}}>
          <MatchCard
            mini
            match={user.match}
            onPress={selectMatch(user.match)}
          />
        </View>
      )}
    </SafeAreaView>
  );
}
