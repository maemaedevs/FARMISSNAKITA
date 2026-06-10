import { useState } from "react";
import { Ionicons } from "@expo/vector-icons";
import DateTimePicker, {
  type DateTimePickerEvent,
} from "@react-native-community/datetimepicker";
import {
  Modal,
  Platform,
  Pressable,
  StyleSheet,
  Text,
  View,
} from "react-native";

import { Colors, FontSize, FontWeight, Radius, Spacing } from "@/constants";
import {
  formatBirthdayDisplay,
  formatBirthdayISO,
  parseBirthdayDate,
} from "@/lib/birthday";

type BirthdayFieldProps = {
  label: string;
  value: string;
  onChange: (isoDate: string) => void;
  placeholder?: string;
  cancelLabel?: string;
  doneLabel?: string;
  maximumDate?: Date;
};

const DEFAULT_MAX_DATE = new Date();

export function BirthdayField({
  label,
  value,
  onChange,
  placeholder = "Select date",
  cancelLabel = "Cancel",
  doneLabel = "Done",
  maximumDate = DEFAULT_MAX_DATE,
}: BirthdayFieldProps) {
  const [showPicker, setShowPicker] = useState(false);
  const parsed = parseBirthdayDate(value);
  const [draftDate, setDraftDate] = useState<Date>(parsed ?? maximumDate);

  const displayValue = parsed
    ? formatBirthdayDisplay(value, placeholder)
    : placeholder;

  function openPicker() {
    setDraftDate(parsed ?? maximumDate);
    setShowPicker(true);
  }

  function handleChange(event: DateTimePickerEvent, selected?: Date) {
    if (Platform.OS === "android") {
      setShowPicker(false);
      if (event.type === "set" && selected) {
        onChange(formatBirthdayISO(selected));
      }
      return;
    }

    if (selected) {
      setDraftDate(selected);
    }
  }

  function confirmIos() {
    onChange(formatBirthdayISO(draftDate));
    setShowPicker(false);
  }

  return (
    <View style={styles.field}>
      <Text style={styles.label}>{label}</Text>
      <Pressable
        accessibilityRole="button"
        onPress={openPicker}
        style={({ pressed }) => [styles.input, pressed && styles.inputPressed]}
      >
        <Text
          style={[styles.value, !parsed && styles.placeholder]}
          numberOfLines={1}
        >
          {displayValue}
        </Text>
        <Ionicons name="calendar-outline" size={20} color={Colors.textMuted} />
      </Pressable>

      {showPicker && Platform.OS === "android" ? (
        <DateTimePicker
          value={draftDate}
          mode="date"
          display="default"
          maximumDate={maximumDate}
          onChange={handleChange}
        />
      ) : null}

      {showPicker && Platform.OS === "ios" ? (
        <Modal transparent animationType="slide" visible={showPicker}>
          <Pressable
            style={styles.modalBackdrop}
            onPress={() => setShowPicker(false)}
          />
          <View style={styles.iosSheet}>
            <View style={styles.iosToolbar}>
              <Pressable onPress={() => setShowPicker(false)}>
                <Text style={styles.iosAction}>{cancelLabel}</Text>
              </Pressable>
              <Pressable onPress={confirmIos}>
                <Text style={[styles.iosAction, styles.iosConfirm]}>{doneLabel}</Text>
              </Pressable>
            </View>
            <DateTimePicker
              value={draftDate}
              mode="date"
              display="spinner"
              maximumDate={maximumDate}
              onChange={handleChange}
              style={styles.iosPicker}
            />
          </View>
        </Modal>
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  field: {
    gap: Spacing.xs,
  },
  label: {
    color: Colors.textSecondary,
    fontSize: FontSize.sm,
    fontWeight: FontWeight.medium,
  },
  input: {
    height: 56,
    borderRadius: Radius.md,
    borderWidth: 1,
    borderColor: Colors.primaryLight,
    paddingHorizontal: Spacing.lg,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    gap: Spacing.md,
  },
  inputPressed: {
    opacity: 0.85,
  },
  value: {
    flex: 1,
    color: Colors.textPrimary,
    fontSize: FontSize.md,
    fontWeight: FontWeight.medium,
  },
  placeholder: {
    color: Colors.textMuted,
  },
  modalBackdrop: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.4)",
  },
  iosSheet: {
    backgroundColor: Colors.primaryDark,
    borderTopLeftRadius: Radius.lg,
    borderTopRightRadius: Radius.lg,
    paddingBottom: Spacing.xl,
  },
  iosToolbar: {
    flexDirection: "row",
    justifyContent: "space-between",
    paddingHorizontal: Spacing.lg,
    paddingVertical: Spacing.md,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: "rgba(255,255,255,0.12)",
  },
  iosAction: {
    color: Colors.textSecondary,
    fontSize: FontSize.md,
    fontWeight: FontWeight.medium,
  },
  iosConfirm: {
    color: Colors.accent,
    fontWeight: FontWeight.semibold,
  },
  iosPicker: {
    alignSelf: "center",
  },
});
