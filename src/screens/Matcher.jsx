import {useCallback, useEffect, useMemo, useRef, useState} from 'react';
import {FlatList, RefreshControl, ScrollView, View} from 'react-native';
import {
  FAB,
  IconButton,
  useTheme,
  TextInput,
  HelperText,
  Button,
  Divider,
} from 'react-native-paper';
import {useNavigation} from '@react-navigation/native';
import {
  format,
  isWithinInterval,
  setHours,
  setMinutes,
  startOfDay,
} from 'date-fns';

import {useAppContext} from 'src/context/App';
import {useSheetContext} from 'src/context/Sheet';
import MatchCard from 'src/components/MatchCard';
import ProviderCard from 'src/components/ProviderCard';
import Counter from 'src/components/Counter';
import SlotPicker from 'src/components/SlotPicker';
import CalendarPicker from 'src/components/CalendarPicker';
import {DAY_MAPS} from 'src/utils/constants';

export default function Matcher() {
  const {user, matches, init} = useAppContext();
  const {displaySheet, hideSheet} = useSheetContext();
  const navigation = useNavigation();
  const theme = useTheme();
  const [isRefreshing, setIsRefreshing] = useState(false);
  const normalizedMatches = useMemo(() => {
    if (!user?.match) return matches;
    let selectedMatch = matches.find(
      m => String(m._id) === String(user.match._id),
    );
    if (selectedMatch)
      return [selectedMatch].concat(
        matches.filter(m => String(m._id) !== String(selectedMatch._id)),
      );

    return matches;
  }, [user?.match, matches]);

  async function onRefresh() {
    setIsRefreshing(true);
    await init();
    setIsRefreshing(false);
  }

  function selectMatch(match) {
    return function () {
      navigation.navigate('Match', {name: match.name, matchRef: match._id});
    };
  }

  function openMatchCreator() {
    displaySheet(<MatchCreator onClose={hideSheet} />, '70%');
  }

  return (
    <>
      <FlatList
        refreshControl={
          <RefreshControl refreshing={isRefreshing} onRefresh={onRefresh} />
        }
        data={normalizedMatches}
        renderItem={({item}) => (
          <MatchCard match={item} onPress={selectMatch(item)} />
        )}
        keyExtractor={item => item._id}
      />

      {Boolean(user && !user.match) && (
        <FAB
          color="#FFF"
          icon="plus"
          style={{
            position: 'absolute',
            margin: 16,
            right: 0,
            bottom: 0,
            backgroundColor: theme.colors.primary,
            borderRadius: 100,
          }}
          onPress={openMatchCreator}
        />
      )}
    </>
  );
}

function MatchCreator({onClose}) {
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
          onClose={onClose}
        />
      );
    default:
      return null;
  }
}

