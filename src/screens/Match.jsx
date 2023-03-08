import {useCallback, useEffect, useMemo, useState} from 'react';
import {View, useWindowDimensions} from 'react-native';
import {Avatar, Badge, Text, useTheme} from 'react-native-paper';
import {useNavigation, useRoute} from '@react-navigation/native';
import {TabView, TabBar} from 'react-native-tab-view';
import {SafeAreaView} from 'react-native-safe-area-context';

import {useAppContext} from 'src/context/App';
import Header from 'src/components/Header';
import MatchActions from 'src/components/MatchActions';
import MatchInfo from 'src/components/MatchInfo';
import MatchParticipant from 'src/components/MatchParticipant';
import MatchChat from 'src/components/MatchChat';

export default function Match() {
  const {user, matches, messages, unreads, saveLastRead} = useAppContext();
  const layout = useWindowDimensions();
  const theme = useTheme();
  const navigation = useNavigation();
  const route = useRoute();
  const [index, setIndex] = useState(0);
  const [routes] = useState([
    {key: 'information-outline', title: 'Info'},
    {key: 'account-multiple', title: 'Participant'},
    {key: 'chat', title: 'Chat'},
  ]);

  const match = useMemo(
    () => matches.find(m => String(m._id) === String(route.params?.matchRef)),
    [matches, route.params?.matchRef],
  );

  const isParticipant = useMemo(
    () => user?.match && String(match?._id) === String(user.match._id),
    [user?.match, match?._id],
  );

  const joinedCount = useMemo(
    () =>
      match?.participants.map(p => p.count).reduce((sum, a) => sum + a, 0) || 0,
    [match?.participants],
  );

  const totalUnreads = useMemo(
    () => (isParticipant ? unreads : 0),
    [isParticipant, unreads],
  );

  useEffect(() => {
    if (!match?._id) navigation.navigate('Matcher');
  }, [match?._id]);

  useEffect(() => {
    if (isParticipant && index === 2) saveLastRead();
  }, [isParticipant, messages, index]);

  const renderScene = useCallback(
    ({route}) => {
      switch (route.key) {
        case 'information-outline':
          return <MatchInfo />;
        case 'account-multiple':
          return <MatchParticipant />;
        case 'chat':
          return <MatchChat />;

        default:
          return null;
      }
    },
    [
      match?.provider.name,
      match?.provider.address,
      match?.location.coordinates,
    ],
  );

  const renderTabBar = useCallback(
    props => {
      if (!match) return null;
      return (
        <TabBar
          {...props}
          style={{backgroundColor: theme.colors.background}}
          tabStyle={{padding: 0}}
          getLabelText={() => null}
          indicatorStyle={{backgroundColor: theme.colors.primary, height: 3}}
          renderIcon={({route, color}) => (
            <View style={{flexDirection: 'row', alignItems: 'center'}}>
              <Avatar.Icon
                icon={route.key}
                size={40}
                color="#000"
                style={{backgroundColor: 'transparent'}}
              />
              {route.key === 'account-multiple' && (
                <Text>
                  {joinedCount} / {match.count}
                </Text>
              )}
              {route.key === 'chat' && totalUnreads > 0 && (
                <Badge
                  style={{position: 'absolute', top: 2, right: 0}}
                  size={18}>
                  {totalUnreads}
                </Badge>
              )}
            </View>
          )}
        />
      );
    },
    [match?.count, theme.colors.secondary, joinedCount, totalUnreads],
  );

  if (!match)
    return (
      <View style={{flex: 1, justifyContent: 'center', alignItems: 'center'}}>
        <Text>Match not found</Text>
      </View>
    );

  return (
    <SafeAreaView style={{flex: 1, backgroundColor: theme.colors.background}}>
      <Header back>
        <View style={{paddingRight: 16}}>
          <MatchActions />
        </View>
      </Header>
      <TabView
        lazy
        navigationState={{index, routes}}
        renderScene={renderScene}
        renderTabBar={renderTabBar}
        onIndexChange={setIndex}
        initialLayout={{width: layout.width}}
        // tabBarPosition="bottom"
      />
    </SafeAreaView>
  );
}
