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
  "OTP sent to email. Please verify your account.": "OTP has been sent to your email. Please verify your account.",
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

  // ===== FORGOT PASSWORD =====
  const [forgotStep, setForgotStep] = useState(1); // 1 email, 2 reset
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
    setForgotStep(1);

    if (next !== "signup") {
      setPendingEmail("");
      setOtp("");
    }
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

  // ===== LOGIN =====
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

  // ===== FORGOT PASSWORD STEP 1 =====
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
      setMessage("OTP sent to email");
    } catch (err) {
      setError(toEnglishMessage(err?.message, "Failed"));
    } finally {
      setLoading(false);
    }
  };

  // ===== FORGOT PASSWORD STEP 2 =====
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
          password: forgotForm.newPassword,
        }),
      });

      const json = await res.json();
      if (!res.ok) throw new Error(toEnglishMessage(json?.message, "Reset failed"));

      setMessage("Password reset successful");
      setMode("login");
      setForgotStep(1);
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

            {/* ===== TABS ===== */}
            <div className="auth-tabs">
              <button onClick={() => switchMode("login")} className={mode === "login" ? "active" : ""}>Login</button>
              <button onClick={() => switchMode("signup")} className={mode === "signup" ? "active" : ""}>Sign up</button>
              <button onClick={() => switchMode("forgot")} className={mode === "forgot" ? "active" : ""}>Forgot</button>
            </div>

            {message && <div className="auth-alert auth-success">{message}</div>}
            {error && <div className="auth-alert auth-error">{error}</div>}

            {/* ===== LOGIN ===== */}
            {mode === "login" && (
              <form onSubmit={submitLogin} className="auth-form">
                <input placeholder="Email" value={loginForm.email} onChange={(e) => onChangeLogin("email", e.target.value)} />
                <input type="password" placeholder="Password" value={loginForm.password} onChange={(e) => onChangeLogin("password", e.target.value)} />

                <button type="submit">Login</button>

                <button type="button" onClick={() => setMode("forgot")}>
                  Forgot password?
                </button>
              </form>
            )}

            {/* ===== FORGOT ===== */}
            {mode === "forgot" && forgotStep === 1 && (
              <form onSubmit={submitForgotEmail} className="auth-form">
                <input
                  placeholder="Email"
                  value={forgotForm.email}
                  onChange={(e) => onChangeForgot("email", e.target.value)}
                />
                <button type="submit">Send OTP</button>
                <button type="button" onClick={() => setMode("login")}>Back</button>
              </form>
            )}

            {mode === "forgot" && forgotStep === 2 && (
              <form onSubmit={submitResetPassword} className="auth-form">
                <input placeholder="OTP" value={forgotForm.otp} onChange={(e) => onChangeForgot("otp", e.target.value)} />
                <input type="password" placeholder="New password" value={forgotForm.newPassword} onChange={(e) => onChangeForgot("newPassword", e.target.value)} />
                <input type="password" placeholder="Confirm password" value={forgotForm.confirmPassword} onChange={(e) => onChangeForgot("confirmPassword", e.target.value)} />

                <button type="submit">Reset password</button>
              </form>
            )}

            {/* ===== SIGNUP + OTP (giữ nguyên logic cũ của bạn) ===== */}
            {mode === "signup" && !isOtpStep && (
              <form onSubmit={submitSignup} className="auth-form">
                <input placeholder="Username" value={signupForm.username} onChange={(e) => onChangeSignup("username", e.target.value)} />
                <input placeholder="Email" value={signupForm.email} onChange={(e) => onChangeSignup("email", e.target.value)} />
                <input type="password" placeholder="Password" value={signupForm.password} onChange={(e) => onChangeSignup("password", e.target.value)} />
                <input type="password" placeholder="Confirm" value={signupForm.resPassword} onChange={(e) => onChangeSignup("resPassword", e.target.value)} />

                <button type="submit">Create account</button>
              </form>
            )}

            {mode === "signup" && isOtpStep && (
              <form onSubmit={submitOtp} className="auth-form">
                <input value={otp} onChange={(e) => setOtp(e.target.value)} placeholder="OTP" />
                <button type="submit">Verify OTP</button>
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