import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { motion } from 'framer-motion';
import { adminApi, type AdminUser } from '../../api/admin.api';
import { Card, CardContent } from '../../components/ui/Card';
import Button from '../../components/ui/Button';
import Badge from '../../components/ui/Badge';
import Skeleton from '../../components/ui/Skeleton';
import SearchBar from '../../components/admin/SearchBar';
import FilterBar from '../../components/admin/FilterBar';
import Pagination from '../../components/admin/Pagination';
import Modal from '../../components/ui/Modal';
import Input from '../../components/ui/Input';
import Select from '../../components/ui/Select';
import toast from 'react-hot-toast';
import { UserCircleIcon, ShieldCheckIcon, NoSymbolIcon, TrashIcon, UserPlusIcon, DocumentDuplicateIcon, PencilIcon } from '@heroicons/react/24/outline';

export default function AdminUsersPage() {
  const queryClient = useQueryClient();
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState('');
  const [roleFilter, setRoleFilter] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [selectedUser, setSelectedUser] = useState<AdminUser | null>(null);
  const [showRoleModal, setShowRoleModal] = useState(false);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [createEmail, setCreateEmail] = useState('');
  const [createFirstName, setCreateFirstName] = useState('');
  const [createLastName, setCreateLastName] = useState('');
  const [createPassword, setCreatePassword] = useState('');
  const [createRole, setCreateRole] = useState('User');

  // Edit / Update States
  const [selectedEditUser, setSelectedEditUser] = useState<AdminUser | null>(null);
  const [showEditModal, setShowEditModal] = useState(false);
  const [editEmail, setEditEmail] = useState('');
  const [editFirstName, setEditFirstName] = useState('');
  const [editLastName, setEditLastName] = useState('');
  const [editPassword, setEditPassword] = useState('');
  const [editRole, setEditRole] = useState('User');

  // Copy / Clipboard Credentials Success
  const [createdCredentials, setCreatedCredentials] = useState<{ email: string; password: string } | null>(null);

  const copyToClipboard = (text: string, label: string) => {
    navigator.clipboard.writeText(text);
    toast.success(`${label} copied to clipboard!`);
  };

  const handleOpenEdit = (user: AdminUser) => {
    setSelectedEditUser(user);
    setEditEmail(user.email);
    setEditFirstName(user.firstName);
    setEditLastName(user.lastName);
    setEditPassword('');
    setEditRole(user.roles.includes('Admin') ? 'Admin' : 'User');
    setShowEditModal(true);
  };

  const { data, isLoading } = useQuery({
    queryKey: ['admin-users', page, search, roleFilter, statusFilter],
    queryFn: () => adminApi.getUsers({
      page, pageSize: 20, search: search || undefined,
      role: roleFilter || undefined,
      isActive: statusFilter === 'active' ? true : statusFilter === 'inactive' ? false : undefined,
    }),
  });

  const statusMutation = useMutation({
    mutationFn: ({ id, isActive }: { id: string; isActive: boolean }) => adminApi.updateUserStatus(id, isActive),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-users'] });
      toast.success('User status updated');
    },
  });

  const roleMutation = useMutation({
    mutationFn: ({ id, role }: { id: string; role: string }) => adminApi.updateUserRole(id, role),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-users'] });
      setShowRoleModal(false);
      toast.success('Role updated');
    },
  });

  const deleteMutation = useMutation({
    mutationFn: (id: string) => adminApi.deleteUser(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-users'] });
      toast.success('User deleted');
    },
  });

  const createMutation = useMutation({
    mutationFn: (data: { email: string; firstName: string; lastName: string; password: string; role: string }) => adminApi.createUser(data),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['admin-users'] });
      setCreatedCredentials({ email: variables.email, password: variables.password });
      setCreateEmail('');
      setCreateFirstName('');
      setCreateLastName('');
      setCreatePassword('');
      setCreateRole('User');
      toast.success('User created successfully');
    },
    onError: (err: any) => {
      const msg = err?.response?.data?.message || err?.message || 'Failed to create user';
      toast.error(msg);
    }
  });

  const updateMutation = useMutation({
    mutationFn: ({ id, data }: { id: string; data: { email: string; firstName: string; lastName: string; password?: string; role: string } }) =>
      adminApi.updateUser(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-users'] });
      setShowEditModal(false);
      setSelectedEditUser(null);
      toast.success('User updated successfully');
    },
    onError: (err: any) => {
      const msg = err?.response?.data?.message || err?.message || 'Failed to update user';
      toast.error(msg);
    }
  });

  const handleUpdateUser = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedEditUser) return;
    if (!editEmail || !editFirstName || !editLastName) {
      toast.error('First Name, Last Name, and Email are required');
      return;
    }
    updateMutation.mutate({
      id: selectedEditUser.id,
      data: {
        email: editEmail,
        firstName: editFirstName,
        lastName: editLastName,
        password: editPassword || undefined,
        role: editRole
      }
    });
  };

  const handleCreateUser = (e: React.FormEvent) => {
    e.preventDefault();
    if (!createEmail || !createFirstName || !createLastName || !createPassword) {
      toast.error('All fields are required');
      return;
    }
    createMutation.mutate({
      email: createEmail,
      firstName: createFirstName,
      lastName: createLastName,
      password: createPassword,
      role: createRole
    });
  };
 
  const users = data?.data?.items || [];
  const totalPages = data?.data?.totalPages || 1;

  if (isLoading) {
    return (
      <div className="space-y-6">
        <Skeleton className="h-10 w-48" />
        <Skeleton className="h-12 w-full rounded-xl" />
        <div className="space-y-3">{[...Array(5)].map((_, i) => <Skeleton key={i} className="h-20 w-full rounded-xl" />)}</div>
      </div>
    );
  }

  return (
    <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="space-y-6">
      <div className="flex items-center justify-between flex-wrap gap-4">
        <div>
          <h1 className="text-3xl font-bold">Users</h1>
          <p className="text-muted-foreground">{data?.data?.totalCount || 0} total users</p>
        </div>
        <Button onClick={() => setShowCreateModal(true)} className="flex items-center gap-2">
          <UserPlusIcon className="h-5 w-5" /> Add User
        </Button>
      </div>

      <div className="flex items-center gap-4 flex-wrap">
        <SearchBar value={search} onChange={setSearch} placeholder="Search users..." className="w-64" />
        <FilterBar
          activeFilter={roleFilter}
          onFilterChange={setRoleFilter}
          options={[
            { value: '', label: 'All Roles' },
            { value: 'Admin', label: 'Admin' },
            { value: 'User', label: 'User' },
          ]}
          filters={[]}
        />
        <FilterBar
          activeFilter={statusFilter}
          onFilterChange={setStatusFilter}
          options={[
            { value: '', label: 'All Status' },
            { value: 'active', label: 'Active' },
            { value: 'inactive', label: 'Inactive' },
          ]}
          filters={[]}
        />
      </div>

      <div className="space-y-3">
        {users.map((u) => (
          <Card key={u.id}>
            <CardContent className="p-4">
              <div className="flex items-center justify-between flex-wrap gap-4">
                <div className="flex items-center gap-4">
                  <div className="h-10 w-10 rounded-full bg-muted flex items-center justify-center">
                    {u.avatarUrl ? (
                      <img src={u.avatarUrl} alt="" className="h-full w-full rounded-full object-cover" />
                    ) : (
                      <UserCircleIcon className="h-6 w-6 text-muted-foreground" />
                    )}
                  </div>
                  <div>
                    <p className="font-medium">{u.firstName} {u.lastName}</p>
                    <div className="flex items-center gap-1.5 text-sm text-muted-foreground mt-0.5">
                      <span>{u.email}</span>
                      <button 
                        onClick={() => copyToClipboard(u.email, 'Email ID')} 
                        className="p-1 hover:text-foreground hover:bg-muted rounded transition-colors"
                        title="Copy Email ID"
                      >
                        <DocumentDuplicateIcon className="h-3.5 w-3.5" />
                      </button>
                    </div>
                  </div>
                </div>
                <div className="flex items-center gap-2 flex-wrap">
                  {u.roles.map((r) => (
                    <Badge key={r} variant={r === 'Admin' ? 'default' : 'outline'}>{r}</Badge>
                  ))}
                  <Badge variant={u.isActive ? 'success' : 'destructive'}>
                    {u.isActive ? 'Active' : 'Inactive'}
                  </Badge>
                  {u.twoFactorEnabled && <Badge variant="outline">2FA</Badge>}
                </div>
                <div className="flex items-center gap-2">
                  <Button variant="outline" size="sm" onClick={() => handleOpenEdit(u)}>
                    <PencilIcon className="h-4 w-4 mr-1" />Edit
                  </Button>
                  <Button variant="outline" size="sm" onClick={() => { setSelectedUser(u); setShowRoleModal(true) }}>
                    <ShieldCheckIcon className="h-4 w-4 mr-1" />Role
                  </Button>
                  <Button variant="outline" size="sm" onClick={() => statusMutation.mutate({ id: u.id, isActive: !u.isActive })}>
                    {u.isActive ? <NoSymbolIcon className="h-4 w-4 mr-1" /> : null}
                    {u.isActive ? 'Disable' : 'Enable'}
                  </Button>
                  <Button variant="destructive" size="sm" onClick={() => {
                    if (confirm('Delete this user?')) deleteMutation.mutate(u.id);
                  }}>
                    <TrashIcon className="h-4 w-4" />
                  </Button>
                </div>
              </div>
              <div className="flex items-center justify-between flex-wrap gap-4 text-xs text-muted-foreground mt-2 pt-2 border-t border-muted/30">
                <div className="flex items-center gap-1.5">
                  <span>ID: <code className="font-mono bg-muted/50 px-1 rounded">{u.id}</code></span>
                  <button 
                    onClick={() => copyToClipboard(u.id, 'User ID')} 
                    className="p-1 hover:text-foreground hover:bg-muted rounded transition-colors"
                    title="Copy User ID"
                  >
                    <DocumentDuplicateIcon className="h-3 w-3" />
                  </button>
                </div>
                <div>
                  Joined {new Date(u.createdAt).toLocaleDateString()}
                  {u.lastLoginAt && ` · Last login ${new Date(u.lastLoginAt).toLocaleDateString()}`}
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      <Pagination page={page} totalPages={totalPages} onPageChange={setPage} />

      {/* Role Modal */}
      <Modal isOpen={showRoleModal} onClose={() => setShowRoleModal(false)} title="Change Role" size="sm">
        <div className="space-y-4">
          <p className="text-sm text-muted-foreground">Change role for {selectedUser?.email}</p>
          <div className="space-y-2">
            {['Admin', 'User'].map((role) => (
              <button
                key={role}
                onClick={() => selectedUser && roleMutation.mutate({ id: selectedUser.id, role })}
                className={`w-full p-3 rounded-lg border text-left text-sm font-medium transition-colors ${
                  selectedUser?.roles.includes(role)
                    ? 'border-primary bg-primary/5'
                    : 'hover:bg-muted'
                }`}
              >
                {role}
                {selectedUser?.roles.includes(role) && <span className="ml-2 text-primary">(current)</span>}
              </button>
            ))}
          </div>
        </div>
      </Modal>

      {/* Create User Modal */}
      <Modal isOpen={showCreateModal} onClose={() => { setShowCreateModal(false); setCreatedCredentials(null); }} title="Add User" size="md">
        {createdCredentials ? (
          <div className="space-y-4 py-2">
            <div className="p-4 bg-primary/5 border border-primary/10 rounded-xl space-y-3">
              <p className="text-sm font-semibold text-primary">User Created Successfully!</p>
              <p className="text-xs text-muted-foreground">Please copy the credentials below. You will not be able to view this password again.</p>
              
              <div className="space-y-2 mt-4">
                <div className="flex items-center justify-between p-2.5 bg-background border rounded-lg">
                  <div>
                    <p className="text-[10px] text-muted-foreground uppercase font-semibold">Email (ID)</p>
                    <p className="text-sm font-mono">{createdCredentials.email}</p>
                  </div>
                  <Button variant="outline" size="sm" onClick={() => copyToClipboard(createdCredentials.email, 'Email')}>
                    Copy
                  </Button>
                </div>
                <div className="flex items-center justify-between p-2.5 bg-background border rounded-lg">
                  <div>
                    <p className="text-[10px] text-muted-foreground uppercase font-semibold">Password</p>
                    <p className="text-sm font-mono">{createdCredentials.password}</p>
                  </div>
                  <Button variant="outline" size="sm" onClick={() => copyToClipboard(createdCredentials.password, 'Password')}>
                    Copy
                  </Button>
                </div>
              </div>
            </div>
            <div className="flex justify-end pt-2">
              <Button onClick={() => { setShowCreateModal(false); setCreatedCredentials(null); }}>
                Done
              </Button>
            </div>
          </div>
        ) : (
          <form onSubmit={handleCreateUser} className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <Input
                label="First Name"
                type="text"
                placeholder="First name"
                value={createFirstName}
                onChange={(e) => setCreateFirstName(e.target.value)}
                required
              />
              <Input
                label="Last Name"
                type="text"
                placeholder="Last name"
                value={createLastName}
                onChange={(e) => setCreateLastName(e.target.value)}
                required
              />
            </div>
            <Input
              label="Email"
              type="email"
              placeholder="email@example.com"
              value={createEmail}
              onChange={(e) => setCreateEmail(e.target.value)}
              required
            />
            <div className="relative">
              <Input
                label="Password"
                type="text"
                placeholder="Password (min 8 chars, mixed case, digit)"
                value={createPassword}
                onChange={(e) => setCreatePassword(e.target.value)}
                required
              />
              <button
                type="button"
                onClick={() => copyToClipboard(createPassword, 'Password')}
                className="absolute right-3 top-9 p-1 hover:bg-muted rounded text-muted-foreground hover:text-foreground"
                title="Copy Password"
              >
                <DocumentDuplicateIcon className="h-4 w-4" />
              </button>
            </div>
            <Select
              label="Role"
              value={createRole}
              onChange={(e) => setCreateRole(e.target.value)}
              options={[
                { value: 'User', label: 'User' },
                { value: 'Admin', label: 'Admin' }
              ]}
            />
            <div className="flex justify-end gap-2 pt-4">
              <Button type="button" variant="outline" onClick={() => setShowCreateModal(false)}>
                Cancel
              </Button>
              <Button type="submit" loading={createMutation.isPending}>
                Create User
              </Button>
            </div>
          </form>
        )}
      </Modal>

      {/* Edit User Modal */}
      <Modal isOpen={showEditModal} onClose={() => { setShowEditModal(false); setSelectedEditUser(null); }} title="Edit User" size="md">
        <form onSubmit={handleUpdateUser} className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <Input
              label="First Name"
              type="text"
              placeholder="First name"
              value={editFirstName}
              onChange={(e) => setEditFirstName(e.target.value)}
              required
            />
            <Input
              label="Last Name"
              type="text"
              placeholder="Last name"
              value={editLastName}
              onChange={(e) => setEditLastName(e.target.value)}
              required
            />
          </div>
          <Input
            label="Email"
            type="email"
            placeholder="email@example.com"
            value={editEmail}
            onChange={(e) => setEditEmail(e.target.value)}
            required
          />
          <div className="relative">
            <Input
              label="New Password (optional)"
              type="text"
              placeholder="Leave blank to keep current password"
              value={editPassword}
              onChange={(e) => setEditPassword(e.target.value)}
            />
            {editPassword && (
              <button
                type="button"
                onClick={() => copyToClipboard(editPassword, 'Password')}
                className="absolute right-3 top-9 p-1 hover:bg-muted rounded text-muted-foreground hover:text-foreground"
                title="Copy Password"
              >
                <DocumentDuplicateIcon className="h-4 w-4" />
              </button>
            )}
            <p className="text-[10px] text-muted-foreground mt-1">If specified: min 8 chars, mixed case, digit.</p>
          </div>
          <Select
            label="Role"
            value={editRole}
            onChange={(e) => setEditRole(e.target.value)}
            options={[
              { value: 'User', label: 'User' },
              { value: 'Admin', label: 'Admin' }
            ]}
          />
          <div className="flex justify-end gap-2 pt-4">
            <Button type="button" variant="outline" onClick={() => { setShowEditModal(false); setSelectedEditUser(null); }}>
              Cancel
            </Button>
            <Button type="submit" loading={updateMutation.isPending}>
              Save Changes
            </Button>
          </div>
        </form>
      </Modal>
    </motion.div>
  );
}
