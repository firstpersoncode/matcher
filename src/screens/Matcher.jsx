import {useEffect, useMemo, useState} from 'react';
import {FlatList, RefreshControl, View} from 'react-native';
import {FAB, useTheme} from 'react-native-paper';
import {useNavigation} from '@react-navigation/native';

import {useAppContext} from 'src/context/App';
import {useSheetContext} from 'src/context/Sheet';
import MatchCard from 'src/components/MatchCard';
import MatchCreator from 'src/components/MatchCreator';

export default function Matcher() {
  const {user, matches, init} = useAppContext();
  const {displaySheet, hideSheet} = useSheetContext();
  const navigation = useNavigation();
  const theme = useTheme();
  const [isRefreshing, setIsRefreshing] = useState(false);
  const normalizedMatches = useMemo(() => {
    if (!user?.match) return matches;
    return matches.filter(m => String(m._id) !== String(user.match._id));
  }, [user?.match, matches]);

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
    displaySheet(<MatchCreator onClose={hideSheet} />, '70%');
  }

  return (
    <View
      style={{
        backgroundColor: theme.colors.background,
        paddingBottom: user?.match ? 150 : 0,
      }}>
      {user?.match && (
        <MatchCard match={user.match} onPress={selectMatch(user.match)} />
      )}
      <FlatList
        refreshControl={
          <RefreshControl refreshing={isRefreshing} onRefresh={onRefresh} />
        }
        data={normalizedMatches}
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
    </View>
  );
}
