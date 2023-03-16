import {useState, createContext, useContext, useEffect, useMemo} from 'react';
import Geolocation from '@react-native-community/geolocation';
import io from 'socket.io-client';
import Config from 'react-native-config';
import messaging from '@react-native-firebase/messaging';

async function requestFCMToken() {
  const authStatus = await messaging().requestPermission();
  const enabled =
    authStatus === messaging.AuthorizationStatus.AUTHORIZED ||
    authStatus === messaging.AuthorizationStatus.PROVISIONAL;

  if (enabled) {
    await messaging().registerDeviceForRemoteMessages();
    const token = await messaging().getToken();

    return token;
  }
}

import {
  fetchUser,
  setCoordinates,
  signIn,
  signUp,
  signOut,
  setName,
} from 'src/services/session';
import {
  createMatch,
  deleteMatch,
  fetchMatches,
  fetchProviders,
  joinMatch,
  leaveMatch,
  removeParticipant,
  updateMatchName,
  updateMatchProvider,
  updateMatchSchedule,
  updateMatchParticipant,
  invitation,
  rejectInvitation,
} from 'src/services/match';
import {
  announce,
  fetchMessages,
  fetchPrivateMessages,
  postMessage,
  postAnnouncement,
  postPrivateMessage,
  unannounce,
} from 'src/services/message';
import {
  confirmContact,
  fetchContact,
  requestContact,
} from 'src/services/contact';

let socketClient;

const appContext = {
  ready: false,
  online: false,
  coordinates: [],
  user: null,
  match: null,
  matches: [],
  providers: [],
  messages: [],
  messagesLastRead: [],
  inbox: null,
  privateMessages: [],
  privateMessagesLastRead: [],
};

