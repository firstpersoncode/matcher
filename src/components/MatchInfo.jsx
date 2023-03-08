import {useCallback, useEffect, useMemo, useRef, useState} from 'react';
import {
  View,
  ScrollView,
  Linking,
  RefreshControl,
  FlatList,
} from 'react-native';
import {
  Button,
  Card,
  Divider,
  HelperText,
  IconButton,
  Searchbar,
  Text,
  TextInput,
  useTheme,
} from 'react-native-paper';
import Hyperlink from 'react-native-hyperlink';
import {useRoute} from '@react-navigation/native';
import {
  format,
  isWithinInterval,
  setHours,
  setMinutes,
  startOfDay,
} from 'date-fns';
import {useSheetRouter} from 'react-native-actions-sheet';

import {DAY_MAPS} from 'src/utils/constants';
import {useAppContext} from 'src/context/App';
import {useModalContext} from 'src/context/Modal';
import {useSheetContext} from 'src/context/Sheet';

import SlotPicker from './SlotPicker';
import CalendarPicker from './CalendarPicker';
import Map from './Map';
import ProviderCard from './ProviderCard';

export default function MatchInfo() {
  const {user, matches} = useAppContext();
  const {displayModal} = useModalContext();
  const {displaySheet, displaySheetRoute} = useSheetContext();

  const theme = useTheme();
  const route = useRoute();
  const match = useMemo(
    () => matches.find(m => String(m._id) === String(route.params.matchRef)),
    [matches, route.params.matchRef],
  );

  const isOwner = useMemo(
    () => String(match?.owner._id) === String(user?._id),
    [user?._id, match?.owner._id],
  );

  function showMap() {
    displayModal(
      <Map
        liteMode={false}
        title={match.provider.name}
        description={match.provider.address}
        center={match.location.coordinates.slice().reverse()}
        height={400}
      />,
    );
  }

  function onEditName() {
    displaySheet({content: <EditName />, height: '30%'});
  }

  function onEditProvider() {
    displaySheetRoute({
      routes: [
        {
          name: 'provider',
          component: EditProvider,
        },
        {
          name: 'schedule',
          component: EditProviderSchedule,
        },
      ],
      initialRoute: 'provider',
      height: '75%',
      state: {provider: null, start: null, end: null},
    });
  }

  function onEditSchedule() {
    displaySheet({content: <EditSchedule />, height: '75%'});
  }

  return (
    <ScrollView style={{flex: 1}}>
      <View
        style={{
          padding: 16,
          paddingTop: 64,
          flexDirection: 'row',
          justifyContent: 'space-between',
          alignItems: 'flex-start',
          backgroundColor: theme.colors.secondaryContainer,
          flexWrap: 'wrap',
        }}>
        <View
          style={{
            flexDirection: 'row',
            alignItems: 'flex-start',
            flexWrap: 'wrap',
            flex: 1,
          }}>
          {isOwner && (
            <IconButton
              mode="contained"
              size={18}
              onPress={onEditName}
              icon="pencil"
            />
          )}
          <Text variant="headlineLarge" style={{fontWeight: 'bold', flex: 1}}>
            {match.name}
          </Text>
        </View>
        <Button
          mode="contained"
          icon="map-marker"
          style={{marginBottom: 8}}
          onPress={showMap}>
          ~ {Math.floor(match.distance / 1000)} km
        </Button>
      </View>

      <Divider />

      <View
        style={{
          padding: 16,
          paddingBottom: 64,
          marginBottom: 48,
          flexDirection: 'row',
          alignItems: 'flex-start',
          backgroundColor: theme.colors.secondaryContainer,
        }}>
        {isOwner && (
          <IconButton
            mode="contained"
            onPress={onEditProvider}
            size={18}
            icon="pencil"
          />
        )}
        <View style={{flex: 1}}>
          <Text
            variant="titleLarge"
            style={{fontWeight: 'bold', marginBottom: 16}}>
            {match.provider.name}
          </Text>
          <Text variant="bodyLarge" style={{marginBottom: 16}}>
            {match.provider.address}
          </Text>
          <View style={{flexDirection: 'row', alignItems: 'flex-start'}}>
            {isOwner && (
              <IconButton
                mode="contained"
                onPress={onEditSchedule}
                size={18}
                icon="pencil"
              />
            )}
            <View style={{flex: 1}}>
              <View style={{flexDirection: 'row', alignItems: 'center'}}>
                <IconButton icon="calendar-check" />
                <Text
                  variant="titleMedium"
                  style={{
                    flex: 1,
                    color: theme.colors.onPrimaryContainer,
                    fontWeight: 'bold',
                  }}>
                  {format(new Date(match.start), 'iiii, do MMMM yyyy')}
                </Text>
              </View>
              <View style={{flexDirection: 'row', alignItems: 'center'}}>
                <IconButton icon="clock-outline" />
                <Text
                  variant="titleMedium"
                  style={{
                    flex: 1,
                    color: theme.colors.onPrimaryContainer,
                    fontWeight: 'bold',
                  }}>
                  {format(new Date(match.start), 'HH:mm')} -{' '}
                  {format(new Date(match.end), 'HH:mm')}
                </Text>
              </View>
            </View>
          </View>
        </View>
      </View>

      <View style={{marginBottom: 32, position: 'relative'}}>
        <Divider style={{backgroundColor: theme.colors.secondary}} />
        <IconButton
          size={20}
          icon="bullhorn"
          style={{
            backgroundColor: theme.colors.secondaryContainer,
            position: 'absolute',
            top: 0,
            transform: [{translateY: -25}],
            left: 16,
          }}
        />
      </View>

      <View style={{padding: 16}}>
        {match.announcements.map(announcement => (
          <Card key={announcement._id} style={{marginBottom: 16}}>
            <Card.Content>
              <Text variant="titleMedium" style={{marginBottom: 16}}>
                {match.owner.name}
              </Text>
              <Hyperlink
                onPress={url => Linking.openURL(url)}
                linkStyle={{color: 'blue'}}>
                <Text variant="titleMedium">{announcement.text}</Text>
              </Hyperlink>
              <Text style={{textAlign: 'right', marginTop: 16}}>
                {format(new Date(announcement.updatedAt), 'iiii, do MMMM yyyy')}
              </Text>
            </Card.Content>
          </Card>
        ))}
      </View>
    </ScrollView>
  );
}

