import {createContext, useContext, useState} from 'react';
import {View} from 'react-native';
import {Divider, IconButton, Modal} from 'react-native-paper';

const modalContext = {
  visible: false,
  content: null,
};

function useModalState() {
  const [ctx, setContext] = useState(modalContext);

  function displayModal(content) {
    setContext({visible: true, content});
  }

  function hideModal() {
    setContext({visible: false, content: null});
  }

  return {
    ...ctx,
    displayModal,
    hideModal,
  };
}

const ModalContext = createContext(modalContext);

export function useModalContext() {
  return useContext(ModalContext);
}

export default function ModalContextProvider({children}) {
  const modalContext = useModalState();

  return (
    <ModalContext.Provider value={modalContext}>
      {children}
      <Modal
        style={{margin: 16, zIndex: 10000}}
        visible={modalContext.visible}
        onDismiss={modalContext.hideModal}>
        {/* <View
          style={{
            backgroundColor: '#fff',
            alignItems: 'flex-end',
          }}>
          <IconButton icon="close" onPress={modalContext.hideModal} />
        </View>
        <Divider /> */}
        {modalContext.content}
      </Modal>
    </ModalContext.Provider>
  );
}
