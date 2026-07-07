import { useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { motion } from 'framer-motion';
import { notificationsApi } from '../../api/notifications.api';
import { Card, CardContent, CardHeader, CardTitle } from '../../components/ui/Card';
import Button from '../../components/ui/Button';
import Input from '../../components/ui/Input';
import Skeleton from '../../components/ui/Skeleton';
import { ArrowLeftIcon } from '@heroicons/react/24/outline';
import toast from 'react-hot-toast';
import type { NotificationPreference } from '../../types';

export default function NotificationPreferencesPage() {
  const queryClient = useQueryClient();

  const { data, isLoading } = useQuery({
    queryKey: ['notification-preferences'],
    queryFn: () => notificationsApi.getPreferences(),
  });

  const { register, handleSubmit, reset, watch } = useForm<NotificationPreference>({
    defaultValues: {
      dailyReminderEnabled: true,
      dailyReminderHour: 9,
      weeklySummaryEnabled: true,
      weeklySummaryDay: 1,
      monthlySummaryEnabled: true,
      monthlySummaryDay: 1,
      budgetAlertEnabled: true,
      budgetExceededEnabled: true,
      pushNotificationsEnabled: true,
    },
  });

  useEffect(() => {
    if (data?.data) {
      reset(data.data);
    }
  }, [data, reset]);

  const mutation = useMutation({
    mutationFn: (formData: NotificationPreference) => notificationsApi.updatePreferences(formData),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['notification-preferences'] });
      toast.success('Preferences saved');
    },
  });

  const dailyEnabled = watch('dailyReminderEnabled');
  const weeklyEnabled = watch('weeklySummaryEnabled');
  const monthlyEnabled = watch('monthlySummaryEnabled');

  if (isLoading) {
    return (
      <div className="max-w-2xl mx-auto space-y-6">
        <Skeleton className="h-10 w-48" />
        <Skeleton className="h-96 w-full rounded-xl" />
      </div>
    );
  }

  return (
    <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="max-w-2xl mx-auto space-y-6">
      <div className="flex items-center gap-4">
        <Link to="/notifications" className="p-2 rounded-lg hover:bg-muted">
          <ArrowLeftIcon className="h-5 w-5" />
        </Link>
        <div>
          <h1 className="text-3xl font-bold">Notification Preferences</h1>
          <p className="text-muted-foreground">Configure how you receive notifications</p>
        </div>
      </div>

      <form onSubmit={handleSubmit((data) => mutation.mutate(data))} className="space-y-6">
        {/* Daily Reminder */}
        <Card>
          <CardHeader>
            <CardTitle className="text-lg flex items-center gap-2">
              <span className="text-xl">📅</span>Daily Reminder
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <label className="flex items-center gap-3 cursor-pointer">
              <input
                type="checkbox"
                className="w-4 h-4 rounded border-input text-primary focus:ring-primary"
                {...register('dailyReminderEnabled')}
              />
              <div>
                <span className="text-sm font-medium">Enable daily reminder</span>
                <p className="text-xs text-muted-foreground">Get a summary of your daily transactions</p>
              </div>
            </label>
            {dailyEnabled && (
              <div className="pl-7">
                <Input
                  label="Reminder time (hour, 0-23)"
                  type="number"
                  min="0"
                  max="23"
                  className="w-24"
                  {...register('dailyReminderHour', { valueAsNumber: true })}
                />
              </div>
            )}
          </CardContent>
        </Card>

        {/* Weekly Summary */}
        <Card>
          <CardHeader>
            <CardTitle className="text-lg flex items-center gap-2">
              <span className="text-xl">📊</span>Weekly Summary
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <label className="flex items-center gap-3 cursor-pointer">
              <input
                type="checkbox"
                className="w-4 h-4 rounded border-input text-primary focus:ring-primary"
                {...register('weeklySummaryEnabled')}
              />
              <div>
                <span className="text-sm font-medium">Enable weekly summary</span>
                <p className="text-xs text-muted-foreground">Receive a weekly financial overview</p>
              </div>
            </label>
            {weeklyEnabled && (
              <div className="pl-7">
                <label className="block text-sm font-medium mb-1">Summary day</label>
                <select
                  className="flex h-10 w-full rounded-lg border border-input bg-transparent px-3 py-2 text-sm"
                  {...register('weeklySummaryDay', { valueAsNumber: true })}
                >
                  <option value={1}>Monday</option>
                  <option value={2}>Tuesday</option>
                  <option value={3}>Wednesday</option>
                  <option value={4}>Thursday</option>
                  <option value={5}>Friday</option>
                  <option value={6}>Saturday</option>
                  <option value={0}>Sunday</option>
                </select>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Monthly Summary */}
        <Card>
          <CardHeader>
            <CardTitle className="text-lg flex items-center gap-2">
              <span className="text-xl">📈</span>Monthly Summary
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <label className="flex items-center gap-3 cursor-pointer">
              <input
                type="checkbox"
                className="w-4 h-4 rounded border-input text-primary focus:ring-primary"
                {...register('monthlySummaryEnabled')}
              />
              <div>
                <span className="text-sm font-medium">Enable monthly summary</span>
                <p className="text-xs text-muted-foreground">Get a comprehensive monthly financial report</p>
              </div>
            </label>
            {monthlyEnabled && (
              <div className="pl-7">
                <Input
                  label="Day of month (1-28)"
                  type="number"
                  min="1"
                  max="28"
                  className="w-24"
                  {...register('monthlySummaryDay', { valueAsNumber: true })}
                />
              </div>
            )}
          </CardContent>
        </Card>

        {/* Budget Alerts */}
        <Card>
          <CardHeader>
            <CardTitle className="text-lg flex items-center gap-2">
              <span className="text-xl">⚠️</span>Budget Alerts
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <label className="flex items-center gap-3 cursor-pointer">
              <input
                type="checkbox"
                className="w-4 h-4 rounded border-input text-primary focus:ring-primary"
                {...register('budgetAlertEnabled')}
              />
              <div>
                <span className="text-sm font-medium">Budget threshold alerts</span>
                <p className="text-xs text-muted-foreground">Get notified when approaching budget limits</p>
              </div>
            </label>
            <label className="flex items-center gap-3 cursor-pointer">
              <input
                type="checkbox"
                className="w-4 h-4 rounded border-input text-primary focus:ring-primary"
                {...register('budgetExceededEnabled')}
              />
              <div>
                <span className="text-sm font-medium">Budget exceeded alerts</span>
                <p className="text-xs text-muted-foreground">Get notified when a budget is exceeded</p>
              </div>
            </label>
          </CardContent>
        </Card>

        {/* Push Notifications */}
        <Card>
          <CardHeader>
            <CardTitle className="text-lg flex items-center gap-2">
              <span className="text-xl">🔔</span>Push Notifications
            </CardTitle>
          </CardHeader>
          <CardContent>
            <label className="flex items-center gap-3 cursor-pointer">
              <input
                type="checkbox"
                className="w-4 h-4 rounded border-input text-primary focus:ring-primary"
                {...register('pushNotificationsEnabled')}
              />
              <div>
                <span className="text-sm font-medium">Enable push notifications</span>
                <p className="text-xs text-muted-foreground">Receive browser push notifications</p>
              </div>
            </label>
          </CardContent>
        </Card>

        <div className="flex gap-4">
          <Button type="submit" loading={mutation.isPending} className="flex-1">
            Save Preferences
          </Button>
          <Link to="/notifications">
            <Button type="button" variant="outline">Cancel</Button>
          </Link>
        </div>
      </form>
    </motion.div>
  );
}
