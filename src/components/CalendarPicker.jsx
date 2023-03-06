import { Text, View } from "react-native";
import { Calendar } from "react-native-calendars";
import { Button, IconButton, useTheme } from "react-native-paper";
import { format, isBefore, isSameDay, startOfDay } from "date-fns";

export default function CalendarPicker({
  selectedDate = new Date(),
  minDate,
  onChangeDate,
  disableDay,
}) {
  const theme = useTheme();

  function selectDate(date, isDisabled) {
    return function () {
      if (isDisabled) return;
      if (onChangeDate) onChangeDate(date);
    };
  }

  return (
    <View style={{ flex: 1 }}>
      <Calendar
        initialDate={
          selectedDate ? format(selectedDate, "yyyy-MM-dd") : undefined
        }
        renderArrow={(dir) => (
          <IconButton
            mode="contained"
            icon={dir === "left" ? "chevron-left" : "chevron-right"}
          />
        )}
        dayComponent={({ date: { timestamp, day }, state }) => {
          const date = new Date(timestamp);
          const isDisabled =
            state === "disabled" ||
            (minDate && isBefore(date, startOfDay(minDate))) ||
            (disableDay && disableDay(date));
          const selected = selectedDate && isSameDay(date, selectedDate);

          return (
            <View
              style={{
                position: "relative",
                minWidth: 35,
                height: 35,
                opacity: isDisabled ? 0.3 : 1,
                borderWidth: state === "today" ? 1 : 0,
                borderColor: theme.colors.primary,
                backgroundColor: selected ? theme.colors.primary : "#fff",
                borderRadius: 100,
              }}
            >
              <Button
                onPress={selectDate(date, isDisabled)}
                style={{ minWidth: 0 }}
              >
                <Text
                  style={{
                    textAlign: "center",
                    color: selected ? theme.colors.onPrimary : "black",
                  }}
                >
                  {day}
                </Text>
              </Button>
            </View>
          );
        }}
      />
    </View>
  );
}
