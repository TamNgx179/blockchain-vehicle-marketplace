import { useEffect, useState } from "react";
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
  "Account created successfully. Please sign in.":
    "Account created successfully. Please sign in.",
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

function generateSecurityCode() {
  return Math.floor(10 + Math.random() * 90).toString();
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
        "Request timed out. Please check the backend server."
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

  const [securityStep, setSecurityStep] = useState(false);
  const [securityCode, setSecurityCode] = useState("");
  const [securityInput, setSecurityInput] = useState("");

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
      setSecurityStep(false);
      setSecurityCode("");
      setSecurityInput("");
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

  const submitSignupDetails = (event) => {
    event.preventDefault();
    setError("");
    setMessage("");

    if (signupForm.password !== signupForm.resPassword) {
      setError("Passwords do not match");
      return;
    }

    setSignupForm((prev) => ({
      ...prev,
      username: prev.username.trim(),
      email: prev.email.trim().toLowerCase(),
    }));
    setSecurityCode(generateSecurityCode());
    setSecurityInput("");
    setSecurityStep(true);
  };

  const submitSignupSecurity = async (event) => {
    event.preventDefault();
    setLoading(true);
    setError("");
    setMessage("");

    try {
      if (securityInput.trim() !== securityCode) {
        setSecurityCode(generateSecurityCode());
        setSecurityInput("");
        throw new Error("Security code is incorrect. Please try again.");
      }

      const json = await postJson(
        "/api/users/register",
        {
          username: signupForm.username,
          email: signupForm.email,
          password: signupForm.password,
          resPassword: signupForm.resPassword,
        },
        "Sign up failed"
      );

      const createdEmail = signupForm.email;
      setSecurityStep(false);
      setSecurityCode("");
      setSecurityInput("");
      setMode("login");
      setLoginForm((prev) => ({ ...prev, email: createdEmail }));
      setSignupForm({
        username: "",
        email: "",
        password: "",
        resPassword: "",
      });
      setMessage(
        toDisplayMessage(
          json?.message,
          "Account created successfully. Please sign in."
        )
      );
    } catch (err) {
      setError(toDisplayMessage(err?.message, "Sign up failed"));
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
                    {securityStep ? "Security check" : "Welcome back"}
                  </span>
                  <h1>
                    {mode === "login"
                      ? "Sign in to your account"
                      : securityStep
                      ? "Confirm the code"
                      : "Create your account"}
                  </h1>
                  <p>
                    {mode === "login"
                      ? "Continue with your email and password."
                      : securityStep
                      ? "Enter the two numbers shown below to finish creating your account."
                      : "Join us and complete a quick security check."}
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

            {mode === "signup" && !securityStep && (
              <form onSubmit={submitSignupDetails} className="auth-form">
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

            {mode === "signup" && securityStep && (
              <form onSubmit={submitSignupSecurity} className="auth-form">
                <div className="auth-captcha-panel">
                  <span>{securityCode}</span>
                </div>

                <div className="auth-email-note">
                  <span>
                    Creating account for <strong>{signupForm.email}</strong>
                  </span>
                  <button
                    type="button"
                    onClick={() => {
                      setSecurityStep(false);
                      setSecurityCode("");
                      setSecurityInput("");
                      setMessage("");
                      setError("");
                    }}
                  >
                    Change
                  </button>
                </div>

                <label className="auth-field">
                  <span>Security code</span>
                  <input
                    value={securityInput}
                    onChange={(event) => setSecurityInput(event.target.value)}
                    placeholder="Enter the two numbers"
                    inputMode="numeric"
                    maxLength={2}
                    required
                  />
                </label>

                <button type="submit" disabled={loading}>
                  {loading ? "Creating..." : "Create account"}
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
