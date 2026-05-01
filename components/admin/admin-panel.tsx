"use client";

import Link from "next/link";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Users, Settings, FileText } from "lucide-react";

export default function AdminPanel() {
  return (
    <div className="grid gap-6 mt-8">
      <div className="grid gap-4 md:grid-cols-3">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              User Management
            </CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <p className="text-xs text-muted-foreground mt-2">
              Kelola pengguna, role, status akun
            </p>
            <Button asChild size="sm" className="mt-4">
              <Link href="/admin/users">Buka</Link>
            </Button>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Settings</CardTitle>
            <Settings className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <p className="text-xs text-muted-foreground mt-2">
              Konfigurasi sistem, periode, bobot poin
            </p>
            <Button asChild size="sm" variant="outline" className="mt-4">
              <Link href="/admin/settings">Buka</Link>
            </Button>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Audit Log</CardTitle>
            <FileText className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <p className="text-xs text-muted-foreground mt-2">
              Lihat semua aktivitas admin
            </p>
            <Button asChild size="sm" variant="outline" className="mt-4">
              <Link href="/admin/audit">Buka</Link>
            </Button>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
