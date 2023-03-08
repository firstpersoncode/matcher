import {createContext, useContext, useState} from 'react';
import ActionSheet, {
  registerSheet,
  SheetManager,
} from 'react-native-actions-sheet';
import {SafeAreaView} from 'react-native-safe-area-context';

const SHEET_ID = 'global-sheet';
const SHEET_ROUTE_ID = 'global-sheet-route';

const sheetContext = {
  visible: false,
  content: null,
  routes: [],
  initialRoute: '',
  height: '50%',
  state: {},
};

function useSheetState() {
  const [ctx, setContext] = useState(sheetContext);

  function displaySheet({content, height = '50%', state = {}}) {
    setContext(v => ({
      ...v,
      visible: true,
      content,
      height,
      state,
    }));
    SheetManager.show(SHEET_ID);
  }

  function hideSheet() {
    SheetManager.hide(SHEET_ID);
    setContext(v => ({...v, visible: false, content: null}));
  }

  function displaySheetRoute({
    routes,
    initialRoute,
    height = '50%',
    state = {},
  }) {
    setContext(v => ({
      ...v,
      visible: true,
      routes,
      initialRoute,
      height,
      state,
    }));
    SheetManager.show(SHEET_ROUTE_ID);
  }

  function hideSheetRoute() {
    SheetManager.hide(SHEET_ROUTE_ID);
    setContext(v => ({
      ...v,
      visible: false,
      routes: [],
      initialRoute: '',
    }));
  }

  function setSheetState(field, value) {
    setContext(v => ({...v, state: {...v.state, [field]: value}}));
  }

  function cleanSheetState() {
    setContext(v => ({...v, state: {}}));
  }

  return {
    ...ctx,
    displaySheet,
    hideSheet,
    displaySheetRoute,
    hideSheetRoute,
    setSheetState,
    cleanSheetState,
  };
}

const SheetContext = createContext(sheetContext);

export function useSheetContext() {
  return useContext(SheetContext);
}

export default function SheetContextProvider({children}) {
  const sheetContext = useSheetState();

  return (
    <SheetContext.Provider value={sheetContext}>
      {children}
    </SheetContext.Provider>
  );
}

function Sheet({sheetId}) {
  const {height, content} = useSheetContext();

  return (
    <ActionSheet id={sheetId} containerStyle={{height}}>
      <SafeAreaView>{content}</SafeAreaView>
    </ActionSheet>
  );
}

function SheetRoute({sheetId}) {
  const {height, routes, initialRoute} = useSheetContext();

  return (
    <ActionSheet
      id={sheetId}
      containerStyle={{height}}
      enableRouterBackNavigation={true}
      routes={routes}
      initialRoute={initialRoute}
    />
  );
}

registerSheet(SHEET_ID, Sheet);
registerSheet(SHEET_ROUTE_ID, SheetRoute);
