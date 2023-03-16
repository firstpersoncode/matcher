import {View} from 'react-native';
import {
  Card,
  HelperText,
  IconButton,
  Text,
  TextInput,
} from 'react-native-paper';

export default function Counter({
  min = 0,
  max = 20,
  label,
  value,
  onDecrement,
  onIncrement,
  error = false,
}) {
  function handleDecrement() {
    let currValue = Number(value);
    let newValue = currValue > min ? currValue - 1 : min;
    onDecrement && onDecrement(newValue);
  }

  function handleIncrement() {
    let currValue = Number(value);
    let newValue = currValue < max ? currValue + 1 : max;
    onIncrement && onIncrement(newValue);
  }

  return (
    <Card style={{padding: 16}}>
      <View
        style={{
          flexDirection: 'row',
          justifyContent: 'space-between',
        }}>
        <Text style={{fontSize: 12}} variant="titleMedium">
          {label}
        </Text>
        <View style={{flexDirection: 'row'}}>
          <IconButton
            size={16}
            mode="contained"
            icon="minus"
            onPress={handleDecrement}
          />
          <View>
            <TextInput
              mode="outlined"
              editable={false}
              value={String(value)}
              error={Boolean(error)}
              style={{fontSize: 12}}
            />
            <HelperText type="error" visible={Boolean(error)}>
              {error}
            </HelperText>
          </View>
          <IconButton
            size={16}
            mode="contained"
            icon="plus"
            onPress={handleIncrement}
          />
        </View>
      </View>
    </Card>
  );
}
