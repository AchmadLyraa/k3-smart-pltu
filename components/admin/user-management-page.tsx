"use client";

import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import UserList from "@/components/users/user-list";
import CreateUserForm from "@/components/users/create-user-form";

export default function UserManagementPage() {
  return (
    <div className="space-y-6 mt-8">
      <div>
        <h1 className="text-3xl font-bold">User Management</h1>
        <p className="text-muted-foreground mt-2">
          Kelola pengguna sistem K3-SMART
        </p>
      </div>

      <CreateUserForm />
      <UserList />
    </div>
  );
}
