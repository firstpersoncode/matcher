import {useMemo, useState} from 'react';
import {Pressable, View} from 'react-native';
import {Text} from 'react-native-paper';
import {
  add,
  differenceInMinutes,
  format,
  isAfter,
  isBefore,
  isEqual,
  isSameDay,
  isWithinInterval,
  startOfDay,
} from 'date-fns';

const hours = [...Array(24).keys()];
const hourInMinutes = 60;
const minLeft = 30;
const slotHeight = 30;

export default function SlotPicker({
  events = [],
  step = 30,
  selectedDate = new Date(),
  onSelectSlot,
  disableSlot,
}) {
  const steps = useMemo(() => Math.floor(hourInMinutes / step), [step]);
  const counter = useMemo(() => slotHeight * steps, [steps]);
  const hourSlots = useMemo(() => [...Array(steps).keys()], [steps]);

  const [selectedSlots, setSelectedSlots] = useState([]);

  const filteredEvents = useMemo(
    () =>
      countOverlaps(
        events
          .filter(
            e =>
              Boolean(selectedDate) &&
              isSameDay(e.start, new Date(selectedDate)),
          )
          .sort((a, b) => a.start - b.start),
      ).map(e => normalize(e, counter, hourInMinutes, minLeft)),
    [events, steps, selectedDate, counter],
  );

  // const filteredEvents = useMemo(
  //   () =>
  //     events
  //       .filter((e) => isSameDay(e.start, new Date(selectedDate)))
  //       .sort((a, b) => a.start - b.start)
  //       .map((e) => normalize(e, counter, hourInMinutes, minLeft)),
  //   [events, selectedDate, counter]
  // );

  function handleSelectSlot(slot, isDisabled) {
    return function () {
      if (isDisabled) return;
      setSelectedSlots(slots => {
        let currSlots = [...slots];

        const selectedSlot = normalize(slot, counter, hourInMinutes, minLeft);

        if (!currSlots.length) {
          const updatedSlots = [...currSlots, selectedSlot].sort(
            (a, b) => a.start - b.start,
          );

          if (onSelectSlot) {
            let firstSlot = updatedSlots[0];
            let lastSlot = updatedSlots[updatedSlots.length - 1];
            if (updatedSlots.length === 1) lastSlot = firstSlot;
            onSelectSlot({start: firstSlot.start, end: lastSlot.end});
          }

          return updatedSlots;
        }

        let firstSlot = currSlots[0];
        let lastSlot = currSlots[currSlots.length - 1];

        if (currSlots.length === 1) lastSlot = firstSlot;

        if (isAfter(selectedSlot.start, lastSlot.end)) {
          let nStart = lastSlot.end;
          let nEnd = add(nStart, {minutes: step});
          while (!isAfter(nEnd, selectedSlot.start)) {
            let nSlot = normalize(
              {start: nStart, end: nEnd},
              counter,
              hourInMinutes,
              minLeft,
            );
            currSlots = [...currSlots, nSlot];
            nStart = add(nStart, {minutes: step});
            nEnd = add(nStart, {minutes: step});
          }
        } else if (isBefore(selectedSlot.end, firstSlot.start)) {
          let nStart = selectedSlot.end;
          let nEnd = add(nStart, {minutes: step});
          while (!isAfter(nEnd, firstSlot.start)) {
            let nSlot = normalize(
              {start: nStart, end: nEnd},
              counter,
              hourInMinutes,
              minLeft,
            );
            currSlots = [...currSlots, nSlot];
            nStart = add(nStart, {minutes: step});
            nEnd = add(nStart, {minutes: step});
          }
        }

        const updatedSlots = [...currSlots, selectedSlot].sort(
          (a, b) => a.start - b.start,
        );

        if (onSelectSlot) {
          let firstSlot = updatedSlots[0];
          let lastSlot = updatedSlots[updatedSlots.length - 1];
          if (updatedSlots.length === 1) lastSlot = firstSlot;
          onSelectSlot({start: firstSlot.start, end: lastSlot.end});
        }

        return updatedSlots;
      });
    };
  }

  function handleRemoveSlot(slot) {
    return function () {
      setSelectedSlots(slots => {
        let currSlots = [...slots];

        if (slots.length > 1) {
          let firstSlot = currSlots[0];
          let lastSlot = currSlots[currSlots.length - 1];

          let distFromFirst = differenceInMinutes(slot.start, firstSlot.end);
          let distFromLast = differenceInMinutes(lastSlot.start, slot.end);

          if (distFromFirst > distFromLast)
            currSlots = currSlots.filter(s => isBefore(s.start, slot.start));
          else currSlots = currSlots.filter(s => isAfter(s.start, slot.start));

          if (onSelectSlot) {
            let firstSlot = currSlots[0];
            let lastSlot = currSlots[currSlots.length - 1];
            if (currSlots.length === 1) lastSlot = firstSlot;
            onSelectSlot({start: firstSlot.start, end: lastSlot.end});
          }
        } else {
          currSlots = [];
          if (onSelectSlot) onSelectSlot({start: null, end: null});
        }
        return currSlots;
      });
    };
  }

  function clearSlots() {
    setSelectedSlots([]);
    onSelectSlot({start: null, end: null});
  }

  return (
    <View style={{flex: 1}}>
      {selectedDate && (
        <Text variant="titleLarge" style={{marginBottom: 16}}>
          {format(selectedDate, 'dd MMM yyyy')}
        </Text>
      )}

      <View style={{position: 'relative', flex: 1}}>
        {hours.map(hour =>
          hourSlots.map((slot, i) => {
            let slotString = `${padNumber(hour)}:${padNumber(slot * step)}`;
            let isDisabled = disableSlot && disableSlot(slotString);

            return (
              <View
                key={i}
                style={{
                  flexDirection: 'row',
                  height: slotHeight,
                  opacity: isDisabled ? 0.3 : 1,
                }}>
                <Text
                  variant="labelSmall"
                  style={{
                    width: minLeft,
                    borderTopWidth: 0.3,
                    borderRightWidth: 0.3,
                    borderColor: '#ccc',
                    fontSize: 10,
                  }}>
                  {slotString}
                </Text>
                <View
                  style={{
                    flex: 1,
                    borderTopWidth: 0.3,
                    borderRightWidth: 0.3,
                    borderColor: '#ccc',
                    backgroundColor: isDisabled ? '#ccc' : '#fff',
                  }}
                />
              </View>
            );
          }),
        )}

        {filteredEvents.map((e, i) => (
          <View
            key={i}
            style={{
              position: 'absolute',
              top: e.top,
              left: e.left,
              right: e.right,
              height: e.height,
              padding: 8,
              backgroundColor: 'rgba(39, 2, 153, .5)',
            }}>
            <Text style={{color: '#fff'}}>
              {format(e.start, 'HH:mm')} - {format(e.end, 'HH:mm')}
            </Text>
            <Text style={{color: '#fff'}}>{e.title}</Text>
          </View>
        ))}

        <View
          style={{
            position: 'absolute',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
          }}>
          {hours.map(hour =>
            hourSlots.map((slot, i) => {
              let slotString = `${padNumber(hour)}:${padNumber(slot * step)}`;
              let isDisabled = disableSlot && disableSlot(slotString);

              return (
                <Pressable
                  key={i}
                  onPress={handleSelectSlot(
                    {
                      start: add(startOfDay(new Date(selectedDate)), {
                        hours: hour,
                        minutes: slot * step,
                      }),
                      end: add(startOfDay(new Date(selectedDate)), {
                        hours: hour,
                        minutes: slot * step + step,
                      }),
                    },
                    isDisabled,
                  )}
                  style={{
                    flex: 1,
                    height: slotHeight,
                  }}
                />
              );
            }),
          )}
        </View>

        {selectedSlots.map((slot, i) => (
          <Pressable
            key={i}
            onPress={handleRemoveSlot(slot)}
            onLongPress={clearSlots}
            style={{
              position: 'absolute',
              left: minLeft,
              right: slot.right,
              top: slot.top,
              height: slot.height,
              backgroundColor: 'rgba(0,0,0,0.5)',
              padding: 8,
              justifyContent: 'space-between',
              flexWrap: 'wrap',
            }}>
            {selectedSlots.length > 1 ? (
              <>
                {i === 0 && (
                  <>
                    <Text style={{color: '#FFF'}}>
                      {format(slot.start, 'HH:mm')}
                    </Text>
                    <Text
                      style={{marginLeft: 8, color: 'rgba(255,255,255,0.3)'}}>
                      - Tap to delete{'   '}- Tap and Hold to clear
                    </Text>
                  </>
                )}
                {i === selectedSlots.length - 1 && (
                  <>
                    <Text style={{color: '#FFF'}}>
                      {format(slot.end, 'HH:mm')}
                    </Text>
                    <Text
                      style={{
                        marginLeft: 8,
                        color: '#FFF',
                        fontWeight: 'bold',
                      }}>
                      ({differenceInMinutes(slot.end, selectedSlots[0].start)}{' '}
                      minutes)
                    </Text>
                  </>
                )}
              </>
            ) : (
              <>
                <Text style={{color: '#FFF'}}>
                  {format(slot.start, 'HH:mm')} - {format(slot.end, 'HH:mm')}
                </Text>
                <Text style={{marginLeft: 8, color: 'rgba(255,255,255,0.3)'}}>
                  - Tap to delete
                </Text>
                <Text
                  style={{
                    marginLeft: 8,
                    color: '#FFF',
                    fontWeight: 'bold',
                  }}>
                  ({differenceInMinutes(slot.end, selectedSlots[0].start)}{' '}
                  minutes)
                </Text>
              </>
            )}
          </Pressable>
        ))}
      </View>
    </View>
  );
}

