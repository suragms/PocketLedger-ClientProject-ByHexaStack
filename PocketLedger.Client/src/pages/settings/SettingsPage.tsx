import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import toast from 'react-hot-toast';
import {
  UserCircleIcon,
  KeyIcon,
  LockClosedIcon,
  ShieldCheckIcon,
  ArrowRightOnRectangleIcon,
  ArrowUpTrayIcon,
  SunIcon,
  MoonIcon,
  CurrencyDollarIcon,
  LanguageIcon,
  BellIcon,
  InformationCircleIcon,
  PencilSquareIcon,
  WalletIcon,
  BanknotesIcon,
  FolderIcon,
} from '@heroicons/react/24/outline';
import Modal from '../../components/ui/Modal';
import Button from '../../components/ui/Button';
import Input from '../../components/ui/Input';
import PinInput from '../../components/auth/PinInput';
import { SettingsRow, SettingsSection } from '../../components/settings/SettingsRow';
import { useAppDispatch, useAppSelector } from '../../app/hooks';
import { logout, setUser } from '../../features/auth/authSlice';
import { setThemeMode } from '../../app/uiSlice';
import { settingsApi } from '../../api/settings.api';
import { authApi } from '../../api/auth.api';
import { CURRENCIES, LANGUAGES } from '../../lib/constants';
import {
  updateProfileSchema,
  changePasswordSchema,
  type UpdateProfileInput,
  type ChangePasswordInput,
} from '../../lib/validators';

