import {useState} from 'react';

import FormParticipant from './FormParticipant';
import FormProvider from './FormProvider';
import FormScheduler from './FormScheduler';

export default function MatchCreator() {
  const [form, setForm] = useState({
    name: '',
    count: 0,
    pcount: 0,
    provider: null,
    start: null,
    end: null,
  });

  const [step, setStep] = useState(1);

  function onChangeForm(field, value) {
    setForm(v => ({...v, [field]: value}));
  }

  switch (step) {
    case 1:
      return (
        <FormParticipant
          form={form}
          onChangeForm={onChangeForm}
          setStep={setStep}
        />
      );
    case 2:
      return <FormProvider onChangeForm={onChangeForm} setStep={setStep} />;
    case 3:
      return (
        <FormScheduler
          form={form}
          onChangeForm={onChangeForm}
          setStep={setStep}
        />
      );
    default:
      return null;
  }
}
