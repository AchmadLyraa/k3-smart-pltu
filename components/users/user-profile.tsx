"use client";

import { useState, useEffect } from "react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Lock, Mail, User, MapPin, Building2, Clock, CheckCircle2, AlertCircle } from "lucide-react";
import { getUserProfile, changePassword } from "@/app/actions/users";
import { useSession } from "next-auth/react";

export default function UserProfile() {
  const { data: session } = useSession();
  const [profile, setProfile] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  // Change password modal state
  const [showPasswordDialog, setShowPasswordDialog] = useState(false);
  const [passwordForm, setPasswordForm] = useState({
    oldPassword: "",
    newPassword: "",
    confirmPassword: "",
  });
  const [passwordLoading, setPasswordLoading] = useState(false);
  const [passwordError, setPasswordError] = useState("");
  const [passwordSuccess, setPasswordSuccess] = useState("");

  // Load profile on mount
  useEffect(() => {
    const loadProfile = async () => {
      if (!session?.user?.id) return;

      const result = await getUserProfile(session.user.id);
      if (result.success) {
        setProfile(result.data);
      } else {
        setError(result.error || "Failed to load profile");
      }
      setLoading(false);
    };

    loadProfile();
  }, [session?.user?.id]);

  const handleChangePassword = async () => {
    setPasswordError("");
    setPasswordSuccess("");

    // Validation
    if (!passwordForm.oldPassword.trim()) {
      setPasswordError("Current password is required");
      return;
    }

    if (!passwordForm.newPassword.trim()) {
      setPasswordError("New password is required");
      return;
    }

    if (passwordForm.newPassword !== passwordForm.confirmPassword) {
      setPasswordError("Passwords do not match");
      return;
    }

    if (passwordForm.newPassword.length < 8) {
      setPasswordError("Password must be at least 8 characters");
      return;
    }

    if (!/[A-Z]/.test(passwordForm.newPassword)) {
      setPasswordError("Password must contain uppercase letter");
      return;
    }

    if (!/[a-z]/.test(passwordForm.newPassword)) {
      setPasswordError("Password must contain lowercase letter");
      return;
    }

    if (!/[0-9]/.test(passwordForm.newPassword)) {
      setPasswordError("Password must contain number");
      return;
    }

    setPasswordLoading(true);
    try {
      const result = await changePassword(
        session!.user.id,
        passwordForm.oldPassword,
        passwordForm.newPassword,
      );

      if (result.success) {
        setPasswordSuccess("Password changed successfully!");
        setPasswordForm({
          oldPassword: "",
          newPassword: "",
          confirmPassword: "",
        });
        setTimeout(() => {
          setShowPasswordDialog(false);
          setPasswordSuccess("");
        }, 2000);
      } else {
        setPasswordError(result.error || "Failed to change password");
      }
    } finally {
      setPasswordLoading(false);
    }
  };

  if (loading) {
    return (
      <Card>
        <CardContent className="flex items-center justify-center py-12">
          <p className="text-muted-foreground">Loading profile...</p>
        </CardContent>
      </Card>
    );
  }

  if (error || !profile) {
    return (
      <Card>
        <CardContent className="py-12">
          <Alert variant="destructive">
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>{error || "Profile not found"}</AlertDescription>
          </Alert>
        </CardContent>
      </Card>
    );
  }

  return (
    <>
      <div className="grid gap-6">
        {/* Profile Header */}
        <Card>
          <CardHeader>
            <CardTitle>My Profile</CardTitle>
            <CardDescription>Manage your personal information</CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            {/* Profile Picture and Basic Info */}
            <div className="flex gap-6 items-start">
              <div className="flex-shrink-0">
                {profile.image ? (
                  <img
                    src={profile.image}
                    alt={profile.name}
                    className="h-24 w-24 rounded-lg object-cover border border-border"
                  />
                ) : (
                  <div className="h-24 w-24 rounded-lg bg-muted flex items-center justify-center border border-border">
                    <User className="h-12 w-12 text-muted-foreground" />
                  </div>
                )}
              </div>

              <div className="flex-1">
                <div className="space-y-1">
                  <h2 className="text-2xl font-bold">{profile.name}</h2>
                  <p className="text-sm text-muted-foreground flex items-center gap-2">
                    <Mail className="h-4 w-4" />
                    {profile.email}
                  </p>
                </div>

                <div className="flex gap-2 mt-4">
                  <span className="inline-flex items-center rounded-full bg-blue-100 px-3 py-1 text-sm font-medium text-blue-700">
                    {profile.role}
                  </span>
                  {profile.status === "ACTIVE" ? (
                    <span className="inline-flex items-center rounded-full bg-green-100 px-3 py-1 text-sm font-medium text-green-700">
                      <CheckCircle2 className="h-3 w-3 mr-1" />
                      Active
                    </span>
                  ) : (
                    <span className="inline-flex items-center rounded-full bg-gray-100 px-3 py-1 text-sm font-medium text-gray-700">
                      {profile.status}
                    </span>
                  )}
                </div>
              </div>
            </div>

            {/* Divider */}
            <div className="border-t" />

            {/* Personal Information */}
            <div className="space-y-4">
              <h3 className="font-semibold">Personal Information</h3>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-sm font-medium text-muted-foreground">
                    Full Name
                  </label>
                  <p className="text-sm mt-1">{profile.name || "-"}</p>
                </div>

                <div>
                  <label className="text-sm font-medium text-muted-foreground">
                    <Mail className="h-4 w-4 inline mr-1" />
                    Email
                  </label>
                  <p className="text-sm mt-1">{profile.email}</p>
                </div>

                <div>
                  <label className="text-sm font-medium text-muted-foreground">
                    NIP
                  </label>
                  <p className="text-sm mt-1">{profile.nip || "-"}</p>
                </div>

                <div>
                  <label className="text-sm font-medium text-muted-foreground">
                    Role
                  </label>
                  <p className="text-sm mt-1">{profile.role}</p>
                </div>
              </div>
            </div>

            {/* Organizational Information */}
            {(profile.unit || profile.division || profile.shift) && (
              <>
                <div className="border-t" />

                <div className="space-y-4">
                  <h3 className="font-semibold">Organization</h3>

                  <div className="grid grid-cols-2 gap-4">
                    {profile.unit && (
                      <div>
                        <label className="text-sm font-medium text-muted-foreground flex items-center gap-1">
                          <Building2 className="h-4 w-4" />
                          Unit
                        </label>
                        <p className="text-sm mt-1">{profile.unit.name}</p>
                      </div>
                    )}

                    {profile.division && (
                      <div>
                        <label className="text-sm font-medium text-muted-foreground flex items-center gap-1">
                          <MapPin className="h-4 w-4" />
                          Division
                        </label>
                        <p className="text-sm mt-1">{profile.division.name}</p>
                      </div>
                    )}

                    {profile.shift && (
                      <div>
                        <label className="text-sm font-medium text-muted-foreground flex items-center gap-1">
                          <Clock className="h-4 w-4" />
                          Shift
                        </label>
                        <p className="text-sm mt-1">{profile.shift.name}</p>
                      </div>
                    )}
                  </div>
                </div>
              </>
            )}

            {/* Account Information */}
            <div className="border-t" />

            <div className="space-y-4">
              <h3 className="font-semibold">Account Information</h3>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-sm font-medium text-muted-foreground">
                    Account Created
                  </label>
                  <p className="text-sm mt-1">
                    {new Date(profile.createdAt).toLocaleDateString("id-ID", {
                      year: "numeric",
                      month: "long",
                      day: "numeric",
                    })}
                  </p>
                </div>

                {profile.lastLogin && (
                  <div>
                    <label className="text-sm font-medium text-muted-foreground">
                      Last Login
                    </label>
                    <p className="text-sm mt-1">
                      {new Date(profile.lastLogin).toLocaleDateString(
                        "id-ID",
                        {
                          year: "numeric",
                          month: "long",
                          day: "numeric",
                          hour: "2-digit",
                          minute: "2-digit",
                        },
                      )}
                    </p>
                  </div>
                )}
              </div>
            </div>

            {/* Action Buttons */}
            <div className="border-t pt-4 flex gap-2">
              <Button
                onClick={() => setShowPasswordDialog(true)}
                variant="outline"
                className="gap-2"
              >
                <Lock className="h-4 w-4" />
                Change Password
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Change Password Dialog */}
      <Dialog
        open={showPasswordDialog}
        onOpenChange={setShowPasswordDialog}
      >
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle>Change Password</DialogTitle>
            <DialogDescription>
              Enter your current password and choose a new one
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4 py-4">
            {passwordError && (
              <Alert variant="destructive">
                <AlertCircle className="h-4 w-4" />
                <AlertDescription>{passwordError}</AlertDescription>
              </Alert>
            )}

            {passwordSuccess && (
              <Alert className="bg-green-50 border-green-200">
                <CheckCircle2 className="h-4 w-4 text-green-600" />
                <AlertDescription className="text-green-700">
                  {passwordSuccess}
                </AlertDescription>
              </Alert>
            )}

            <div className="space-y-2">
              <label className="text-sm font-medium">Current Password</label>
              <Input
                type="password"
                placeholder="Enter your current password"
                value={passwordForm.oldPassword}
                onChange={(e) =>
                  setPasswordForm({
                    ...passwordForm,
                    oldPassword: e.target.value,
                  })
                }
                disabled={passwordLoading}
              />
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium">New Password</label>
              <Input
                type="password"
                placeholder="Enter new password"
                value={passwordForm.newPassword}
                onChange={(e) =>
                  setPasswordForm({
                    ...passwordForm,
                    newPassword: e.target.value,
                  })
                }
                disabled={passwordLoading}
              />
              <p className="text-xs text-muted-foreground">
                Minimum 8 characters, must include uppercase, lowercase, and number
              </p>
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium">Confirm Password</label>
              <Input
                type="password"
                placeholder="Confirm new password"
                value={passwordForm.confirmPassword}
                onChange={(e) =>
                  setPasswordForm({
                    ...passwordForm,
                    confirmPassword: e.target.value,
                  })
                }
                disabled={passwordLoading}
              />
            </div>

            <div className="flex gap-2 justify-end pt-4 border-t">
              <Button
                variant="outline"
                onClick={() => setShowPasswordDialog(false)}
                disabled={passwordLoading}
              >
                Cancel
              </Button>
              <Button
                onClick={handleChangePassword}
                disabled={passwordLoading}
              >
                {passwordLoading ? "Changing..." : "Change Password"}
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
}
