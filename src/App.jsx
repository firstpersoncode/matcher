import {NavigationContainer} from '@react-navigation/native';
import {Provider as PaperProvider} from 'react-native-paper';
import {SheetProvider} from 'react-native-actions-sheet';
import {SafeAreaProvider} from 'react-native-safe-area-context';

import AppContextProvider from './context/App';
import ModalContextProvider from './context/Modal';
import SheetContextProvider from './context/Sheet';
import theme from './utils/theme';
import Screens from './screens';

export default function App() {
  return (
    <NavigationContainer>
      <PaperProvider theme={theme}>
        <AppContextProvider>
          <ModalContextProvider>
            <SheetContextProvider>
              <SheetProvider>
                <SafeAreaProvider>
                  <Screens />
                </SafeAreaProvider>
              </SheetProvider>
            </SheetContextProvider>
          </ModalContextProvider>
        </AppContextProvider>
      </PaperProvider>
    </NavigationContainer>
  );
}