function EditName() {
  const {user, handleUpdateMatchName} = useAppContext();
  const {hideSheet} = useSheetContext();
  const inputRef = useRef();
  const timeoutRef = useRef();
  const [name, setName] = useState(user.match.name);
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    if (timeoutRef.current) clearTimeout(timeoutRef.current);
    timeoutRef.current = setTimeout(() => {
      inputRef.current?.focus();
    }, 50);
    return () => {
      timeoutRef.current && clearTimeout(timeoutRef.current);
      inputRef.current?.blur();
    };
  }, []);

  function onChange(text) {
    setName(text);
  }

  async function onSubmit() {
    if (!Boolean(name.trim())) return;

    if (name === user.match.name) {
      inputRef.current?.blur();
      hideSheet();
    }

    setIsSubmitting(true);
    try {
      await handleUpdateMatchName({name});
      inputRef.current?.blur();
      hideSheet();
    } catch (err) {
      console.error(err.message || err);
    }
    setIsSubmitting(false);
  }

  return (
    <View style={{padding: 16}}>
      <TextInput
        ref={inputRef}
        mode="outlined"
        value={name}
        onChangeText={onChange}
        onSubmitEditing={onSubmit}
        maxLength={50}
        right={<TextInput.Affix text={`${String(name.length)}/50`} />}
        error={!Boolean(name)}
      />
      <HelperText type="error" visible={!Boolean(name)}>
        Required
      </HelperText>

      <Button
        // style={{marginTop: 16}}
        disabled={isSubmitting}
        mode="contained"
        onPress={onSubmit}>
        Update
      </Button>
    </View>
  );
}

