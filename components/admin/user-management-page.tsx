"use client";

import { useState } from "react";
import UserList from "@/components/users/user-list";
import CreateUserForm from "@/components/users/create-user-form";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Plus } from "lucide-react";

export default function UserManagementPage() {
  const [isCreateOpen, setIsCreateOpen] = useState(false);

  // Refresh trigger untuk reload UserList setelah user berhasil dibuat
  const [refreshTrigger, setRefreshTrigger] = useState(0);

  const handleCreateSuccess = () => {
    setIsCreateOpen(false);
    setRefreshTrigger((prev) => prev + 1);
  };

  return (
    <div className="space-y-6">
      <div className="sa-welcome mb-8">
        <div>
          <h1 className="sa-welcome__title">Kelola Pengguna</h1>
          <p className="sa-welcome__subtitle">
            Manajemen data pengguna K3 Smart
          </p>
        </div>

        <Dialog open={isCreateOpen} onOpenChange={setIsCreateOpen}>
          <DialogTrigger asChild>
            <Button className="bg-[#FF4B4B] hover:bg-[#FF3333] text-white rounded-[20px] px-6 h-10 shadow-sm transition-all font-semibold">
              <Plus className="w-5 h-5 mr-1" strokeWidth={3} />
              Tambah
            </Button>
          </DialogTrigger>

          <DialogContent className="max-w-lg w-full max-h-screen overflow-y-auto rounded-[24px] p-6">
            <DialogHeader>
              <DialogTitle className="text-xl font-bold text-slate-900">Tambah Pengguna</DialogTitle>
            </DialogHeader>

            <CreateUserForm onSuccess={handleCreateSuccess} />
          </DialogContent>
        </Dialog>
      </div>

      <UserList refreshTrigger={refreshTrigger} />
    </div>
  );
}