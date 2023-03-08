import {useEffect, useMemo, useState} from 'react';
import {FlatList, RefreshControl, View, Image} from 'react-native';
import {
  Divider,
  HelperText,
  IconButton,
  Searchbar,
  useTheme,
} from 'react-native-paper';
import {useNavigation} from '@react-navigation/native';

import {useAppContext} from 'src/context/App';
import Header from 'src/components/Header';
import Account from 'src/components/Account';
import MatchCard from 'src/components/MatchCard';
import MatcherCreator from 'src/components/MatchCreator';

export default function Matcher() {
  const {user, matches, init, selectMatch} = useAppContext();
  const navigation = useNavigation();
  const theme = useTheme();
  const [isRefreshing, setIsRefreshing] = useState(false);

  const filteredMatches = useMemo(() => {
    if (!user?.match) return matches;
    return matches.filter(m => String(m._id) !== String(user.match._id));
  }, [user?.match, matches]);

  useEffect(() => {
    if (user?.match?._id) {
      selectMatch(user.match);
      navigation.navigate('Match', {name: user.match.name});
    }
  }, [user?.match?._id, user?.match?.name]);

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

  return (
    <View style={{flex: 1, backgroundColor: theme.colors.background}}>
      <Header
        disableTitle
        logo={
          <View style={{paddingLeft: 8}}>
            <Image
              resizeMode="contain"
              style={{width: 120}}
              source={require('../assets/matcher-logo.png')}
            />
          </View>
        }>
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
        data={filteredMatches}
        renderItem={({item}) => (
          <MatchCard match={item} onPress={navigateToMatch(item)} />
        )}
        keyExtractor={item => item._id}
      />

      {!user?.match && <MatcherCreator />}

      {user?.match && (
        <View style={{backgroundColor: theme.colors.primary}}>
          <MatchCard
            mini
            match={user.match}
            onPress={navigateToMatch(user.match)}
          />
        </View>
      )}
    </View>
  );
}
