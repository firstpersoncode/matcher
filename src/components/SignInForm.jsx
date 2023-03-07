import {useState} from 'react';
import {ScrollView} from 'react-native';
import {Button, HelperText, TextInput, useTheme} from 'react-native-paper';

import validateEmail from 'src/utils/validateEmail';

export default function SignInForm({onSubmit, onSignUp}) {
  const theme = useTheme();
  const [form, setForm] = useState({email: '', password: ''});
  const [errors, setErrors] = useState({});
  const [showPassword, setShowPassword] = useState(false);
  const [isSubmitted, setIsSubmitted] = useState(false);

  function handleChange(field) {
    return function (value) {
      setForm(v => ({...v, [field]: value}));
      setErrors(v => ({...v, [field]: undefined}));
    };
  }

  function handleClickShowPassword() {
    setShowPassword(show => !show);
  }

  function validateForm() {
    let errs = {};
    if (!form.email) errs = {...errs, email: 'Required'};
    else if (!validateEmail(form.email))
      errs = {...errs, email: 'Invalid format'};
    if (!form.password) errs = {...errs, password: 'Required'};
    setErrors(errs);
    return errs;
  }

  async function handleSubmitForm() {
    const validation = validateForm();
    const isValid = !Object.keys(validation).length;
    if (!isValid) return;
    setIsSubmitted(true);
    await onSubmit(form);
    setIsSubmitted(false);
  }

  return (
    <ScrollView keyboardShouldPersistTaps="handled">
      <TextInput
        keyboardType="email-address"
        autoComplete="email"
        mode="outlined"
        label="Email"
        value={form.email}
        onChangeText={handleChange('email')}
        error={Boolean(errors.email)}
      />
      <HelperText type="error" visible={Boolean(errors.email)}>
        {errors.email}
      </HelperText>
      <TextInput
        mode="outlined"
        label="Password"
        secureTextEntry={!showPassword}
        value={form.password}
        onChangeText={handleChange('password')}
        error={Boolean(errors.password)}
        right={<TextInput.Icon icon="eye" onPress={handleClickShowPassword} />}
        onSubmitEditing={handleSubmitForm}
      />
      <HelperText type="error" visible={Boolean(errors.password)}>
        {errors.password}
      </HelperText>
      <Button
        mode="elevated"
        buttonColor={theme.colors.primary}
        textColor={theme.colors.onPrimary}
        disabled={isSubmitted}
        onPress={handleSubmitForm}>
        Submit
      </Button>
      <Button disabled={isSubmitted} onPress={onSignUp}>
        Sign Up
      </Button>
    </ScrollView>
  );
}
