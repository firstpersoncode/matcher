import {useCallback, useMemo, useRef, useState} from 'react';
import {ScrollView, View} from 'react-native';
import {
  IconButton,
  useTheme,
  HelperText,
  Button,
  Divider,
} from 'react-native-paper';
import {
  format,
  isWithinInterval,
  setHours,
  setMinutes,
  startOfDay,
} from 'date-fns';

import {useAppContext} from 'src/context/App';
import {DAY_MAPS} from 'src/utils/constants';

import SlotPicker from './SlotPicker';
import CalendarPicker from './CalendarPicker';
import {useSheetContext} from 'src/context/Sheet';

export default function FormScheduler({form, onChangeForm, setStep}) {
  const {matches, handleCreateMatch} = useAppContext();
  const {hideSheet} = useSheetContext();
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
      hideSheet();
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
