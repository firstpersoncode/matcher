import {useEffect, useMemo} from 'react';
import {Pressable, View, Image} from 'react-native';
import {Avatar, Badge, Divider, Text, useTheme} from 'react-native-paper';
import {useNavigation} from '@react-navigation/native';
import {createMaterialTopTabNavigator} from '@react-navigation/material-top-tabs';

import {useAppContext} from 'src/context/App';
import Header from 'src/components/Header';
import MatchActions from 'src/components/MatchActions';
import MatchInfo from 'src/components/MatchInfo';
import MatchParticipant from 'src/components/MatchParticipant';
import MatchChat from 'src/components/MatchChat';

const Tab = createMaterialTopTabNavigator();

export default function Match() {
  const {user, match, unreads} = useAppContext();
  const theme = useTheme();
  const navigation = useNavigation();

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

  if (!match)
    return (
      <View style={{flex: 1, justifyContent: 'center', alignItems: 'center'}}>
        <Text>Match not found</Text>
      </View>
    );

  return (
    <View style={{flex: 1, backgroundColor: theme.colors.background}}>
      <Header back disableTitle>
        <View style={{paddingRight: 16}}>
          <MatchActions />
        </View>
      </Header>
      <Divider />
      <Tab.Navigator
        tabBarPosition="bottom"
        screenOptions={{
          lazy: true,
          tabBarIndicatorStyle: {
            backgroundColor: theme.colors.primary,
            bottom: 'auto',
            top: 0,
          },
          tabBarStyle: {backgroundColor: theme.colors.background},
          tabBarItemStyle: {
            flexDirection: 'row',
            alignItems: 'center',
          },
        }}>
        <Tab.Screen
          name="MatchInfo"
          options={{
            tabBarShowLabel: false,
            tabBarIcon: ({color}) => (
              <Avatar.Icon
                icon="information-outline"
                size={30}
                color={color}
                style={{
                  backgroundColor: 'transparent',
                }}
              />
            ),
          }}
          component={MatchInfo}
        />
        <Tab.Screen
          name="MatchParticipant"
          options={{
            title: `${joinedCount} / ${match.count}`,
            tabBarIcon: ({color}) => (
              <Avatar.Icon
                icon="account-multiple"
                size={30}
                color={color}
                style={{
                  padding: 0,
                  margin: 0,
                  backgroundColor: 'transparent',
                }}
              />
            ),
          }}
          component={MatchParticipant}
        />
        <Tab.Screen
          name="MatchChat"
          options={{
            tabBarShowLabel: false,
            tabBarIcon: ({color}) => (
              <View style={{position: 'relative'}}>
                {totalUnreads > 0 && (
                  <Badge
                    style={{position: 'absolute', top: -8, right: -8}}
                    size={17}>
                    {totalUnreads}
                  </Badge>
                )}
                <Avatar.Icon
                  icon="chat"
                  size={30}
                  color={color}
                  style={{
                    padding: 0,
                    margin: 0,
                    backgroundColor: 'transparent',
                  }}
                />
              </View>
            ),
          }}
          component={MatchChat}
        />
      </Tab.Navigator>
    </View>
  );
}
