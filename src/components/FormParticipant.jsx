import {useState} from 'react';
import {View} from 'react-native';
import {TextInput, HelperText, Button} from 'react-native-paper';

import Counter from './Counter';

export default function FormParticipant({form, onChangeForm, setStep}) {
  const [errors, setErrors] = useState({});

  function handleChangeName(text) {
    onChangeForm('name', text);
    setErrors(v => ({...v, name: undefined}));
  }

  function handleDecrement(field) {
    return function (value) {
      onChangeForm(field, value);
      setErrors(v => ({...v, count: undefined, pcount: undefined}));
    };
  }

  function handleIncrement(field) {
    return function (value) {
      onChangeForm(field, value);
      setErrors(v => ({...v, count: undefined, pcount: undefined}));
    };
  }

  function validate() {
    let errors = {};

    if (!form.name) errors = {...errors, name: 'required'};
    if (!form.count) errors = {...errors, count: 'required'};
    else if (form.count < form.pcount) errors = {...errors, count: 'invalid'};

    if (!form.pcount) errors = {...errors, pcount: 'required'};
    else if (form.pcount > form.count) errors = {...errors, pcount: 'invalid'};

    setErrors(errors);

    return errors;
  }

  function handleSubmit() {
    const isValid = !Object.keys(validate()).length;
    if (!isValid) return;

    setStep(2);
  }

  return (
    <View style={{padding: 16}}>
      <TextInput
        label="Name"
        mode="outlined"
        value={form.name}
        onChangeText={handleChangeName}
        error={Boolean(errors.name)}
      />
      <HelperText type="error" visible={Boolean(errors.name)}>
        {errors.name}
      </HelperText>

      <Counter
        label="Needed"
        value={form.count}
        onDecrement={handleDecrement('count')}
        onIncrement={handleIncrement('count')}
        error={errors.count}
      />

      <Counter
        label="Available"
        value={form.pcount}
        onDecrement={handleDecrement('pcount')}
        onIncrement={handleIncrement('pcount')}
        error={errors.pcount}
      />

      <Button mode="contained" onPress={handleSubmit}>
        Continue
      </Button>
    </View>
  );
}
