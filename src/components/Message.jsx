import {useEffect, useMemo, useRef, useState} from 'react';
import {Linking, Pressable, View} from 'react-native';
import {Card, Chip, Text, useTheme} from 'react-native-paper';
import Hyperlink from 'react-native-hyperlink';
import {
  differenceInDays,
  differenceInHours,
  differenceInMinutes,
  differenceInSeconds,
} from 'date-fns';

import {useAppContext} from 'src/context/App';

export default function Message({message}) {
  const {user} = useAppContext();
  const intervalRef = useRef();
  const theme = useTheme();
  const [now, setNow] = useState(new Date());

  const isSelf = useMemo(
    () => String(message.owner._id) === String(user?._id),
    [message.owner._id, user?._id],
  );

  const lastCreated = useMemo(() => {
    const diffDays = differenceInDays(now, new Date(message.createdAt));
    if (diffDays >= 1) return `${diffDays}${diffDays > 1 ? 'days' : 'day'} ago`;
    else {
      const diffHours = differenceInHours(now, new Date(message.createdAt));
      if (diffHours >= 1) return `${diffHours}h ago`;
      else {
        const diffMinutes = differenceInMinutes(
          now,
          new Date(message.createdAt),
        );

        if (diffMinutes >= 1) return `${diffMinutes}m ago`;
        else {
          const diffSeconds = differenceInSeconds(
            now,
            new Date(message.createdAt),
          );

          if (diffSeconds >= 1) return `${diffSeconds}s ago`;
          else return '0s ago';
        }
      }
    }
  }, [now, message.createdAt]);

  useEffect(() => {
    if (intervalRef.current) clearInterval(intervalRef.current);

    intervalRef.current = setInterval(() => {
      setNow(new Date());
    }, 1000 * 60);

    return () => {
      intervalRef.current && clearInterval(intervalRef.current);
    };
  }, []);

  return (
    <View
      style={{
        padding: 16,
        flex: 1,
        flexDirection: 'row',
        justifyContent: isSelf ? 'flex-end' : 'flex-start',
      }}>
      <Card
        style={{
          minWidth: 100,
          maxWidth: '90%',
          backgroundColor: isSelf
            ? theme.colors.secondaryContainer
            : theme.colors.onPrimary,
        }}>
        <Text
          style={{
            paddingTop: 16,
            paddingBottom: 4,
            paddingLeft: 16,
            paddingRight: 16,
          }}
          variant="labelSmall">
          {isSelf ? 'Me' : message.owner.name}
        </Text>
        <Hyperlink
          onPress={url => Linking.openURL(url)}
          linkStyle={{color: 'blue'}}>
          <Text
            variant="bodyMedium"
            style={{
              paddingBottom: 8,
              paddingLeft: 16,
              paddingRight: 16,
            }}>
            {message.text}
          </Text>
        </Hyperlink>
        <Pressable
          style={{
            flex: 1,
            paddingLeft: 16,
            paddingRight: 8,
            flexDirection: 'row',
            justifyContent: 'flex-end',
            alignItems: 'center',
          }}>
          <Text variant="labelSmall">{lastCreated}</Text>
          <Chip
            style={{
              backgroundColor: isSelf
                ? theme.colors.secondaryContainer
                : theme.colors.onPrimary,
              width: 25,
            }}
            icon="check"
          />
        </Pressable>
      </Card>
    </View>
  );
}
