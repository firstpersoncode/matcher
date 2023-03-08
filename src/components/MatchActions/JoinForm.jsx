import {useState} from 'react';
import {View} from 'react-native';
import {Button} from 'react-native-paper';

import Counter from 'src/components/Counter';

export default function JoinForm({maxJoined, onSubmit}) {
  const [value, setValue] = useState(1);
  const [isSubmitting, setIsSubmitting] = useState(false);

  function onCountChange(v) {
    setValue(v);
  }

  async function handleSubmit() {
    setIsSubmitting(true);
    try {
      await onSubmit(value);
    } catch (err) {
      console.error(err.message || err);
    }
    setIsSubmitting(false);
  }

  return (
    <View style={{padding: 16}}>
      <Counter
        label="Player"
        min={1}
        max={maxJoined}
        value={value}
        onDecrement={onCountChange}
        onIncrement={onCountChange}
      />

      <Button disabled={isSubmitting} mode="contained" onPress={handleSubmit}>
        Join
      </Button>
    </View>
  );
}
