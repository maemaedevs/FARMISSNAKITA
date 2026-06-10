import { Button, Card, Input, PageHeader, PasswordInput } from '@/components/common';
import { useAuth } from '@/hooks/useAuth';

export default function SettingsPage() {
  const { user } = useAuth();

  return (
    <>
      <PageHeader
        title="Settings"
        subtitle="Manage your profile and platform preferences."
      />

      <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
        <Card title="Profile" description="Update your personal information.">
          <div className="space-y-4">
            <Input label="Full name" defaultValue={user?.name ?? ''} />
            <Input label="Email" type="email" defaultValue={user?.email ?? ''} />
            <Input label="Phone" placeholder="+63 900 000 0000" />
            <div className="flex justify-end pt-2">
              <Button>Save changes</Button>
            </div>
          </div>
        </Card>

        <Card title="Security" description="Keep your account secure.">
          <div className="space-y-4">
            <PasswordInput label="Current password" autoComplete="current-password" />
            <PasswordInput label="New password" autoComplete="new-password" />
            <PasswordInput
              label="Confirm new password"
              autoComplete="new-password"
            />
            <div className="flex justify-end pt-2">
              <Button variant="secondary">Update password</Button>
            </div>
          </div>
        </Card>
      </div>
    </>
  );
}
