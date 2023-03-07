import {useCallback, useEffect, useMemo, useState} from 'react';
import {View, useWindowDimensions} from 'react-native';
import {Avatar, Badge, Text, useTheme} from 'react-native-paper';
import {useNavigation, useRoute} from '@react-navigation/native';
import {TabView, TabBar} from 'react-native-tab-view';

import {useAppContext} from 'src/context/App';
import Map from 'src/components/Map';
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
    {key: 'map-marker', title: 'Location'},
  ]);
  const match = useMemo(
    () => matches.find(m => String(m._id) === String(route.params.matchRef)),
    [matches, route.params.matchRef],
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
        case 'map-marker':
          return match ? (
            <Map
              liteMode={false}
              title={match.provider.name}
              description={match.provider.address}
              center={match.location.coordinates.slice().reverse()}
            />
          ) : null;
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
          style={{backgroundColor: theme.colors.primary}}
          tabStyle={{padding: 0}}
          getLabelText={() => null}
          indicatorStyle={{bottom: 'auto', top: 0}}
          renderIcon={({route, color}) => (
            <View style={{flexDirection: 'row', alignItems: 'center'}}>
              <Avatar.Icon
                icon={route.key}
                size={40}
                color={color}
                style={{backgroundColor: 'transparent'}}
              />
              {route.key === 'account-multiple' && (
                <Text style={{color}}>
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
        <Text>Match already removed</Text>
      </View>
    );

  return (
    <TabView
      lazy
      navigationState={{index, routes}}
      renderScene={renderScene}
      renderTabBar={renderTabBar}
      onIndexChange={setIndex}
      initialLayout={{width: layout.width}}
      tabBarPosition="bottom"
    />
  );
}
