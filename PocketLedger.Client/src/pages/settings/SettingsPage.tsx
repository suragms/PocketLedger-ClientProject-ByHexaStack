import { useState, useRef } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { motion, AnimatePresence } from 'framer-motion';
import { useAppSelector, useAppDispatch } from '../../app/hooks';
import { setThemeMode } from '../../app/uiSlice';
import { setUser } from '../../features/auth/authSlice';
import { settingsApi } from '../../api/settings.api';
import { authApi } from '../../api/auth.api';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '../../components/ui/Card';
import Button from '../../components/ui/Button';
import Input from '../../components/ui/Input';
import Modal from '../../components/ui/Modal';
import Skeleton from '../../components/ui/Skeleton';
import PinInput from '../../components/auth/PinInput';
import { CURRENCIES, LANGUAGES, THEME_OPTIONS } from '../../lib/constants';
import {
  updateProfileSchema,
  changePasswordSchema,
  setPinSchema,
  deleteAccountSchema,
  enable2FASchema,
  disable2FASchema,
  type UpdateProfileInput,
  type ChangePasswordInput,
  type SetPinInput,
  type DeleteAccountInput,
  type Enable2FAInput,
  type Disable2FAInput,
} from '../../lib/validators';
import {
  UserCircleIcon,
  PhotoIcon,
  SwatchIcon,
  LanguageIcon,
  CurrencyDollarIcon,
  ShieldCheckIcon,
  KeyIcon,
  LockClosedIcon,
  FingerPrintIcon,
  DocumentArrowUpIcon,
  DocumentArrowDownIcon,
  TrashIcon,
  InformationCircleIcon,
  CheckCircleIcon,
  ExclamationTriangleIcon,
  SunIcon,
  MoonIcon,
  ComputerDesktopIcon,
  EnvelopeIcon,
  BellIcon,
  EyeIcon,
} from '@heroicons/react/24/outline';
import toast from 'react-hot-toast';
import type { UserSettings, Passkey } from '../../types';

const tabs = [
  { id: 'profile', label: 'Profile', icon: UserCircleIcon },
  { id: 'appearance', label: 'Appearance', icon: SwatchIcon },
  { id: 'security', label: 'Security', icon: ShieldCheckIcon },
  { id: 'notifications', label: 'Notifications', icon: BellIcon },
  { id: 'data', label: 'Data', icon: DocumentArrowUpIcon },
  { id: 'about', label: 'About', icon: InformationCircleIcon },
] as const;

const THEME_ICONS: Record<string, typeof SunIcon> = {
  light: SunIcon,
  dark: MoonIcon,
  system: ComputerDesktopIcon,
};