function FormParticipant({form, onChangeForm, setStep}) {
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

function FormProvider({onChangeForm, setStep}) {
  const {providers, getProviders} = useAppContext();

  useEffect(() => {
    if (!providers.length) loadProviders();
  }, [providers.length]);

  async function loadProviders() {
    try {
      await getProviders();
    } catch (err) {
      console.error(err.message || err);
    }
  }

  function onBack() {
    setStep(1);
  }

  function selectProvider(provider) {
    return function () {
      onChangeForm('provider', provider);
      setStep(3);
    };
  }

  return (
    <>
      <IconButton icon="arrow-left" onPress={onBack} />
      <Divider />
      <FlatList
        data={providers}
        renderItem={({item}) => (
          <ProviderCard provider={item} onPress={selectProvider(item)} />
        )}
        keyExtractor={item => item._id}
      />
    </>
  );
}

function FormScheduler({form, onChangeForm, onClose, setStep}) {
  const {matches, handleCreateMatch} = useAppContext();
  const theme = useTheme();
  const [availability, setAvailability] = useState(null);
  const [date, setDate] = useState(new Date());
  const [errors, setErrors] = useState({});
  const scrollViewRef = useRef();
  const [calendarLayout, setCalendarLayout] = useState(null);
  const [slotLayout, setSlotLayout] = useState(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  function onBack() {
    setStep(2);
  }

  const events = useMemo(
    () =>
      matches
        .filter(m => String(m.provider._id) === String(form.provider?._id))
        .map(m => ({
          _id: m._id,
          title: m.name,
          start: new Date(m.start),
          end: new Date(m.end),
        })),
    [matches, form.provider?._id],
  );

  const disableDay = useCallback(
    date => {
      const day = format(new Date(date), 'iii').toLowerCase();
      return day !== availability?.day;
    },
    [availability?.day],
  );

  const disableSlot = useCallback(
    slot => {
      if (!date) return true;

      let slotDate = setHours(startOfDay(new Date(date)), slot.split(':')[0]);
      slotDate = setMinutes(slotDate, slot.split(':')[1]);

      return !isWithinAvailability(slotDate);
    },
    [date],
  );

  function selectAvailability(a) {
    return function () {
      setAvailability(a);
      setErrors(v => ({...v, availability: undefined}));
      scrollViewRef.current?.scrollTo({
        x: 0,
        y: calendarLayout?.y,
        animated: true,
      });
    };
  }

  function onChangeDate(date) {
    setDate(date);
    setErrors(v => ({...v, date: undefined}));
    scrollViewRef.current?.scrollTo({
      x: 0,
      y: slotLayout?.y,
      animated: true,
    });
  }

  function onSelectSlot(slot) {
    onChangeForm('start', slot.start);
    onChangeForm('end', slot.end);
    setErrors(v => ({...v, slot: undefined}));
  }

  function isWithinAvailability(d) {
    if (!(availability && date && d)) return false;

    let startHour = setHours(
      startOfDay(new Date(date)),
      availability.start.split(':')[0],
    );

    startHour = setMinutes(startHour, availability.start.split(':')[1]);

    let endHour = setHours(
      startOfDay(new Date(date)),
      availability.end.split(':')[0],
    );

    endHour = setMinutes(endHour, availability.end.split(':')[1]);

    return isWithinInterval(new Date(d), {
      start: startHour,
      end: endHour,
    });
  }

  function validate() {
    let errors = {};

    if (!availability) errors = {...errors, availability: 'required'};
    else if (
      !form.provider?.availabilities.find(a => a.day === availability.day)
    )
      errors = {...errors, availability: 'invalid'};

    if (!date) errors = {...errors, date: 'required'};
    else if (format(date, 'iii').toLowerCase() !== availability?.day)
      errors = {...errors, date: 'invalid'};

    if (!(form.start && form.end)) errors = {...errors, slot: 'required'};
    else {
      const withinAvailability =
        isWithinAvailability(new Date(form.start)) &&
        isWithinAvailability(new Date(form.end));

      if (!withinAvailability) errors = {...errors, slot: 'invalid'};
    }

    setErrors(errors);

    return errors;
  }

  async function handleSubmit() {
    const isValid = !Object.keys(validate()).length;
    if (!isValid) return;

    setIsSubmitting(true);
    try {
      await handleCreateMatch({...form, providerRef: form.provider._id});
      onClose();
    } catch (err) {
      console.error(err.message || err);
    }
    setIsSubmitting(false);
  }

  return (
    <>
      <IconButton icon="arrow-left" onPress={onBack} />
      <Divider />
      <ScrollView ref={scrollViewRef} style={{padding: 16}}>
        {form.provider.availabilities.map((a, i) => {
          const selected = a.day === availability?.day;

          return (
            <Button
              key={i}
              onPress={selectAvailability(a)}
              mode="elevated"
              buttonColor={
                selected ? theme.colors.primaryContainer : theme.colors.surface
              }
              textColor={
                selected
                  ? theme.colors.onPrimaryContainer
                  : theme.colors.onSurface
              }
              style={{marginBottom: 16}}>
              {DAY_MAPS[a.day]} {a.start} - {a.end}
            </Button>
          );
        })}
        <HelperText type="error" visible={Boolean(errors.availability)}>
          {errors.availability}
        </HelperText>
        <Divider />
        <View onLayout={e => setCalendarLayout(e.nativeEvent.layout)}>
          <CalendarPicker
            minDate={new Date()}
            selectedDate={date}
            onChangeDate={onChangeDate}
            disableDay={disableDay}
            events={events}
          />
          <HelperText type="error" visible={Boolean(errors.date)}>
            {errors.date}
          </HelperText>
        </View>
        <Divider style={{marginBottom: 16}} />
        <View onLayout={e => setSlotLayout(e.nativeEvent.layout)}>
          <SlotPicker
            events={events}
            selectedDate={date}
            onSelectSlot={onSelectSlot}
            disableSlot={disableSlot}
          />
          <HelperText type="error" visible={Boolean(errors.slot)}>
            {errors.slot}
          </HelperText>
        </View>
        <Button
          disabled={isSubmitting}
          style={{marginBottom: 32}}
          mode="contained"
          onPress={handleSubmit}>
          Submit
        </Button>
      </ScrollView>
    </>
  );
}
