import { useCallback, useEffect, useState } from "react";
import { Ionicons } from "@expo/vector-icons";
import { Image } from "expo-image";
import {
  ActivityIndicator,
  KeyboardAvoidingView,
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

import coverPhoto from "@/assets/images/coverphoto.png";
import profileRightIcon from "@/assets/images/profile_right_icon.png";
import FarmerBadge from "@/assets/images/svg/farmerbadge.svg";
import UserIcon from "@/assets/images/svg/user.svg";
import { AvatarPicker } from "@/components/AvatarPicker";
import { BirthdayField } from "@/components/BirthdayField";
import { GenderField } from "@/components/GenderField";
import { PasswordField } from "@/components/PasswordField";
import { PrimaryButton } from "@/components/PrimaryButton";
import { TextField } from "@/components/TextField";
import { Colors, FontSize, FontWeight, Radius, Spacing } from "@/constants";
import { useLanguage } from "@/contexts/LanguageContext";
import { formatBirthdayDisplay } from "@/lib/birthday";
import {
  formatGenderForDisplay,
  genderToProfileValue,
  parseGenderFromProfile,
  type GenderOption,
} from "@/lib/gender";
import { pickProfileImage } from "@/lib/pickProfileImage";
import { resolveAssetUrl } from "@/lib/resolveAssetUrl";
import { getSession, updateSessionUser } from "@/lib/session";
import {
  changeMobilePassword,
  getMobileProfile,
  updateMobileProfile,
  uploadMobileAvatar,
  type MobileProfile,
  type UpdateMobileProfileInput,
} from "@/services/mobileAuthApi";

type ProfileForm = {
  name: string;
  email: string;
  birthday: string;
  placeOfBirth: string;
  nationality: string;
  occupation: string;
  education: string;
  age: string;
  genderOption: GenderOption;
  genderOther: string;
  contactNumber: string;
  alternativeContact: string;
  address: string;
  primaryIncome: string;
  mainCrop: string;
  farmingExperienceYears: string;
  farmingType: string;
  farmAreaHa: string;
  householdSize: string;
  organization: string;
};

type EditingSection = "personal" | "farming" | "beneficiary" | null;

function textValue(
  value: string | undefined | null,
  fallback: string,
): string {
  const trimmed = value?.trim();
  return trimmed && trimmed.length > 0 ? trimmed : fallback;
}

function countValue(
  value: number | undefined | null,
  fallback: string,
  suffix = "",
): string {
  return typeof value === "number" && value > 0
    ? `${value}${suffix}`
    : fallback;
}

function profileToForm(profile: MobileProfile): ProfileForm {
  const primaryCrop =
    profile.mainCrop?.trim() || profile.primaryCrops?.[0]?.trim() || "";

  const { option: genderOption, other: genderOther } = parseGenderFromProfile(
    profile.gender,
  );

  return {
    name: profile.name ?? "",
    email: profile.email ?? "",
    birthday: profile.birthday ?? "",
    placeOfBirth: profile.placeOfBirth ?? "",
    nationality: profile.nationality ?? "",
    occupation: profile.occupation ?? "",
    education: profile.education ?? "",
    age: profile.age > 0 ? String(profile.age) : "",
    genderOption,
    genderOther,
    contactNumber: profile.contactNumber ?? "",
    alternativeContact: profile.alternativeContact ?? "",
    address: profile.address ?? "",
    primaryIncome: profile.primaryIncome ?? "",
    mainCrop: primaryCrop,
    farmingExperienceYears:
      profile.farmingExperienceYears > 0
        ? String(profile.farmingExperienceYears)
        : "",
    farmingType: profile.farmingType ?? "",
    farmAreaHa:
      typeof profile.farmAreaHa === "number" && profile.farmAreaHa > 0
        ? String(profile.farmAreaHa)
        : "",
    householdSize:
      profile.householdSize > 0 ? String(profile.householdSize) : "",
    organization: profile.organization ?? "",
  };
}

function parseOptionalInt(value: string): number | undefined {
  const trimmed = value.trim();
  if (!trimmed) return undefined;
  const parsed = Number.parseInt(trimmed, 10);
  return Number.isFinite(parsed) ? parsed : undefined;
}

function parseOptionalFloat(value: string): number | undefined {
  const trimmed = value.trim();
  if (!trimmed) return undefined;
  const parsed = Number.parseFloat(trimmed);
  return Number.isFinite(parsed) ? parsed : undefined;
}

function personalSectionToUpdate(
  form: ProfileForm,
): UpdateMobileProfileInput {
  return {
    name: form.name.trim() || undefined,
    email: form.email.trim(),
    birthday: form.birthday.trim(),
    placeOfBirth: form.placeOfBirth.trim(),
    nationality: form.nationality.trim(),
    occupation: form.occupation.trim(),
    education: form.education.trim(),
    age: parseOptionalInt(form.age),
    gender: genderToProfileValue(form.genderOption, form.genderOther),
    contactNumber: form.contactNumber.trim() || undefined,
    alternativeContact: form.alternativeContact.trim(),
    address: form.address.trim(),
    primaryIncome: form.primaryIncome.trim(),
  };
}

function farmingSectionToUpdate(form: ProfileForm): UpdateMobileProfileInput {
  return {
    mainCrop: form.mainCrop.trim(),
    farmingExperienceYears: parseOptionalInt(form.farmingExperienceYears),
    farmingType: form.farmingType.trim(),
    farmAreaHa: parseOptionalFloat(form.farmAreaHa),
  };
}

function beneficiarySectionToUpdate(
  form: ProfileForm,
): UpdateMobileProfileInput {
  return {
    householdSize: parseOptionalInt(form.householdSize),
    organization: form.organization.trim(),
  };
}

type InfoRowProps = {
  label: string;
  value: string;
  isFirst?: boolean;
  isLast?: boolean;
  valueBold?: boolean;
};

function InfoRow({ label, value, isFirst, isLast, valueBold }: InfoRowProps) {
  return (
    <View style={styles.infoRow}>
      <View style={styles.timelineCol}>
        {!isFirst ? <View style={styles.timelineLineTop} /> : <View style={styles.timelineSpacer} />}
        <View style={styles.timelineDot} />
        {!isLast ? <View style={styles.timelineLineBottom} /> : <View style={styles.timelineSpacer} />}
      </View>
      <View style={styles.infoContent}>
        <Text style={styles.infoLabel}>{label}</Text>
        <Text style={[styles.infoValue, valueBold && styles.infoValueBold]}>{value}</Text>
      </View>
    </View>
  );
}

type EditFieldProps = {
  label: string;
  value: string;
  onChangeText: (text: string) => void;
  keyboardType?: "default" | "email-address" | "numeric" | "decimal-pad" | "phone-pad";
  autoCapitalize?: "none" | "sentences" | "words" | "characters";
  isPassword?: boolean;
};

function EditField({
  label,
  value,
  onChangeText,
  keyboardType = "default",
  autoCapitalize = "sentences",
  isPassword = false,
}: EditFieldProps) {
  const inputProps = {
    value,
    onChangeText,
    keyboardType,
    autoCapitalize,
    autoCorrect: false as const,
  };

  return (
    <View style={styles.editField}>
      <Text style={styles.editLabel}>{label}</Text>
      {isPassword ? (
        <PasswordField {...inputProps} />
      ) : (
        <TextField {...inputProps} />
      )}
    </View>
  );
}

type SectionPillHeaderProps = {
  title: string;
  editLabel?: string;
  canEdit?: boolean;
  onEdit?: () => void;
};

function SectionPillHeader({
  title,
  editLabel,
  canEdit = false,
  onEdit,
}: SectionPillHeaderProps) {
  return (
    <View style={styles.pillHeaderRow}>
      <View style={styles.pill}>
        <Text style={styles.pillText}>{title}</Text>
      </View>
      <View style={styles.pillActions}>
        {onEdit && canEdit ? (
          <Pressable
            accessibilityRole="button"
            onPress={onEdit}
            style={({ pressed }) => [
              styles.sectionEditButton,
              pressed && styles.sectionEditButtonPressed,
            ]}
          >
            <Ionicons name="create-outline" size={16} color={Colors.white} />
            <Text style={styles.sectionEditButtonText}>{editLabel}</Text>
          </Pressable>
        ) : null}
        <View style={styles.pillIconBox}>
          <Image source={profileRightIcon} style={styles.pillIcon} contentFit="cover" />
        </View>
      </View>
    </View>
  );
}

type PersonalSectionHeaderProps = {
  title: string;
  editLabel: string;
  canEdit: boolean;
  onEdit: () => void;
};

function PersonalSectionHeader({
  title,
  editLabel,
  canEdit,
  onEdit,
}: PersonalSectionHeaderProps) {
  return (
    <View style={styles.personalHeader}>
      <View style={styles.personalHeaderLeft}>
        <UserIcon width={28} height={28} />
        <Text style={styles.personalTitle}>{title}</Text>
      </View>
      {canEdit ? (
        <Pressable
          accessibilityRole="button"
          onPress={onEdit}
          style={({ pressed }) => [
            styles.sectionEditButton,
            pressed && styles.sectionEditButtonPressed,
          ]}
        >
          <Ionicons name="create-outline" size={16} color={Colors.white} />
          <Text style={styles.sectionEditButtonText}>{editLabel}</Text>
        </Pressable>
      ) : null}
    </View>
  );
}

type SectionSaveActionsProps = {
  saveLabel: string;
  cancelLabel: string;
  saving: boolean;
  onSave: () => void;
  onCancel: () => void;
};

function SectionSaveActions({
  saveLabel,
  cancelLabel,
  saving,
  onSave,
  onCancel,
}: SectionSaveActionsProps) {
  return (
    <View style={styles.sectionSaveActions}>
      <PrimaryButton
        label={saveLabel}
        loading={saving}
        onPress={onSave}
      />
      <Pressable
        accessibilityRole="button"
        disabled={saving}
        onPress={onCancel}
        style={({ pressed }) => [
          styles.cancelButton,
          (pressed || saving) && styles.cancelButtonPressed,
        ]}
      >
        <Text style={styles.cancelButtonText}>{cancelLabel}</Text>
      </Pressable>
    </View>
  );
}

export function ProfileScreen() {
  const { t } = useLanguage();
  const [profile, setProfile] = useState<MobileProfile | null>(null);
  const [form, setForm] = useState<ProfileForm | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [editingSection, setEditingSection] = useState<EditingSection>(null);
  const [error, setError] = useState<string | null>(null);
  const [saveMessage, setSaveMessage] = useState<string | null>(null);
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [changingPassword, setChangingPassword] = useState(false);
  const [passwordError, setPasswordError] = useState<string | null>(null);
  const [passwordSuccess, setPasswordSuccess] = useState<string | null>(null);
  const [uploadingAvatar, setUploadingAvatar] = useState(false);

  const loadProfile = useCallback(async () => {
    const session = getSession();
    if (!session) {
      setLoading(false);
      setError("You are not signed in.");
      return;
    }

    setLoading(true);
    setError(null);
    try {
      const data = await getMobileProfile(session.token);
      setProfile(data);
      setForm(profileToForm(data));
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "Could not load your profile.",
      );
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    void loadProfile();
  }, [loadProfile]);

  function startEditingSection(section: Exclude<EditingSection, null>) {
    if (profile) {
      setForm(profileToForm(profile));
    }
    setSaveMessage(null);
    setError(null);
    setEditingSection(section);
  }

  function cancelEditingSection() {
    if (profile) {
      setForm(profileToForm(profile));
    }
    setSaveMessage(null);
    setEditingSection(null);
  }

  function updateFormField<K extends keyof ProfileForm>(
    key: K,
    value: ProfileForm[K],
  ) {
    setForm((prev) => (prev ? { ...prev, [key]: value } : prev));
  }

  async function handleSaveSection(section: Exclude<EditingSection, null>) {
    const session = getSession();
    if (!session || !form) return;

    const payload =
      section === "personal"
        ? personalSectionToUpdate(form)
        : section === "farming"
          ? farmingSectionToUpdate(form)
          : beneficiarySectionToUpdate(form);

    setSaving(true);
    setSaveMessage(null);
    setError(null);

    try {
      const updated = await updateMobileProfile(session.token, payload);
      setProfile(updated);
      setForm(profileToForm(updated));
      setEditingSection(null);
      setSaveMessage(t("profile.profileSaved"));

      updateSessionUser({
        ...session.user,
        name: updated.name,
        contactNumber: updated.contactNumber,
        barangay: updated.barangay,
      });
    } catch (err) {
      setError(
        err instanceof Error ? err.message : t("profile.profileSaveFailed"),
      );
    } finally {
      setSaving(false);
    }
  }

  async function handlePickAvatar() {
    const session = getSession();
    if (!session) return;

    setError(null);
    setSaveMessage(null);

    try {
      const imageUri = await pickProfileImage();
      if (!imageUri) return;

      setUploadingAvatar(true);
      const updated = await uploadMobileAvatar(session.token, imageUri);
      setProfile(updated);
      setForm(profileToForm(updated));
      setSaveMessage(t("profile.avatarUpdated"));
    } catch (err) {
      setError(
        err instanceof Error ? err.message : t("profile.avatarUpdateFailed"),
      );
    } finally {
      setUploadingAvatar(false);
    }
  }

  async function handleChangePassword() {
    const session = getSession();
    if (!session) return;

    setPasswordError(null);
    setPasswordSuccess(null);

    if (currentPassword.length < 6 || newPassword.length < 6) {
      setPasswordError(t("profile.passwordTooShort"));
      return;
    }
    if (newPassword !== confirmPassword) {
      setPasswordError(t("profile.passwordMismatch"));
      return;
    }

    setChangingPassword(true);
    try {
      await changeMobilePassword(session.token, {
        currentPassword,
        newPassword,
      });
      setCurrentPassword("");
      setNewPassword("");
      setConfirmPassword("");
      setPasswordSuccess(t("profile.passwordChanged"));
    } catch (err) {
      setPasswordError(
        err instanceof Error ? err.message : t("profile.passwordChangeFailed"),
      );
    } finally {
      setChangingPassword(false);
    }
  }

  const session = getSession();
  const notProvided = t("profile.notProvided");
  const displayName = textValue(profile?.name ?? session?.user.name, notProvided);
  const displayFarmerId = textValue(
    profile?.farmerCode ?? session?.user.farmerCode,
    notProvided,
  );
  const displayRegistryId = textValue(profile?.registryId, notProvided);
  const displayBarangay = textValue(
    profile?.barangay ?? session?.user.barangay,
    notProvided,
  );
  const displayStatus =
    profile?.status === "active"
      ? t("profile.statusActive")
      : profile?.status === "inactive"
        ? t("profile.statusInactive")
        : notProvided;

  const primaryCrop =
    profile?.mainCrop?.trim() || profile?.primaryCrops?.[0]?.trim() || "";

  const accountRows = [
    { label: t("profile.farmerId"), value: displayFarmerId },
    { label: t("profile.registryId"), value: displayRegistryId },
    { label: t("profile.barangay"), value: displayBarangay },
    { label: t("profile.status"), value: displayStatus },
  ];

  const personalRows = [
    { label: t("profile.fullName"), value: textValue(profile?.name, notProvided) },
    {
      label: t("profile.birthday"),
      value: formatBirthdayDisplay(profile?.birthday, notProvided),
    },
    {
      label: t("profile.placeOfBirth"),
      value: textValue(profile?.placeOfBirth, notProvided),
    },
    {
      label: t("profile.nationality"),
      value: textValue(profile?.nationality, notProvided),
    },
    {
      label: t("profile.occupation"),
      value: textValue(profile?.occupation, notProvided),
    },
    {
      label: t("profile.education"),
      value: textValue(profile?.education, notProvided),
    },
    { label: t("profile.email"), value: textValue(profile?.email, notProvided) },
    { label: t("profile.age"), value: countValue(profile?.age, notProvided) },
    {
      label: t("profile.gender"),
      value: formatGenderForDisplay(profile?.gender, {
        male: t("profile.genderMale"),
        female: t("profile.genderFemale"),
        notProvided,
      }),
    },
    {
      label: t("profile.contactNumber"),
      value: textValue(profile?.contactNumber, notProvided),
    },
    {
      label: t("profile.alternativeContact"),
      value: textValue(profile?.alternativeContact, notProvided),
    },
    { label: t("profile.address"), value: textValue(profile?.address, notProvided) },
    {
      label: t("profile.primaryIncome"),
      value: textValue(profile?.primaryIncome, notProvided),
    },
  ];

  const farmingRows = [
    { label: t("profile.primaryCrop"), value: textValue(primaryCrop, notProvided) },
    {
      label: t("profile.yearsOfFarming"),
      value: countValue(profile?.farmingExperienceYears, notProvided, " Years"),
    },
    {
      label: t("profile.farmingType"),
      value: textValue(profile?.farmingType, notProvided),
    },
    {
      label: t("profile.totalFarmingArea"),
      value:
        typeof profile?.farmAreaHa === "number" && profile.farmAreaHa > 0
          ? `${profile.farmAreaHa.toFixed(2)} Hectares`
          : notProvided,
    },
  ];

  const beneficiaryRows = [
    {
      label: t("profile.householdSize"),
      value: countValue(profile?.householdSize, notProvided),
    },
    {
      label: t("profile.registeredBeneficiary"),
      value: profile?.registeredBeneficiary ? "Yes" : "No",
    },
    {
      label: t("profile.organization"),
      value: textValue(profile?.organization, notProvided),
    },
  ];

  if (loading) {
    return (
      <SafeAreaView style={[styles.safeArea, styles.loadingWrap]} edges={["top"]}>
        <ActivityIndicator color={Colors.accent} size="large" />
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.safeArea} edges={["top"]}>
      <KeyboardAvoidingView
        style={styles.flex}
        behavior={Platform.OS === "ios" ? "padding" : undefined}
      >
        <ScrollView
          style={styles.scroll}
          contentContainerStyle={styles.scrollContent}
          showsVerticalScrollIndicator={false}
          keyboardShouldPersistTaps="handled"
        >
          <View style={styles.coverWrap}>
            <Image source={coverPhoto} style={styles.cover} contentFit="cover" />
          </View>

          <View style={styles.identityRow}>
            <View style={styles.avatarBlock}>
              <AvatarPicker
                uri={resolveAssetUrl(profile?.avatarUrl)}
                size={AVATAR_SIZE}
                shape="rounded"
                borderRadius={Radius.lg}
                loading={uploadingAvatar}
                onPress={() => void handlePickAvatar()}
                accessibilityLabel={t("profile.changePhoto")}
              />
              <View style={styles.badgeWrap}>
                <FarmerBadge width={44} height={44} />
              </View>
            </View>

            <View style={styles.nameBlock}>
              <Text style={styles.name}>{displayName}</Text>
              <Text style={styles.farmerId}>{displayFarmerId}</Text>
              <Text style={styles.metaText}>{displayBarangay}</Text>
            </View>
          </View>

          {error ? <Text style={styles.errorText}>{error}</Text> : null}
          {saveMessage ? <Text style={styles.successText}>{saveMessage}</Text> : null}

          <View style={styles.section}>
            <View style={styles.infoList}>
              {accountRows.map((row, index) => (
                <InfoRow
                  key={row.label}
                  label={row.label}
                  value={row.value}
                  isFirst={index === 0}
                  isLast={index === accountRows.length - 1}
                />
              ))}
            </View>
          </View>

          <View style={styles.section}>
            <PersonalSectionHeader
              title={t("profile.personalInformation")}
              editLabel={t("profile.edit")}
              canEdit={editingSection === null}
              onEdit={() => startEditingSection("personal")}
            />

            {editingSection === "personal" && form ? (
              <View style={styles.editForm}>
                <EditField
                  label={t("profile.fullName")}
                  value={form.name}
                  onChangeText={(text) => updateFormField("name", text)}
                  autoCapitalize="words"
                />
                <BirthdayField
                  label={t("profile.birthday")}
                  value={form.birthday}
                  onChange={(isoDate) => updateFormField("birthday", isoDate)}
                  placeholder={t("profile.selectBirthday")}
                  cancelLabel={t("profile.cancel")}
                  doneLabel={t("profile.done")}
                />
                <EditField
                  label={t("profile.placeOfBirth")}
                  value={form.placeOfBirth}
                  onChangeText={(text) => updateFormField("placeOfBirth", text)}
                />
                <EditField
                  label={t("profile.nationality")}
                  value={form.nationality}
                  onChangeText={(text) => updateFormField("nationality", text)}
                />
                <EditField
                  label={t("profile.occupation")}
                  value={form.occupation}
                  onChangeText={(text) => updateFormField("occupation", text)}
                />
                <EditField
                  label={t("profile.education")}
                  value={form.education}
                  onChangeText={(text) => updateFormField("education", text)}
                />
                <EditField
                  label={t("profile.email")}
                  value={form.email}
                  onChangeText={(text) => updateFormField("email", text)}
                  keyboardType="email-address"
                  autoCapitalize="none"
                />
                <EditField
                  label={t("profile.age")}
                  value={form.age}
                  onChangeText={(text) => updateFormField("age", text)}
                  keyboardType="numeric"
                />
                <GenderField
                  label={t("profile.gender")}
                  option={form.genderOption}
                  otherValue={form.genderOther}
                  onChangeOption={(option) => updateFormField("genderOption", option)}
                  onChangeOther={(text) => updateFormField("genderOther", text)}
                  maleLabel={t("profile.genderMale")}
                  femaleLabel={t("profile.genderFemale")}
                  otherLabel={t("profile.genderOther")}
                  specifyLabel={t("profile.genderSpecify")}
                  specifyPlaceholder={t("profile.genderSpecifyPlaceholder")}
                />
                <EditField
                  label={t("profile.contactNumber")}
                  value={form.contactNumber}
                  onChangeText={(text) => updateFormField("contactNumber", text)}
                  keyboardType="phone-pad"
                />
                <EditField
                  label={t("profile.alternativeContact")}
                  value={form.alternativeContact}
                  onChangeText={(text) => updateFormField("alternativeContact", text)}
                  keyboardType="phone-pad"
                />
                <EditField
                  label={t("profile.address")}
                  value={form.address}
                  onChangeText={(text) => updateFormField("address", text)}
                />
                <EditField
                  label={t("profile.primaryIncome")}
                  value={form.primaryIncome}
                  onChangeText={(text) => updateFormField("primaryIncome", text)}
                />
              </View>
            ) : (
              <View style={styles.infoList}>
                {personalRows.map((row, index) => (
                  <InfoRow
                    key={row.label}
                    label={row.label}
                    value={row.value}
                    isFirst={index === 0}
                    isLast={index === personalRows.length - 1}
                  />
                ))}
              </View>
            )}

            {editingSection === "personal" ? (
              <SectionSaveActions
                saveLabel={t("profile.saveChanges")}
                cancelLabel={t("profile.cancel")}
                saving={saving}
                onSave={() => void handleSaveSection("personal")}
                onCancel={cancelEditingSection}
              />
            ) : null}
          </View>

          <View style={styles.section}>
            <SectionPillHeader
              title={t("profile.farmingInformation")}
              editLabel={t("profile.edit")}
              canEdit={editingSection === null}
              onEdit={() => startEditingSection("farming")}
            />

            {editingSection === "farming" && form ? (
              <View style={styles.editForm}>
                <EditField
                  label={t("profile.primaryCrop")}
                  value={form.mainCrop}
                  onChangeText={(text) => updateFormField("mainCrop", text)}
                />
                <EditField
                  label={t("profile.yearsOfFarming")}
                  value={form.farmingExperienceYears}
                  onChangeText={(text) => updateFormField("farmingExperienceYears", text)}
                  keyboardType="numeric"
                />
                <EditField
                  label={t("profile.farmingType")}
                  value={form.farmingType}
                  onChangeText={(text) => updateFormField("farmingType", text)}
                />
                <EditField
                  label={t("profile.totalFarmingArea")}
                  value={form.farmAreaHa}
                  onChangeText={(text) => updateFormField("farmAreaHa", text)}
                  keyboardType="decimal-pad"
                />
              </View>
            ) : (
              <View style={[styles.infoList, styles.infoListAfterPill]}>
                {farmingRows.map((row, index) => (
                  <InfoRow
                    key={row.label}
                    label={row.label}
                    value={row.value}
                    isFirst={index === 0}
                    isLast={index === farmingRows.length - 1}
                  />
                ))}
              </View>
            )}

            {editingSection === "farming" ? (
              <SectionSaveActions
                saveLabel={t("profile.saveChanges")}
                cancelLabel={t("profile.cancel")}
                saving={saving}
                onSave={() => void handleSaveSection("farming")}
                onCancel={cancelEditingSection}
              />
            ) : null}
          </View>

          <View style={styles.section}>
            <SectionPillHeader
              title={t("profile.beneficiaryInfo")}
              editLabel={t("profile.edit")}
              canEdit={editingSection === null}
              onEdit={() => startEditingSection("beneficiary")}
            />

            {editingSection === "beneficiary" && form ? (
              <View style={styles.editForm}>
                <EditField
                  label={t("profile.householdSize")}
                  value={form.householdSize}
                  onChangeText={(text) => updateFormField("householdSize", text)}
                  keyboardType="numeric"
                />
                <InfoRow
                  label={t("profile.registeredBeneficiary")}
                  value={profile?.registeredBeneficiary ? "Yes" : "No"}
                  isFirst
                />
                <EditField
                  label={t("profile.organization")}
                  value={form.organization}
                  onChangeText={(text) => updateFormField("organization", text)}
                />
              </View>
            ) : (
              <View style={[styles.infoList, styles.infoListAfterPill]}>
                {beneficiaryRows.map((row, index) => (
                  <InfoRow
                    key={row.label}
                    label={row.label}
                    value={row.value}
                    isFirst={index === 0}
                    isLast={index === beneficiaryRows.length - 1}
                    valueBold={row.label === t("profile.organization")}
                  />
                ))}
              </View>
            )}

            {editingSection === "beneficiary" ? (
              <SectionSaveActions
                saveLabel={t("profile.saveChanges")}
                cancelLabel={t("profile.cancel")}
                saving={saving}
                onSave={() => void handleSaveSection("beneficiary")}
                onCancel={cancelEditingSection}
              />
            ) : null}
          </View>

          {editingSection === null ? (
            <View style={styles.section}>
              <SectionPillHeader title={t("profile.changePassword")} />
              <View style={styles.editForm}>
                <EditField
                  label={t("profile.currentPassword")}
                  value={currentPassword}
                  onChangeText={(text) => {
                    setCurrentPassword(text);
                    if (passwordError) setPasswordError(null);
                  }}
                  autoCapitalize="none"
                  isPassword
                />
                <EditField
                  label={t("profile.newPassword")}
                  value={newPassword}
                  onChangeText={(text) => {
                    setNewPassword(text);
                    if (passwordError) setPasswordError(null);
                  }}
                  autoCapitalize="none"
                  isPassword
                />
                <EditField
                  label={t("profile.confirmPassword")}
                  value={confirmPassword}
                  onChangeText={(text) => {
                    setConfirmPassword(text);
                    if (passwordError) setPasswordError(null);
                  }}
                  autoCapitalize="none"
                  isPassword
                />
                {passwordError ? (
                  <Text style={styles.errorText}>{passwordError}</Text>
                ) : null}
                {passwordSuccess ? (
                  <Text style={styles.successText}>{passwordSuccess}</Text>
                ) : null}
                <PrimaryButton
                  label={t("profile.updatePassword")}
                  loading={changingPassword}
                  onPress={() => void handleChangePassword()}
                />
              </View>
            </View>
          ) : null}
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const AVATAR_SIZE = 96;
const PROFILE_SECTION_GREEN = "#186539";

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: Colors.primaryDark,
  },
  flex: {
    flex: 1,
  },
  loadingWrap: {
    alignItems: "center",
    justifyContent: "center",
  },
  errorText: {
    color: "#FCA5A5",
    fontSize: FontSize.sm,
    textAlign: "center",
    paddingHorizontal: Spacing.lg,
    marginBottom: Spacing.md,
  },
  successText: {
    color: "#86EFAC",
    fontSize: FontSize.sm,
    textAlign: "center",
    paddingHorizontal: Spacing.lg,
    marginBottom: Spacing.md,
  },
  scroll: {
    flex: 1,
  },
  scrollContent: {
    paddingBottom: Spacing.xxxl,
  },
  coverWrap: {
    width: "100%",
    height: 168,
    backgroundColor: Colors.primaryLight,
  },
  cover: {
    width: "100%",
    height: "100%",
  },
  identityRow: {
    flexDirection: "row",
    alignItems: "flex-end",
    paddingHorizontal: Spacing.lg,
    marginTop: -AVATAR_SIZE / 2,
    marginBottom: Spacing.md,
    gap: Spacing.md,
    overflow: "visible",
  },
  avatarBlock: {
    width: AVATAR_SIZE,
    height: AVATAR_SIZE,
    position: "relative",
    overflow: "visible",
  },
  badgeWrap: {
    position: "absolute",
    bottom: -15,
    right: -8,
    zIndex: 1,
  },
  nameBlock: {
    flex: 1,
    paddingBottom: Spacing.sm,
    justifyContent: "flex-end",
  },
  name: {
    color: Colors.textPrimary,
    fontSize: FontSize.lg,
    fontWeight: FontWeight.bold,
    marginBottom: Spacing.xs,
  },
  farmerId: {
    color: Colors.textSecondary,
    fontSize: FontSize.sm,
    fontWeight: FontWeight.medium,
  },
  metaText: {
    color: Colors.textSecondary,
    fontSize: FontSize.xs,
    marginTop: Spacing.xs,
  },
  section: {
    paddingHorizontal: Spacing.lg,
    marginBottom: Spacing.xl,
  },
  personalHeader: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    gap: Spacing.sm,
    marginBottom: Spacing.lg,
  },
  personalHeaderLeft: {
    flexDirection: "row",
    alignItems: "center",
    gap: Spacing.sm,
    flex: 1,
  },
  personalTitle: {
    color: Colors.textPrimary,
    fontSize: FontSize.md,
    fontWeight: FontWeight.bold,
  },
  pillHeaderRow: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: Spacing.lg,
    gap: Spacing.sm,
  },
  pillActions: {
    flexDirection: "row",
    alignItems: "center",
    gap: Spacing.sm,
  },
  sectionEditButton: {
    flexDirection: "row",
    alignItems: "center",
    gap: Spacing.xs,
    backgroundColor: "rgba(255,255,255,0.12)",
    borderRadius: Radius.pill,
    paddingVertical: Spacing.xs,
    paddingHorizontal: Spacing.md,
  },
  sectionEditButtonPressed: {
    opacity: 0.85,
  },
  sectionEditButtonText: {
    color: Colors.white,
    fontSize: FontSize.xs,
    fontWeight: FontWeight.semibold,
  },
  pill: {
    flex: 1,
    backgroundColor: PROFILE_SECTION_GREEN,
    borderRadius: 9,
    paddingVertical: Spacing.md,
    paddingHorizontal: Spacing.lg,
    marginRight: Spacing.sm,
  },
  pillText: {
    color: Colors.white,
    fontSize: FontSize.md,
    fontWeight: FontWeight.bold,
  },
  pillIconBox: {
    width: 48,
    height: 48,
    borderRadius: 9,
    overflow: "hidden",
    backgroundColor: PROFILE_SECTION_GREEN,
  },
  pillIcon: {
    width: 48,
    height: 48,
    borderRadius: 9,
  },
  infoList: {
    gap: 0,
  },
  infoListAfterPill: {
    marginTop: Spacing.xs,
  },
  editForm: {
    gap: Spacing.md,
  },
  editField: {
    gap: Spacing.xs,
  },
  editLabel: {
    color: Colors.textSecondary,
    fontSize: FontSize.sm,
    fontWeight: FontWeight.medium,
  },
  infoRow: {
    flexDirection: "row",
    minHeight: 52,
  },
  timelineCol: {
    width: 20,
    alignItems: "center",
    marginRight: Spacing.md,
  },
  timelineSpacer: {
    flex: 1,
  },
  timelineLineTop: {
    width: 2,
    flex: 1,
    backgroundColor: Colors.dotInactive,
    minHeight: 4,
  },
  timelineLineBottom: {
    width: 2,
    flex: 1,
    backgroundColor: Colors.dotInactive,
    minHeight: 4,
  },
  timelineDot: {
    width: 10,
    height: 10,
    borderRadius: 5,
    backgroundColor: Colors.accent,
    marginVertical: 2,
  },
  infoContent: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingVertical: Spacing.md,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: "rgba(255,255,255,0.08)",
    gap: Spacing.md,
  },
  infoLabel: {
    flex: 1,
    color: Colors.textSecondary,
    fontSize: FontSize.sm,
    fontWeight: FontWeight.medium,
  },
  infoValue: {
    flex: 1,
    color: Colors.textPrimary,
    fontSize: FontSize.sm,
    fontWeight: FontWeight.semibold,
    textAlign: "right",
  },
  infoValueBold: {
    fontWeight: FontWeight.bold,
  },
  sectionSaveActions: {
    gap: Spacing.md,
    marginTop: Spacing.lg,
    marginBottom: Spacing.md,
  },
  cancelButton: {
    height: 56,
    borderRadius: Radius.pill,
    borderWidth: 1,
    borderColor: Colors.primaryLight,
    alignItems: "center",
    justifyContent: "center",
  },
  cancelButtonPressed: {
    opacity: 0.7,
  },
  cancelButtonText: {
    color: Colors.textPrimary,
    fontSize: FontSize.md,
    fontWeight: FontWeight.semibold,
  },
});
