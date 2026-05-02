import { useEffect, useMemo, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { ArrowLeft, LockKeyhole } from "lucide-react";
import Navbar from "../../components/Navbar/Navbar";
import Footer from "../../components/Footer/Footer";
import AuthService from "../../services/authService";
import { API_URL } from "../../services/apiConfig";
import googleLogo from "../../assets/icon/google.webp";
import "./Auth.css";

const REQUEST_TIMEOUT_MS = 20000;

const MESSAGE_MAP = {
  "OTP sent to email. Please verify your account.":
    "OTP has been sent to your email. Please verify your account.",
  "OTP has been sent to your email":
    "OTP has been sent to your email.",
  "Verification successful":
    "Verification successful. Please sign in.",
  "Password has been updated successfully":
    "Password reset successful. Please sign in.",
  "Username or Email already exists":
    "Username or email already exists",
};

function toDisplayMessage(message, fallback) {
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

function normalizeInitialMode(mode) {
  if (mode === "signup") return "signup";
  if (mode === "reset" || mode === "forgot") return "forgot";
  return "login";
}

async function readJsonResponse(response) {
  try {
    return await response.json();
  } catch {
    return {};
  }
}

async function postJson(path, body, fallbackMessage) {
  const controller = new AbortController();
  const timeoutId = window.setTimeout(
    () => controller.abort(),
    REQUEST_TIMEOUT_MS
  );

  try {
    const response = await fetch(`${API_URL}${path}`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      credentials: "include",
      body: JSON.stringify(body),
      signal: controller.signal,
    });

    const json = await readJsonResponse(response);
    if (!response.ok) {
      throw new Error(toDisplayMessage(json?.message, fallbackMessage));
    }

    return json;
  } catch (error) {
    if (error?.name === "AbortError") {
      throw new Error(
        "Request timed out while sending OTP. Please check the backend or SMTP settings."
      );
    }

    if (error instanceof TypeError) {
      throw new Error(
        "Cannot connect to the server. Please make sure the backend is running."
      );
    }

    throw error;
  } finally {
    window.clearTimeout(timeoutId);
  }
}

function Auth({ initialMode = "login" }) {
  const navigate = useNavigate();
  const location = useLocation();

  const [mode, setMode] = useState(() => normalizeInitialMode(initialMode));
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
    setMode(normalizeInitialMode(initialMode));
    setForgotStep(1);
    setMessage("");
    setError("");
  }, [initialMode]);

  useEffect(() => {
    const params = new URLSearchParams(location.search || "");
    const token = params.get("token");
    const email = params.get("email");
    const username = params.get("username");

    if (!token) return;

    localStorage.setItem("authToken", token);
    localStorage.setItem("token", token);

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
    setLoginForm((prev) => ({ ...prev, [field]: value }));
  };

  const onChangeSignup = (field, value) => {
    setSignupForm((prev) => ({ ...prev, [field]: value }));
  };

  const onChangeForgot = (field, value) => {
    setForgotForm((prev) => ({ ...prev, [field]: value }));
  };

  const handleGoogleLogin = () => {
    setError("");
    setMessage("");
    AuthService.googleLogin();
  };

  const submitLogin = async (event) => {
    event.preventDefault();
    setLoading(true);
    setError("");
    setMessage("");

    try {
      const payload = {
        email: loginForm.email.trim().toLowerCase(),
        password: loginForm.password,
      };
      const json = await postJson("/api/users/login", payload, "Login failed");

      if (!json?.token) throw new Error("Login failed");

      const tokenPayload = getTokenPayload(json.token);

      localStorage.setItem("authToken", json.token);
      localStorage.setItem("token", json.token);
      if (json.refreshToken) localStorage.setItem("refreshToken", json.refreshToken);
      localStorage.setItem("authEmail", payload.email);
      localStorage.setItem("authUsername", tokenPayload?.username || "");

      window.dispatchEvent(new Event("auth-change"));
      navigate(getPostLoginPath(json.token), { replace: true });
    } catch (err) {
      setError(toDisplayMessage(err?.message, "Login failed"));
    } finally {
      setLoading(false);
    }
  };

  const submitSignup = async (event) => {
    event.preventDefault();
    setLoading(true);
    setError("");
    setMessage("");

    try {
      const payload = {
        username: signupForm.username.trim(),
        email: signupForm.email.trim().toLowerCase(),
        password: signupForm.password,
        resPassword: signupForm.resPassword,
      };
      const json = await postJson(
        "/api/users/register",
        payload,
        "Sign up failed"
      );

      setSignupForm(payload);
      setPendingEmail(payload.email);
      setOtp("");
      setMessage(
        toDisplayMessage(
          json?.message,
          "OTP has been sent to your email. Please verify your account."
        )
      );
    } catch (err) {
      setError(toDisplayMessage(err?.message, "Sign up failed"));
    } finally {
      setLoading(false);
    }
  };

  const submitOtp = async (event) => {
    event.preventDefault();
    setLoading(true);
    setError("");
    setMessage("");

    try {
      const json = await postJson(
        "/api/users/verifyOtp",
        { email: pendingEmail, otp: otp.trim() },
        "OTP verification failed"
      );

      const verifiedEmail = pendingEmail;
      setPendingEmail("");
      setOtp("");
      setMode("login");
      setLoginForm((prev) => ({ ...prev, email: verifiedEmail }));
      setSignupForm({
        username: "",
        email: "",
        password: "",
        resPassword: "",
      });
      setMessage(
        toDisplayMessage(
          json?.message,
          "Verification successful. Please sign in."
        )
      );
    } catch (err) {
      setError(toDisplayMessage(err?.message, "OTP verification failed"));
    } finally {
      setLoading(false);
    }
  };

  const submitForgotEmail = async (event) => {
    event.preventDefault();
    setLoading(true);
    setError("");
    setMessage("");

    try {
      const email = forgotForm.email.trim().toLowerCase();
      const json = await postJson(
        "/api/users/forgot-password",
        { email },
        "Failed to send reset code"
      );

      setForgotForm((prev) => ({
        ...prev,
        email,
        otp: "",
        newPassword: "",
        confirmPassword: "",
      }));
      setForgotStep(2);
      setMessage(toDisplayMessage(json?.message, "OTP sent to your email."));
    } catch (err) {
      setError(toDisplayMessage(err?.message, "Failed to send reset code"));
    } finally {
      setLoading(false);
    }
  };

  const submitResetPassword = async (event) => {
    event.preventDefault();
    setLoading(true);
    setError("");
    setMessage("");

    try {
      if (forgotForm.newPassword !== forgotForm.confirmPassword) {
        throw new Error("Passwords do not match");
      }

      const json = await postJson(
        "/api/users/reset-password",
        {
          email: forgotForm.email,
          otp: forgotForm.otp.trim(),
          newPassword: forgotForm.newPassword,
        },
        "Reset failed"
      );

      const resetEmail = forgotForm.email;
      setMode("login");
      setForgotStep(1);
      setLoginForm((prev) => ({ ...prev, email: resetEmail, password: "" }));
      setForgotForm({
        email: "",
        otp: "",
        newPassword: "",
        confirmPassword: "",
      });
      setMessage(
        toDisplayMessage(
          json?.message,
          "Password reset successful. Please sign in."
        )
      );
    } catch (err) {
      setError(toDisplayMessage(err?.message, "Reset failed"));
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
                  <span className="auth-kicker">
                    {isOtpStep ? "Email verification" : "Welcome back"}
                  </span>
                  <h1>
                    {mode === "login"
                      ? "Sign in to your account"
                      : isOtpStep
                      ? "Verify your email"
                      : "Create your account"}
                  </h1>
                  <p>
                    {mode === "login"
                      ? "Continue with your email and password."
                      : isOtpStep
                      ? "Enter the OTP sent to your inbox to activate your account."
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
                  <ArrowLeft size={16} />
                  Back to login
                </button>

                <div className="auth-icon">
                  <LockKeyhole size={24} />
                </div>
                <span className="auth-kicker">Account recovery</span>
                <h1>Reset your password</h1>
                <p>
                  {forgotStep === 1
                    ? "Enter your email and we will send you a one-time code."
                    : "Enter the OTP sent to your email and choose a new password."}
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
                    onChange={(event) => onChangeLogin("email", event.target.value)}
                    required
                  />
                </label>

                <label className="auth-field">
                  <span>Password</span>
                  <input
                    type="password"
                    placeholder="Enter your password"
                    value={loginForm.password}
                    onChange={(event) =>
                      onChangeLogin("password", event.target.value)
                    }
                    required
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
                    onChange={(event) =>
                      onChangeForgot("email", event.target.value)
                    }
                    required
                  />
                </label>

                <button type="submit" disabled={loading}>
                  {loading ? "Sending..." : "Send reset code"}
                </button>
              </form>
            )}

            {mode === "forgot" && forgotStep === 2 && (
              <form onSubmit={submitResetPassword} className="auth-form">
                <div className="auth-email-note">
                  <span>
                    Code sent to <strong>{forgotForm.email}</strong>
                  </span>
                  <button type="button" onClick={() => setForgotStep(1)}>
                    Change
                  </button>
                </div>

                <label className="auth-field">
                  <span>OTP code</span>
                  <input
                    placeholder="Enter OTP"
                    value={forgotForm.otp}
                    onChange={(event) => onChangeForgot("otp", event.target.value)}
                    inputMode="numeric"
                    maxLength={6}
                    required
                  />
                </label>

                <label className="auth-field">
                  <span>New password</span>
                  <input
                    type="password"
                    placeholder="Enter new password"
                    value={forgotForm.newPassword}
                    onChange={(event) =>
                      onChangeForgot("newPassword", event.target.value)
                    }
                    required
                  />
                </label>

                <label className="auth-field">
                  <span>Confirm password</span>
                  <input
                    type="password"
                    placeholder="Confirm new password"
                    value={forgotForm.confirmPassword}
                    onChange={(event) =>
                      onChangeForgot("confirmPassword", event.target.value)
                    }
                    required
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
                    onChange={(event) =>
                      onChangeSignup("username", event.target.value)
                    }
                    required
                  />
                </label>

                <label className="auth-field">
                  <span>Email</span>
                  <input
                    type="email"
                    placeholder="you@example.com"
                    value={signupForm.email}
                    onChange={(event) =>
                      onChangeSignup("email", event.target.value)
                    }
                    required
                  />
                </label>

                <label className="auth-field">
                  <span>Password</span>
                  <input
                    type="password"
                    placeholder="Create a password"
                    value={signupForm.password}
                    onChange={(event) =>
                      onChangeSignup("password", event.target.value)
                    }
                    required
                  />
                </label>

                <label className="auth-field">
                  <span>Confirm password</span>
                  <input
                    type="password"
                    placeholder="Confirm your password"
                    value={signupForm.resPassword}
                    onChange={(event) =>
                      onChangeSignup("resPassword", event.target.value)
                    }
                    required
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
                  <span>
                    OTP sent to <strong>{pendingEmail}</strong>
                  </span>
                  <button
                    type="button"
                    onClick={() => {
                      setPendingEmail("");
                      setOtp("");
                      setMessage("");
                      setError("");
                    }}
                  >
                    Change
                  </button>
                </div>

                <label className="auth-field">
                  <span>OTP code</span>
                  <input
                    value={otp}
                    onChange={(event) => setOtp(event.target.value)}
                    placeholder="Enter OTP"
                    inputMode="numeric"
                    maxLength={6}
                    required
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
