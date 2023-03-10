import {useMemo, useState} from 'react';
import {ScrollView, View} from 'react-native';
import {Button} from 'react-native-paper';

import {useAppContext} from 'src/context/App';
import {useSheetContext} from 'src/context/Sheet';

import Counter from 'src/components/Counter';

export default function EditParticipant() {
  const {user, match, handleUpdateMatchParticipant} = useAppContext();
  const {hideSheet} = useSheetContext();
  const [form, setForm] = useState({
    count: match.count,
    pcount: match.participants.find(
      p => String(p.participant._id) === String(user._id),
    ).count,
  });
  const [errors, setErrors] = useState({});
  const [isSubmitting, setIsSubmitting] = useState(false);

  const joinedCount = useMemo(
    () => match.participants.map(p => p.count).reduce((sum, a) => sum + a, 0),
    [match.participants],
  );

  function handleDecrement(field) {
    return function (value) {
      setForm(v => ({...v, [field]: value}));
      setErrors(v => ({...v, count: undefined, pcount: undefined}));
    };
  }

  function handleIncrement(field) {
    return function (value) {
      setForm(v => ({...v, [field]: value}));
      setErrors(v => ({...v, count: undefined, pcount: undefined}));
    };
  }

  function validate() {
    let errors = {};

    if (!form.count) errors = {...errors, count: 'required'};
    else if (form.count < form.pcount) errors = {...errors, count: 'invalid'};

    if (!form.pcount) errors = {...errors, pcount: 'required'};
    else if (form.pcount > form.count) errors = {...errors, pcount: 'invalid'};

    setErrors(errors);

    return errors;
  }

  async function handleSubmit() {
    const isValid = !Object.keys(validate()).length;
    if (!isValid) return;

    setIsSubmitting(true);
    try {
      await handleUpdateMatchParticipant(form);
      hideSheet();
    } catch (err) {
      console.error(err.message || err);
    }
    setIsSubmitting(false);
  }

  return (
    <ScrollView style={{padding: 16}} keyboardShouldPersistTaps="handled">
      <View style={{marginBottom: 16}}>
        <Counter
          label="Needed"
          min={joinedCount}
          value={form.count}
          onDecrement={handleDecrement('count')}
          onIncrement={handleIncrement('count')}
          error={errors.count}
        />
      </View>
      <View style={{marginBottom: 16}}>
        <Counter
          label="Available"
          value={form.pcount}
          onDecrement={handleDecrement('pcount')}
          onIncrement={handleIncrement('pcount')}
          error={errors.pcount}
        />
      </View>
      <Button disabled={isSubmitting} mode="contained" onPress={handleSubmit}>
        Update
      </Button>
    </ScrollView>
  );
}
