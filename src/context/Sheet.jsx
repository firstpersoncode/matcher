import {createContext, useContext, useState} from 'react';
import ActionSheet, {
  registerSheet,
  SheetManager,
} from 'react-native-actions-sheet';

const SHEET_ID = 'global-sheet';

const sheetContext = {
  visible: false,
  content: null,
  height: '50%',
};

function useSheetState() {
  const [ctx, setContext] = useState();

  function displaySheet(content, height = '50%') {
    setContext(v => ({...v, visible: true, content, height}));
    SheetManager.show(SHEET_ID);
  }

  function hideSheet() {
    SheetManager.hide(SHEET_ID);
    setContext(v => ({...v, visible: false, content: null}));
  }

  return {
    ...ctx,
    displaySheet,
    hideSheet,
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
      {content}
    </ActionSheet>
  );
}

registerSheet(SHEET_ID, Sheet);
