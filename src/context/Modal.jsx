import {createContext, useContext, useState} from 'react';

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
    </ModalContext.Provider>
  );
}
