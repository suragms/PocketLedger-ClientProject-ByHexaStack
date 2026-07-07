import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { motion } from 'framer-motion';
import { adminApi } from '../../api/admin.api';
import { Card, CardContent } from '../../components/ui/Card';
import Button from '../../components/ui/Button';
import Input from '../../components/ui/Input';
import Badge from '../../components/ui/Badge';
import Skeleton from '../../components/ui/Skeleton';
import Modal from '../../components/ui/Modal';
import toast from 'react-hot-toast';
import { PlusIcon, TrashIcon, ShieldCheckIcon } from '@heroicons/react/24/outline';

export default function AdminRolesPage() {
  const queryClient = useQueryClient();
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [newRoleName, setNewRoleName] = useState('');
  const [newRoleDesc, setNewRoleDesc] = useState('');

  const { data, isLoading } = useQuery({
    queryKey: ['admin-roles'],
    queryFn: () => adminApi.getRoles(),
  });

  const createMutation = useMutation({
    mutationFn: ({ name, description }: { name: string; description?: string }) => adminApi.createRole(name, description),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-roles'] });
      setShowCreateModal(false);
      setNewRoleName('');
      setNewRoleDesc('');
      toast.success('Role created');
    },
    onError: () => toast.error('Failed to create role'),
  });

  const deleteMutation = useMutation({
    mutationFn: (id: string) => adminApi.deleteRole(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-roles'] });
      toast.success('Role deleted');
    },
    onError: () => toast.error('Failed to delete role'),
  });

  const roles = data?.data?.roles || [];

  if (isLoading) {
    return (
      <div className="space-y-6">
        <Skeleton className="h-10 w-48" />
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {[...Array(3)].map((_, i) => <Skeleton key={i} className="h-32 rounded-xl" />)}
        </div>
      </div>
    );
  }

  return (
    <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="space-y-6">
      <div className="flex items-center justify-between flex-wrap gap-4">
        <h1 className="text-3xl font-bold">Role Management</h1>
        <Button onClick={() => setShowCreateModal(true)}>
          <PlusIcon className="h-4 w-4 mr-1.5" />Create Role
        </Button>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {roles.map((role) => (
          <Card key={role.id}>
            <CardContent className="p-4">
              <div className="flex items-start justify-between">
                <div className="flex items-center gap-3">
                  <div className="h-10 w-10 rounded-lg bg-primary/10 flex items-center justify-center">
                    <ShieldCheckIcon className="h-5 w-5 text-primary" />
                  </div>
                  <div>
                    <p className="font-medium">{role.name}</p>
                    <p className="text-sm text-muted-foreground">{role.description || 'No description'}</p>
                  </div>
                </div>
                <Badge variant="outline">{role.userCount} users</Badge>
              </div>
              {role.name !== 'Admin' && role.name !== 'User' && (
                <div className="mt-4 flex justify-end">
                  <Button variant="destructive" size="sm" onClick={() => {
                    if (confirm(`Delete role "${role.name}"?`)) deleteMutation.mutate(role.id);
                  }}>
                    <TrashIcon className="h-4 w-4 mr-1" />Delete
                  </Button>
                </div>
              )}
              {(role.name === 'Admin' || role.name === 'User') && (
                <p className="text-xs text-muted-foreground mt-3 italic">Built-in role</p>
              )}
            </CardContent>
          </Card>
        ))}
      </div>

      <Modal isOpen={showCreateModal} onClose={() => setShowCreateModal(false)} title="Create Role">
        <div className="space-y-4">
          <Input label="Role Name" value={newRoleName} onChange={(e) => setNewRoleName(e.target.value)} placeholder="e.g., Moderator" />
          <Input label="Description (optional)" value={newRoleDesc} onChange={(e) => setNewRoleDesc(e.target.value)} placeholder="What does this role do?" />
          <div className="flex gap-4">
            <Button onClick={() => createMutation.mutate({ name: newRoleName, description: newRoleDesc || undefined })} loading={createMutation.isPending}>
              Create Role
            </Button>
            <Button variant="outline" onClick={() => setShowCreateModal(false)}>Cancel</Button>
          </div>
        </div>
      </Modal>
    </motion.div>
  );
}