function useAppState() {
  const [ctx, setContext] = useState(appContext);
  const selectedMatch = useMemo(
    () => ctx.matches.find(m => String(m._id) === String(ctx.match?._id)),
    [ctx.match?._id, ctx.matches],
  );

  const selectedInbox = useMemo(
    () =>
      ctx.user?.contacts.find(
        item => String(item.contact._id) === String(ctx.inbox?._id),
      )?.contact,
    [ctx.inbox?._id, ctx.user?.contacts],
  );

  useEffect(() => {
    setContext(v => ({...v, ready: true}));
  }, []);

  useEffect(() => {
    if (ctx.ready) {
      Geolocation.requestAuthorization(init, err =>
        console.error('requestAuthorization', err.message || err),
      );

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
    if (ctx.user?._id) {
      socketClient.emit('join', ctx.user?._id);
      loadPrivateMessages();
    }
  }, [ctx.user?._id]);

  useEffect(() => {
    if (ctx.user?.match?._id) {
      socketClient.emit('join', ctx.user?.match?._id);
      loadMessages();
    }
  }, [ctx.user?.match?._id]);

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
          coordinates,
          matches,
        }));
      },
      err => console.error('getCurrentPosition', err.message || err),
      {enableHighAccuracy: true},
    );
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
              currUser.invitations = [];
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
              currUser.invitations = [];
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
      case 'announcement':
        setContext(v => {
          let currUser = v.user;
          let currMessages = v.messages;
          if (currUser && currUser.match) {
            if (String(data.match._id) === String(currUser.match._id)) {
              currMessages = [...currMessages, data.announcement];
            }
          }

          return {
            ...v,
            matches: [...v.matches].map(m => {
              if (String(m._id) === String(data.match._id)) {
                m.announcements = [...m.announcements, data.announcement];
              }
              return m;
            }),
            messages: currMessages,
          };
        });
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
      case 'private-message-post':
        setContext(v => ({
          ...v,
          privateMessages: [...v.privateMessages, data],
        }));
        break;
      case 'contact-request':
        setContext(v => {
          let currUser = v.user;
          if (currUser)
            if (String(currUser._id) === String(data.requester._id))
              currUser.contacts = [
                ...currUser.contacts,
                {contact: data.responser, status: 'waiting-res'},
              ];
            else if (String(currUser._id) === String(data.responser._id))
              currUser.contacts = [
                ...currUser.contacts,
                {contact: data.requester, status: 'waiting-req'},
              ];
          return {...v, user: currUser};
        });
        break;
      case 'contact-confirm':
        setContext(v => {
          let currUser = v.user;
          if (currUser) {
            currUser.contacts = currUser.contacts.map(item => {
              if (
                String(item.contact._id) === String(data.requester._id) ||
                String(item.contact._id) === String(data.responser._id)
              )
                item.status = 'friend';
              return item;
            });
          }
          return {...v, user: currUser};
        });
        break;
      case 'match-invite':
        setContext(v => {
          let currUser = v.user;
          if (currUser) {
            currUser.invitations = [...currUser.invitations, data];
          }
          return {...v, user: currUser};
        });
        break;
      case 'match-reject-invite':
        setContext(v => {
          let currUser = v.user;
          if (currUser) {
            currUser.invitations = currUser.invitations.filter(
              m => String(m._id) !== String(data),
            );
          }
          return {...v, user: currUser};
        });
        break;
      default:
        console.log('unknown broadcast type', type);
    }
  }

  async function handleUpdateName(name) {
    await setName(name);
    setContext(v => ({...v, user: {...v.user, name}}));
  }

  async function handleSignIn(form) {
    const token = await requestFCMToken();
    const user = await signIn({...form, fcmToken: token});
    setContext(v => ({...v, user}));
  }

  async function handleSignUp(form) {
    const token = await requestFCMToken();
    const user = await signUp({...form, fcmToken: token});
    setContext(v => ({...v, user}));
  }

  async function handleSignOut() {
    await signOut();
    setContext(v => {
      socketClient.emit('leave', v.user._id);
      if (v.user.match) socketClient.emit('leave', v.user.match._id);
      return {...v, user: null};
    });
  }

  function selectMatch(match) {
    setContext(v => ({...v, match}));
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

  async function handleUpdateMatchProvider(providerAndSchedule) {
    await updateMatchProvider(providerAndSchedule);
  }

  async function handleUpdateMatchSchedule(slot) {
    await updateMatchSchedule(slot);
  }

  async function handleUpdateMatchParticipant(form) {
    await updateMatchParticipant(form);
  }

  async function handleRemoveParticipant(participant) {
    await removeParticipant(participant);
  }

  async function handleInviteParticipant(participantRef) {
    await invitation(participantRef);
  }

  async function handleRejectInvite(matchRef) {
    await rejectInvitation(matchRef);
  }

  function setMessagesLastRead(match, message) {
    setContext(v => {
      let currMessagesLastRead = v.messagesLastRead;
      let lastRead = currMessagesLastRead.find(
        m => String(m.match) === String(match),
      );

      if (lastRead) {
        currMessagesLastRead = currMessagesLastRead.map(m => {
          if (String(m.match) === String(match)) m.message = message;
          return m;
        });
      } else currMessagesLastRead = [...currMessagesLastRead, {match, message}];

      return {
        ...v,
        messagesLastRead: currMessagesLastRead,
      };
    });
  }

  async function loadMessages() {
    const messages = await fetchMessages();
    setContext(v => ({...v, messages}));
  }

  async function sendMessage(message) {
    await postMessage(message);
  }

  async function sendAnnouncement(message) {
    await postAnnouncement(message);
  }

  // function saveLastRead() {
  //   setContext(v => {
  //     let currMessages = v.messages;
  //     const index = currMessages.length - 1;
  //     if (index !== -1) {
  //       let lastMessage = currMessages[index];
  //       setLastRead(lastMessage._id);
  //       currMessages = currMessages.slice(index);
  //     }

  //     return {
  //       ...v,
  //       unreads: currMessages.length - 1,
  //     };
  //   });
  // }

  // async function getTotalUnreads() {
  //   const messageId = await getLastRead();
  //   setContext(v => {
  //     let currMessages = v.messages;
  //     const index = currMessages.findIndex(
  //       m => String(m._id) === String(messageId),
  //     );

  //     if (index !== -1) currMessages = currMessages.slice(index + 1);

  //     return {
  //       ...v,
  //       unreads: currMessages.length,
  //     };
  //   });
  // }

  async function announceMessage(message) {
    await announce(message);
  }

  async function unAnnounceMessage(message) {
    await unannounce(message);
  }

  function selectInbox(inbox) {
    setContext(v => ({...v, inbox}));
  }

  async function getContact(idString) {
    return await fetchContact(idString);
  }

  async function addContact(contact) {
    await requestContact(contact);
  }

  async function acceptContact(contact) {
    await confirmContact(contact);
  }

  function setPrivateMessagesLastRead(inbox, message) {
    setContext(v => {
      let currMessagesLastRead = v.privateMessagesLastRead;
      let lastRead = currMessagesLastRead.find(
        m => String(m.inbox) === String(inbox),
      );

      if (lastRead) {
        currMessagesLastRead = currMessagesLastRead.map(m => {
          if (String(m.inbox) === String(inbox)) m.message = message;
          return m;
        });
      } else currMessagesLastRead = [...currMessagesLastRead, {inbox, message}];

      return {
        ...v,
        privateMessagesLastRead: currMessagesLastRead,
      };
    });
  }

  async function loadPrivateMessages() {
    const privateMessages = await fetchPrivateMessages();
    setContext(v => ({...v, privateMessages}));
  }

  async function sendPrivateMessage(message) {
    await postPrivateMessage(message);
  }

  return {
    ...ctx,
    match: selectedMatch,
    inbox: selectedInbox,
    init,
    handleUpdateName,
    handleSignIn,
    handleSignUp,
    handleSignOut,
    selectMatch,
    getProviders,
    handleCreateMatch,
    handleLeaveMatch,
    handleDeleteMatch,
    handleJoinMatch,
    handleUpdateMatchName,
    handleUpdateMatchProvider,
    handleUpdateMatchSchedule,
    handleUpdateMatchParticipant,
    handleRemoveParticipant,
    handleInviteParticipant,
    handleRejectInvite,
    setMessagesLastRead,
    sendMessage,
    sendAnnouncement,
    announceMessage,
    unAnnounceMessage,
    selectInbox,
    getContact,
    addContact,
    acceptContact,
    setPrivateMessagesLastRead,
    sendPrivateMessage,
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
