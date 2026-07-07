import { useState } from 'react';
import { motion } from 'framer-motion';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '../../components/ui/Card';
import Badge from '../../components/ui/Badge';
import { Cog6ToothIcon, ShieldCheckIcon, BellIcon, DocumentTextIcon } from '@heroicons/react/24/outline';
import toast from 'react-hot-toast';

export default function AdminSettingsPage() {
  const [maintenanceMode, setMaintenanceMode] = useState(false);
  const [registrationEnabled, setRegistrationEnabled] = useState(true);

  return (
    <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="space-y-6 max-w-3xl">
      <h1 className="text-3xl font-bold">Admin Settings</h1>

      {/* General */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Cog6ToothIcon className="h-5 w-5" />General
          </CardTitle>
          <CardDescription>System-wide settings</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <label className="flex items-center justify-between p-3 rounded-lg border cursor-pointer">
            <div>
              <p className="font-medium">Maintenance Mode</p>
              <p className="text-sm text-muted-foreground">Temporarily disable access for non-admin users</p>
            </div>
            <button
              type="button"
              onClick={() => { setMaintenanceMode(!maintenanceMode); toast.success('Setting updated'); }}
              className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${maintenanceMode ? 'bg-destructive' : 'bg-muted'}`}
            >
              <span className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${maintenanceMode ? 'translate-x-6' : 'translate-x-1'}`} />
            </button>
          </label>

          <label className="flex items-center justify-between p-3 rounded-lg border cursor-pointer">
            <div>
              <p className="font-medium">User Registration</p>
              <p className="text-sm text-muted-foreground">Allow new user registrations</p>
            </div>
            <button
              type="button"
              onClick={() => { setRegistrationEnabled(!registrationEnabled); toast.success('Setting updated'); }}
              className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${registrationEnabled ? 'bg-primary' : 'bg-muted'}`}
            >
              <span className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${registrationEnabled ? 'translate-x-6' : 'translate-x-1'}`} />
            </button>
          </label>
        </CardContent>
      </Card>

      {/* Security */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <ShieldCheckIcon className="h-5 w-5" />Security
          </CardTitle>
          <CardDescription>Security policies</CardDescription>
        </CardHeader>
        <CardContent className="space-y-3">
          <div className="flex items-center justify-between p-3 rounded-lg border">
            <div>
              <p className="font-medium">Require 2FA for Admins</p>
              <p className="text-sm text-muted-foreground">Enforce two-factor authentication for admin accounts</p>
            </div>
            <Badge variant="outline">Enabled</Badge>
          </div>
          <div className="flex items-center justify-between p-3 rounded-lg border">
            <div>
              <p className="font-medium">Session Timeout</p>
              <p className="text-sm text-muted-foreground">Auto-logout after inactivity</p>
            </div>
            <Badge variant="outline">30 minutes</Badge>
          </div>
          <div className="flex items-center justify-between p-3 rounded-lg border">
            <div>
              <p className="font-medium">Password Policy</p>
              <p className="text-sm text-muted-foreground">Minimum 8 chars, uppercase, lowercase, digit, special char</p>
            </div>
            <Badge variant="success">Strong</Badge>
          </div>
        </CardContent>
      </Card>

      {/* Notifications */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <BellIcon className="h-5 w-5" />Notifications
          </CardTitle>
          <CardDescription>System notification settings</CardDescription>
        </CardHeader>
        <CardContent className="space-y-3">
          <div className="flex items-center justify-between p-3 rounded-lg border">
            <div>
              <p className="font-medium">Email Notifications</p>
              <p className="text-sm text-muted-foreground">Send email notifications to users</p>
            </div>
            <Badge variant="success">Enabled</Badge>
          </div>
          <div className="flex items-center justify-between p-3 rounded-lg border">
            <div>
              <p className="font-medium">Budget Alerts</p>
              <p className="text-sm text-muted-foreground">Notify users when approaching budget limits</p>
            </div>
            <Badge variant="success">Enabled</Badge>
          </div>
        </CardContent>
      </Card>

      {/* Data */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <DocumentTextIcon className="h-5 w-5" />Data Management
          </CardTitle>
          <CardDescription>Data retention and backup</CardDescription>
        </CardHeader>
        <CardContent className="space-y-3">
          <div className="flex items-center justify-between p-3 rounded-lg border">
            <div>
              <p className="font-medium">Data Retention</p>
              <p className="text-sm text-muted-foreground">How long to keep audit logs</p>
            </div>
            <Badge variant="outline">90 days</Badge>
          </div>
          <div className="flex items-center justify-between p-3 rounded-lg border">
            <div>
              <p className="font-medium">Automatic Backup</p>
              <p className="text-sm text-muted-foreground">Daily database backups</p>
            </div>
            <Badge variant="success">Enabled</Badge>
          </div>
        </CardContent>
      </Card>
    </motion.div>
  );
}