function checkOverlap(event, event2) {
  if (
    event.end.getTime() === event2.start.getTime() ||
    event2.end.getTime() === event.start.getTime()
  ) {
    return false;
  }

  return (
    isWithinInterval(event.start, event2) ||
    isWithinInterval(event.end, event2) ||
    isWithinInterval(event2.start, event) ||
    isWithinInterval(event2.end, event)
  );
}

function countOverlaps(arr) {
  let overlapCounts = arr.map(e => ({...e, left: [], right: []}));

  for (let i = 0; i < overlapCounts.length; i++) {
    let event = overlapCounts[i];

    for (let j = 0; j < overlapCounts.length; j++) {
      if (i === j) {
        continue;
      }

      let event2 = overlapCounts[j];

      if (checkOverlap(event, event2)) {
        if (
          isEqual(event.start, event2.start) ||
          isAfter(event.start, event2.start)
        )
          event.left.push(event2, ...event2.left);
      }
    }

    overlapCounts.forEach(e => {
      if (String(e._id) === String(event._id)) e = event;
    });
  }

  return overlapCounts;
}

function normalize(e, counter, hourInMinutes, minLeft) {
  let top =
    e.start.getHours() * counter +
    (e.start.getMinutes() / hourInMinutes) * counter;
  e.top = top;

  let bottom =
    e.end.getHours() * counter + (e.end.getMinutes() / hourInMinutes) * counter;

  e.height = bottom - top;

  if (e.left) e.left = e.left.length * minLeft + minLeft;
  // e.left = minLeft;
  e.right = 0;

  return e;
}

function padNumber(num) {
  return String(num).padStart(2, '0');
}
