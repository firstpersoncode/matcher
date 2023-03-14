import {useEffect, useMemo, useRef, useState} from 'react';
import {View} from 'react-native';
import {
  Avatar,
  Badge,
  Button,
  Divider,
  HelperText,
  IconButton,
  Text,
  TextInput,
  useTheme,
} from 'react-native-paper';
import {useNavigation} from '@react-navigation/native';
import {createMaterialTopTabNavigator} from '@react-navigation/material-top-tabs';

import {useAppContext} from 'src/context/App';
import Header from 'src/components/Header';
import MatchActions from 'src/components/MatchActions';
import MatchInfo from 'src/components/MatchInfo';
import MatchParticipant from 'src/components/MatchParticipant';
import MatchChat from 'src/components/MatchChat';
import {useSheetContext} from 'src/context/Sheet';
import AsyncStorage from '@react-native-async-storage/async-storage';

const Tab = createMaterialTopTabNavigator();

export default function Match() {
  const {user, match, messages, messagesLastRead} = useAppContext();
  const {displaySheet} = useSheetContext();
  const theme = useTheme();
  const navigation = useNavigation();
  const [unreadCounts, setUnreadCounts] = useState(0);

  const isOwner = useMemo(
    () => String(match?.owner._id) === String(user?._id),
    [user?._id, match?.owner._id],
  );

  const isParticipant = useMemo(
    () => String(match?._id) === String(user?.match?._id),
    [user?.match?._id, match?._id],
  );

  const joinedCount = useMemo(
    () =>
      match?.participants.map(p => p.count).reduce((sum, a) => sum + a, 0) || 0,
    [match?.participants],
  );

  useEffect(() => {
    if (!match?._id) navigation.navigate('MatchList');
  }, [match?._id]);

  useEffect(() => {
    if (!(isParticipant && messages.length)) return;
    (async () => {
      let messageLastRead = messagesLastRead.find(
        m => String(m.match) === String(match._id),
      );

      if (!messageLastRead) {
        let res = await AsyncStorage.getItem('messages-last-read');
        let currMessagesLastRead = res ? JSON.parse(res) : [];
        messageLastRead = currMessagesLastRead.find(
          m => String(m.match) === String(match._id),
        );
      }

      let lastRead = messageLastRead?.message;
      if (lastRead) {
        let index = messages.findIndex(m => String(m._id) === String(lastRead));
        if (index !== -1) {
          let counts = messages.slice(index + 1).length;
          setUnreadCounts(counts);
        }
      } else setUnreadCounts(messages.length);
    })();
  }, [isParticipant, messages, messagesLastRead, match._id]);

  function onEditName() {
    displaySheet({content: <EditName />});
  }

  if (!match)
    return (
      <View style={{flex: 1, justifyContent: 'center', alignItems: 'center'}}>
        <Text>Match not found</Text>
      </View>
    );

  return (
    <View style={{flex: 1, backgroundColor: theme.colors.background}}>
      <Header
        back
        action={<MatchActions />}
        title={
          <View
            style={{
              flex: 1,
              flexDirection: 'row',
              alignItems: 'center',
              paddingRight: 30,
            }}>
            <Text variant="titleLarge">{match.name}</Text>
            {isOwner && (
              <IconButton size={15} onPress={onEditName} icon="pencil" />
            )}
          </View>
        }
      />
      <Divider />
      <Tab.Navigator
        backBehavior="initialRoute"
        tabBarPosition="bottom"
        screenOptions={{
          swipeEnabled: false,
          lazy: true,
          tabBarIndicatorStyle: {backgroundColor: 'transparent'},
          tabBarStyle: {backgroundColor: theme.colors.secondaryContainer},
          tabBarItemStyle: {
            flexDirection: 'row',
            alignItems: 'center',
          },
        }}>
        <Tab.Screen
          name="MatchInfo"
          options={{
            tabBarShowLabel: false,
            tabBarIcon: ({color, focused}) => (
              <Avatar.Icon
                icon={focused ? 'information' : 'information-outline'}
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
            tabBarIcon: ({color, focused}) => (
              <Avatar.Icon
                icon={focused ? 'account-multiple' : 'account-multiple-outline'}
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
            tabBarIcon: ({color, focused}) => (
              <View style={{position: 'relative'}}>
                {unreadCounts > 0 && (
                  <Badge
                    style={{position: 'absolute', top: -8, right: -8}}
                    size={17}>
                    {unreadCounts}
                  </Badge>
                )}
                <Avatar.Icon
                  icon={focused ? 'chat' : 'chat-outline'}
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

function EditName() {
  const {user, handleUpdateMatchName} = useAppContext();
  const {hideSheet} = useSheetContext();
  const inputRef = useRef();
  const timeoutRef = useRef();
  const [name, setName] = useState(user.match.name);
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    if (timeoutRef.current) clearTimeout(timeoutRef.current);
    timeoutRef.current = setTimeout(() => {
      inputRef.current?.focus();
    }, 50);
    return () => {
      timeoutRef.current && clearTimeout(timeoutRef.current);
      inputRef.current?.blur();
    };
  }, []);

  function onChange(text) {
    setName(text);
  }

  async function onSubmit() {
    if (!Boolean(name.trim())) return;

    if (name === user.match.name) {
      inputRef.current?.blur();
      hideSheet();
    }

    setIsSubmitting(true);
    try {
      await handleUpdateMatchName({name});
      inputRef.current?.blur();
      hideSheet();
    } catch (err) {
      console.error(err.message || err);
    }
    setIsSubmitting(false);
  }

  return (
    <View style={{padding: 16}}>
      <TextInput
        ref={inputRef}
        mode="outlined"
        value={name}
        onChangeText={onChange}
        onSubmitEditing={onSubmit}
        maxLength={50}
        right={<TextInput.Affix text={`${String(name.length)}/50`} />}
        error={!Boolean(name)}
      />
      <HelperText type="error" visible={!Boolean(name)}>
        Required
      </HelperText>

      <Button disabled={isSubmitting} mode="contained" onPress={onSubmit}>
        Update
      </Button>
    </View>
  );
}
