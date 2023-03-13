import {createContext, useContext, useState} from 'react';
import {View} from 'react-native';
import {Divider, IconButton, Modal, Portal} from 'react-native-paper';

const modalContext = {
  visible: false,
  content: null,
  portal: false,
};

function useModalState() {
  const [ctx, setContext] = useState(modalContext);

  function displayModal({content, portal = false}) {
    setContext({visible: !portal, portal, content});
  }

  function hideModal() {
    setContext({visible: false, portal: false, content: null});
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
      <Dialog />
    </ModalContext.Provider>
  );
}

function Dialog() {
  const {visible, hideModal, portal, content} = useModalContext();

  return (
    <>
      <DialogModal visible={visible} content={content} hideModal={hideModal} />
      <Portal>
        <DialogModal visible={portal} content={content} hideModal={hideModal} />
      </Portal>
    </>
  );
}

function DialogModal({visible, content, hideModal}) {
  return (
    <Modal
      contentContainerStyle={{
        margin: 16,
        zIndex: 99999,
        borderRadius: 15,
        overflow: 'hidden',
      }}
      visible={visible}
      onDismiss={hideModal}>
      <View
        style={{
          backgroundColor: '#fff',
          alignItems: 'flex-end',
        }}>
        <IconButton
          style={{margin: 2}}
          size={15}
          icon="close"
          onPress={hideModal}
        />
      </View>
      <Divider />
      {content}
    </Modal>
  );
}
