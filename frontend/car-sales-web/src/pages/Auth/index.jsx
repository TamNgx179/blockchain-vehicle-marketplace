import { useEffect, useMemo, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import Navbar from "../../components/Navbar/Navbar";
import Footer from "../../components/Footer/Footer";
import AuthService from "../../services/authService";
import googleLogo from "../../assets/icon/google.webp";
import "./Auth.css";

const API_URL = import.meta.env.VITE_API_URL || "http://localhost:3000";

const MESSAGE_MAP = {
  "Đăng nhập thành công": "Login successful",
  "Đăng nhập thất bại": "Login failed",
  "Đăng ký thất bại": "Sign up failed",
  "OTP đã được gửi tới email": "OTP has been sent to your email",
  "OTP sent to email. Please verify your account.":
    "OTP has been sent to your email. Please verify your account.",
  "Xác thực OTP thất bại": "OTP verification failed",
  "Xác thực thành công": "Verification successful",
  "Xác thực thành công, hãy đăng nhập": "Verification successful. Please sign in.",
  "Email chưa được xác thực": "Email has not been verified yet",
  "Username or Email already exists": "Username or email already exists",
  "Passwords do not match": "Passwords do not match",
  "Password is invalid": "Password is invalid",
  "Confirm password is invalid": "Confirm password is invalid",
  "Invalid email or password": "Invalid email or password",
  "OTP không tồn tại hoặc đã hết hạn": "OTP does not exist or has expired",
  "OTP đã hết hạn": "OTP has expired",
  "OTP không chính xác": "Incorrect OTP",
  "Invalid OTP": "Invalid OTP",
};

function toEnglishMessage(message, fallback) {
  if (!message) return fallback;
  return MESSAGE_MAP[message] || message;
}

function getTokenPayload(token) {
  try {
    const payload = token?.split(".")?.[1];
    if (!payload) return null;

    const normalizedPayload = payload.replace(/-/g, "+").replace(/_/g, "/");
    const paddedPayload = normalizedPayload.padEnd(
      Math.ceil(normalizedPayload.length / 4) * 4,
      "="
    );

    return JSON.parse(window.atob(paddedPayload));
  } catch {
    return null;
  }
}

function getPostLoginPath(token) {
  return getTokenPayload(token)?.isadmin ? "/admin" : "/";
}

function Auth({ initialMode = "login" }) {
  const navigate = useNavigate();
  const location = useLocation();

  const [mode, setMode] = useState(initialMode);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");

  const [pendingEmail, setPendingEmail] = useState("");
  const [otp, setOtp] = useState("");

  const [loginForm, setLoginForm] = useState({
    email: "",
    password: "",
  });

  const [signupForm, setSignupForm] = useState({
    username: "",
    email: "",
    password: "",
    resPassword: "",
  });

  const [forgotStep, setForgotStep] = useState(1);
  const [forgotForm, setForgotForm] = useState({
    email: "",
    otp: "",
    newPassword: "",
    confirmPassword: "",
  });

  const isOtpStep = useMemo(
    () => mode === "signup" && Boolean(pendingEmail),
    [mode, pendingEmail]
  );

  useEffect(() => {
    setMode(initialMode);
  }, [initialMode]);

  useEffect(() => {
    const params = new URLSearchParams(location.search || "");
    const token = params.get("token");
    const email = params.get("email");
    const username = params.get("username");

    if (!token) return;

    localStorage.setItem("authToken", token);
    localStorage.setItem("token", token);

    if (email) {
      localStorage.setItem("authEmail", email);
    }

    localStorage.setItem(
      "authUsername",
      username || getTokenPayload(token)?.username || ""
    );

    window.dispatchEvent(new Event("auth-change"));
    navigate(getPostLoginPath(token), { replace: true });
  }, [location.search, navigate]);

  const switchMode = (next) => {
    setMode(next);
    setMessage("");
    setError("");
    setForgotStep(1);

    if (next !== "signup") {
      setPendingEmail("");
      setOtp("");
    }
  };

  const openForgotPassword = () => {
    setMode("forgot");
    setForgotStep(1);
    setMessage("");
    setError("");
    setForgotForm((prev) => ({
      ...prev,
      email: prev.email || loginForm.email,
      otp: "",
      newPassword: "",
      confirmPassword: "",
    }));
  };

  const backToLogin = () => {
    setMode("login");
    setForgotStep(1);
    setMessage("");
    setError("");
  };

  const onChangeLogin = (field, value) => {
    setLoginForm((p) => ({ ...p, [field]: value }));
  };

  const onChangeSignup = (field, value) => {
    setSignupForm((p) => ({ ...p, [field]: value }));
  };

  const onChangeForgot = (field, value) => {
    setForgotForm((p) => ({ ...p, [field]: value }));
  };

  const handleGoogleLogin = () => {
    setError("");
    setMessage("");
    AuthService.googleLogin();
  };

  const submitLogin = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError("");
    setMessage("");

    try {
      const res = await fetch(`${API_URL}/api/users/login`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify(loginForm),
      });

      const json = await res.json();
      if (!res.ok) throw new Error(toEnglishMessage(json?.message, "Login failed"));
      if (!json?.token) throw new Error("Login failed");

      const payload = getTokenPayload(json.token);

      localStorage.setItem("authToken", json.token);
      localStorage.setItem("token", json.token);
      localStorage.setItem("authEmail", loginForm.email);
      localStorage.setItem("authUsername", payload?.username || "");

      window.dispatchEvent(new Event("auth-change"));
      navigate(getPostLoginPath(json.token), { replace: true });
    } catch (err) {
      setError(toEnglishMessage(err?.message, "Login failed"));
    } finally {
      setLoading(false);
    }
  };

  const submitSignup = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError("");
    setMessage("");

    try {
      const res = await fetch(`${API_URL}/api/users/register`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(signupForm),
      });

      const json = await res.json();
      if (!res.ok) throw new Error(toEnglishMessage(json?.message, "Sign up failed"));

      setPendingEmail(signupForm.email);
      setMessage(toEnglishMessage(json?.message, "OTP sent"));
    } catch (err) {
      setError(toEnglishMessage(err?.message, "Sign up failed"));
    } finally {
      setLoading(false);
    }
  };

  const submitOtp = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError("");
    setMessage("");

    try {
      const res = await fetch(`${API_URL}/api/users/verifyOtp`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: pendingEmail, otp }),
      });

      const json = await res.json();
      if (!res.ok) throw new Error(toEnglishMessage(json?.message, "OTP failed"));

      setPendingEmail("");
      setOtp("");
      setMode("login");
      setLoginForm((p) => ({ ...p, email: signupForm.email }));
      setMessage("Verification successful. Please sign in.");
    } catch (err) {
      setError(toEnglishMessage(err?.message, "OTP failed"));
    } finally {
      setLoading(false);
    }
  };

  const submitForgotEmail = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError("");
    setMessage("");

    try {
      const res = await fetch(`${API_URL}/api/users/forgot-password`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: forgotForm.email }),
      });

      const json = await res.json();
      if (!res.ok) throw new Error(toEnglishMessage(json?.message, "Failed"));

      setForgotStep(2);
      setMessage("OTP sent to your email");
    } catch (err) {
      setError(toEnglishMessage(err?.message, "Failed"));
    } finally {
      setLoading(false);
    }
  };

  const submitForgotOtp = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError("");
    setMessage("");

    try {
      const res = await fetch(`${API_URL}/api/users/verifyOtp`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          email: forgotForm.email,
          otp: forgotForm.otp,
        }),
      });

      const json = await res.json();
      if (!res.ok) {
        throw new Error(toEnglishMessage(json?.message, "OTP verification failed"));
      }

      setForgotStep(3);
      setMessage("OTP verified. Please enter your new password.");
    } catch (err) {
      setError(toEnglishMessage(err?.message, "OTP verification failed"));
    } finally {
      setLoading(false);
    }
  };

  const submitResetPassword = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError("");
    setMessage("");

    try {
      if (forgotForm.newPassword !== forgotForm.confirmPassword) {
        throw new Error("Passwords do not match");
      }

      const res = await fetch(`${API_URL}/api/users/reset-password`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          email: forgotForm.email,
          otp: forgotForm.otp,
          newPassword: forgotForm.newPassword,
        }),
      });

      const json = await res.json();
      if (!res.ok) throw new Error(toEnglishMessage(json?.message, "Reset failed"));

      setMessage("Password reset successful. Please sign in.");
      setMode("login");
      setForgotStep(1);
      setLoginForm((p) => ({ ...p, email: forgotForm.email, password: "" }));
      setForgotForm({
        email: "",
        otp: "",
        newPassword: "",
        confirmPassword: "",
      });
    } catch (err) {
      setError(toEnglishMessage(err?.message, "Reset failed"));
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <Navbar />

      <main className="auth-page">
        <section className="auth-hero">
          <div className="auth-card">
            {mode !== "forgot" && (
              <>
                <div className="auth-header">
                  <span className="auth-kicker">Welcome back</span>
                  <h1>{mode === "login" ? "Sign in to your account" : "Create your account"}</h1>
                  <p>
                    {mode === "login"
                      ? "Continue with your email and password."
                      : "Join us and verify your email to get started."}
                  </p>
                </div>

                <div className="auth-tabs">
                  <button
                    type="button"
                    onClick={() => switchMode("login")}
                    className={mode === "login" ? "active" : ""}
                  >
                    Login
                  </button>
                  <button
                    type="button"
                    onClick={() => switchMode("signup")}
                    className={mode === "signup" ? "active" : ""}
                  >
                    Sign up
                  </button>
                </div>
              </>
            )}

            {mode === "forgot" && (
              <div className="auth-header auth-forgot-header">
                <button type="button" className="auth-back-link" onClick={backToLogin}>
                  ← Back to login
                </button>

                <div className="auth-icon">🔐</div>
                <span className="auth-kicker">Account recovery</span>
                <h1>Reset your password</h1>
                <p>
                  {forgotStep === 1
                    ? "Enter your email and we’ll send you a one-time code to reset your password."
                    : forgotStep === 2
                    ? "Enter the OTP sent to your email."
                    : "Choose a new password for your account."}
                </p>
              </div>
            )}

            {message && <div className="auth-alert auth-success">{message}</div>}
            {error && <div className="auth-alert auth-error">{error}</div>}

            {mode === "login" && (
              <form onSubmit={submitLogin} className="auth-form">
                <label className="auth-field">
                  <span>Email</span>
                  <input
                    type="email"
                    placeholder="you@example.com"
                    value={loginForm.email}
                    onChange={(e) => onChangeLogin("email", e.target.value)}
                  />
                </label>

                <label className="auth-field">
                  <span>Password</span>
                  <input
                    type="password"
                    placeholder="Enter your password"
                    value={loginForm.password}
                    onChange={(e) => onChangeLogin("password", e.target.value)}
                  />
                </label>

                <div className="auth-forgot-row">
                  <button
                    type="button"
                    className="auth-text-link"
                    onClick={openForgotPassword}
                  >
                    Forgot password?
                  </button>
                </div>

                <button type="submit" disabled={loading}>
                  {loading ? "Signing in..." : "Login"}
                </button>

                <div className="auth-divider">
                  <span>or</span>
                </div>

                <button
                  type="button"
                  className="auth-google-btn"
                  onClick={handleGoogleLogin}
                  disabled={loading}
                >
                  <img src={googleLogo} alt="" aria-hidden="true" />
                  Continue with Google
                </button>
              </form>
            )}

            {mode === "forgot" && forgotStep === 1 && (
              <form onSubmit={submitForgotEmail} className="auth-form">
                <label className="auth-field">
                  <span>Email address</span>
                  <input
                    type="email"
                    placeholder="you@example.com"
                    value={forgotForm.email}
                    onChange={(e) => onChangeForgot("email", e.target.value)}
                  />
                </label>

                <button type="submit" disabled={loading}>
                  {loading ? "Sending..." : "Send reset code"}
                </button>
              </form>
            )}

            {mode === "forgot" && forgotStep === 2 && (
              <form onSubmit={submitForgotOtp} className="auth-form">
                <div className="auth-email-note">
                  Code sent to <strong>{forgotForm.email}</strong>
                  <button type="button" onClick={() => setForgotStep(1)}>
                    Change
                  </button>
                </div>

                <label className="auth-field">
                  <span>OTP code</span>
                  <input
                    placeholder="Enter OTP"
                    value={forgotForm.otp}
                    onChange={(e) => onChangeForgot("otp", e.target.value)}
                  />
                </label>

                <button type="submit" disabled={loading}>
                  {loading ? "Verifying..." : "Verify OTP"}
                </button>
              </form>
            )}

            {mode === "forgot" && forgotStep === 3 && (
              <form onSubmit={submitResetPassword} className="auth-form">
                <div className="auth-email-note">
                  OTP verified for <strong>{forgotForm.email}</strong>
                </div>

                <label className="auth-field">
                  <span>New password</span>
                  <input
                    type="password"
                    placeholder="Enter new password"
                    value={forgotForm.newPassword}
                    onChange={(e) => onChangeForgot("newPassword", e.target.value)}
                  />
                </label>

                <label className="auth-field">
                  <span>Confirm password</span>
                  <input
                    type="password"
                    placeholder="Confirm new password"
                    value={forgotForm.confirmPassword}
                    onChange={(e) => onChangeForgot("confirmPassword", e.target.value)}
                  />
                </label>

                <button type="submit" disabled={loading}>
                  {loading ? "Resetting..." : "Reset password"}
                </button>
              </form>
            )}

            {mode === "signup" && !isOtpStep && (
              <form onSubmit={submitSignup} className="auth-form">
                <label className="auth-field">
                  <span>Username</span>
                  <input
                    placeholder="Your username"
                    value={signupForm.username}
                    onChange={(e) => onChangeSignup("username", e.target.value)}
                  />
                </label>

                <label className="auth-field">
                  <span>Email</span>
                  <input
                    type="email"
                    placeholder="you@example.com"
                    value={signupForm.email}
                    onChange={(e) => onChangeSignup("email", e.target.value)}
                  />
                </label>

                <label className="auth-field">
                  <span>Password</span>
                  <input
                    type="password"
                    placeholder="Create a password"
                    value={signupForm.password}
                    onChange={(e) => onChangeSignup("password", e.target.value)}
                  />
                </label>

                <label className="auth-field">
                  <span>Confirm password</span>
                  <input
                    type="password"
                    placeholder="Confirm your password"
                    value={signupForm.resPassword}
                    onChange={(e) => onChangeSignup("resPassword", e.target.value)}
                  />
                </label>

                <button type="submit" disabled={loading}>
                  {loading ? "Creating..." : "Create account"}
                </button>

                <div className="auth-divider">
                  <span>or</span>
                </div>

                <button
                  type="button"
                  className="auth-google-btn"
                  onClick={handleGoogleLogin}
                  disabled={loading}
                >
                  <img src={googleLogo} alt="" aria-hidden="true" />
                  Continue with Google
                </button>
              </form>
            )}

            {mode === "signup" && isOtpStep && (
              <form onSubmit={submitOtp} className="auth-form">
                <div className="auth-email-note">
                  OTP sent to <strong>{pendingEmail}</strong>
                </div>

                <label className="auth-field">
                  <span>OTP code</span>
                  <input
                    value={otp}
                    onChange={(e) => setOtp(e.target.value)}
                    placeholder="Enter OTP"
                  />
                </label>

                <button type="submit" disabled={loading}>
                  {loading ? "Verifying..." : "Verify OTP"}
                </button>
              </form>
            )}
          </div>
        </section>
      </main>

      <Footer />
    </>
  );
}

export default Auth;
