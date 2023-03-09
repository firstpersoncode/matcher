import {useCallback, useMemo, useRef, useState} from 'react';
import {View, ScrollView} from 'react-native';
import {Button, Divider, HelperText, Text, useTheme} from 'react-native-paper';
import {
  format,
  isWithinInterval,
  setHours,
  setMinutes,
  startOfDay,
} from 'date-fns';

import {DAY_MAPS} from 'src/utils/constants';
import {useAppContext} from 'src/context/App';
import {useSheetContext} from 'src/context/Sheet';

import SlotPicker from 'src/components/SlotPicker';
import CalendarPicker from 'src/components/CalendarPicker';

export default function EditSchedule() {
  const {matches, handleUpdateMatchSchedule, user} = useAppContext();
  const {hideSheet} = useSheetContext();
  const theme = useTheme();
  const [availability, setAvailability] = useState(null);
  const [date, setDate] = useState(null);
  const [slot, setSlot] = useState(null);
  const [errors, setErrors] = useState({});
  const scrollViewRef = useRef();
  const [calendarLayout, setCalendarLayout] = useState(null);
  const [slotLayout, setSlotLayout] = useState(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const events = useMemo(
    () =>
      matches
        .filter(m => String(m.provider._id) === String(user.match.provider._id))
        .map(m => ({
          _id: m._id,
          title: m.name,
          start: new Date(m.start),
          end: new Date(m.end),
        })),
    [matches, user.match.provider._id],
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
    setSlot({start: slot.start, end: slot.end});
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
      !user.match.provider?.availabilities.find(a => a.day === availability.day)
    )
      errors = {...errors, availability: 'invalid'};

    if (!date) errors = {...errors, date: 'required'};
    else if (format(date, 'iii').toLowerCase() !== availability?.day)
      errors = {...errors, date: 'invalid'};

    if (!(slot.start && slot.end)) errors = {...errors, slot: 'required'};
    else {
      const withinAvailability =
        isWithinAvailability(new Date(slot.start)) &&
        isWithinAvailability(new Date(slot.end));

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
      await handleUpdateMatchSchedule(slot);
      hideSheet();
    } catch (err) {
      console.error(err.message || err);
    }
    setIsSubmitting(false);
  }

  return (
    <View style={{height: '100%'}}>
      <View
        style={{
          padding: 16,
          paddingBottom: 8,
          flexDirection: 'row',
          alignItems: 'center',
        }}>
        {date && (
          <Text variant="titleLarge">
            {format(new Date(date), 'dd MMM yyyy')}
          </Text>
        )}
      </View>
      <Divider />
      <ScrollView ref={scrollViewRef} style={{padding: 16, marginBottom: 16}}>
        {user.match.provider.availabilities.map((a, i) => {
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
    </View>
  );
}
