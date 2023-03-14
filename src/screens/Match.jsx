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

const Tab = createMaterialTopTabNavigator();

export default function Match() {
  const {user, match, messages} = useAppContext();
  const {displaySheet} = useSheetContext();
  const theme = useTheme();
  const navigation = useNavigation();

  const isOwner = useMemo(
    () => String(match?.owner._id) === String(user?._id),
    [user?._id, match?.owner._id],
  );

  const joinedCount = useMemo(
    () =>
      match?.participants.map(p => p.count).reduce((sum, a) => sum + a, 0) || 0,
    [match?.participants],
  );

  useEffect(() => {
    if (!match?._id) navigation.navigate('MatchList');
  }, [match?._id]);

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
                {messages.length > 0 && (
                  <Badge
                    style={{position: 'absolute', top: -8, right: -8}}
                    size={17}>
                    {messages.length}
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
