import {useState} from 'react';
import {ScrollView} from 'react-native';
import {Button, HelperText, TextInput, useTheme} from 'react-native-paper';

import validateEmail from 'src/utils/validateEmail';

export default function SignInForm({onSubmit, onSignIn}) {
  const theme = useTheme();
  const [form, setForm] = useState({
    name: '',
    email: '',
    password: '',
    cpassword: '',
  });
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
    if (!form.name) errs = {...errs, name: 'Required'};
    if (!form.email) errs = {...errs, email: 'Required'};
    else if (!validateEmail(form.email))
      errs = {...errs, email: 'Invalid format'};
    if (!form.password) errs = {...errs, password: 'Required'};
    if (!form.cpassword) errs = {...errs, cpassword: 'Required'};
    if (form.password !== form.cpassword)
      errs = {...errs, password: 'Invalid', cpassword: 'Invalid'};
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
        mode="outlined"
        label="Name"
        value={form.name}
        onChangeText={handleChange('name')}
        maxLength={50}
        right={<TextInput.Affix text={`${String(form.name.length)}/50`} />}
        error={Boolean(errors.name)}
      />
      <HelperText type="error" visible={Boolean(errors.name)}>
        {errors.name}
      </HelperText>
      <TextInput
        mode="outlined"
        keyboardType="email-address"
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
      <TextInput
        mode="outlined"
        label="Confirm Password"
        secureTextEntry={!showPassword}
        value={form.cpassword}
        onChangeText={handleChange('cpassword')}
        error={Boolean(errors.cpassword)}
        right={<TextInput.Icon icon="eye" onPress={handleClickShowPassword} />}
        onSubmitEditing={handleSubmitForm}
      />
      <HelperText type="error" visible={Boolean(errors.cpassword)}>
        {errors.cpassword}
      </HelperText>
      <Button
        mode="elevated"
        buttonColor={theme.colors.primary}
        textColor={theme.colors.onPrimary}
        disabled={isSubmitted}
        onPress={handleSubmitForm}>
        Submit
      </Button>
      <Button disabled={isSubmitted} onPress={onSignIn}>
        Sign In
      </Button>
    </ScrollView>
  );
}
