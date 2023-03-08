import {useEffect, useState} from 'react';
import {ScrollView, View} from 'react-native';
import {useSheetRouter} from 'react-native-actions-sheet';
import {TextInput, HelperText, Button} from 'react-native-paper';
import {useSheetContext} from 'src/context/Sheet';

import Counter from './Counter';

export default function FormParticipant() {
  const {state, setSheetState} = useSheetContext();
  const route = useSheetRouter();
  const [errors, setErrors] = useState({});

  function handleChangeName(text) {
    setSheetState('name', text);
    setErrors(v => ({...v, name: undefined}));
  }

  function handleDecrement(field) {
    return function (value) {
      setSheetState(field, value);
      setErrors(v => ({...v, count: undefined, pcount: undefined}));
    };
  }

  function handleIncrement(field) {
    return function (value) {
      setSheetState(field, value);
      setErrors(v => ({...v, count: undefined, pcount: undefined}));
    };
  }

  function validate() {
    let errors = {};

    if (!state.name) errors = {...errors, name: 'required'};
    if (!state.count) errors = {...errors, count: 'required'};
    else if (state.count < state.pcount) errors = {...errors, count: 'invalid'};

    if (!state.pcount) errors = {...errors, pcount: 'required'};
    else if (state.pcount > state.count)
      errors = {...errors, pcount: 'invalid'};

    setErrors(errors);

    return errors;
  }

  function handleSubmit() {
    const isValid = !Object.keys(validate()).length;
    if (!isValid) return;

    route.navigate('provider');
  }

  return (
    <ScrollView style={{padding: 16}} keyboardShouldPersistTaps="handled">
      <TextInput
        label="Name"
        mode="outlined"
        value={state.name}
        onChangeText={handleChangeName}
        maxLength={50}
        right={<TextInput.Affix text={`${String(state.name.length)}/50`} />}
        error={Boolean(errors.name)}
      />
      <HelperText type="error" visible={Boolean(errors.name)}>
        {errors.name}
      </HelperText>

      <Counter
        label="Needed"
        value={state.count}
        onDecrement={handleDecrement('count')}
        onIncrement={handleIncrement('count')}
        error={errors.count}
      />

      <Counter
        label="Available"
        value={state.pcount}
        onDecrement={handleDecrement('pcount')}
        onIncrement={handleIncrement('pcount')}
        error={errors.pcount}
      />

      <Button mode="contained" onPress={handleSubmit}>
        Continue
      </Button>
    </ScrollView>
  );
}