export default function SettingsPage() {
  const dispatch = useAppDispatch();
  const queryClient = useQueryClient();
  const { user } = useAppSelector((state) => state.auth);
  const { themeMode } = useAppSelector((state) => state.ui);
  const [activeTab, setActiveTab] = useState<string>('profile');
  const avatarInputRef = useRef<HTMLInputElement>(null);
  const importInputRef = useRef<HTMLInputElement>(null);

  // Modals
  const [showChangePassword, setShowChangePassword] = useState(false);
  const [showSetPin, setShowSetPin] = useState(false);
  const [showEnable2FA, setShowEnable2FA] = useState(false);
  const [showVerify2FA, setShowVerify2FA] = useState(false);
  const [showDisable2FA, setShowDisable2FA] = useState(false);
  const [showDeleteAccount, setShowDeleteAccount] = useState(false);
  const [show2FACodes, setShow2FACodes] = useState(false);
  const [twoFACodes, setTwoFACodes] = useState<string[]>([]);
  const [twoFASecret, setTwoFASecret] = useState('');

  // Queries
  const { data: profileData, isLoading: profileLoading } = useQuery({
    queryKey: ['settings-profile'],
    queryFn: () => settingsApi.getProfile(),
  });

  const { data: settingsData, isLoading: settingsLoading } = useQuery({
    queryKey: ['settings'],
    queryFn: () => settingsApi.getSettings(),
  });

  const { data: passkeysData } = useQuery({
    queryKey: ['settings-passkeys'],
    queryFn: () => settingsApi.getPasskeys(),
    enabled: activeTab === 'security',
  });

  const { data: twoFAData } = useQuery({
    queryKey: ['settings-2fa'],
    queryFn: () => settingsApi.get2FAStatus(),
    enabled: activeTab === 'security',
  });

  const { data: aboutData } = useQuery({
    queryKey: ['settings-about'],
    queryFn: () => settingsApi.getAbout(),
    enabled: activeTab === 'about',
  });

  // Profile form
  const profileForm = useForm({
    resolver: zodResolver(updateProfileSchema),
    defaultValues: {
      firstName: user?.firstName || '',
      lastName: user?.lastName || '',
      defaultCurrency: user?.defaultCurrency || 'USD',
    },
  });

  // Password form
  const passwordForm = useForm<ChangePasswordInput>({
    resolver: zodResolver(changePasswordSchema),
  });

  // PIN form
  const pinForm = useForm<SetPinInput>({
    resolver: zodResolver(setPinSchema),
  });

  // Delete form
  const deleteForm = useForm<DeleteAccountInput>({
    resolver: zodResolver(deleteAccountSchema),
  });

  // 2FA verify form
  const verify2FAForm = useForm<Enable2FAInput>({
    resolver: zodResolver(enable2FASchema),
  });

  // Disable 2FA form
  const disable2FAForm = useForm<Disable2FAInput>({
    resolver: zodResolver(disable2FASchema),
  });

  // Mutations
  const updateProfileMutation = useMutation({
    mutationFn: (data: UpdateProfileInput) => settingsApi.updateProfile(data),
    onSuccess: (res) => {
      queryClient.invalidateQueries({ queryKey: ['settings-profile'] });
      if (res.data) {
        dispatch(setUser({ ...user!, firstName: res.data.firstName, lastName: res.data.lastName, defaultCurrency: res.data.defaultCurrency }));
      }
      toast.success('Profile updated!');
    },
    onError: () => toast.error('Failed to update profile'),
  });

  const uploadAvatarMutation = useMutation({
    mutationFn: (file: File) => settingsApi.uploadAvatar(file),
    onSuccess: (res) => {
      queryClient.invalidateQueries({ queryKey: ['settings-profile'] });
      if (res.data) {
        dispatch(setUser({ ...user!, avatarUrl: res.data.avatarUrl }));
      }
      toast.success('Avatar updated!');
    },
    onError: () => toast.error('Failed to upload avatar'),
  });

  const updateAppearanceMutation = useMutation({
    mutationFn: (data: { theme: string; language: string; currency: string }) => settingsApi.updateAppearance(data),
    onSuccess: (res) => {
      queryClient.invalidateQueries({ queryKey: ['settings'] });
      if (res.data) {
        dispatch(setThemeMode(res.data.theme as 'light' | 'dark' | 'system'));
      }
      toast.success('Appearance updated!');
    },
    onError: () => toast.error('Failed to update appearance'),
  });

  const updateNotificationsMutation = useMutation({
    mutationFn: (data: UserSettings) => settingsApi.updateNotifications(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['settings'] });
      toast.success('Notification settings updated!');
    },
    onError: () => toast.error('Failed to update notification settings'),
  });

  const updatePrivacyMutation = useMutation({
    mutationFn: (data: UserSettings) => settingsApi.updatePrivacy(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['settings'] });
      toast.success('Privacy settings updated!');
    },
    onError: () => toast.error('Failed to update privacy settings'),
  });

  const changePasswordMutation = useMutation({
    mutationFn: (data: ChangePasswordInput) => settingsApi.changePassword(data),
    onSuccess: () => {
      setShowChangePassword(false);
      passwordForm.reset();
      toast.success('Password changed!');
    },
    onError: () => toast.error('Failed to change password'),
  });

  const setPinMutation = useMutation({
    mutationFn: (data: SetPinInput) => authApi.setPin(data),
    onSuccess: async () => {
      const updatedUser = await authApi.getCurrentUser();
      dispatch(setUser(updatedUser));
      setShowSetPin(false);
      pinForm.reset();
      toast.success('PIN set!');
    },
    onError: () => toast.error('Failed to set PIN'),
  });

  const removePinMutation = useMutation({
    mutationFn: (password: string) => authApi.removePin({ currentPassword: password }),
    onSuccess: async () => {
      const updatedUser = await authApi.getCurrentUser();
      dispatch(setUser(updatedUser));
      toast.success('PIN removed!');
    },
    onError: () => toast.error('Failed to remove PIN'),
  });

  const enable2FAMutation = useMutation({
    mutationFn: () => settingsApi.enable2FA(),
    onSuccess: (res) => {
      if (res.data) {
        setTwoFASecret(res.data.secretKey);
        setTwoFACodes(res.data.recoveryCodes);
      }
      setShowEnable2FA(false);
      setShowVerify2FA(true);
    },
    onError: () => toast.error('Failed to initiate 2FA'),
  });

  const verify2FAMutation = useMutation({
    mutationFn: (code: string) => settingsApi.verify2FA(code),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['settings-2fa'] });
      setShowVerify2FA(false);
      setShow2FACodes(true);
      verify2FAForm.reset();
      toast.success('2FA enabled!');
    },
    onError: () => toast.error('Invalid code'),
  });

  const disable2FAMutation = useMutation({
    mutationFn: (password: string) => settingsApi.disable2FA(password),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['settings-2fa'] });
      setShowDisable2FA(false);
      disable2FAForm.reset();
      toast.success('2FA disabled!');
    },
    onError: () => toast.error('Failed to disable 2FA'),
  });

  const deletePasskeyMutation = useMutation({
    mutationFn: (id: number) => settingsApi.deletePasskey(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['settings-passkeys'] });
      toast.success('Passkey deleted!');
    },
    onError: () => toast.error('Failed to delete passkey'),
  });

  const exportMutation = useMutation({
    mutationFn: () => settingsApi.exportData(),
    onSuccess: (res) => {
      if (res.data) {
        const link = document.createElement('a');
        link.href = res.data.downloadUrl;
        link.download = res.data.fileName;
        link.click();
        toast.success('Data exported!');
      }
    },
    onError: () => toast.error('Failed to export data'),
  });

  const importMutation = useMutation({
    mutationFn: (file: File) => settingsApi.importData(file),
    onSuccess: (res) => {
      queryClient.invalidateQueries();
      if (res.data) {
        toast.success(`Imported: ${res.data.accountsImported} accounts, ${res.data.categoriesImported} categories`);
      }
    },
    onError: () => toast.error('Failed to import data'),
  });

  const deleteAccountMutation = useMutation({
    mutationFn: (password: string) => settingsApi.deleteAccount(password),
    onSuccess: () => {
      toast.success('Account deleted');
      window.location.href = '/login';
    },
    onError: () => toast.error('Failed to delete account'),
  });

  const profile = profileData?.data;
  const settings = settingsData?.data;
  const passkeys = passkeysData?.data?.passkeys || [];
  const twoFAStatus = twoFAData?.data;
  const about = aboutData?.data;

  if (profileLoading || settingsLoading) {
    return (
      <div className="space-y-6">
        <Skeleton className="h-10 w-48" />
        <Skeleton className="h-12 w-full rounded-xl" />
        <Skeleton className="h-96 w-full rounded-xl" />
      </div>
    );
  }

  return (
    <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="space-y-6 max-w-4xl">
      <h1 className="text-3xl font-bold">Settings</h1>

      {/* Tab Navigation */}
      <div className="flex gap-1 overflow-x-auto pb-2 border-b">
        {tabs.map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            className={`flex items-center gap-2 px-4 py-2.5 rounded-lg text-sm font-medium whitespace-nowrap transition-colors ${
              activeTab === tab.id
                ? 'bg-primary text-primary-foreground'
                : 'text-muted-foreground hover:bg-muted hover:text-foreground'
            }`}
          >
            <tab.icon className="h-4 w-4" />
            {tab.label}
          </button>
        ))}
      </div>

      <AnimatePresence mode="wait">
        <motion.div
          key={activeTab}
          initial={{ opacity: 0, x: 10 }}
          animate={{ opacity: 1, x: 0 }}
          exit={{ opacity: 0, x: -10 }}
          transition={{ duration: 0.15 }}
        >
          {/* ===== PROFILE TAB ===== */}
          {activeTab === 'profile' && (
            <div className="space-y-6">
              {/* Avatar */}
              <Card>
                <CardHeader>
                  <CardTitle>Profile Photo</CardTitle>
                  <CardDescription>Upload a profile picture</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="flex items-center gap-6">
                    <div className="relative group">
                      <div className="h-24 w-24 rounded-full bg-muted flex items-center justify-center overflow-hidden">
                        {profile?.avatarUrl ? (
                          <img src={profile.avatarUrl} alt="Avatar" className="h-full w-full object-cover" />
                        ) : (
                          <UserCircleIcon className="h-16 w-16 text-muted-foreground" />
                        )}
                      </div>
                      <button
                        onClick={() => avatarInputRef.current?.click()}
                        className="absolute inset-0 rounded-full bg-black/50 opacity-0 group-hover:opacity-100 flex items-center justify-center transition-opacity"
                      >
                        <PhotoIcon className="h-6 w-6 text-white" />
                      </button>
                    </div>
                    <div>
                      <Button variant="outline" size="sm" onClick={() => avatarInputRef.current?.click()}>
                        <PhotoIcon className="h-4 w-4 mr-1.5" />Upload Photo
                      </Button>
                      <p className="text-xs text-muted-foreground mt-2">JPG, PNG or GIF. Max 5MB.</p>
                    </div>
                    <input
                      ref={avatarInputRef}
                      type="file"
                      accept="image/*"
                      className="hidden"
                      onChange={(e) => {
                        const file = e.target.files?.[0];
                        if (file) uploadAvatarMutation.mutate(file);
                      }}
                    />
                  </div>
                </CardContent>
              </Card>

              {/* Profile Info */}
              <Card>
                <CardHeader>
                  <CardTitle>Personal Information</CardTitle>
                  <CardDescription>Update your name and default currency</CardDescription>
                </CardHeader>
                <CardContent>
                  <form onSubmit={profileForm.handleSubmit((d) => updateProfileMutation.mutate(d))} className="space-y-4">
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <Input label="First Name" error={profileForm.formState.errors.firstName?.message} {...profileForm.register('firstName')} />
                      <Input label="Last Name" error={profileForm.formState.errors.lastName?.message} {...profileForm.register('lastName')} />
                    </div>
                    <Input label="Email" value={profile?.email || ''} readOnly disabled />
                    <div>
                      <label className="block text-sm font-medium mb-1.5">Default Currency</label>
                      <select
                        className="flex h-10 w-full rounded-lg border border-input bg-transparent px-3 py-2 text-sm"
                        {...profileForm.register('defaultCurrency')}
                      >
                        {CURRENCIES.map((c) => (
                          <option key={c.code} value={c.code}>{c.flag} {c.code} - {c.name}</option>
                        ))}
                      </select>
                    </div>
                    <p className="text-xs text-muted-foreground">
                      Member since {profile?.createdAt ? new Date(profile.createdAt).toLocaleDateString() : 'N/A'}
                    </p>
                    <Button type="submit" loading={updateProfileMutation.isPending}>Save Changes</Button>
                  </form>
                </CardContent>
              </Card>
            </div>
          )}

          {/* ===== APPEARANCE TAB ===== */}
          {activeTab === 'appearance' && (
            <div className="space-y-6">
              {/* Theme */}
              <Card>
                <CardHeader>
                  <CardTitle>Theme</CardTitle>
                  <CardDescription>Choose your preferred appearance</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-3 gap-3">
                    {THEME_OPTIONS.map((option) => {
                      const Icon = THEME_ICONS[option.value];
                      const isActive = themeMode === option.value;
                      return (
                        <button
                          key={option.value}
                          onClick={() => {
                            updateAppearanceMutation.mutate({
                              theme: option.value,
                              language: settings?.language || 'en',
                              currency: settings?.currency || 'USD',
                            });
                          }}
                          className={`flex flex-col items-center gap-2 p-4 rounded-xl border-2 transition-all ${
                            isActive
                              ? 'border-primary bg-primary/5'
                              : 'border-muted hover:border-primary/50'
                          }`}
                        >
                          <Icon className={`h-8 w-8 ${isActive ? 'text-primary' : 'text-muted-foreground'}`} />
                          <span className={`text-sm font-medium ${isActive ? 'text-primary' : ''}`}>{option.label}</span>
                        </button>
                      );
                    })}
                  </div>
                </CardContent>
              </Card>

              {/* Currency */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <CurrencyDollarIcon className="h-5 w-5" />Currency
                  </CardTitle>
                  <CardDescription>Set your preferred display currency</CardDescription>
                </CardHeader>
                <CardContent>
                  <select
                    className="flex h-10 w-full rounded-lg border border-input bg-transparent px-3 py-2 text-sm"
                    value={settings?.currency || 'USD'}
                    onChange={(e) => {
                      updateAppearanceMutation.mutate({
                        theme: settings?.theme || 'system',
                        language: settings?.language || 'en',
                        currency: e.target.value,
                      });
                    }}
                  >
                    {CURRENCIES.map((c) => (
                      <option key={c.code} value={c.code}>{c.flag} {c.code} - {c.name} ({c.symbol})</option>
                    ))}
                  </select>
                </CardContent>
              </Card>

              {/* Language */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <LanguageIcon className="h-5 w-5" />Language
                  </CardTitle>
                  <CardDescription>Select your preferred language</CardDescription>
                </CardHeader>
                <CardContent>
                  <select
                    className="flex h-10 w-full rounded-lg border border-input bg-transparent px-3 py-2 text-sm"
                    value={settings?.language || 'en'}
                    onChange={(e) => {
                      updateAppearanceMutation.mutate({
                        theme: settings?.theme || 'system',
                        language: e.target.value,
                        currency: settings?.currency || 'USD',
                      });
                    }}
                  >
                    {LANGUAGES.map((l) => (
                      <option key={l.code} value={l.code}>{l.nativeName} ({l.name})</option>
                    ))}
                  </select>
                </CardContent>
              </Card>
            </div>
          )}

          {/* ===== SECURITY TAB ===== */}
          {activeTab === 'security' && (
            <div className="space-y-6">
              {/* Password */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <LockClosedIcon className="h-5 w-5" />Password
                  </CardTitle>
                  <CardDescription>Change your account password</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="flex items-center justify-between p-3 rounded-lg border">
                    <div>
                      <p className="font-medium">Password</p>
                      <p className="text-sm text-muted-foreground">Last changed: Unknown</p>
                    </div>
                    <Button variant="outline" size="sm" onClick={() => setShowChangePassword(true)}>Change</Button>
                  </div>
                </CardContent>
              </Card>

              {/* Passkeys */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <FingerPrintIcon className="h-5 w-5" />Passkeys
                  </CardTitle>
                  <CardDescription>Manage your passkeys for passwordless login</CardDescription>
                </CardHeader>
                <CardContent className="space-y-3">
                  {passkeys.length === 0 ? (
                    <p className="text-sm text-muted-foreground">No passkeys configured</p>
                  ) : (
                    passkeys.map((pk: Passkey) => (
                      <div key={pk.id} className="flex items-center justify-between p-3 rounded-lg border">
                        <div>
                          <p className="font-medium">{pk.name}</p>
                          <p className="text-xs text-muted-foreground">
                            Created {new Date(pk.createdAt).toLocaleDateString()}
                            {pk.lastUsedAt && ` · Last used ${new Date(pk.lastUsedAt).toLocaleDateString()}`}
                          </p>
                        </div>
                        <Button variant="destructive" size="sm" onClick={() => deletePasskeyMutation.mutate(pk.id)}>
                          <TrashIcon className="h-4 w-4" />
                        </Button>
                      </div>
                    ))
                  )}
                </CardContent>
              </Card>

              {/* PIN */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <KeyIcon className="h-5 w-5" />PIN Login
                  </CardTitle>
                  <CardDescription>Quick login with a 4-digit PIN</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="flex items-center justify-between p-3 rounded-lg border">
                    <div>
                      <p className="font-medium">PIN</p>
                      <p className="text-sm text-muted-foreground">
                        {user?.pinEnabled ? 'PIN is enabled' : 'Set up a 4-digit PIN for quick login'}
                      </p>
                    </div>
                    {user?.pinEnabled ? (
                      <Button variant="destructive" size="sm" onClick={() => {
                        const password = prompt('Enter your password to remove PIN:');
                        if (password) removePinMutation.mutate(password);
                      }}>Remove</Button>
                    ) : (
                      <Button variant="outline" size="sm" onClick={() => setShowSetPin(true)}>Set Up</Button>
                    )}
                  </div>
                </CardContent>
              </Card>

              {/* 2FA */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <ShieldCheckIcon className="h-5 w-5" />Two-Factor Authentication
                  </CardTitle>
                  <CardDescription>Add an extra layer of security to your account</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="flex items-center justify-between p-3 rounded-lg border">
                    <div>
                      <p className="font-medium">2FA</p>
                      <p className="text-sm text-muted-foreground">
                        {twoFAStatus?.isEnabled
                          ? `Enabled · ${twoFAStatus.recoveryCodesRemaining} recovery codes remaining`
                          : 'Not enabled'}
                      </p>
                    </div>
                    {twoFAStatus?.isEnabled ? (
                      <Button variant="destructive" size="sm" onClick={() => setShowDisable2FA(true)}>Disable</Button>
                    ) : (
                      <Button variant="outline" size="sm" onClick={() => setShowEnable2FA(true)}>Enable</Button>
                    )}
                  </div>
                </CardContent>
              </Card>
            </div>
          )}

          {/* ===== NOTIFICATIONS TAB ===== */}
          {activeTab === 'notifications' && settings && (
            <div className="space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle>Email Notifications</CardTitle>
                  <CardDescription>Manage your email notification preferences</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  {[
                    { key: 'emailNotifications' as const, label: 'Email notifications', desc: 'Receive notifications via email' },
                    { key: 'pushNotifications' as const, label: 'Push notifications', desc: 'Receive browser push notifications' },
                    { key: 'budgetAlerts' as const, label: 'Budget alerts', desc: 'Get notified about budget thresholds' },
                    { key: 'weeklyReport' as const, label: 'Weekly report', desc: 'Receive a weekly financial summary' },
                    { key: 'monthlyReport' as const, label: 'Monthly report', desc: 'Receive a monthly financial summary' },
                  ].map((item) => (
                    <label key={item.key} className="flex items-center justify-between p-3 rounded-lg border cursor-pointer">
                      <div className="flex items-center gap-3">
                        <EnvelopeIcon className="h-5 w-5 text-muted-foreground" />
                        <div>
                          <p className="font-medium">{item.label}</p>
                          <p className="text-sm text-muted-foreground">{item.desc}</p>
                        </div>
                      </div>
                      <button
                        type="button"
                        onClick={() => updateNotificationsMutation.mutate({ ...settings, [item.key]: !settings[item.key] })}
                        className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                          settings[item.key] ? 'bg-primary' : 'bg-muted'
                        }`}
                      >
                        <span className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                          settings[item.key] ? 'translate-x-6' : 'translate-x-1'
                        }`} />
                      </button>
                    </label>
                  ))}
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Quick Settings</CardTitle>
                  <CardDescription>
                    For more notification options, visit the{' '}
                    <a href="/notifications/preferences" className="text-primary hover:underline">Notification Preferences</a>
                  </CardDescription>
                </CardHeader>
              </Card>
            </div>
          )}

          {/* ===== DATA TAB ===== */}
          {activeTab === 'data' && (
            <div className="space-y-6">
              {/* Privacy */}
              <Card>
                <CardHeader>
                  <CardTitle>Privacy</CardTitle>
                  <CardDescription>Control what others can see</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  {[
                    { key: 'showBalance' as const, label: 'Show balance', desc: 'Display your account balance', icon: EyeIcon },
                    { key: 'showTransactions' as const, label: 'Show transactions', desc: 'Display transaction details', icon: EyeIcon },
                    { key: 'publicProfile' as const, label: 'Public profile', desc: 'Make your profile visible to others', icon: UserCircleIcon },
                  ].map((item) => (
                    <label key={item.key} className="flex items-center justify-between p-3 rounded-lg border cursor-pointer">
                      <div className="flex items-center gap-3">
                        <item.icon className="h-5 w-5 text-muted-foreground" />
                        <div>
                          <p className="font-medium">{item.label}</p>
                          <p className="text-sm text-muted-foreground">{item.desc}</p>
                        </div>
                      </div>
                      <button
                        type="button"
                        onClick={() => {
                          const current = settings || {} as UserSettings;
                          updatePrivacyMutation.mutate({ ...current, [item.key]: !current[item.key] });
                        }}
                        className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                          settings?.[item.key] ? 'bg-primary' : 'bg-muted'
                        }`}
                      >
                        <span className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                          settings?.[item.key] ? 'translate-x-6' : 'translate-x-1'
                        }`} />
                      </button>
                    </label>
                  ))}
                </CardContent>
              </Card>

              {/* Export */}
              <Card>
                <CardHeader>
                  <CardTitle>Export Data</CardTitle>
                  <CardDescription>Download all your data as a JSON file</CardDescription>
                </CardHeader>
                <CardContent>
                  <Button variant="outline" onClick={() => exportMutation.mutate()} loading={exportMutation.isPending}>
                    <DocumentArrowDownIcon className="h-4 w-4 mr-1.5" />Export All Data
                  </Button>
                </CardContent>
              </Card>

              {/* Import */}
              <Card>
                <CardHeader>
                  <CardTitle>Import Data</CardTitle>
                  <CardDescription>Restore data from a backup file</CardDescription>
                </CardHeader>
                <CardContent>
                  <Button variant="outline" onClick={() => importInputRef.current?.click()}>
                    <DocumentArrowUpIcon className="h-4 w-4 mr-1.5" />Import Data
                  </Button>
                  <input
                    ref={importInputRef}
                    type="file"
                    accept=".json"
                    className="hidden"
                    onChange={(e) => {
                      const file = e.target.files?.[0];
                      if (file) importMutation.mutate(file);
                    }}
                  />
                </CardContent>
              </Card>

              {/* Danger Zone */}
              <Card className="border-destructive">
                <CardHeader>
                  <CardTitle className="text-destructive">Danger Zone</CardTitle>
                  <CardDescription>Irreversible actions</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="font-medium">Delete Account</p>
                      <p className="text-sm text-muted-foreground">Permanently delete your account and all data</p>
                    </div>
                    <Button variant="destructive" size="sm" onClick={() => setShowDeleteAccount(true)}>
                      <TrashIcon className="h-4 w-4 mr-1" />Delete
                    </Button>
                  </div>
                </CardContent>
              </Card>
            </div>
          )}

          {/* ===== ABOUT TAB ===== */}
          {activeTab === 'about' && (
            <div className="space-y-6">
              <Card>
                <CardContent className="pt-6">
                  <div className="text-center space-y-4">
                    <div className="h-20 w-20 rounded-2xl bg-primary/10 flex items-center justify-center mx-auto">
                      <span className="text-3xl font-bold text-primary">PL</span>
                    </div>
                    <div>
                      <h2 className="text-2xl font-bold">{about?.appName || 'PocketLedger'}</h2>
                      <p className="text-muted-foreground">Version {about?.version || '1.0.0'}</p>
                    </div>
                    <p className="text-sm text-muted-foreground max-w-md mx-auto">
                      {about?.description || 'A comprehensive personal finance management application'}
                    </p>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Features</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                    {(about?.features || []).map((feature, i) => (
                      <div key={i} className="flex items-center gap-2 text-sm">
                        <CheckCircleIcon className="h-4 w-4 text-green-500 shrink-0" />
                        {feature}
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Legal</CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  <a href="/privacy" className="flex items-center justify-between p-3 rounded-lg border hover:bg-muted/50 transition-colors">
                    <span className="font-medium">Privacy Policy</span>
                    <span className="text-muted-foreground">→</span>
                  </a>
                  <a href="/terms" className="flex items-center justify-between p-3 rounded-lg border hover:bg-muted/50 transition-colors">
                    <span className="font-medium">Terms of Service</span>
                    <span className="text-muted-foreground">→</span>
                  </a>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Licenses</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-2">
                    {(about?.licenses || []).map((lic, i) => (
                      <div key={i} className="flex items-center justify-between text-sm p-2 rounded-lg">
                        <span className="font-medium">{lic.name}</span>
                        <span className="text-muted-foreground">{lic.license} · {lic.copyright}</span>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>

              <p className="text-center text-xs text-muted-foreground">
                © {new Date().getFullYear()} {about?.author || 'PocketLedger Team'}. All rights reserved.
              </p>
            </div>
          )}
        </motion.div>
      </AnimatePresence>

      {/* ===== MODALS ===== */}

      {/* Change Password Modal */}
      <Modal isOpen={showChangePassword} onClose={() => setShowChangePassword(false)} title="Change Password">
        <form onSubmit={passwordForm.handleSubmit((d) => changePasswordMutation.mutate(d))} className="space-y-4">
          <Input label="Current Password" type="password" error={passwordForm.formState.errors.currentPassword?.message} {...passwordForm.register('currentPassword')} />
          <Input label="New Password" type="password" error={passwordForm.formState.errors.newPassword?.message} {...passwordForm.register('newPassword')} />
          <Input label="Confirm Password" type="password" error={passwordForm.formState.errors.confirmPassword?.message} {...passwordForm.register('confirmPassword')} />
          <div className="flex gap-4">
            <Button type="submit" loading={changePasswordMutation.isPending}>Change Password</Button>
            <Button type="button" variant="outline" onClick={() => setShowChangePassword(false)}>Cancel</Button>
          </div>
        </form>
      </Modal>

      {/* Set PIN Modal */}
      <Modal isOpen={showSetPin} onClose={() => setShowSetPin(false)} title="Set Up PIN">
        <form onSubmit={pinForm.handleSubmit((d) => setPinMutation.mutate(d))} className="space-y-4">
          <div>
            <label className="block text-sm font-medium mb-2 text-center">Enter a 4-digit PIN</label>
            <PinInput value={pinForm.watch('pin') || ''} onChange={(v) => pinForm.setValue('pin', v)} error={pinForm.formState.errors.pin?.message} />
          </div>
          <Input label="Confirm Password" type="password" placeholder="Enter your password to confirm"
            error={pinForm.formState.errors.currentPassword?.message} {...pinForm.register('currentPassword')} />
          <div className="flex gap-4">
            <Button type="submit" loading={pinForm.formState.isSubmitting}>Set PIN</Button>
            <Button type="button" variant="outline" onClick={() => setShowSetPin(false)}>Cancel</Button>
          </div>
        </form>
      </Modal>

      {/* Enable 2FA Modal */}
      <Modal isOpen={showEnable2FA} onClose={() => setShowEnable2FA(false)} title="Enable Two-Factor Authentication">
        <div className="space-y-4">
          <p className="text-sm text-muted-foreground">
            Two-factor authentication adds an extra layer of security to your account. You'll need an authenticator app like Google Authenticator or Authy.
          </p>
          <div className="flex gap-4">
            <Button onClick={() => enable2FAMutation.mutate()} loading={enable2FAMutation.isPending}>Continue</Button>
            <Button variant="outline" onClick={() => setShowEnable2FA(false)}>Cancel</Button>
          </div>
        </div>
      </Modal>

      {/* Verify 2FA Modal */}
      <Modal isOpen={showVerify2FA} onClose={() => setShowVerify2FA(false)} title="Verify 2FA Setup">
        <div className="space-y-4">
          {twoFASecret && (
            <div className="p-4 rounded-lg bg-muted text-center">
              <p className="text-xs text-muted-foreground mb-2">Enter this secret key in your authenticator app:</p>
              <p className="font-mono text-lg font-bold tracking-wider">{twoFASecret}</p>
            </div>
          )}
          <form onSubmit={verify2FAForm.handleSubmit((d) => verify2FAMutation.mutate(d.code))} className="space-y-4">
            <Input label="Enter 6-digit code" placeholder="000000" maxLength={6}
              error={verify2FAForm.formState.errors.code?.message} {...verify2FAForm.register('code')} />
            <div className="flex gap-4">
              <Button type="submit" loading={verify2FAMutation.isPending}>Verify</Button>
              <Button type="button" variant="outline" onClick={() => setShowVerify2FA(false)}>Cancel</Button>
            </div>
          </form>
        </div>
      </Modal>

      {/* 2FA Recovery Codes Modal */}
      <Modal isOpen={show2FACodes} onClose={() => setShow2FACodes(false)} title="Save Recovery Codes">
        <div className="space-y-4">
          <div className="flex items-start gap-2 p-3 rounded-lg bg-amber-500/10 border border-amber-500/20">
            <ExclamationTriangleIcon className="h-5 w-5 text-amber-500 shrink-0 mt-0.5" />
            <p className="text-sm">Save these recovery codes in a safe place. You can use them to access your account if you lose your authenticator device.</p>
          </div>
          <div className="grid grid-cols-2 gap-2 p-4 rounded-lg bg-muted font-mono text-sm">
            {twoFACodes.map((code, i) => (
              <div key={i} className="p-1">{code}</div>
            ))}
          </div>
          <Button onClick={() => {
            navigator.clipboard.writeText(twoFACodes.join('\n'));
            toast.success('Recovery codes copied!');
          }}>Copy Codes</Button>
        </div>
      </Modal>

      {/* Disable 2FA Modal */}
      <Modal isOpen={showDisable2FA} onClose={() => setShowDisable2FA(false)} title="Disable Two-Factor Authentication">
        <form onSubmit={disable2FAForm.handleSubmit((d) => disable2FAMutation.mutate(d.password))} className="space-y-4">
          <p className="text-sm text-muted-foreground">Enter your password to disable 2FA.</p>
          <Input label="Password" type="password" error={disable2FAForm.formState.errors.password?.message} {...disable2FAForm.register('password')} />
          <div className="flex gap-4">
            <Button type="submit" variant="destructive" loading={disable2FAMutation.isPending}>Disable 2FA</Button>
            <Button type="button" variant="outline" onClick={() => setShowDisable2FA(false)}>Cancel</Button>
          </div>
        </form>
      </Modal>

      {/* Delete Account Modal */}
      <Modal isOpen={showDeleteAccount} onClose={() => setShowDeleteAccount(false)} title="Delete Account" size="sm">
        <div className="space-y-4">
          <div className="flex items-start gap-2 p-3 rounded-lg bg-destructive/10 border border-destructive/20">
            <ExclamationTriangleIcon className="h-5 w-5 text-destructive shrink-0 mt-0.5" />
            <p className="text-sm text-destructive">This action is irreversible. All your data will be permanently deleted.</p>
          </div>
          <form onSubmit={deleteForm.handleSubmit((d) => deleteAccountMutation.mutate(d.password))} className="space-y-4">
            <Input label="Enter your password" type="password" error={deleteForm.formState.errors.password?.message} {...deleteForm.register('password')} />
            <Input label='Type "DELETE" to confirm' error={deleteForm.formState.errors.confirmation?.message} {...deleteForm.register('confirmation')} />
            <div className="flex gap-4">
              <Button type="submit" variant="destructive" loading={deleteAccountMutation.isPending}>Delete Account</Button>
              <Button type="button" variant="outline" onClick={() => setShowDeleteAccount(false)}>Cancel</Button>
            </div>
          </form>
        </div>
      </Modal>
    </motion.div>
  );
}