function EditProvider() {
  const {providers, getProviders} = useAppContext();
  const {setSheetState} = useSheetContext();
  const theme = useTheme();
  const route = useSheetRouter();
  const [isRefreshing, setIsRefreshing] = useState(false);

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

  async function onRefresh() {
    setIsRefreshing(true);
    await getProviders();
    setIsRefreshing(false);
  }

  function selectProvider(provider) {
    return function () {
      setSheetState('provider', provider);
      route.navigate('schedule');
    };
  }

  return (
    <>
      <View
        keyboardShouldPersistTaps="handled"
        style={{
          paddingLeft: 16,
          paddingRight: 16,
          paddingTop: 16,
          paddingBottom: 8,
        }}>
        <View style={{flexDirection: 'row'}}>
          <View style={{flex: 1, paddingRight: 8}}>
            <Searchbar
              style={{
                backgroundColor: '#FFF',
                borderWidth: 1,
                borderColor: theme.colors.secondary,
              }}
              placeholder="Search Provider..."
            />
            <HelperText>By name, address</HelperText>
          </View>
          <IconButton mode="contained" icon="filter-variant" />
        </View>
      </View>
      <Divider />
      <FlatList
        data={providers}
        renderItem={({item}) => (
          <ProviderCard provider={item} onPress={selectProvider(item)} />
        )}
        keyExtractor={item => item._id}
        refreshControl={
          <RefreshControl refreshing={isRefreshing} onRefresh={onRefresh} />
        }
      />
    </>
  );
}

function EditProviderSchedule() {
  const {matches, handleUpdateMatchProvider} = useAppContext();
  const {state, setSheetState, cleanSheetState, hideSheetRoute} =
    useSheetContext();
  const route = useSheetRouter();
  const theme = useTheme();
  const [availability, setAvailability] = useState(null);
  const [date, setDate] = useState(null);
  const [errors, setErrors] = useState({});
  const scrollViewRef = useRef();
  const [calendarLayout, setCalendarLayout] = useState(null);
  const [slotLayout, setSlotLayout] = useState(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  function onBack() {
    route.goBack();
  }

  const events = useMemo(
    () =>
      matches
        .filter(m => String(m.provider._id) !== String(state.provider?._id))
        .map(m => ({
          _id: m._id,
          title: m.name,
          start: new Date(m.start),
          end: new Date(m.end),
        })),
    [matches, state.provider?._id],
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
    setSheetState('start', slot.start);
    setSheetState('end', slot.end);
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
      !state.provider?.availabilities.find(a => a.day === availability.day)
    )
      errors = {...errors, availability: 'invalid'};

    if (!date) errors = {...errors, date: 'required'};
    else if (format(date, 'iii').toLowerCase() !== availability?.day)
      errors = {...errors, date: 'invalid'};

    if (!(state.start && state.end)) errors = {...errors, slot: 'required'};
    else {
      const withinAvailability =
        isWithinAvailability(new Date(state.start)) &&
        isWithinAvailability(new Date(state.end));

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
      await handleUpdateMatchProvider({
        ...state,
        providerRef: state.provider._id,
      });
      hideSheetRoute();
      cleanSheetState();
    } catch (err) {
      console.error(err.message || err);
    }
    setIsSubmitting(false);
  }

  return (
    <>
      <View
        style={{
          paddingTop: 16,
          paddingBottom: 8,
          flexDirection: 'row',
          alignItems: 'center',
        }}>
        <IconButton icon="arrow-left" onPress={onBack} />
        {date && (
          <Text variant="titleLarge">
            {format(new Date(date), 'dd MMM yyyy')}
          </Text>
        )}
      </View>
      <Divider />
      <ScrollView ref={scrollViewRef} style={{padding: 16, marginBottom: 16}}>
        {state.provider.availabilities.map((a, i) => {
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

function EditSchedule() {
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
        .filter(m => String(m.provider._id) !== String(user.match.provider._id))
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
    <>
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
    </>
  );
}
