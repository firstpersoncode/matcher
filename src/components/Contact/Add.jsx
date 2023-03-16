import {Image, View, Pressable} from 'react-native';
import {
  Divider,
  IconButton,
  Menu,
  ProgressBar,
  Searchbar,
  Text,
  useTheme,
} from 'react-native-paper';

import {useAppContext} from 'src/context/App';
import {useEffect, useRef, useState} from 'react';
import {useSheetContext} from 'src/context/Sheet';

export default function Add() {
  const {getContact, addContact} = useAppContext();
  const {hideSheet} = useSheetContext();
  const theme = useTheme();
  const inputRef = useRef();
  const timeoutRef = useRef();
  const [idString, setIdString] = useState('');
  const [result, setResult] = useState(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [visibleMenu, setVisibleMenu] = useState(false);

  useEffect(() => {
    if (timeoutRef.current) clearTimeout(timeoutRef.current);
    timeoutRef.current = setTimeout(() => {
      inputRef.current?.focus();
    }, 50);
    return () => {
      timeoutRef.current && clearTimeout(timeoutRef.current);
      inputRef.current?.blur();
    };
  }, []);

  function onChange(text) {
    setIdString(text);
  }

  async function onSubmit() {
    if (isSubmitting) return;
    if (!Boolean(idString.trim())) return;

    inputRef.current?.blur();
    setIsSubmitting(true);
    try {
      let contact = await getContact(idString);
      setResult(contact);
    } catch (err) {
      console.error(err.message || err);
    }
    setIsSubmitting(false);
  }

  function toggleVisibleMenu() {
    setVisibleMenu(v => !v);
  }

  async function onAdd() {
    setIsSubmitting(true);
    try {
      await addContact({contactRef: result._id});
      hideSheet();
      setVisibleMenu(false);
      setResult(null);
    } catch (err) {
      console.error(err.message || err);
    }
    setIsSubmitting(false);
  }

  return (
    <View style={{padding: 16, paddingBottom: 32}}>
      <View
        style={{flexDirection: 'row', alignItems: 'center', marginBottom: 16}}>
        <Searchbar
          clearButtonMode="never"
          clearIcon={() => null}
          ref={inputRef}
          style={{
            flex: 1,
            height: 40,
            backgroundColor: '#FFF',
            borderWidth: 1,
            borderColor: theme.colors.secondary,
            marginRight: 16,
          }}
          inputStyle={{fontSize: 12}}
          placeholder="User ID"
          value={idString}
          onChangeText={onChange}
          onSubmitEditing={onSubmit}
        />
        <IconButton
          style={{margin: 0}}
          disabled={isSubmitting}
          icon="magnify"
          mode="contained"
          onPress={onSubmit}
        />
      </View>
      <Divider />
      {isSubmitting && <ProgressBar indeterminate />}
      <Text variant="labelLarge" style={{marginVertical: 16}}>
        Result:
      </Text>
      {result && (
        <Menu
          visible={visibleMenu}
          onDismiss={toggleVisibleMenu}
          anchor={
            <Pressable
              onPress={toggleVisibleMenu}
              style={{
                flexDirection: 'row',
                alignItems: 'center',
                padding: 16,
                backgroundColor: theme.colors.secondaryContainer,
                borderRadius: 10,
              }}>
              <Image
                resizeMode="stretch"
                style={{width: 30, height: 30, marginRight: 16}}
                source={require('../../assets/avatar.png')}
              />
              <Text>{result.name}</Text>
            </Pressable>
          }>
          <Menu.Item title="Add Contact" onPress={onAdd} />
        </Menu>
      )}
    </View>
  );
}
