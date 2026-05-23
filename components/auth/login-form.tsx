"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { signIn } from "next-auth/react";
import Image from "next/image";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Mail, Lock, Eye, EyeOff } from "lucide-react";

export default function LoginForm() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setIsLoading(true);

    try {
      const result = await signIn("credentials", {
        email,
        password,
        redirect: false,
      });

      if (!result?.ok) {
        setError(result?.error || "Invalid email or password");
        return;
      }

      // Fetch session untuk dapat role
      const { getSession } = await import("next-auth/react");
      const session = await getSession();
      const role = (session?.user as any)?.role;

      const roleRoutes: Record<string, string> = {
        SUPER_ADMIN: "/admin/dashboard",
        HSE_ADMIN: "/hse/dashboard",
        REWARD_ADMIN: "/reward/dashboard",
        WORKER: "/worker/home",
      };

      router.push(roleRoutes[role] ?? "/");
      router.refresh();
    } catch (err) {
      setError("An error occurred during login");
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="login-page">
      {/* Left Panel - Red circle with worker image */}
      <div className="login-left-panel">
        <div className="login-circle-bg">
          {/* Worker background image */}
          <div className="login-worker-image">
            <Image
              src="/images/login-bg-worker.png"
              alt="K3 Safety Worker"
              fill
              style={{ objectFit: "cover", objectPosition: "center" }}
              priority
            />
          </div>
          {/* Red overlay */}
          <div className="login-circle-overlay" />
          {/* Logo & Tagline */}
          <div className="login-brand">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src="/images/logonew-k3-white.svg"
              alt="K3 Smart Logo"
              className="login-brand-logo-img"
            />
            <p className="login-brand-tagline">Belajar, Paham, Selamat!</p>
          </div>
        </div>
      </div>

      {/* Right Panel - Login form */}
      <div className="login-right-panel">
        <div className="login-form-container">
          <h1 className="login-title">Masuk</h1>

          <form onSubmit={handleSubmit} className="login-form">
            {error && (
              <Alert variant="destructive" className="login-alert">
                <AlertDescription>{error}</AlertDescription>
              </Alert>
            )}

            <div className="login-field">
              <label htmlFor="email" className="login-label">
                Email
              </label>
              <div className="login-input-wrapper">
                <Mail className="login-input-icon-left" />
                <input
                  id="email"
                  type="email"
                  className="login-input with-left-icon"
                  placeholder="Masukkan email Anda"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  disabled={isLoading}
                />
              </div>
            </div>

            <div className="login-field">
              <label htmlFor="password" className="login-label">
                Password
              </label>
              <div className="login-input-wrapper">
                <Lock className="login-input-icon-left" />
                <input
                  id="password"
                  type={showPassword ? "text" : "password"}
                  className="login-input with-left-icon with-right-icon"
                  placeholder="Masukkan password Anda"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  disabled={isLoading}
                />
                <button
                  type="button"
                  className="login-password-toggle-btn"
                  onClick={() => setShowPassword(!showPassword)}
                  tabIndex={-1}
                  disabled={isLoading}
                  aria-label={showPassword ? "Sembunyikan password" : "Tampilkan password"}
                >
                  {showPassword ? (
                    <EyeOff className="login-input-icon-right" />
                  ) : (
                    <Eye className="login-input-icon-right" />
                  )}
                </button>
              </div>
            </div>

            <button
              type="submit"
              className="login-submit-btn"
              disabled={isLoading}
            >
              {isLoading ? (
                <span className="login-loading">
                  <svg className="login-spinner" viewBox="0 0 24 24" fill="none">
                    <circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeDasharray="32" strokeDashoffset="32">
                      <animate attributeName="stroke-dashoffset" values="32;0;32" dur="1.2s" repeatCount="indefinite"/>
                    </circle>
                  </svg>
                  Memproses...
                </span>
              ) : (
                "Masuk"
              )}
            </button>
          </form>
        </div>
      </div>

      <style jsx>{`
        .login-page {
          display: flex;
          min-height: 100vh;
          width: 100%;
          background: #ffffff;
          font-family: 'Buckin', sans-serif;
          overflow: hidden;
        }

        /* ─── Left Panel ─── */
        .login-left-panel {
          position: relative;
          width: 48%;
          min-height: 100vh;
          flex-shrink: 0;
        }

        .login-circle-bg {
          position: absolute;
          top: 30;
          left: 30;
          bottom: 30;
          width: calc(100% + 2vw);
          border-radius: 20% 20% 20% 20% ;
          overflow: hidden;
          background: #EF4444;
        }

        .login-worker-image {
          position: absolute;
          inset: -200;
          z-index: 1;
        }

        .login-circle-overlay {
          position: absolute;
          inset: 0;
          background: linear-gradient(
            160deg,
            rgba(239, 68, 68, 0.55) 0%,
            rgba(220, 38, 38, 0.70) 50%,
            rgba(185, 28, 28, 0.82) 100%
          );
          z-index: 2;
        }

        .login-brand {
          position: absolute;
          z-index: 3;
          display: flex;
          flex-direction: column;
          align-items: flex-start;
          left: 10%;
          bottom: 32%;
        }

        .login-brand-logo-img {
          width: 250px;
          height: auto;
          margin-bottom: 12px;
        }

        .login-brand-tagline {
          font-family: 'Buckin', sans-serif;
          font-size: 22px;
          font-weight: 400;
          color: rgba(255, 255, 255, 0.95);
          letter-spacing: 0.3px;
          margin: 0;
        }

        /* ─── Right Panel ─── */
        .login-right-panel {
          flex: 1;
          display: flex;
          align-items: center;
          justify-content: center;
          padding: 48px 60px;
        }

        .login-form-container {
          width: 100%;
          max-width: 460px;
        }

        .login-title {
          font-family: 'Buckin', sans-serif;
          font-size: 42px;
          font-weight: 700;
          color: #1a1a1a;
          margin: 0 0 44px 0;
          letter-spacing: -0.5px;
          text-align: center;
        }

        .login-form {
          display: flex;
          flex-direction: column;
          gap: 24px;
        }

        .login-alert {
          border-radius: 16px;
        }

        .login-field {
          display: flex;
          flex-direction: column;
          gap: 8px;
        }

        .login-label {
          font-family: 'Buckin', sans-serif;
          font-size: 17px;
          font-weight: 700;
          color: #6b7280;
          padding-left: 8px;
        }

        .login-input {
          font-family: 'Buckin', sans-serif;
          width: 100%;
          height: 56px;
          padding: 0 24px;
          border: none;
          border-radius: 28px;
          background: #f3f4f6;
          font-size: 16px;
          font-weight: 400;
          color: #1a1a1a;
          outline: none;
          transition: all 0.25s ease;
          box-shadow: inset 0 2px 4px rgba(0, 0, 0, 0.04);
        }

        .login-input:focus {
          background: #ffffff;
          box-shadow: 0 0 0 3px rgba(239, 68, 68, 0.15),
                      inset 0 2px 4px rgba(0, 0, 0, 0.02);
        }

        .login-input:disabled {
          opacity: 0.5;
          cursor: not-allowed;
        }

        .login-input::placeholder {
          color: #9ca3af;
        }

        .login-input-wrapper {
          position: relative;
          display: flex;
          align-items: center;
          width: 100%;
        }

        .login-input.with-left-icon {
          padding-left: 54px;
        }

        .login-input.with-right-icon {
          padding-right: 54px;
        }

        .login-input-wrapper :global(.login-input-icon-left) {
          position: absolute;
          left: 22px;
          color: #9ca3af;
          width: 20px;
          height: 20px;
          pointer-events: none;
          transition: color 0.25s ease;
        }

        .login-input-wrapper:focus-within :global(.login-input-icon-left) {
          color: #EF4444;
        }

        .login-password-toggle-btn {
          position: absolute;
          right: 16px;
          background: none;
          border: none;
          padding: 8px;
          cursor: pointer;
          color: #9ca3af;
          display: flex;
          align-items: center;
          justify-content: center;
          border-radius: 50%;
          transition: all 0.25s ease;
        }

        .login-password-toggle-btn:hover:not(:disabled) {
          color: #EF4444;
          background-color: rgba(239, 68, 68, 0.08);
        }

        .login-password-toggle-btn:disabled {
          cursor: not-allowed;
          opacity: 0.5;
        }

        .login-password-toggle-btn :global(.login-input-icon-right) {
          width: 20px;
          height: 20px;
        }

        .login-submit-btn {
          font-family: 'Buckin', sans-serif;
          width: 100%;
          height: 58px;
          margin-top: 16px;
          border: none;
          border-radius: 32px;
          background: linear-gradient(135deg, #EF4444 0%, #DC2626 100%);
          color: #ffffff;
          font-size: 22px;
          font-weight: 700;
          cursor: pointer;
          transition: all 0.3s ease;
          box-shadow: 0 4px 16px rgba(239, 68, 68, 0.3);
          letter-spacing: 0.3px;
        }

        .login-submit-btn:hover:not(:disabled) {
          background: linear-gradient(135deg, #DC2626 0%, #B91C1C 100%);
          box-shadow: 0 6px 24px rgba(239, 68, 68, 0.4);
          transform: translateY(-1px);
        }

        .login-submit-btn:active:not(:disabled) {
          transform: translateY(0);
          box-shadow: 0 2px 8px rgba(239, 68, 68, 0.3);
        }

        .login-submit-btn:disabled {
          opacity: 0.7;
          cursor: not-allowed;
        }

        .login-loading {
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 10px;
        }

        .login-spinner {
          width: 22px;
          height: 22px;
          animation: spin 1s linear infinite;
        }

        @keyframes spin {
          from { transform: rotate(0deg); }
          to { transform: rotate(360deg); }
        }

        /* ─── Responsive ─── */
        @media (max-width: 1024px) {
          .login-page {
            flex-direction: column;
            overflow-y: auto;
          }

          .login-left-panel {
            width: 100%;
            min-height: 320px;
            height: 35vh;
          }

          .login-circle-bg {
            width: 120%;
            left: -10%;
            border-radius: 0 0 50% 50%;
          }

          .login-brand {
            left: 50%;
            bottom: 20%;
            transform: translateX(-50%);
            align-items: center;
          }

          .login-brand-logo-img {
            width: 220px;
          }

          .login-brand-tagline {
            text-align: center;
          }

          .login-right-panel {
            padding: 32px 24px 48px;
          }

          .login-title {
            font-size: 34px;
            margin-bottom: 28px;
          }
        }

        @media (max-width: 640px) {
          .login-left-panel {
            min-height: 240px;
            height: 28vh;
          }

          .login-brand-logo-img {
            width: 180px;
          }

          .login-brand-tagline {
            font-size: 16px;
          }

          .login-right-panel {
            padding: 24px 20px 40px;
          }

          .login-title {
            font-size: 28px;
            margin-bottom: 24px;
          }

          .login-input {
            height: 50px;
            padding: 0 20px;
            font-size: 15px;
          }

          .login-input.with-left-icon {
            padding-left: 48px;
          }

          .login-input.with-right-icon {
            padding-right: 48px;
          }

          .login-input-wrapper :global(.login-input-icon-left) {
            left: 18px;
            width: 18px;
            height: 18px;
          }

          .login-password-toggle-btn {
            right: 12px;
          }

          .login-password-toggle-btn :global(.login-input-icon-right) {
            width: 18px;
            height: 18px;
          }

          .login-submit-btn {
            height: 52px;
            font-size: 18px;
          }
        }
      `}</style>
    </div>
  );
}