const SettingsPage = () => {
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const dispatch = useAppDispatch();

  const user = useAppSelector((state) => state.auth.user);
  const isDark = useAppSelector((state) => state.ui.darkMode);

  // ─── Profile ───
  const [showProfileModal, setShowProfileModal] = useState(false);
  const [profileForm, setProfileForm] = useState({
    firstName: user?.firstName || '',
    lastName: user?.lastName || '',
    defaultCurrency: user?.defaultCurrency || 'USD',
  });
  const [profileErrors, setProfileErrors] = useState<Record<string, string>>({});

  const profileMutation = useMutation({
    mutationFn: (data: UpdateProfileInput) => settingsApi.updateProfile(data),
    onSuccess: (res) => {
      dispatch(setUser({ ...res.data, roles: user?.roles || [] }));
      queryClient.invalidateQueries({ queryKey: ['auth-user'] });
      toast.success('Profile updated successfully');
      setShowProfileModal(false);
    },
    onError: (err: Error) => {
      toast.error(err.message || 'Failed to update profile');
    },
  });

  // ─── Password ───
  const [showPasswordModal, setShowPasswordModal] = useState(false);
  const [passwordForm, setPasswordForm] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: '',
  });
  const [passwordErrors, setPasswordErrors] = useState<Record<string, string>>({});

  const passwordMutation = useMutation({
    mutationFn: (data: ChangePasswordInput) =>
      settingsApi.changePassword({
        currentPassword: data.currentPassword,
        newPassword: data.newPassword,
      }),
    onSuccess: () => {
      toast.success('Password changed successfully');
      setShowPasswordModal(false);
      setPasswordForm({ currentPassword: '', newPassword: '', confirmPassword: '' });
    },
    onError: (err: Error) => {
      toast.error(err.message || 'Failed to change password');
    },
  });

  // ─── PIN ───
  const [showPinModal, setShowPinModal] = useState(false);
  const [pinStep, setPinStep] = useState<'enter' | 'verify' | 'success'>('enter');
  const [pinValue, setPinValue] = useState('');
  const [pinConfirmValue, setPinConfirmValue] = useState('');
  const [pinError, setPinError] = useState('');
  const [pinCurrentPassword, setPinCurrentPassword] = useState('');
  const [isRemovingPin, setIsRemovingPin] = useState(false);

  const setPinMutation = useMutation({
    mutationFn: () =>
      authApi.setPin({ pin: pinValue, currentPassword: pinCurrentPassword }),
    onSuccess: () => {
      toast.success('PIN set successfully');
      setShowPinModal(false);
      setPinValue('');
      setPinConfirmValue('');
      setPinCurrentPassword('');
      setPinStep('enter');
    },
    onError: (err: Error) => {
      toast.error(err.message || 'Failed to set PIN');
    },
  });

  const removePinMutation = useMutation({
    mutationFn: () => authApi.removePin({ currentPassword: pinCurrentPassword }),
    onSuccess: () => {
      toast.success('PIN removed successfully');
      setShowPinModal(false);
      setPinValue('');
      setPinConfirmValue('');
      setPinCurrentPassword('');
    },
    onError: (err: Error) => {
      toast.error(err.message || 'Failed to remove PIN');
    },
  });

  const handlePinSubmit = () => {
    if (isRemovingPin) {
      if (!pinCurrentPassword) {
        setPinError('Password is required');
        return;
      }
      removePinMutation.mutate();
    } else if (pinStep === 'enter') {
      if (pinValue.length < 4) {
        setPinError('PIN must be at least 4 digits');
        return;
      }
      if (pinConfirmValue.length < 4) {
        setPinError('Please confirm your PIN');
        return;
      }
      if (pinValue !== pinConfirmValue) {
        setPinError('PINs do not match');
        return;
      }
      setPinError('');
      setPinStep('verify');
    } else if (pinStep === 'verify') {
      if (!pinCurrentPassword) {
        setPinError('Password is required');
        return;
      }
      setPinError('');
      setPinStep('success');
    } else {
      setPinMutation.mutate();
    }
  };

  // ─── 2FA ───
  const [show2FAModal, setShow2FAModal] = useState(false);
  const [twoFAStep, setTwoFAStep] = useState<'qr' | 'verify' | 'disable'>('qr');
  const [twoFASecret, setTwoFASecret] = useState('');
  const [twoFAOtpAuthUrl, setTwoFAOtpAuthUrl] = useState('');
  const [twoFAVerificationCode, setTwoFAVerificationCode] = useState('');
  const [twoFAErrors, setTwoFAErrors] = useState<Record<string, string>>({});
  const [disable2FAPassword, setDisable2FAPassword] = useState('');
  const [disable2FAError, setDisable2FAError] = useState('');

  const { data: twoFAStatus, isLoading: twoFALoading } = useQuery({
    queryKey: ['two-fa-status'],
    queryFn: () => settingsApi.get2FAStatus(),
    enabled: show2FAModal,
  });

  const enable2FAMutation = useMutation({
    mutationFn: () => settingsApi.enable2FA(),
    onSuccess: (res) => {
      setTwoFASecret(res.data.secretKey);
      setTwoFAOtpAuthUrl(res.data.qrCodeUri);
      setTwoFAStep('verify');
      setTwoFAErrors({});
    },
    onError: (err: Error) => {
      toast.error(err.message || 'Failed to enable 2FA');
    },
  });

  const verify2FAMutation = useMutation({
    mutationFn: (code: string) => settingsApi.verify2FA(code),
    onSuccess: () => {
      toast.success('Two-factor authentication enabled');
      setShow2FAModal(false);
      setTwoFAStep('qr');
      setTwoFAVerificationCode('');
      queryClient.invalidateQueries({ queryKey: ['two-fa-status'] });
    },
    onError: (err: Error) => {
      setTwoFAErrors({ code: err.message || 'Invalid verification code' });
    },
  });

  const disable2FAMutation = useMutation({
    mutationFn: (password: string) => settingsApi.disable2FA(password),
    onSuccess: () => {
      toast.success('Two-factor authentication disabled');
      setShow2FAModal(false);
      setDisable2FAPassword('');
      queryClient.invalidateQueries({ queryKey: ['two-fa-status'] });
    },
    onError: (err: Error) => {
      setDisable2FAError(err.message || 'Invalid password');
    },
  });

  // ─── Data Export ───
  const [showExportModal, setShowExportModal] = useState(false);

  const exportMutation = useMutation({
    mutationFn: () => settingsApi.exportData(),
    onSuccess: (res) => {
      window.open(res.data.downloadUrl, '_blank');
      toast.success('Data exported successfully');
      setShowExportModal(false);
    },
    onError: (err: Error) => {
      toast.error(err.message || 'Failed to export data');
    },
  });

  // ─── Delete Account ───
  const [showDeleteAccountModal, setShowDeleteAccountModal] = useState(false);
  const [deletePassword, setDeletePassword] = useState('');
  const [deleteError, setDeleteError] = useState('');
  const deleteAccountMutation = useMutation({
    mutationFn: () => authApi.deleteAccount({ password: deletePassword }),
    onSuccess: () => {
      toast.success('Account deleted');
      dispatch(logout());
      navigate('/login');
    },
    onError: (err: Error) => {
      toast.error(err.message || 'Failed to delete account');
    },
  });

  const handleDeleteAccount = () => {
    if (!deletePassword) {
      setDeleteError('Password is required');
      return;
    }
    setDeleteError('');
    deleteAccountMutation.mutate();
  };

  const handleExportData = () => {
    exportMutation.mutate();
  };

  const handleThemeToggle = () => {
    dispatch(setThemeMode(isDark ? 'light' : 'dark'));
  };

  const handleSignOut = () => {
    dispatch(logout());
    navigate('/login');
  };

  return (
    <div className="min-h-screen bg-background pb-24">
      {/* ─── Profile Card ─── */}
      <div className="px-4 pt-4">
        <button
          type="button"
          onClick={() => {
            setProfileForm({
              firstName: user?.firstName || '',
              lastName: user?.lastName || '',
              defaultCurrency: user?.defaultCurrency || 'USD',
            });
            setProfileErrors({});
            setShowProfileModal(true);
          }}
          className="flex w-full items-center gap-4 rounded-xl border bg-card p-4 transition-colors active:bg-muted/80"
        >
          <div className="flex h-14 w-14 items-center justify-center rounded-full bg-primary/10">
            {user?.avatarUrl ? (
              <img
                src={user.avatarUrl}
                alt={`${user.firstName} ${user.lastName}`}
                className="h-14 w-14 rounded-full object-cover"
              />
            ) : (
              <UserCircleIcon className="h-8 w-8 text-primary" />
            )}
          </div>
          <div className="flex-1 text-left min-w-0">
            <p className="text-base font-semibold text-foreground truncate">
              {user?.firstName} {user?.lastName}
            </p>
            <p className="text-sm text-muted-foreground truncate">{user?.email}</p>
          </div>
          <PencilSquareIcon className="h-5 w-5 text-muted-foreground/50 shrink-0" />
        </button>
      </div>

      {/* ─── Sections ─── */}
      <div className="mt-6 space-y-6 px-4">
        {/* Account */}
        <SettingsSection title="Account">
          <SettingsRow
            icon={<UserCircleIcon className="h-5 w-5 text-blue-600 dark:text-blue-400" />}
            iconBg="bg-blue-100 dark:bg-blue-900/30"
            label="Personal Information"
            subtitle={`${user?.firstName} ${user?.lastName}`}
            onClick={() => {
              setProfileForm({
                firstName: user?.firstName || '',
                lastName: user?.lastName || '',
                defaultCurrency: user?.defaultCurrency || 'USD',
              });
              setProfileErrors({});
              setShowProfileModal(true);
            }}
          />
          <SettingsRow
            icon={<KeyIcon className="h-5 w-5 text-amber-600 dark:text-amber-400" />}
            iconBg="bg-amber-100 dark:bg-amber-900/30"
            label="Change Password"
            onClick={() => {
              setPasswordForm({ currentPassword: '', newPassword: '', confirmPassword: '' });
              setPasswordErrors({});
              setShowPasswordModal(true);
            }}
          />
          <SettingsRow
            icon={<LockClosedIcon className="h-5 w-5 text-purple-600 dark:text-purple-400" />}
            iconBg="bg-purple-100 dark:bg-purple-900/30"
            label="PIN Lock"
            subtitle={user?.pinEnabled ? 'Enabled' : 'Disabled'}
            onClick={() => {
              setPinValue('');
              setPinConfirmValue('');
              setPinCurrentPassword('');
              setPinError('');
              setPinStep('enter');
              setIsRemovingPin(user?.pinEnabled || false);
              setShowPinModal(true);
            }}
          />
          <SettingsRow
            icon={<ShieldCheckIcon className="h-5 w-5 text-teal-600 dark:text-teal-400" />}
            iconBg="bg-teal-100 dark:bg-teal-900/30"
            label="Two-Factor Authentication"
            subtitle={
              twoFALoading
                ? undefined
                : twoFAStatus?.data?.isEnabled
                ? 'Enabled'
                : 'Disabled'
            }
            onClick={() => {
              setTwoFAStep('qr');
              setTwoFAVerificationCode('');
              setDisable2FAPassword('');
              setTwoFAErrors({});
              setShow2FAModal(true);
            }}
          />
        </SettingsSection>

        {/* Preferences */}
        <SettingsSection title="Preferences">
          <SettingsRow
            icon={
              isDark ? (
                <MoonIcon className="h-5 w-5 text-indigo-400" />
              ) : (
                <SunIcon className="h-5 w-5 text-orange-500" />
              )
            }
            iconBg={isDark ? 'bg-indigo-100 dark:bg-indigo-900/30' : 'bg-orange-100 dark:bg-orange-900/30'}
            label="Dark Mode"
            toggle={isDark}
            onToggle={handleThemeToggle}
          />
          <SettingsRow
            icon={<CurrencyDollarIcon className="h-5 w-5 text-emerald-600 dark:text-emerald-400" />}
            iconBg="bg-emerald-100 dark:bg-emerald-900/30"
            label="Default Currency"
            value={CURRENCIES.find((c) => c.code === user?.defaultCurrency)?.symbol || '$'}
            onClick={() => navigate('/settings/currency')}
          />
          <SettingsRow
            icon={<LanguageIcon className="h-5 w-5 text-cyan-600 dark:text-cyan-400" />}
            iconBg="bg-cyan-100 dark:bg-cyan-900/30"
            label="Language & Format"
            value={LANGUAGES[0]?.name || 'English'}
            onClick={() => navigate('/settings/language')}
          />
        </SettingsSection>

        {/* Features / Data Management */}
        <SettingsSection title="Features">
          <SettingsRow
            icon={<FolderIcon className="h-5 w-5 text-indigo-600 dark:text-indigo-400" />}
            iconBg="bg-indigo-100 dark:bg-indigo-900/30"
            label="Categories"
            onClick={() => navigate('/categories')}
          />
          <SettingsRow
            icon={<WalletIcon className="h-5 w-5 text-emerald-600 dark:text-emerald-400" />}
            iconBg="bg-emerald-100 dark:bg-emerald-900/30"
            label="Wallets"
            onClick={() => navigate('/wallets')}
          />
          <SettingsRow
            icon={<BanknotesIcon className="h-5 w-5 text-blue-600 dark:text-blue-400" />}
            iconBg="bg-blue-100 dark:bg-blue-900/30"
            label="Accounts"
            onClick={() => navigate('/accounts')}
          />
          <SettingsRow
            icon={<CurrencyDollarIcon className="h-5 w-5 text-pink-600 dark:text-pink-400" />}
            iconBg="bg-pink-100 dark:bg-pink-900/30"
            label="Budgets"
            onClick={() => navigate('/budgets')}
          />
        </SettingsSection>

        {/* Notifications */}
        <SettingsSection title="Notifications">
          <SettingsRow
            icon={<BellIcon className="h-5 w-5 text-rose-600 dark:text-rose-400" />}
            iconBg="bg-rose-100 dark:bg-rose-900/30"
            label="Notification Preferences"
            onClick={() => navigate('/notifications')}
          />
        </SettingsSection>

        {/* Data & Privacy */}
        <SettingsSection title="Data & Privacy">
          <SettingsRow
            icon={<ArrowUpTrayIcon className="h-5 w-5 text-indigo-600 dark:text-indigo-400" />}
            iconBg="bg-indigo-100 dark:bg-indigo-900/30"
            label="Export Data"
            onClick={() => setShowExportModal(true)}
          />
        </SettingsSection>

        {/* About */}
        <SettingsSection title="About">
          <SettingsRow
            icon={<InformationCircleIcon className="h-5 w-5 text-slate-600 dark:text-slate-400" />}
            iconBg="bg-slate-100 dark:bg-slate-900/30"
            label="About PocketLedger"
            value="v1.0.0"
            onClick={() => navigate('/settings/about')}
          />
        </SettingsSection>

        {/* Sign Out */}
        <SettingsSection>
          <SettingsRow
            icon={<ArrowRightOnRectangleIcon className="h-5 w-5" />}
            iconBg="bg-red-100 dark:bg-red-900/30"
            label="Sign Out"
            destructive
            onClick={handleSignOut}
          />
        </SettingsSection>

        {/* Delete Account */}
        <div className="pt-2 pb-8">
          <button
            type="button"
            onClick={() => {
              setDeletePassword('');
              setDeleteError('');
              setShowDeleteAccountModal(true);
            }}
            className="w-full text-center text-sm text-destructive/70 hover:text-destructive transition-colors py-2"
          >
            Delete Account
          </button>
        </div>
      </div>

      {/* ═══════════════════════════════════════════════════════════════════════════
          MODALS
          ═══════════════════════════════════════════════════════════════════════════ */}

      {/* ─── Profile Modal ─── */}
      <Modal
        isOpen={showProfileModal}
        onClose={() => setShowProfileModal(false)}
        title="Edit Profile"
      >
        <form
          onSubmit={(e: React.FormEvent) => {
            e.preventDefault();
            const result = updateProfileSchema.safeParse(profileForm);
            if (!result.success) {
              const fieldErrors: Record<string, string> = {};
              result.error.issues.forEach((issue) => {
                const path = issue.path.join('.');
                if (path) fieldErrors[path] = issue.message;
              });
              setProfileErrors(fieldErrors);
              return;
            }
            setProfileErrors({});
            profileMutation.mutate(result.data);
          }}
          className="space-y-4"
        >
          <Input
            label="First Name"
            value={profileForm.firstName}
            onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
              setProfileForm({ ...profileForm, firstName: e.target.value })
            }
            error={profileErrors.firstName}
          />
          <Input
            label="Last Name"
            value={profileForm.lastName}
            onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
              setProfileForm({ ...profileForm, lastName: e.target.value })
            }
            error={profileErrors.lastName}
          />
          <div className="flex justify-end gap-3 pt-2">
            <Button
              type="button"
              variant="outline"
              onClick={() => setShowProfileModal(false)}
            >
              Cancel
            </Button>
            <Button type="submit" loading={profileMutation.isPending}>
              Save
            </Button>
          </div>
        </form>
      </Modal>

      {/* ─── Password Modal ─── */}
      <Modal
        isOpen={showPasswordModal}
        onClose={() => setShowPasswordModal(false)}
        title="Change Password"
      >
        <form
          onSubmit={(e: React.FormEvent) => {
            e.preventDefault();
            const result = changePasswordSchema.safeParse(passwordForm);
            if (!result.success) {
              const fieldErrors: Record<string, string> = {};
              result.error.issues.forEach((issue) => {
                const path = issue.path.join('.');
                if (path) fieldErrors[path] = issue.message;
              });
              setPasswordErrors(fieldErrors);
              return;
            }
            setPasswordErrors({});
            passwordMutation.mutate(result.data);
          }}
          className="space-y-4"
        >
          <Input
            label="Current Password"
            type="password"
            value={passwordForm.currentPassword}
            onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
              setPasswordForm({ ...passwordForm, currentPassword: e.target.value })
            }
            error={passwordErrors.currentPassword}
          />
          <Input
            label="New Password"
            type="password"
            value={passwordForm.newPassword}
            onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
              setPasswordForm({ ...passwordForm, newPassword: e.target.value })
            }
            error={passwordErrors.newPassword}
          />
          <Input
            label="Confirm New Password"
            type="password"
            value={passwordForm.confirmPassword}
            onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
              setPasswordForm({ ...passwordForm, confirmPassword: e.target.value })
            }
            error={passwordErrors.confirmPassword}
          />
          <div className="flex justify-end gap-3 pt-2">
            <Button
              type="button"
              variant="outline"
              onClick={() => setShowPasswordModal(false)}
            >
              Cancel
            </Button>
            <Button type="submit" loading={passwordMutation.isPending}>
              Save
            </Button>
          </div>
        </form>
      </Modal>

      {/* ─── PIN Modal ─── */}
      <Modal
        isOpen={showPinModal}
        onClose={() => {
          setShowPinModal(false);
          setPinValue('');
          setPinConfirmValue('');
          setPinCurrentPassword('');
          setPinStep('enter');
          setIsRemovingPin(false);
        }}
        title={
          isRemovingPin
            ? 'Remove PIN'
            : pinStep === 'enter'
            ? 'Set PIN'
            : 'Confirm PIN'
        }
      >
        <div className="space-y-6">
          {isRemovingPin ? (
            <>
              <p className="text-sm text-muted-foreground text-center">
                Enter your password to remove the PIN
              </p>
              <Input
                label="Password"
                type="password"
                value={pinCurrentPassword}
                onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                  setPinCurrentPassword(e.target.value)
                }
              />
              {pinError && (
                <p className="text-sm text-destructive text-center">{pinError}</p>
              )}
            </>
          ) : pinStep === 'enter' ? (
            <>
              <p className="text-sm text-muted-foreground text-center">
                Set a 4-digit PIN to secure your app
              </p>
              <div className="space-y-3">
                <div>
                  <p className="text-sm font-medium text-foreground mb-2 text-center">
                    Enter PIN
                  </p>
                  <div className="flex justify-center">
                    <PinInput length={4} value={pinValue} onChange={setPinValue} />
                  </div>
                </div>
                <div>
                  <p className="text-sm font-medium text-foreground mb-2 text-center">
                    Confirm PIN
                  </p>
                  <div className="flex justify-center">
                    <PinInput length={4} value={pinConfirmValue} onChange={setPinConfirmValue} />
                  </div>
                </div>
              </div>
              {pinError && (
                <p className="text-sm text-destructive text-center">{pinError}</p>
              )}
            </>
          ) : (
            <>
              <p className="text-sm text-muted-foreground text-center">
                Enter your password to confirm PIN setup
              </p>
              <Input
                label="Password"
                type="password"
                value={pinCurrentPassword}
                onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                  setPinCurrentPassword(e.target.value)
                }
              />
              {pinError && (
                <p className="text-sm text-destructive text-center">{pinError}</p>
              )}
            </>
          )}
          <div className="flex justify-end gap-3 pt-2">
            <Button
              type="button"
              variant="outline"
              onClick={() => {
                setShowPinModal(false);
                setPinValue('');
                setPinConfirmValue('');
                setPinCurrentPassword('');
                setPinStep('enter');
                setIsRemovingPin(false);
              }}
            >
              Cancel
            </Button>
            <Button
              type="button"
              onClick={handlePinSubmit}
              loading={setPinMutation.isPending || removePinMutation.isPending}
            >
              {isRemovingPin
                ? 'Remove PIN'
                : pinStep === 'enter'
                ? 'Next'
                : 'Confirm PIN'}
            </Button>
          </div>
          {user?.pinEnabled && !isRemovingPin && (
            <div className="text-center">
              <button
                type="button"
                onClick={() => setIsRemovingPin(true)}
                className="text-sm text-destructive hover:underline"
              >
                Remove PIN
              </button>
            </div>
          )}
        </div>
      </Modal>

      {/* ─── 2FA Modal ─── */}
      <Modal
        isOpen={show2FAModal}
        onClose={() => {
          setShow2FAModal(false);
          setTwoFAStep('qr');
          setTwoFAVerificationCode('');
          setDisable2FAPassword('');
          setTwoFAErrors({});
        }}
        title={
          twoFAStatus?.data?.isEnabled
            ? 'Disable Two-Factor Auth'
            : twoFAStep === 'qr'
            ? 'Enable Two-Factor Auth'
            : 'Verify Two-Factor Auth'
        }
      >
        <div className="space-y-6">
          {twoFAStatus?.data?.isEnabled ? (
            <>
              <p className="text-sm text-muted-foreground text-center">
                Enter your password to disable 2FA
              </p>
              <Input
                label="Password"
                type="password"
                value={disable2FAPassword}
                onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                  setDisable2FAPassword(e.target.value)
                }
                error={disable2FAError}
              />
            </>
          ) : twoFAStep === 'qr' ? (
            <>
              <p className="text-sm text-muted-foreground text-center">
                Scan this QR code with your authenticator app
              </p>
              {twoFASecret && (
                <div className="flex justify-center">
                  <img
                    src={`https://api.qrserver.com/v1/create-qr-code/?size=200x200&data=${encodeURIComponent(twoFAOtpAuthUrl)}`}
                    alt="2FA QR Code"
                    className="rounded-lg border"
                  />
                </div>
              )}
            </>
          ) : (
            <>
              <p className="text-sm text-muted-foreground text-center">
                Enter the code from your authenticator app
              </p>
              <Input
                label="Verification Code"
                value={twoFAVerificationCode}
                onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                  setTwoFAVerificationCode(e.target.value)
                }
                error={twoFAErrors.code}
                placeholder="123456"
                maxLength={6}
              />
            </>
          )}
          <div className="flex justify-end gap-3 pt-2">
            <Button
              type="button"
              variant="outline"
              onClick={() => {
                setShow2FAModal(false);
                setTwoFAStep('qr');
                setTwoFAVerificationCode('');
                setDisable2FAPassword('');
                setTwoFAErrors({});
              }}
            >
              Cancel
            </Button>
            {twoFAStatus?.data?.isEnabled ? (
              <Button
                type="button"
                onClick={() => disable2FAMutation.mutate(disable2FAPassword)}
                loading={disable2FAMutation.isPending}
                variant="destructive"
              >
                Disable 2FA
              </Button>
            ) : twoFAStep === 'qr' ? (
              <Button
                type="button"
                onClick={() => {
                  if (!twoFASecret) {
                    enable2FAMutation.mutate();
                  } else {
                    setTwoFAStep('verify');
                  }
                }}
                loading={enable2FAMutation.isPending}
              >
                Continue
              </Button>
            ) : (
              <Button
                type="button"
                onClick={() => verify2FAMutation.mutate(twoFAVerificationCode)}
                loading={verify2FAMutation.isPending}
              >
                Verify
              </Button>
            )}
          </div>
        </div>
      </Modal>

      {/* ─── Export Modal ─── */}
      <Modal
        isOpen={showExportModal}
        onClose={() => setShowExportModal(false)}
        title="Export Data"
      >
        <div className="space-y-4">
          <p className="text-sm text-muted-foreground">
            Export your transaction data as a CSV file.
          </p>
          <div className="flex justify-end gap-3 pt-2">
            <Button variant="outline" onClick={() => setShowExportModal(false)}>
              Cancel
            </Button>
            <Button onClick={handleExportData} loading={exportMutation.isPending}>
              <ArrowUpTrayIcon className="h-4 w-4 mr-2" />
              Export
            </Button>
          </div>
        </div>
      </Modal>

      {/* ─── Delete Account Modal ─── */}
      <Modal
        isOpen={showDeleteAccountModal}
        onClose={() => setShowDeleteAccountModal(false)}
        title="Delete Account"
      >
        <div className="space-y-4">
          <p className="text-sm text-muted-foreground">
            This action is permanent and cannot be undone. All your data will be deleted.
          </p>
          <p className="text-sm text-muted-foreground">
            Type <span className="font-semibold text-foreground">{user?.email}</span> to confirm.
          </p>
          <Input
            label="Password"
            type="password"
            value={deletePassword}
            onChange={(e: React.ChangeEvent<HTMLInputElement>) => setDeletePassword(e.target.value)}
            error={deleteError}
          />
          <div className="flex justify-end gap-3 pt-2">
            <Button variant="outline" onClick={() => setShowDeleteAccountModal(false)}>
              Cancel
            </Button>
            <Button
              variant="destructive"
              onClick={handleDeleteAccount}
              loading={deleteAccountMutation.isPending}
              disabled={!deletePassword}
            >
              Delete Account
            </Button>
          </div>
        </div>
      </Modal>
    </div>
  );
};

export default SettingsPage;
