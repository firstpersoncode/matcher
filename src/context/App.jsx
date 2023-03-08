import {useState, createContext, useContext, useEffect} from 'react';
import Geolocation from '@react-native-community/geolocation';
import io from 'socket.io-client';
import Config from 'react-native-config';
import PushNotification, {Importance} from 'react-native-push-notification';

import {
  fetchUser,
  setCoordinates,
  signIn,
  signUp,
  signOut,
} from '../services/session';
import {
  createMatch,
  deleteMatch,
  fetchMatches,
  fetchProviders,
  joinMatch,
  leaveMatch,
  removeParticipant,
  updateMatchName,
} from '../services/match';
import {
  announce,
  fetchMessages,
  getLastRead,
  postMessage,
  setLastRead,
  unannounce,
} from '../services/message';

const channelId = 'test-channel';
let socketClient;

const appContext = {
  ready: false,
  online: false,
  user: null,
  matches: [],
  providers: [],
  messages: [],
  unreads: 0,
};

function useAppState() {
  const [ctx, setContext] = useState(appContext);

  useEffect(() => {
    setContext(v => ({...v, ready: true}));
  }, []);

  useEffect(() => {
    if (ctx.ready) {
      Geolocation.requestAuthorization(init, err =>
        console.error('requestAuthorization', err.message || err),
      );

      notificationInit();

      socketClient = io(Config.API_URI);
      socketClient.on('connect', socketInit);
      socketClient.on('connect_error', socketError);

      return () => {
        socketClient.off('connect', socketInit);
        socketClient.off('connect_error', socketError);
      };
    }
  }, [ctx.ready]);

  useEffect(() => {
    if (ctx.online) {
      socketClient.on('broadcast', socketBroadcast);
      socketClient.on('private', socketPrivate);
      return () => {
        socketClient.off('broadcast', socketBroadcast);
        socketClient.off('private', socketPrivate);
      };
    }
  }, [ctx.online]);

  useEffect(() => {
    if (ctx.user?.match?._id) {
      socketClient.emit('join', ctx.user.match._id);
      loadMessages();
    }
  }, [ctx.user?.match?._id]);

  useEffect(() => {
    getTotalUnreads();
  }, [ctx.messages]);

  function init() {
    Geolocation.getCurrentPosition(
      async pos => {
        let coordinates = [pos.coords.latitude, pos.coords.longitude];
        let user;
        let matches = [];

        try {
          user = await fetchUser();
          if (user) setCoordinates(coordinates);
        } catch (err) {
          console.warn('init-user', err.message || err);
        }

        try {
          matches = await fetchMatches(coordinates);
        } catch (err) {
          console.warn('init-matches', err.message || err);
        }

        setContext(v => ({
          ...v,
          user,
          matches,
        }));
      },
      err => console.error('getCurrentPosition', err.message || err),
      {enableHighAccuracy: true},
    );
  }

  function notificationInit() {
    PushNotification.channelExists(channelId, function (exists) {
      if (!exists) {
        PushNotification.createChannel(
          {
            channelId, // (required)
            channelName: 'My channel', // (required)
            // channelDescription: 'A channel to categorise your notifications', // (optional) default: undefined.
            playSound: true, // (optional) default: true
            soundName: 'default', // (optional) See `soundName` parameter of `localNotification` function
            importance: Importance.HIGH, // (optional) default: Importance.HIGH. Int value of the Android notification importance
            vibrate: true, // (optional) default: true. Creates the default vibration pattern if true.
          },
          created => {
            if (created)
              PushNotification.localNotification({
                channelId,
                title: 'Welcome back!', // (optional)
                message: 'Where have you been!?', // (required)
              });
          },
        );
      } else
        PushNotification.localNotification({
          channelId,
          title: 'Welcome back!', // (optional)
          message: 'Where have you been!?', // (required)
        });
    });
  }

  function socketInit() {
    console.info('socketInit', 'socket initialized');
    setContext(v => ({
      ...v,
      online: true,
    }));
  }

  function socketError(err) {
    console.error('socketError', 'socket error', err.message || err);
    setContext(v => ({
      ...v,
      online: false,
    }));
  }

  function socketBroadcast({type, data}) {
    switch (type) {
      case 'match-create':
        setContext(v => {
          let currUser = v.user;
          if (currUser) {
            let isOwner = String(data.owner._id) === String(currUser._id);
            if (isOwner) {
              currUser.match = data;
            }
          }

          return {
            ...v,
            matches: [...v.matches, data].sort(
              (a, b) => a.distance - b.distance,
            ),
            user: currUser,
          };
        });
        break;
      case 'match-delete':
        setContext(v => {
          let currUser = v.user;
          let currMessages = v.messages;
          if (currUser?.match) {
            let isOwner = String(data.owner._id) === String(currUser._id);
            let isParticipant = data.participants.find(
              p => String(p.participant._id) === String(currUser._id),
            );

            if (isOwner || isParticipant) {
              currUser.match = null;
              currMessages = [];
              socketClient.emit('leave', data._id);
            }
          }

          return {
            ...v,
            matches: [...v.matches].filter(
              m => String(m._id) !== String(data._id),
            ),
            user: currUser,
            messages: currMessages,
          };
        });
        break;
      case 'match-join':
        setContext(v => {
          let currUser = v.user;
          if (currUser) {
            let isParticipant =
              String(data.participant._id) === String(currUser._id);
            if (isParticipant) {
              currUser.match = data.match;
            }
          }

          return {
            ...v,
            matches: [...v.matches].map(m => {
              if (String(m._id) === String(data.match._id)) {
                m.participants = [
                  ...m.participants,
                  {participant: data.participant, count: data.count},
                ];
              }
              return m;
            }),
            user: currUser,
          };
        });
        break;
      case 'match-leave':
        setContext(v => {
          let currUser = v.user;
          let currMessages = v.messages;
          if (currUser?.match) {
            let isParticipant =
              String(data.participant._id) === String(currUser._id);
            if (isParticipant) {
              currUser.match = null;
              currMessages = [];
              socketClient.emit('leave', data.match._id);
            }
          }

          return {
            ...v,
            matches: [...v.matches].map(m => {
              if (String(m._id) === String(data.match._id)) {
                m.participants = m.participants.filter(
                  p =>
                    String(p.participant._id) !== String(data.participant._id),
                );
              }
              return m;
            }),
            user: currUser,
            messages: currMessages,
          };
        });
        break;
      case 'match-remove':
        setContext(v => {
          let currUser = v.user;
          let currMessages = v.messages;
          if (currUser?.match) {
            let isParticipant =
              String(data.participant._id) === String(currUser._id);
            if (isParticipant) {
              currUser.match = null;
              currMessages = [];
              socketClient.emit('leave', data.match._id);
            }
          }

          return {
            ...v,
            matches: [...v.matches].map(m => {
              if (String(m._id) === String(data.match._id)) {
                m.participants = m.participants.filter(
                  p =>
                    String(p.participant._id) !== String(data.participant._id),
                );
              }
              return m;
            }),
            user: currUser,
            messages: currMessages,
          };
        });
        break;
      case 'match-update':
        setContext(v => {
          let currUser = v.user;
          if (currUser?.match) {
            let isParticipant = data.participants.find(
              p => String(p.participant._id) === String(currUser._id),
            );
            if (isParticipant) {
              currUser.match = {...currUser.match, ...data};
            }
          }

          return {
            ...v,
            matches: [...v.matches].map(m => {
              if (String(m._id) === String(data._id)) {
                m = {...m, ...data};
              }
              return m;
            }),
            user: currUser,
          };
        });
        break;
      case 'message-announce':
        setContext(v => ({
          ...v,
          matches: [...v.matches].map(m => {
            if (String(m._id) === String(data.match._id)) {
              m.announcements = [...m.announcements, data.announcement];
            }
            return m;
          }),
          messages: [...v.messages].map(message => {
            if (String(message._id) === String(data.announcement._id))
              message.type = data.announcement.type;

            return message;
          }),
        }));
        break;
      case 'message-unannounce':
        setContext(v => ({
          ...v,
          matches: [...v.matches].map(m => {
            if (String(m._id) === String(data.match._id)) {
              m.announcements = m.announcements.filter(
                announcement =>
                  String(announcement._id) !== String(data.announcement._id),
              );
            }
            return m;
          }),
          messages: [...v.messages].map(message => {
            if (String(message._id) === String(data.announcement._id))
              message.type = data.announcement.type;

            return message;
          }),
        }));
        break;
      default:
        console.log('unknown broadcast type', type);
    }
  }

  function socketPrivate({type, data}) {
    switch (type) {
      case 'message-post':
        setContext(v => ({...v, messages: [...v.messages, data]}));
        break;
      default:
        console.log('unknown broadcast type', type);
    }
  }

  async function handleSignIn(form) {
    const user = await signIn(form);
    setContext(v => ({...v, user}));
  }

  async function handleSignUp(form) {
    const user = await signUp(form);
    setContext(v => ({...v, user}));
  }

  async function handleSignOut() {
    await signOut();
    setContext(v => ({...v, user: null}));
  }

  async function getProviders() {
    const providers = await fetchProviders();
    setContext(v => ({...v, providers}));
  }

  async function handleCreateMatch(match) {
    await createMatch(match);
  }

  async function handleLeaveMatch() {
    await leaveMatch();
  }

  async function handleDeleteMatch() {
    await deleteMatch();
  }

  async function handleJoinMatch(match) {
    await joinMatch(match);
  }

  async function handleUpdateMatchName(name) {
    await updateMatchName(name);
  }

  async function handleRemoveParticipant(participant) {
    await removeParticipant(participant);
  }

  async function loadMessages() {
    const messages = await fetchMessages();
    setContext(v => ({...v, messages}));
  }

  async function sendMessage(message) {
    await postMessage(message);
  }

  function saveLastRead() {
    setContext(v => {
      let currMessages = v.messages;
      const index = currMessages.length - 1;
      if (index !== -1) {
        let lastMessage = currMessages[index];
        setLastRead(lastMessage._id);
        currMessages = currMessages.slice(index);
      }

      return {
        ...v,
        unreads: currMessages.length - 1,
      };
    });
  }

  async function getTotalUnreads() {
    const messageId = await getLastRead();
    setContext(v => {
      let currMessages = v.messages;
      const index = currMessages.findIndex(
        m => String(m._id) === String(messageId),
      );

      if (index !== -1) currMessages = currMessages.slice(index);

      return {
        ...v,
        unreads: currMessages.length - 1,
      };
    });
  }

  async function announceMessage(message) {
    await announce(message);
  }

  async function unAnnounceMessage(message) {
    await unannounce(message);
  }

  return {
    ...ctx,
    init,
    handleSignIn,
    handleSignUp,
    handleSignOut,
    getProviders,
    handleCreateMatch,
    handleLeaveMatch,
    handleDeleteMatch,
    handleJoinMatch,
    handleUpdateMatchName,
    handleRemoveParticipant,
    sendMessage,
    saveLastRead,
    getTotalUnreads,
    announceMessage,
    unAnnounceMessage,
  };
}

const AppContext = createContext(appContext);

export function useAppContext() {
  return useContext(AppContext);
}

export default function AppContextProvider({children}) {
  const appContext = useAppState();

  return (
    <AppContext.Provider value={appContext}>{children}</AppContext.Provider>
  );
}
