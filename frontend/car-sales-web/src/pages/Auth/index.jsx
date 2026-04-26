import { useEffect, useMemo, useState } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import Navbar from "../../components/Navbar/Navbar";
import Footer from "../../components/Footer/Footer";
import "./Auth.css";

const API_URL = import.meta.env.VITE_API_URL || "http://localhost:3000";

const MESSAGE_MAP = {
  "Đăng nhập thành công": "Login successful",
  "Đăng nhập thất bại": "Login failed",
  "Đăng ký thất bại": "Sign up failed",
  "OTP đã được gửi tới email": "OTP has been sent to your email",
  "OTP đã được gửi đến email của bạn": "OTP has been sent to your email",
  "OTP sent to email. Please verify your account.": "OTP has been sent to your email. Please verify your account.",
  "Xác thực OTP thất bại": "OTP verification failed",
  "Xác thực thành công": "Verification successful",
  "Xác thực thành công, hãy đăng nhập": "Verification successful. Please sign in.",
  "Email chưa được xác thực": "Email has not been verified yet",
  "Email không tồn tại trong hệ thống": "Email does not exist",
  "Username or Email already exists": "Username or email already exists",
  "Passwords do not match": "Passwords do not match",
  "Password is invalid": "Password is invalid",
  "Confirm password is invalid": "Confirm password is invalid",
  "Invalid email or password": "Invalid email or password",
  "OTP không tồn tại hoặc đã hết hạn": "OTP does not exist or has expired",
  "OTP đã hết hạn": "OTP has expired",
  "OTP không chính xác": "Incorrect OTP",
  "OTP không hợp lệ hoặc đã hết hạn": "OTP does not exist or has expired",
  "Mật khẩu đã được cập nhật thành công": "Password updated successfully",
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
  const [resetOtpSent, setResetOtpSent] = useState(false);
  const [resetForm, setResetForm] = useState({
    email: "",
    otp: "",
    newPassword: "",
    confirmPassword: "",
  });
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
    if (email) localStorage.setItem("authEmail", email);
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

    if (next !== "signup") {
      setPendingEmail("");
      setOtp("");
    }
    if (next !== "reset") {
      setResetOtpSent(false);
      setResetForm({
        email: "",
        otp: "",
        newPassword: "",
        confirmPassword: "",
      });
    }
  };

  const onChangeLogin = (field, value) => {
    setLoginForm((p) => ({ ...p, [field]: value }));
  };

  const onChangeSignup = (field, value) => {
    setSignupForm((p) => ({ ...p, [field]: value }));
  };

  const onChangeReset = (field, value) => {
    setResetForm((prev) => ({ ...prev, [field]: value }));
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

  // ===== SIGNUP =====
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

  // ===== OTP VERIFY =====
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

  const submitForgotPassword = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError("");
    setMessage("");

    try {
      const res = await fetch(`${API_URL}/api/users/forgot-password`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ email: resetForm.email }),
      });
      const json = await res.json();
      if (!res.ok) throw new Error(toEnglishMessage(json?.message, "Failed to send OTP"));

      setResetOtpSent(true);
      setMessage(toEnglishMessage(json?.message, "OTP has been sent to your email"));
    } catch (err) {
      setError(toEnglishMessage(err?.message, "Failed to send OTP"));
    } finally {
      setLoading(false);
    }
  };

  const submitResetPassword = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError("");
    setMessage("");

    const newPassword = resetForm.newPassword;
    const confirmPassword = resetForm.confirmPassword;
    if (!newPassword || newPassword.length < 8) {
      setLoading(false);
      setError("Password must be at least 8 characters long");
      return;
    }
    if (newPassword !== confirmPassword) {
      setLoading(false);
      setError("Passwords do not match");
      return;
    }

    try {
      const res = await fetch(`${API_URL}/api/users/reset-password`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          email: resetForm.email,
          otp: resetForm.otp,
          newPassword,
        }),
      });
      const json = await res.json();
      if (!res.ok) throw new Error(toEnglishMessage(json?.message, "Password reset failed"));

      const email = resetForm.email;
      setResetOtpSent(false);
      setResetForm({
        email: "",
        otp: "",
        newPassword: "",
        confirmPassword: "",
      });
      setLoginForm((prev) => ({ ...prev, email }));
      setMode("login");
      setMessage(toEnglishMessage(json?.message, "Password updated successfully"));
    } catch (err) {
      setError(toEnglishMessage(err?.message, "Password reset failed"));
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <Navbar />
      <main className="auth-page">
        <section className="auth-hero">
          <div className="auth-hero-inner">
            <div className="auth-copy">
              <div className="auth-kicker">Electric Car Store</div>
              <h1>
                {mode === "login"
                  ? "Welcome back"
                  : mode === "reset"
                    ? "Reset your password"
                    : "Create your account"}
              </h1>
              <p>
                {mode === "reset"
                  ? "Enter your email to receive an OTP and set a new password."
                  : "Sign in to continue exploring our cars, or create a new account to start your buying journey."}
              </p>
              <div className="auth-copy-links">
                <Link to="/cars">View cars</Link>
                <Link to="/">Back home</Link>
              </div>
            </div>

            <div className="auth-card">
              <div className="auth-tabs">
                {mode === "reset" ? (
                  <button type="button" className="active" onClick={() => switchMode("reset")}>
                    Reset password
                  </button>
                ) : (
                  <>
                    <button
                      type="button"
                      className={mode === "login" ? "active" : ""}
                      onClick={() => switchMode("login")}
                    >
                      Login
                    </button>
                    <button
                      type="button"
                      className={mode === "signup" ? "active" : ""}
                      onClick={() => switchMode("signup")}
                    >
                      Sign up
                    </button>
                    <button
                      type="button"
                      className={mode === "reset" ? "active" : ""}
                      onClick={() => switchMode("reset")}
                    >
                      Reset password
                    </button>
                  </>
                )}
              </div>

              {message ? <div className="auth-alert auth-success">{message}</div> : null}
              {error ? <div className="auth-alert auth-error">{error}</div> : null}

              {mode === "login" ? (
                <form className="auth-form" onSubmit={submitLogin}>
                  <label className="auth-field">
                    <span>Email</span>
                    <input
                      type="email"
                      value={loginForm.email}
                      onChange={(e) => onChangeLogin("email", e.target.value)}
                      placeholder="you@example.com"
                      required
                      disabled={loading}
                    />
                  </label>

                  <label className="auth-field">
                    <span>Password</span>
                    <input
                      type="password"
                      value={loginForm.password}
                      onChange={(e) => onChangeLogin("password", e.target.value)}
                      placeholder="Enter password"
                      required
                      disabled={loading}
                    />
                  </label>

                  <button
                    type="button"
                    className="auth-secondary"
                    onClick={() => {
                      setResetOtpSent(false);
                      switchMode("reset");
                      setResetForm((prev) => ({ ...prev, email: loginForm.email }));
                    }}
                    disabled={loading}
                  >
                    Forgot password?
                  </button>

                  <button type="submit" className="auth-submit" disabled={loading}>
                    {loading ? "Signing in..." : "Login"}
                  </button>
                </form>
              ) : null}

              {mode === "signup" && !isOtpStep ? (
                <form className="auth-form" onSubmit={submitSignup}>
                  <label className="auth-field">
                    <span>Username</span>
                    <input
                      type="text"
                      value={signupForm.username}
                      onChange={(e) => onChangeSignup("username", e.target.value)}
                      placeholder="Enter username"
                      required
                      disabled={loading}
                    />
                  </label>

                  <label className="auth-field">
                    <span>Email</span>
                    <input
                      type="email"
                      value={signupForm.email}
                      onChange={(e) => onChangeSignup("email", e.target.value)}
                      placeholder="you@example.com"
                      required
                      disabled={loading}
                    />
                  </label>

                  <label className="auth-field">
                    <span>Password</span>
                    <input
                      type="password"
                      value={signupForm.password}
                      onChange={(e) => onChangeSignup("password", e.target.value)}
                      placeholder="Create password"
                      required
                      disabled={loading}
                    />
                  </label>

                  <label className="auth-field">
                    <span>Confirm password</span>
                    <input
                      type="password"
                      value={signupForm.resPassword}
                      onChange={(e) => onChangeSignup("resPassword", e.target.value)}
                      placeholder="Confirm password"
                      required
                      disabled={loading}
                    />
                  </label>

                  <button type="submit" className="auth-submit" disabled={loading}>
                    {loading ? "Creating..." : "Create account"}
                  </button>
                </form>
              ) : null}

              {mode === "signup" && isOtpStep ? (
                <form className="auth-form" onSubmit={submitOtp}>
                  <div className="auth-otp-copy">
                    Enter the OTP sent to <strong>{pendingEmail}</strong>.
                  </div>

                  <label className="auth-field">
                    <span>OTP</span>
                    <input
                      type="text"
                      value={otp}
                      onChange={(e) => setOtp(e.target.value)}
                      placeholder="6-digit OTP"
                      required
                      disabled={loading}
                    />
                  </label>

                  <button type="submit" className="auth-submit" disabled={loading}>
                    {loading ? "Verifying..." : "Verify OTP"}
                  </button>

                  <button
                    type="button"
                    className="auth-secondary"
                    onClick={() => {
                      setPendingEmail("");
                      setOtp("");
                      setMessage("");
                      setError("");
                    }}
                    disabled={loading}
                  >
                    Back to sign up
                  </button>
                </form>
              ) : null}

              {mode === "reset" ? (
                resetOtpSent ? (
                  <form className="auth-form" onSubmit={submitResetPassword}>
                    <label className="auth-field">
                      <span>Email</span>
                      <input
                        type="email"
                        value={resetForm.email}
                        onChange={(e) => onChangeReset("email", e.target.value)}
                        placeholder="you@example.com"
                        required
                        disabled={loading}
                      />
                    </label>

                    <label className="auth-field">
                      <span>OTP</span>
                      <input
                        type="text"
                        value={resetForm.otp}
                        onChange={(e) => onChangeReset("otp", e.target.value)}
                        placeholder="6-digit OTP"
                        required
                        disabled={loading}
                      />
                    </label>

                    <label className="auth-field">
                      <span>New password</span>
                      <input
                        type="password"
                        value={resetForm.newPassword}
                        onChange={(e) => onChangeReset("newPassword", e.target.value)}
                        placeholder="Create a new password"
                        required
                        disabled={loading}
                      />
                    </label>

                    <label className="auth-field">
                      <span>Confirm password</span>
                      <input
                        type="password"
                        value={resetForm.confirmPassword}
                        onChange={(e) => onChangeReset("confirmPassword", e.target.value)}
                        placeholder="Confirm new password"
                        required
                        disabled={loading}
                      />
                    </label>

                    <button type="submit" className="auth-submit" disabled={loading}>
                      {loading ? "Updating..." : "Update password"}
                    </button>

                    <button
                      type="button"
                      className="auth-secondary"
                      onClick={() => setResetOtpSent(false)}
                      disabled={loading}
                    >
                      Back
                    </button>
                  </form>
                ) : (
                  <form className="auth-form" onSubmit={submitForgotPassword}>
                    <label className="auth-field">
                      <span>Email</span>
                      <input
                        type="email"
                        value={resetForm.email}
                        onChange={(e) => onChangeReset("email", e.target.value)}
                        placeholder="you@example.com"
                        required
                        disabled={loading}
                      />
                    </label>

                    <button type="submit" className="auth-submit" disabled={loading}>
                      {loading ? "Sending..." : "Send OTP"}
                    </button>

                    <button
                      type="button"
                      className="auth-secondary"
                      onClick={() => switchMode("login")}
                      disabled={loading}
                    >
                      Back to login
                    </button>
                  </form>
                )
              ) : null}
            </div>
          </div>
        </section>
      </main>
      <Footer />
    </>
  );
}

export default Auth;
