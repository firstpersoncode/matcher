import {FAB, useTheme} from 'react-native-paper';
import {useAppContext} from 'src/context/App';
import {useModalContext} from 'src/context/Modal';
import {useSheetContext} from 'src/context/Sheet';
import Auth from 'src/components/Auth';

import FormParticipant from './FormParticipant';
import FormProvider from './FormProvider';
import FormScheduler from './FormScheduler';

export default function MatcherCreator() {
  const {user} = useAppContext();
  const {displaySheetRoute} = useSheetContext();
  const {displayModal} = useModalContext();
  const theme = useTheme();

  function openMatchCreator() {
    if (!user) return displayModal({content: <Auth />});
    displaySheetRoute({
      routes: [
        {
          name: 'participant',
          component: FormParticipant,
        },
        {
          name: 'provider',
          component: FormProvider,
        },
        {
          name: 'schedule',
          component: FormScheduler,
        },
      ],
      initialRoute: 'participant',
      state: {
        name: '',
        count: 0,
        pcount: 0,
        provider: null,
        start: null,
        end: null,
      },
    });
  }

  return (
    <FAB
      mode="flat"
      color="#FFF"
      icon="plus"
      style={{
        position: 'absolute',
        right: 0,
        bottom: 0,
        backgroundColor: theme.colors.primary,
        borderRadius: 100,
        margin: 16,
      }}
      onPress={openMatchCreator}
    />
  );
}
