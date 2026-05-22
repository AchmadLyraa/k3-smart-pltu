"use client";

import { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Card, CardContent } from "@/components/ui/card";
import {
  Copy,
  CheckCircle2,
  AlertCircle,
  Eye,
  EyeOff,
  RefreshCw,
} from "lucide-react";
import { resetPassword } from "@/app/actions/users";
import { useToast } from "@/hooks/use-toast";

interface ResetPasswordDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  user?: {
    id: string;
    name?: string;
    email: string;
  };
  onSuccess?: () => void;
}

export function ResetPasswordDialog({
  open,
  onOpenChange,
  user,
  onSuccess,
}: ResetPasswordDialogProps) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [result, setResult] = useState<any>(null);
  const [showPassword, setShowPassword] = useState(false);
  const [copied, setCopied] = useState(false);
  const { toast } = useToast();

  const handleReset = async () => {
    if (!user?.id) return;

    setLoading(true);
    setError("");

    try {
      const response = await resetPassword(user.id);

      if (response.success) {
        setResult(response.data);
        toast({
          title: "Berhasil",
          description: "Password berhasil direset",
        });
      } else {
        setError(response.error || "Failed to reset password");
        toast({
          title: "Gagal",
          description: response.error || "Gagal mereset password",
          variant: "destructive",
        });
      }
    } finally {
      setLoading(false);
    }
  };

  const handleCopy = async () => {
    if (result?.newPassword) {
      await navigator.clipboard.writeText(result.newPassword);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  const handleClose = () => {
    setLoading(false);
    setError("");
    setResult(null);
    setShowPassword(false);
    setCopied(false);
    onOpenChange(false);
    onSuccess?.();
  };

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>Reset User Password</DialogTitle>
          <DialogDescription>
            Generate a new password for {user?.name || user?.email}
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 py-4">
          {/* Error Alert */}
          {error && (
            <Alert variant="destructive">
              <AlertCircle className="h-4 w-4" />
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}

          {/* Before Reset - User Info & Button */}
          {!result && (
            <>
              <Card className="bg-muted/50">
                <CardContent className="pt-6">
                  <div className="space-y-3 text-sm">
                    <div>
                      <p className="text-xs text-muted-foreground uppercase tracking-wide">
                        User Name
                      </p>
                      <p className="font-medium">{user?.name || "-"}</p>
                    </div>
                    <div>
                      <p className="text-xs text-muted-foreground uppercase tracking-wide">
                        Email
                      </p>
                      <p className="font-medium">{user?.email}</p>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Alert className="bg-blue-50 border-blue-200">
                <AlertCircle className="h-4 w-4 text-blue-600" />
                <AlertDescription className="text-blue-700">
                  A new password will be automatically generated. Make sure to
                  copy and share it with the user securely.
                </AlertDescription>
              </Alert>

              <div className="flex gap-2 justify-end border-t pt-4">
                <Button
                  variant="outline"
                  onClick={handleClose}
                  disabled={loading}
                >
                  Cancel
                </Button>
                <Button
                  onClick={handleReset}
                  disabled={loading}
                  className="gap-2"
                >
                  {loading ? (
                    <>
                      <RefreshCw className="h-4 w-4 animate-spin" />
                      Generating...
                    </>
                  ) : (
                    <>
                      <RefreshCw className="h-4 w-4" />
                      Reset Password
                    </>
                  )}
                </Button>
              </div>
            </>
          )}

          {/* After Reset - Show Generated Password */}
          {result && (
            <>
              <Alert className="bg-green-50 border-green-200">
                <CheckCircle2 className="h-4 w-4 text-green-600" />
                <AlertDescription className="text-green-700">
                  Password reset successfully! Copy the new password and share it
                  with the user.
                </AlertDescription>
              </Alert>

              <Card className="bg-amber-50 border-amber-200">
                <CardContent className="pt-6">
                  <div className="space-y-3">
                    <p className="text-sm font-medium text-amber-900">
                      New Password for {result.email}:
                    </p>

                    <div className="flex gap-2">
                      <div className="flex-1 relative">
                        <input
                          type={showPassword ? "text" : "password"}
                          value={result.newPassword}
                          readOnly
                          className="w-full px-3 py-2 border rounded-md bg-white font-mono text-sm"
                        />
                      </div>
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => setShowPassword(!showPassword)}
                        className="px-3"
                      >
                        {showPassword ? (
                          <EyeOff className="h-4 w-4" />
                        ) : (
                          <Eye className="h-4 w-4" />
                        )}
                      </Button>
                      <Button
                        size="sm"
                        onClick={handleCopy}
                        className={`px-3 gap-2 ${
                          copied
                            ? "bg-green-600 hover:bg-green-700"
                            : "bg-blue-600 hover:bg-blue-700"
                        }`}
                      >
                        {copied ? (
                          <>
                            <CheckCircle2 className="h-4 w-4" />
                            Copied!
                          </>
                        ) : (
                          <>
                            <Copy className="h-4 w-4" />
                            Copy
                          </>
                        )}
                      </Button>
                    </div>

                    <div className="text-xs text-amber-700 bg-white p-2 rounded border border-amber-200">
                      ⚠️ Make sure to save this password in a secure place. The
                      user will use it to login.
                    </div>
                  </div>
                </CardContent>
              </Card>

              <div className="flex gap-2 justify-end border-t pt-4">
                <Button onClick={handleClose} className="gap-2">
                  <CheckCircle2 className="h-4 w-4" />
                  Done
                </Button>
              </div>
            </>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}
