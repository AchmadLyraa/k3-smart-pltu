"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Lock, Mail, User, MapPin, Building2, Clock, CheckCircle2, AlertCircle } from "lucide-react";
import { getUserProfile, changePassword } from "@/app/actions/users";
import { useSession } from "next-auth/react";

const inputStyleClass =
  "w-full rounded-[24px] h-11 px-5 border-[#E2E8F0] focus-visible:border-[#FF4B4B] focus-visible:ring-[#FF4B4B]/20 focus-visible:ring-[3px] focus-visible:outline-none transition-all shadow-sm";

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
        session?.user?.id ?? "",
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
      <div className="bg-white rounded-[24px] shadow-sm border border-slate-100 p-8 flex items-center justify-center py-16">
        <p className="text-muted-foreground">Loading profile...</p>
      </div>
    );
  }

  if (error || !profile) {
    return (
      <div className="bg-white rounded-[24px] shadow-sm border border-slate-100 p-8 py-12">
        <div className="rounded-[24px] bg-red-50 border border-red-200 p-4 flex items-start gap-3">
          <AlertCircle className="w-5 h-5 text-red-500 shrink-0 mt-0.5" />
          <p className="text-sm text-red-700">{error || "Profile not found"}</p>
        </div>
      </div>
    );
  }

  return (
    <>
      <div className="space-y-6">
        {/* Profile Header Card */}
        <div className="bg-white rounded-[24px] shadow-sm border border-slate-100 p-8">
          <div className="flex gap-8 items-start">
            {/* Profile Picture - Circle */}
            <div className="flex-shrink-0">
              {profile.image ? (
                <img
                  src={profile.image}
                  alt={profile.name}
                  className="h-24 w-24 rounded-full object-cover border-4 border-[#FFF0EE]"
                />
              ) : (
                <div className="h-24 w-24 rounded-full bg-[#FFF0EE] flex items-center justify-center border-4 border-[#FFF0EE]">
                  <User className="h-10 w-10 text-[#FF4B4B]" />
                </div>
              )}
            </div>

            <div className="flex-1 pt-1">
              <h2 className="text-2xl font-bold text-slate-900">{profile.name}</h2>
              <p className="text-sm text-slate-500 flex items-center gap-2 mt-1">
                <Mail className="h-4 w-4 text-slate-400" />
                {profile.email}
              </p>

              <div className="flex gap-2 mt-4">
                <span className="inline-flex items-center rounded-full bg-[#FFF0EE] px-4 py-1.5 text-sm font-semibold text-[#FF4B4B]">
                  {profile.role}
                </span>
                {profile.status === "ACTIVE" ? (
                  <span className="inline-flex items-center rounded-full bg-green-50 px-4 py-1.5 text-sm font-semibold text-green-700">
                    <CheckCircle2 className="h-3.5 w-3.5 mr-1.5" />
                    Active
                  </span>
                ) : (
                  <span className="inline-flex items-center rounded-full bg-gray-100 px-4 py-1.5 text-sm font-semibold text-gray-700">
                    {profile.status}
                  </span>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Personal Information Card */}
        <div className="bg-white rounded-[24px] shadow-sm border border-slate-100 p-8">
          <h3 className="font-bold text-[15px] text-slate-900 mb-6">Personal Information</h3>

          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
            <div className="bg-slate-50 rounded-[16px] p-4">
              <p className="text-xs text-slate-500 font-medium uppercase tracking-wide">Full Name</p>
              <p className="text-sm font-semibold text-slate-800 mt-1.5">{profile.name || "-"}</p>
            </div>

            <div className="bg-slate-50 rounded-[16px] p-4">
              <p className="text-xs text-slate-500 font-medium uppercase tracking-wide">
                <Mail className="h-3.5 w-3.5 inline mr-1 text-slate-400" />
                Email
              </p>
              <p className="text-sm font-semibold text-slate-800 mt-1.5">{profile.email}</p>
            </div>

            <div className="bg-slate-50 rounded-[16px] p-4">
              <p className="text-xs text-slate-500 font-medium uppercase tracking-wide">NIP</p>
              <p className="text-sm font-semibold text-slate-800 mt-1.5">{profile.nip || "-"}</p>
            </div>

            <div className="bg-slate-50 rounded-[16px] p-4">
              <p className="text-xs text-slate-500 font-medium uppercase tracking-wide">Role</p>
              <p className="text-sm font-semibold text-slate-800 mt-1.5">{profile.role}</p>
            </div>
          </div>

          {/* Organizational Information */}
          {(profile.unit || profile.division || profile.shift) && (
            <>
              <hr className="my-6 border-slate-100" />
              <h3 className="font-bold text-[15px] text-slate-900 mb-6">Organization</h3>

              <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
                {profile.unit && (
                  <div className="bg-slate-50 rounded-[16px] p-4">
                    <p className="text-xs text-slate-500 font-medium uppercase tracking-wide flex items-center gap-1">
                      <Building2 className="h-3.5 w-3.5 text-slate-400" />
                      Unit
                    </p>
                    <p className="text-sm font-semibold text-slate-800 mt-1.5">{profile.unit.name}</p>
                  </div>
                )}

                {profile.division && (
                  <div className="bg-slate-50 rounded-[16px] p-4">
                    <p className="text-xs text-slate-500 font-medium uppercase tracking-wide flex items-center gap-1">
                      <MapPin className="h-3.5 w-3.5 text-slate-400" />
                      Division
                    </p>
                    <p className="text-sm font-semibold text-slate-800 mt-1.5">{profile.division.name}</p>
                  </div>
                )}

                {profile.shift && (
                  <div className="bg-slate-50 rounded-[16px] p-4">
                    <p className="text-xs text-slate-500 font-medium uppercase tracking-wide flex items-center gap-1">
                      <Clock className="h-3.5 w-3.5 text-slate-400" />
                      Shift
                    </p>
                    <p className="text-sm font-semibold text-slate-800 mt-1.5">{profile.shift.name}</p>
                  </div>
                )}
              </div>
            </>
          )}

          {/* Account Information */}
          <hr className="my-6 border-slate-100" />
          <h3 className="font-bold text-[15px] text-slate-900 mb-6">Account Information</h3>

          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
            <div className="bg-slate-50 rounded-[16px] p-4">
              <p className="text-xs text-slate-500 font-medium uppercase tracking-wide">Account Created</p>
              <p className="text-sm font-semibold text-slate-800 mt-1.5">
                {new Date(profile.createdAt).toLocaleDateString("id-ID", {
                  year: "numeric",
                  month: "long",
                  day: "numeric",
                })}
              </p>
            </div>

            {profile.lastLogin && (
              <div className="bg-slate-50 rounded-[16px] p-4">
                <p className="text-xs text-slate-500 font-medium uppercase tracking-wide">Last Login</p>
                <p className="text-sm font-semibold text-slate-800 mt-1.5">
                  {new Date(profile.lastLogin).toLocaleDateString("id-ID", {
                    year: "numeric",
                    month: "long",
                    day: "numeric",
                    hour: "2-digit",
                    minute: "2-digit",
                  })}
                </p>
              </div>
            )}
          </div>

          {/* Action Buttons */}
          <div className="mt-8 pt-6 border-t border-slate-100">
            <Button
              onClick={() => setShowPasswordDialog(true)}
              variant="outline"
              className="rounded-[24px] h-10 px-6 border-[#E2E8F0] hover:border-gray-300 transition-all font-semibold gap-2"
            >
              <Lock className="h-4 w-4" />
              Change Password
            </Button>
          </div>
        </div>
      </div>

      {/* Change Password Dialog */}
      <Dialog
        open={showPasswordDialog}
        onOpenChange={setShowPasswordDialog}
      >
        <DialogContent className="max-w-lg w-full max-h-screen overflow-y-auto rounded-[24px] p-6">
          <DialogHeader>
            <DialogTitle className="text-xl font-bold text-slate-900">Change Password</DialogTitle>
          </DialogHeader>

          <div className="space-y-4 pt-2">
            {passwordError && (
              <div className="rounded-[24px] bg-red-50 border border-red-200 p-4 flex items-start gap-3">
                <AlertCircle className="w-5 h-5 text-red-500 shrink-0 mt-0.5" />
                <p className="text-sm text-red-700">{passwordError}</p>
              </div>
            )}

            {passwordSuccess && (
              <div className="rounded-[24px] bg-green-50 border border-green-200 p-4 flex items-start gap-3">
                <CheckCircle2 className="w-5 h-5 text-green-600 shrink-0 mt-0.5" />
                <p className="text-sm text-green-700">{passwordSuccess}</p>
              </div>
            )}

            <div>
              <label className="block text-sm font-medium mb-1.5 text-slate-700">Current Password</label>
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
                className={inputStyleClass}
              />
            </div>

            <div>
              <label className="block text-sm font-medium mb-1.5 text-slate-700">New Password</label>
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
                className={inputStyleClass}
              />
              <p className="text-xs text-muted-foreground mt-1 ml-1">
                Minimum 8 characters, must include uppercase, lowercase, and number
              </p>
            </div>

            <div>
              <label className="block text-sm font-medium mb-1.5 text-slate-700">Confirm Password</label>
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
                className={inputStyleClass}
              />
            </div>

            <div className="flex gap-2 pt-2">
              <Button
                variant="outline"
                className="flex-1 rounded-[24px] h-10 border-[#E2E8F0] hover:border-gray-300 transition-all font-semibold"
                onClick={() => setShowPasswordDialog(false)}
                disabled={passwordLoading}
              >
                Cancel
              </Button>
              <Button
                onClick={handleChangePassword}
                disabled={passwordLoading}
                className="flex-1 bg-[#FF4B4B] hover:bg-[#FF3333] text-white rounded-[24px] h-10 shadow-sm transition-all font-semibold"
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