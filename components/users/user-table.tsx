"use client";

import { useState } from "react";
import {
  updateUserRole,
  updateUserStatus,
  deleteUser,
} from "@/app/actions/users";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { UserRoundPen, Trash2, Key } from "lucide-react";
import UserEditDialog from "./user-edit-dialog";
import UserDeleteDialog from "./user-delete-dialog";
import { ResetPasswordDialog } from "./reset-password-dialog";
import { useToast } from "@/hooks/use-toast";

interface UserTableProps {
  users: any[];
  onRefresh: () => void;
}

export default function UserTable({ users, onRefresh }: UserTableProps) {
  const [selectedUser, setSelectedUser] = useState<any>(null);
  const [editDialogOpen, setEditDialogOpen] = useState(false);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [resetPasswordDialogOpen, setResetPasswordDialogOpen] = useState(false);
  const { toast } = useToast();

  const handleEditUser = (user: any) => {
    setSelectedUser(user);
    setEditDialogOpen(true);
  };

  const handleDeleteUser = (user: any) => {
    setSelectedUser(user);
    setDeleteDialogOpen(true);
  };

  const handleResetPassword = (user: any) => {
    setSelectedUser(user);
    setResetPasswordDialogOpen(true);
  };

  const handleRoleChange = async (userId: string, newRole: string) => {
    const result = await updateUserRole(userId, newRole);
    if (result.success) {
      toast({
        title: "Berhasil",
        description: "Role pengguna berhasil diubah",
      });
      onRefresh();
    } else {
      toast({
        title: "Gagal",
        description: "Gagal mengubah role pengguna",
        variant: "destructive",
      });
    }
  };

  const handleStatusChange = async (userId: string, newStatus: string) => {
    const result = await updateUserStatus(userId, newStatus);
    if (result.success) {
      toast({
        title: "Berhasil",
        description: "Status pengguna berhasil diubah",
      });
      onRefresh();
    } else {
      toast({
        title: "Gagal",
        description: "Gagal mengubah status pengguna",
        variant: "destructive",
      });
    }
  };

  const handleConfirmDelete = async () => {
    const result = await deleteUser(selectedUser.id);
    if (result.success) {
      toast({
        title: "Berhasil",
        description: "Pengguna berhasil dihapus",
      });
      setDeleteDialogOpen(false);
      onRefresh();
    } else {
      toast({
        title: "Gagal",
        description: "Gagal menghapus pengguna",
        variant: "destructive",
      });
    }
  };

  return (
    <>
      <div className="overflow-x-auto rounded-[12px] border border-slate-100 pb-2">
        <table className="w-full text-sm">
          <thead className="bg-[#FFF0EE] text-[#E74C3C] font-semibold">
            <tr>
              <th className="text-left py-4 px-6 font-semibold rounded-tl-[12px]">Nama</th>
              <th className="text-left py-4 px-6 font-semibold">Email</th>
              <th className="text-left py-4 px-6 font-semibold">NIP</th>
              <th className="text-left py-4 px-6 font-semibold">Role</th>
              <th className="text-left py-4 px-6 font-semibold">Status</th>
              <th className="text-left py-4 px-6 font-semibold">Last Login</th>
              <th className="text-left py-4 px-6 font-semibold rounded-tr-[12px]">Aksi</th>
            </tr>
          </thead>
          <tbody>
            {users.map((user) => (
              <tr
                key={user.id}
                className="border-b border-gray-100 hover:bg-slate-50/50 transition-colors"
              >
                <td className="py-4 px-6 font-medium text-gray-700">{user.name || "—"}</td>
                <td className="py-4 px-6 text-gray-600">{user.email}</td>
                <td className="py-4 px-6 text-gray-500">
                  {user.nip || "—"}
                </td>
                <td className="py-3 px-6">
                  <Select
                    value={user.role}
                    onValueChange={(val) => handleRoleChange(user.id, val)}
                  >
                    <SelectTrigger className="w-32 h-8 border-0 shadow-none bg-transparent hover:bg-gray-100 text-gray-600 font-medium">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="WORKER">Worker</SelectItem>
                      <SelectItem value="HSE_ADMIN">HSE Admin</SelectItem>
                      <SelectItem value="REWARD_ADMIN">Reward Admin</SelectItem>
                      <SelectItem value="SUPER_ADMIN">Admin</SelectItem>
                    </SelectContent>
                  </Select>
                </td>
                <td className="py-3 px-6">
                  <Select
                    value={user.status}
                    onValueChange={(val) => handleStatusChange(user.id, val)}
                  >
                    <SelectTrigger className="w-28 h-8 border-0 shadow-none bg-transparent hover:bg-gray-100 text-gray-600 font-medium">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="ACTIVE">Aktif</SelectItem>
                      <SelectItem value="INACTIVE">Inactive</SelectItem>
                      <SelectItem value="SUSPENDED">Suspended</SelectItem>
                    </SelectContent>
                  </Select>
                </td>
                <td className="py-4 px-6 text-gray-500">
                  {user.lastLogin
                    ? new Date(user.lastLogin).toLocaleDateString("id-ID")
                    : "—"}
                </td>
                <td className="py-4 px-6">
                  <div className="flex gap-2 items-center">
                    <button
                      onClick={() => handleResetPassword(user)}
                      className="p-1.5 text-gray-500 hover:text-amber-600 hover:bg-amber-50 rounded transition-colors"
                      title="Reset Password"
                    >
                      <Key className="w-[18px] h-[18px]" strokeWidth={2} />
                    </button>
                    <button
                      onClick={() => handleEditUser(user)}
                      className="p-1.5 text-gray-500 hover:text-blue-600 hover:bg-blue-50 rounded transition-colors"
                      title="Edit User"
                    >
                      <UserRoundPen className="w-[18px] h-[18px]" strokeWidth={2} />
                    </button>
                    <button
                      onClick={() => handleDeleteUser(user)}
                      className="p-1.5 text-[#E74C3C] hover:bg-red-50 rounded transition-colors"
                      title="Delete User"
                    >
                      <Trash2 className="w-[18px] h-[18px]" strokeWidth={2} />
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {users.length === 0 && (
        <div className="text-center py-12">
          <p className="text-muted-foreground">No users found</p>
        </div>
      )}

      <UserEditDialog
        user={selectedUser}
        open={editDialogOpen}
        onOpenChange={setEditDialogOpen}
        onSuccess={() => {
          setEditDialogOpen(false);
          onRefresh();
        }}
      />

      <UserDeleteDialog
        user={selectedUser}
        open={deleteDialogOpen}
        onOpenChange={setDeleteDialogOpen}
        onConfirm={handleConfirmDelete}
      />

      <ResetPasswordDialog
        open={resetPasswordDialogOpen}
        onOpenChange={setResetPasswordDialogOpen}
        user={selectedUser}
        onSuccess={() => {
          setResetPasswordDialogOpen(false);
          onRefresh();
        }}
      />
    </>
  );
}
