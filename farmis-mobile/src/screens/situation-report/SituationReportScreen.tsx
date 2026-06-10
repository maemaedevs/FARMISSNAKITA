import { Ionicons } from "@expo/vector-icons";
import DateTimePicker, {
  type DateTimePickerEvent,
} from "@react-native-community/datetimepicker";
import { Image } from "expo-image";
import { LinearGradient } from "expo-linear-gradient";
import { useFocusEffect } from "expo-router";
import { useCallback, useState, type ReactNode } from "react";
import {
  ActivityIndicator,
  Alert,
  KeyboardAvoidingView,
  Modal,
  Platform,
  Pressable,
  RefreshControl,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

import { BirthdayField } from "@/components/BirthdayField";
import { Checkbox } from "@/components/Checkbox";
import { PrimaryButton } from "@/components/PrimaryButton";
import { Colors, FontSize, FontWeight, Radius, Spacing } from "@/constants";
import { useLanguage } from "@/contexts/LanguageContext";
import {
  formatBirthdayISO,
  parseBirthdayDate,
} from "@/lib/birthday";
import {
  pickSituationPhotoFromLibrary,
  takeSituationPhoto,
} from "@/lib/pickSituationPhoto";
import { resolveAssetUrl } from "@/lib/resolveAssetUrl";
import { getSession } from "@/lib/session";
import { getMobileProfile } from "@/services/mobileAuthApi";
import {
  createMobileSituationReport,
  getMobileSituationReports,
  type IncidentType,
  type SituationReport,
} from "@/services/mobileSituationReportApi";

const INCIDENT_TYPES: IncidentType[] = [
  "storm_typhoon",
  "landslide",
  "flood",
  "other",
];

type PhotoSlot = "photoCrop" | "photoLandslide" | "photoOther";

function SectionHeader({
  number,
  title,
  icon,
}: {
  number: number;
  title: string;
  icon: keyof typeof Ionicons.glyphMap;
}) {
  return (
    <View style={styles.sectionHeader}>
      <Ionicons name={icon} size={22} color={Colors.textPrimary} />
      <Text style={styles.sectionTitle}>
        {number}. {title}
      </Text>
    </View>
  );
}

function GradientField({
  children,
  icon,
}: {
  children: ReactNode;
  icon?: keyof typeof Ionicons.glyphMap;
}) {
  return (
    <LinearGradient
      colors={["#0E363E", "#019F6E", "#13303F"]}
      start={{ x: 0, y: 0.5 }}
      end={{ x: 1, y: 0.5 }}
      style={styles.gradientField}
    >
      {icon ? (
        <Ionicons name={icon} size={20} color={Colors.textMuted} style={styles.fieldIcon} />
      ) : null}
      <View style={styles.gradientInner}>{children}</View>
    </LinearGradient>
  );
}

function PhotoUploadSlot({
  label,
  uri,
  onPress,
}: {
  label: string;
  uri: string | null;
  onPress: () => void;
}) {
  const { t } = useLanguage();

  return (
    <View style={styles.photoSlot}>
      <Text style={styles.photoSlotLabel}>{label}</Text>
      <Pressable onPress={onPress} style={styles.photoUploadBtn}>
        <LinearGradient
          colors={["#0E363E", "#019F6E", "#13303F"]}
          start={{ x: 0, y: 0.5 }}
          end={{ x: 1, y: 0.5 }}
          style={styles.photoUploadGradient}
        >
          {uri ? (
            <Image source={{ uri }} style={styles.photoThumb} contentFit="cover" />
          ) : (
            <>
              <Ionicons name="camera-outline" size={22} color={Colors.textPrimary} />
              <Text style={styles.photoUploadText}>{t("situationReport.uploadPhoto")}</Text>
            </>
          )}
        </LinearGradient>
      </Pressable>
    </View>
  );
}

function combineDateAndTime(dateIso: string, time: Date): string {
  const date = parseBirthdayDate(dateIso) ?? new Date();
  const combined = new Date(date);
  combined.setHours(time.getHours(), time.getMinutes(), 0, 0);
  return combined.toISOString();
}

export function SituationReportScreen() {
  const { t } = useLanguage();
  const [fullName, setFullName] = useState("");
  const [contactNumber, setContactNumber] = useState("");
  const [address, setAddress] = useState("");
  const [incidentTypes, setIncidentTypes] = useState<IncidentType[]>([]);
  const [incidentOther, setIncidentOther] = useState("");
  const [incidentDate, setIncidentDate] = useState("");
  const [incidentTime, setIncidentTime] = useState(new Date());
  const [showTimePicker, setShowTimePicker] = useState(false);
  const [sitioPurok, setSitioPurok] = useState("");
  const [barangay, setBarangay] = useState("");
  const [cropType, setCropType] = useState("");
  const [estimatedAreaHa, setEstimatedAreaHa] = useState("");
  const [estimatedLossPeso, setEstimatedLossPeso] = useState("");
  const [damageDescription, setDamageDescription] = useState("");
  const [photos, setPhotos] = useState<Record<PhotoSlot, string | null>>({
    photoCrop: null,
    photoLandslide: null,
    photoOther: null,
  });
  const [docProofOfLand, setDocProofOfLand] = useState(false);
  const [docListOfCrops, setDocListOfCrops] = useState(false);
  const [docValidId, setDocValidId] = useState(false);
  const [docOther, setDocOther] = useState(false);
  const [document, setDocument] = useState<{
    uri: string;
    name: string;
    mimeType: string;
  } | null>(null);
  const [declared, setDeclared] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [reports, setReports] = useState<SituationReport[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const loadProfile = useCallback(async () => {
    const session = getSession();
    if (!session?.token) return;
    try {
      const profile = await getMobileProfile(session.token);
      setFullName(profile.name);
      setContactNumber(profile.contactNumber);
      setAddress(profile.address);
      setBarangay(profile.barangay);
    } catch {
      // keep empty defaults
    }
  }, []);

  const loadReports = useCallback(async (isRefresh = false) => {
    const session = getSession();
    if (!session?.token) {
      setReports([]);
      setLoading(false);
      setRefreshing(false);
      return;
    }

    if (isRefresh) setRefreshing(true);
    else setLoading(true);

    try {
      const res = await getMobileSituationReports(session.token);
      setReports(res.data);
    } catch {
      // ignore
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, []);

  useFocusEffect(
    useCallback(() => {
      void loadProfile();
      void loadReports();
    }, [loadProfile, loadReports]),
  );

  function toggleIncident(type: IncidentType) {
    setIncidentTypes((current) =>
      current.includes(type)
        ? current.filter((item) => item !== type)
        : [...current, type],
    );
    if (error) setError(null);
  }

  async function handlePhoto(slot: PhotoSlot) {
    Alert.alert(t("situationReport.uploadPhoto"), undefined, [
      {
        text: t("situationReport.takePhoto"),
        onPress: () => {
          void (async () => {
            try {
              const uri = await takeSituationPhoto();
              if (uri) setPhotos((prev) => ({ ...prev, [slot]: uri }));
            } catch (err) {
              Alert.alert(
                t("situationReport.title"),
                err instanceof Error ? err.message : t("situationReport.photoFailed"),
              );
            }
          })();
        },
      },
      {
        text: t("situationReport.choosePhoto"),
        onPress: () => {
          void (async () => {
            try {
              const uri = await pickSituationPhotoFromLibrary();
              if (uri) setPhotos((prev) => ({ ...prev, [slot]: uri }));
            } catch (err) {
              Alert.alert(
                t("situationReport.title"),
                err instanceof Error ? err.message : t("situationReport.photoFailed"),
              );
            }
          })();
        },
      },
      { text: t("profile.cancel"), style: "cancel" },
    ]);
  }

  async function handleAttachDocument() {
    try {
      const uri = await pickSituationPhotoFromLibrary();
      if (!uri) return;
      const name = uri.split("/").pop() ?? "document.jpg";
      setDocument({ uri, name, mimeType: "image/jpeg" });
    } catch (err) {
      Alert.alert(
        t("situationReport.title"),
        err instanceof Error ? err.message : t("situationReport.photoFailed"),
      );
    }
  }

  function resetForm() {
    setIncidentTypes([]);
    setIncidentOther("");
    setIncidentDate("");
    setSitioPurok("");
    setCropType("");
    setEstimatedAreaHa("");
    setEstimatedLossPeso("");
    setDamageDescription("");
    setPhotos({ photoCrop: null, photoLandslide: null, photoOther: null });
    setDocProofOfLand(false);
    setDocListOfCrops(false);
    setDocValidId(false);
    setDocOther(false);
    setDocument(null);
    setDeclared(false);
    setError(null);
    void loadProfile();
  }

  async function handleSubmit() {
    if (!fullName.trim() || !contactNumber.trim() || !address.trim()) {
      setError(t("situationReport.personalRequired"));
      return;
    }
    if (incidentTypes.length === 0) {
      setError(t("situationReport.incidentRequired"));
      return;
    }
    if (incidentTypes.includes("other") && !incidentOther.trim()) {
      setError(t("situationReport.incidentOtherRequired"));
      return;
    }
    if (!incidentDate) {
      setError(t("situationReport.dateRequired"));
      return;
    }
    if (!sitioPurok.trim() || !barangay.trim()) {
      setError(t("situationReport.locationRequired"));
      return;
    }
    if (!cropType.trim()) {
      setError(t("situationReport.cropRequired"));
      return;
    }
    const area = Number.parseFloat(estimatedAreaHa);
    const loss = Number.parseFloat(estimatedLossPeso);
    if (!Number.isFinite(area) || area < 0 || !Number.isFinite(loss) || loss < 0) {
      setError(t("situationReport.damageNumbersRequired"));
      return;
    }
    if (!damageDescription.trim()) {
      setError(t("situationReport.descriptionRequired"));
      return;
    }
    if (!photos.photoCrop && !photos.photoLandslide && !photos.photoOther) {
      setError(t("situationReport.photoRequired"));
      return;
    }
    if (!declared) {
      setError(t("situationReport.declarationRequired"));
      return;
    }

    const session = getSession();
    if (!session?.token) {
      setError(t("situationReport.signInRequired"));
      return;
    }

    setSubmitting(true);
    setError(null);

    try {
      await createMobileSituationReport(session.token, {
        fullName: fullName.trim(),
        contactNumber: contactNumber.trim(),
        address: address.trim(),
        incidentTypes,
        incidentOther: incidentOther.trim() || undefined,
        incidentAt: combineDateAndTime(incidentDate, incidentTime),
        sitioPurok: sitioPurok.trim(),
        barangay: barangay.trim(),
        cropType: cropType.trim(),
        estimatedAreaHa: area,
        estimatedLossPeso: loss,
        damageDescription: damageDescription.trim(),
        docProofOfLand,
        docListOfCrops,
        docValidId,
        docOther,
        declared: true,
        photos: {
          photoCrop: photos.photoCrop ?? undefined,
          photoLandslide: photos.photoLandslide ?? undefined,
          photoOther: photos.photoOther ?? undefined,
        },
        document: document ?? undefined,
      });
      resetForm();
      await loadReports(true);
      Alert.alert(t("situationReport.title"), t("situationReport.submitSuccess"));
    } catch (err) {
      setError(
        err instanceof Error ? err.message : t("situationReport.submitFailed"),
      );
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <SafeAreaView style={styles.safe} edges={["top"]}>
      <View style={styles.header}>
        <Text style={styles.headerTitle}>{t("situationReport.title")}</Text>
        <Text style={styles.headerSubtitle}>{t("situationReport.subtitle")}</Text>
      </View>

      <KeyboardAvoidingView
        style={styles.flex}
        behavior={Platform.OS === "ios" ? "padding" : undefined}
      >
        <ScrollView
          style={styles.scroll}
          contentContainerStyle={styles.scrollContent}
          keyboardShouldPersistTaps="handled"
          showsVerticalScrollIndicator={false}
          refreshControl={
            <RefreshControl
              refreshing={refreshing}
              onRefresh={() => void loadReports(true)}
              tintColor={Colors.accent}
            />
          }
        >
          <SectionHeader
            number={1}
            title={t("situationReport.personalInformation")}
            icon="person-outline"
          />
          <GradientField icon="person-outline">
            <TextInput
              value={fullName}
              onChangeText={setFullName}
              placeholder={t("situationReport.fullName")}
              placeholderTextColor={Colors.textMuted}
              style={styles.gradientInput}
            />
          </GradientField>
          <GradientField icon="call-outline">
            <TextInput
              value={contactNumber}
              onChangeText={setContactNumber}
              placeholder={t("situationReport.contactNumber")}
              placeholderTextColor={Colors.textMuted}
              keyboardType="phone-pad"
              style={styles.gradientInput}
            />
          </GradientField>
          <GradientField icon="location-outline">
            <TextInput
              value={address}
              onChangeText={setAddress}
              placeholder={t("situationReport.address")}
              placeholderTextColor={Colors.textMuted}
              style={styles.gradientInput}
            />
          </GradientField>

          <SectionHeader
            number={2}
            title={t("situationReport.incidentType")}
            icon="thunderstorm-outline"
          />
          <View style={styles.checkboxGroup}>
            {INCIDENT_TYPES.map((type) => (
              <Checkbox
                key={type}
                checked={incidentTypes.includes(type)}
                onChange={() => toggleIncident(type)}
                label={t(`situationReport.incidents.${type}`)}
              />
            ))}
          </View>
          <GradientField>
            <TextInput
              value={incidentOther}
              onChangeText={setIncidentOther}
              placeholder={t("situationReport.pleaseSpecify")}
              placeholderTextColor={Colors.textMuted}
              style={styles.gradientInput}
              editable={incidentTypes.includes("other")}
            />
          </GradientField>

          <SectionHeader
            number={3}
            title={t("situationReport.dateTimeOfIncident")}
            icon="calendar-outline"
          />
          <BirthdayField
            label={t("situationReport.date")}
            value={incidentDate}
            onChange={setIncidentDate}
            placeholder={t("situationReport.selectDate")}
            cancelLabel={t("profile.cancel")}
            doneLabel={t("profile.done")}
          />
          <View style={styles.field}>
            <Text style={styles.label}>{t("situationReport.time")}</Text>
            <Pressable
              onPress={() => setShowTimePicker(true)}
              style={styles.timeTrigger}
            >
              <Text style={styles.timeValue}>
                {incidentTime.toLocaleTimeString(undefined, {
                  hour: "2-digit",
                  minute: "2-digit",
                })}
              </Text>
              <Ionicons name="time-outline" size={20} color={Colors.textMuted} />
            </Pressable>
          </View>
          {showTimePicker && Platform.OS === "android" ? (
            <DateTimePicker
              value={incidentTime}
              mode="time"
              onChange={(event: DateTimePickerEvent, selected?: Date) => {
                setShowTimePicker(false);
                if (event.type === "set" && selected) setIncidentTime(selected);
              }}
            />
          ) : null}
          {showTimePicker && Platform.OS === "ios" ? (
            <Modal transparent animationType="slide" visible={showTimePicker}>
              <Pressable
                style={styles.modalBackdrop}
                onPress={() => setShowTimePicker(false)}
              />
              <View style={styles.iosSheet}>
                <View style={styles.iosToolbar}>
                  <Pressable onPress={() => setShowTimePicker(false)}>
                    <Text style={styles.iosAction}>{t("profile.cancel")}</Text>
                  </Pressable>
                  <Pressable onPress={() => setShowTimePicker(false)}>
                    <Text style={[styles.iosAction, styles.iosConfirm]}>
                      {t("profile.done")}
                    </Text>
                  </Pressable>
                </View>
                <DateTimePicker
                  value={incidentTime}
                  mode="time"
                  display="spinner"
                  onChange={(_event, selected) => {
                    if (selected) setIncidentTime(selected);
                  }}
                />
              </View>
            </Modal>
          ) : null}

          <SectionHeader
            number={4}
            title={t("situationReport.locationOfDamage")}
            icon="navigate-outline"
          />
          <View style={styles.field}>
            <Text style={styles.label}>{t("situationReport.sitioPurok")}</Text>
            <GradientField>
              <TextInput
                value={sitioPurok}
                onChangeText={setSitioPurok}
                placeholder={t("situationReport.sitioPlaceholder")}
                placeholderTextColor={Colors.textMuted}
                style={styles.gradientInput}
              />
            </GradientField>
          </View>
          <View style={styles.field}>
            <Text style={styles.label}>{t("situationReport.barangay")}</Text>
            <GradientField>
              <TextInput
                value={barangay}
                onChangeText={setBarangay}
                placeholder={t("situationReport.barangayPlaceholder")}
                placeholderTextColor={Colors.textMuted}
                style={styles.gradientInput}
              />
            </GradientField>
          </View>
          <Pressable
            style={styles.mapBtn}
            onPress={() =>
              Alert.alert(
                t("situationReport.selectOnMap"),
                t("situationReport.mapHint"),
              )
            }
          >
            <Ionicons name="location-outline" size={18} color={Colors.accent} />
            <Text style={styles.mapBtnText}>{t("situationReport.selectOnMap")}</Text>
          </Pressable>

          <SectionHeader
            number={5}
            title={t("situationReport.damageDetails")}
            icon="business-outline"
          />
          <View style={styles.damageTable}>
            <View style={styles.damageHeaderRow}>
              <Text style={[styles.damageHeaderCell, styles.damageColCrop]}>
                {t("situationReport.typeOfCrops")}
              </Text>
              <Text style={[styles.damageHeaderCell, styles.damageColArea]}>
                {t("situationReport.estimatedArea")}
              </Text>
              <Text style={[styles.damageHeaderCell, styles.damageColLoss]}>
                {t("situationReport.estimatedLoss")}
              </Text>
            </View>
            <View style={styles.damageInputRow}>
              <TextInput
                value={cropType}
                onChangeText={setCropType}
                placeholder={t("situationReport.cropPlaceholder")}
                placeholderTextColor={Colors.textMuted}
                style={[styles.damageInput, styles.damageColCrop]}
              />
              <TextInput
                value={estimatedAreaHa}
                onChangeText={setEstimatedAreaHa}
                placeholder="1.5"
                placeholderTextColor={Colors.textMuted}
                keyboardType="decimal-pad"
                style={[styles.damageInput, styles.damageColArea]}
              />
              <TextInput
                value={estimatedLossPeso}
                onChangeText={setEstimatedLossPeso}
                placeholder="5000"
                placeholderTextColor={Colors.textMuted}
                keyboardType="decimal-pad"
                style={[styles.damageInput, styles.damageColLoss]}
              />
            </View>
          </View>
          <View style={styles.field}>
            <Text style={styles.label}>{t("situationReport.describeDamage")}</Text>
            <LinearGradient
              colors={["#0E363E", "#019F6E", "#13303F"]}
              start={{ x: 0, y: 0.5 }}
              end={{ x: 1, y: 0.5 }}
              style={styles.descriptionGradient}
            >
              <TextInput
                value={damageDescription}
                onChangeText={setDamageDescription}
                placeholder={t("situationReport.descriptionPlaceholder")}
                placeholderTextColor={Colors.textMuted}
                multiline
                textAlignVertical="top"
                style={styles.descriptionInput}
              />
            </LinearGradient>
          </View>

          <SectionHeader
            number={6}
            title={t("situationReport.uploadPhotos")}
            icon="camera-outline"
          />
          <View style={styles.photoRow}>
            <PhotoUploadSlot
              label={t("situationReport.damageCrops")}
              uri={photos.photoCrop}
              onPress={() => void handlePhoto("photoCrop")}
            />
            <PhotoUploadSlot
              label={t("situationReport.landslideArea")}
              uri={photos.photoLandslide}
              onPress={() => void handlePhoto("photoLandslide")}
            />
            <PhotoUploadSlot
              label={t("situationReport.otherDamage")}
              uri={photos.photoOther}
              onPress={() => void handlePhoto("photoOther")}
            />
          </View>

          <SectionHeader
            number={7}
            title={t("situationReport.attachDocument")}
            icon="document-attach-outline"
          />
          <View style={styles.checkboxGroup}>
            <Checkbox
              checked={docProofOfLand}
              onChange={setDocProofOfLand}
              label={t("situationReport.docProofOfLand")}
            />
            <Checkbox
              checked={docListOfCrops}
              onChange={setDocListOfCrops}
              label={t("situationReport.docListOfCrops")}
            />
            <Checkbox
              checked={docValidId}
              onChange={setDocValidId}
              label={t("situationReport.docValidId")}
            />
            <Checkbox
              checked={docOther}
              onChange={setDocOther}
              label={t("situationReport.docOther")}
            />
          </View>
          <Pressable style={styles.attachBtn} onPress={() => void handleAttachDocument()}>
            <LinearGradient
              colors={["#0E363E", "#019F6E", "#13303F"]}
              start={{ x: 0, y: 0.5 }}
              end={{ x: 1, y: 0.5 }}
              style={styles.attachGradient}
            >
              <Ionicons name="attach-outline" size={18} color={Colors.textPrimary} />
              <Text style={styles.attachText}>
                {document?.name ?? t("situationReport.attachDocumentBtn")}
              </Text>
            </LinearGradient>
          </Pressable>

          <SectionHeader
            number={8}
            title={t("situationReport.declaration")}
            icon="shield-checkmark-outline"
          />
          <Checkbox
            checked={declared}
            onChange={setDeclared}
            label={t("situationReport.declarationText")}
          />

          {error ? <Text style={styles.errorText}>{error}</Text> : null}

          <PrimaryButton
            label={t("situationReport.submit")}
            loading={submitting}
            onPress={() => void handleSubmit()}
            style={styles.submitBtn}
          />

          <Text style={styles.sectionLabel}>{t("situationReport.myReports")}</Text>
          {loading ? (
            <ActivityIndicator color={Colors.accent} style={styles.listState} />
          ) : reports.length === 0 ? (
            <Text style={styles.emptyText}>{t("situationReport.empty")}</Text>
          ) : (
            reports.map((report) => {
              const imageUri = resolveAssetUrl(
                report.photoCropUrl ?? report.imageUrl,
              );
              return (
                <View key={report.id} style={styles.reportCard}>
                  {imageUri ? (
                    <Image
                      source={{ uri: imageUri }}
                      style={styles.reportImage}
                      contentFit="cover"
                    />
                  ) : null}
                  <View style={styles.reportBody}>
                    <Text style={styles.reportTitle}>{report.cropType}</Text>
                    <Text style={styles.reportMeta}>
                      {report.reportCode} ·{" "}
                      {t(`situationReport.status.${report.status}`)}
                    </Text>
                    <Text style={styles.reportDescription} numberOfLines={2}>
                      {report.damageDescription}
                    </Text>
                  </View>
                </View>
              );
            })
          )}
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: Colors.primaryDark },
  flex: { flex: 1 },
  header: {
    paddingHorizontal: Spacing.lg,
    paddingTop: Spacing.md,
    paddingBottom: Spacing.sm,
    gap: 4,
  },
  headerTitle: {
    color: Colors.textPrimary,
    fontSize: FontSize.xl,
    fontWeight: FontWeight.bold,
  },
  headerSubtitle: {
    color: Colors.textMuted,
    fontSize: FontSize.sm,
    lineHeight: 20,
  },
  scroll: { flex: 1 },
  scrollContent: {
    paddingHorizontal: Spacing.lg,
    paddingBottom: Spacing.xxl,
    gap: Spacing.md,
  },
  sectionHeader: {
    flexDirection: "row",
    alignItems: "center",
    gap: Spacing.sm,
    marginTop: Spacing.sm,
  },
  sectionTitle: {
    color: Colors.textPrimary,
    fontSize: FontSize.md,
    fontWeight: FontWeight.bold,
    letterSpacing: 0.5,
    flex: 1,
  },
  gradientField: {
    borderRadius: Radius.md,
    flexDirection: "row",
    alignItems: "center",
    minHeight: 52,
    paddingHorizontal: Spacing.md,
  },
  fieldIcon: { marginRight: Spacing.sm },
  gradientInner: { flex: 1 },
  gradientInput: {
    color: Colors.textPrimary,
    fontSize: FontSize.md,
    fontWeight: FontWeight.medium,
    paddingVertical: Spacing.md,
    flex: 1,
  },
  checkboxGroup: { gap: Spacing.sm },
  field: { gap: Spacing.xs },
  label: {
    color: Colors.textSecondary,
    fontSize: FontSize.sm,
    fontWeight: FontWeight.medium,
  },
  timeTrigger: {
    height: 52,
    borderRadius: Radius.md,
    borderWidth: 1,
    borderColor: Colors.primaryLight,
    paddingHorizontal: Spacing.lg,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  timeValue: {
    color: Colors.textPrimary,
    fontSize: FontSize.md,
    fontWeight: FontWeight.medium,
  },
  mapBtn: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: Spacing.sm,
    paddingVertical: Spacing.md,
    borderRadius: Radius.md,
    borderWidth: 1,
    borderColor: Colors.accent,
  },
  mapBtnText: {
    color: Colors.accent,
    fontSize: FontSize.sm,
    fontWeight: FontWeight.bold,
    letterSpacing: 0.5,
  },
  damageTable: { gap: Spacing.xs },
  damageHeaderRow: {
    flexDirection: "row",
    backgroundColor: "#019F6E",
    borderRadius: Radius.sm,
    overflow: "hidden",
  },
  damageHeaderCell: {
    color: Colors.textPrimary,
    fontSize: FontSize.xs,
    fontWeight: FontWeight.bold,
    paddingVertical: Spacing.sm,
    paddingHorizontal: 6,
    textAlign: "center",
  },
  damageInputRow: { flexDirection: "row", gap: 4 },
  damageInput: {
    backgroundColor: Colors.primary,
    borderWidth: 1,
    borderColor: Colors.primaryLight,
    borderRadius: Radius.sm,
    color: Colors.textPrimary,
    fontSize: FontSize.xs,
    paddingHorizontal: 6,
    paddingVertical: Spacing.sm,
    textAlign: "center",
  },
  damageColCrop: { flex: 1.2 },
  damageColArea: { flex: 1 },
  damageColLoss: { flex: 1 },
  descriptionGradient: {
    borderRadius: Radius.md,
    minHeight: 120,
    padding: Spacing.md,
  },
  descriptionInput: {
    color: Colors.textPrimary,
    fontSize: FontSize.sm,
    minHeight: 100,
  },
  photoRow: { flexDirection: "row", gap: Spacing.sm },
  photoSlot: { flex: 1, gap: 6 },
  photoSlotLabel: {
    color: Colors.textMuted,
    fontSize: FontSize.xs,
    textAlign: "center",
  },
  photoUploadBtn: { borderRadius: Radius.md, overflow: "hidden" },
  photoUploadGradient: {
    height: 88,
    alignItems: "center",
    justifyContent: "center",
    gap: 4,
    padding: Spacing.xs,
  },
  photoThumb: { width: "100%", height: "100%", borderRadius: Radius.sm },
  photoUploadText: {
    color: Colors.textPrimary,
    fontSize: 10,
    fontWeight: FontWeight.semibold,
    textAlign: "center",
  },
  attachBtn: { borderRadius: Radius.md, overflow: "hidden", alignSelf: "flex-start" },
  attachGradient: {
    flexDirection: "row",
    alignItems: "center",
    gap: Spacing.sm,
    paddingHorizontal: Spacing.lg,
    paddingVertical: Spacing.md,
  },
  attachText: {
    color: Colors.textPrimary,
    fontSize: FontSize.sm,
    fontWeight: FontWeight.semibold,
  },
  errorText: {
    color: "#F87171",
    fontSize: FontSize.sm,
    textAlign: "center",
  },
  submitBtn: { marginTop: Spacing.sm },
  sectionLabel: {
    color: Colors.textPrimary,
    fontSize: FontSize.lg,
    fontWeight: FontWeight.bold,
    marginTop: Spacing.lg,
  },
  listState: { paddingVertical: Spacing.lg },
  emptyText: {
    color: Colors.textMuted,
    fontSize: FontSize.sm,
    textAlign: "center",
    paddingVertical: Spacing.lg,
  },
  reportCard: {
    backgroundColor: Colors.primary,
    borderRadius: Radius.lg,
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: Colors.primaryLight,
    overflow: "hidden",
    marginBottom: Spacing.sm,
  },
  reportImage: { width: "100%", height: 140 },
  reportBody: { padding: Spacing.md, gap: 4 },
  reportTitle: {
    color: Colors.textPrimary,
    fontSize: FontSize.md,
    fontWeight: FontWeight.bold,
  },
  reportMeta: { color: Colors.textMuted, fontSize: FontSize.xs },
  reportDescription: { color: Colors.textSecondary, fontSize: FontSize.sm },
  modalBackdrop: { flex: 1, backgroundColor: "rgba(0,0,0,0.4)" },
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
  },
  iosAction: {
    color: Colors.textSecondary,
    fontSize: FontSize.md,
  },
  iosConfirm: {
    color: Colors.accent,
    fontWeight: FontWeight.semibold,
  },
});
