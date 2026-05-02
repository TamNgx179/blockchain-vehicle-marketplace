import { useEffect, useMemo, useState } from "react";
import {
  AtSign,
  CalendarDays,
  LoaderCircle,
  LockKeyhole,
  MapPin,
  Pencil,
  Phone,
  Save,
  ShieldCheck,
  UserRound,
} from "lucide-react";
import Navbar from "../../components/Navbar/Navbar";
import AccountService from "../../services/accountService";
import WalletManagement from "./WalletManagement/WalletManagement";
import "./Profile.css";

const emptyProfile = {
  username: "",
  email: "",
  phoneNumber: "",
  address: "",
  isadmin: false,
  createdAt: "",
};

const emptyPasswordForm = {
  oldPassword: "",
  newPassword: "",
  resNewPassword: "",
};

const getMessage = (error, fallback) =>
  error?.response?.data?.message ||
  error?.response?.data?.error ||
  error?.message ||
  fallback;

function Profile() {
  const [profile, setProfile] = useState(emptyProfile);
  const [form, setForm] = useState(emptyProfile);
  const [passwordForm, setPasswordForm] = useState(emptyPasswordForm);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [changingPassword, setChangingPassword] = useState(false);
  const [editing, setEditing] = useState(false);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");
  const [passwordMessage, setPasswordMessage] = useState("");
  const [passwordError, setPasswordError] = useState("");

  const joinedDate = useMemo(() => {
    if (!profile.createdAt) return "Not available";
    return new Date(profile.createdAt).toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
    });
  }, [profile.createdAt]);

  useEffect(() => {
    const loadProfile = async () => {
      try {
        setLoading(true);
        setError("");
        const response = await AccountService.getProfile();
        const data = response?.data?.data || emptyProfile;
        setProfile(data);
        setForm({
          ...emptyProfile,
          ...data,
          phoneNumber: data.phoneNumber || "",
          address: data.address || "",
        });
      } catch (err) {
        setError(getMessage(err, "Could not load your profile."));
      } finally {
        setLoading(false);
      }
    };

    loadProfile();
  }, []);

  const updateField = (field, value) => {
    setForm((current) => ({ ...current, [field]: value }));
  };

  const updatePasswordField = (field, value) => {
    setPasswordForm((current) => ({ ...current, [field]: value }));
  };

  const cancelEditing = () => {
    setForm({
      ...emptyProfile,
      ...profile,
      phoneNumber: profile.phoneNumber || "",
      address: profile.address || "",
    });
    setEditing(false);
    setMessage("");
    setError("");
  };

  const submitProfile = async (event) => {
    event.preventDefault();
    setSaving(true);
    setMessage("");
    setError("");

    try {
      const payload = {
        username: form.username.trim(),
        phoneNumber: form.phoneNumber.trim(),
        address: form.address.trim(),
      };

      const response = await AccountService.editProfile(payload);
      const updatedProfile = response?.data?.user || { ...profile, ...payload };

      setProfile(updatedProfile);
      setForm({
        ...emptyProfile,
        ...updatedProfile,
        phoneNumber: updatedProfile.phoneNumber || "",
        address: updatedProfile.address || "",
      });
      localStorage.setItem("authUsername", updatedProfile.username || "");
      window.dispatchEvent(new Event("auth-change"));
      setEditing(false);
      setMessage("Profile updated successfully.");
    } catch (err) {
      setError(getMessage(err, "Could not update your profile."));
    } finally {
      setSaving(false);
    }
  };

  const submitPassword = async (event) => {
    event.preventDefault();
    setChangingPassword(true);
    setPasswordMessage("");
    setPasswordError("");

    try {
      if (passwordForm.newPassword !== passwordForm.resNewPassword) {
        throw new Error("New passwords do not match.");
      }

      await AccountService.changePassword(passwordForm);
      setPasswordForm(emptyPasswordForm);
      setPasswordMessage("Password updated successfully.");
    } catch (err) {
      setPasswordError(getMessage(err, "Could not update your password."));
    } finally {
      setChangingPassword(false);
    }
  };

  return (
    <>
      <Navbar />
      <main className="profile-page">
        <header className="profile-header">
          <div>
            <p className="profile-eyebrow">Account profile</p>
            <h1>Personal information</h1>
            <p>Manage your contact information and keep your account secure.</p>
          </div>

          <div className="profile-identity">
            <div className="profile-avatar">
              <UserRound size={28} />
            </div>
            <div>
              <span>{profile.isadmin ? "Admin account" : "Customer account"}</span>
              <strong>{profile.username || "Customer"}</strong>
            </div>
          </div>
        </header>

        <section className="profile-grid">
          <article className="profile-card profile-summary-card">
            <div className="profile-card-title">
              <div>
                <span>Overview</span>
                <h2>Account details</h2>
              </div>
              <ShieldCheck size={22} />
            </div>

            {loading ? (
              <div className="profile-loading">
                <LoaderCircle className="spin-icon" size={22} />
                Loading profile...
              </div>
            ) : (
              <div className="profile-summary-list">
                <ProfileInfo
                  icon={<AtSign size={18} />}
                  label="Email"
                  value={profile.email || "Not available"}
                />
                <ProfileInfo
                  icon={<Phone size={18} />}
                  label="Phone"
                  value={profile.phoneNumber || "Not available"}
                />
                <ProfileInfo
                  icon={<MapPin size={18} />}
                  label="Address"
                  value={profile.address || "Not available"}
                />
                <ProfileInfo
                  icon={<CalendarDays size={18} />}
                  label="Joined"
                  value={joinedDate}
                />
              </div>
            )}
          </article>

          <article className="profile-card profile-form-card">
            <div className="profile-card-title">
              <div>
                <span>Edit profile</span>
                <h2>Update information</h2>
              </div>
              <button
                type="button"
                className="profile-edit-button"
                onClick={() => setEditing((value) => !value)}
                disabled={loading || saving}
              >
                <Pencil size={17} />
                {editing ? "Editing" : "Edit"}
              </button>
            </div>

            {message && <div className="profile-alert success">{message}</div>}
            {error && <div className="profile-alert error">{error}</div>}

            <form className="profile-form" onSubmit={submitProfile}>
              <label className="profile-field">
                <span>Username</span>
                <input
                  value={form.username}
                  onChange={(event) =>
                    updateField("username", event.target.value)
                  }
                  disabled={!editing || saving || loading}
                  placeholder="Your name"
                  required
                />
              </label>

              <label className="profile-field">
                <span>Email</span>
                <input value={form.email} disabled placeholder="Email address" />
              </label>

              <label className="profile-field">
                <span>Phone number</span>
                <input
                  value={form.phoneNumber}
                  onChange={(event) =>
                    updateField("phoneNumber", event.target.value)
                  }
                  disabled={!editing || saving || loading}
                  placeholder="Add your phone number"
                />
              </label>

              <label className="profile-field">
                <span>Address</span>
                <textarea
                  value={form.address}
                  onChange={(event) =>
                    updateField("address", event.target.value)
                  }
                  disabled={!editing || saving || loading}
                  placeholder="Add your address"
                  rows={4}
                />
              </label>

              {editing && (
                <div className="profile-actions">
                  <button
                    type="button"
                    className="profile-secondary-button"
                    onClick={cancelEditing}
                    disabled={saving}
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="profile-primary-button"
                    disabled={saving || loading}
                  >
                    {saving ? (
                      <LoaderCircle className="spin-icon" size={17} />
                    ) : (
                      <Save size={17} />
                    )}
                    Save changes
                  </button>
                </div>
              )}
            </form>
          </article>

          <article className="profile-card profile-security-card">
            <div className="profile-card-title">
              <div>
                <span>Security</span>
                <h2>Change password</h2>
              </div>
              <LockKeyhole size={22} />
            </div>

            {passwordMessage && (
              <div className="profile-alert success">{passwordMessage}</div>
            )}
            {passwordError && (
              <div className="profile-alert error">{passwordError}</div>
            )}

            <form className="profile-form" onSubmit={submitPassword}>
              <label className="profile-field">
                <span>Current password</span>
                <input
                  type="password"
                  value={passwordForm.oldPassword}
                  onChange={(event) =>
                    updatePasswordField("oldPassword", event.target.value)
                  }
                  placeholder="Enter current password"
                  required
                />
              </label>

              <label className="profile-field">
                <span>New password</span>
                <input
                  type="password"
                  value={passwordForm.newPassword}
                  onChange={(event) =>
                    updatePasswordField("newPassword", event.target.value)
                  }
                  placeholder="At least 8 characters"
                  minLength={8}
                  required
                />
              </label>

              <label className="profile-field">
                <span>Confirm new password</span>
                <input
                  type="password"
                  value={passwordForm.resNewPassword}
                  onChange={(event) =>
                    updatePasswordField("resNewPassword", event.target.value)
                  }
                  placeholder="Confirm new password"
                  minLength={8}
                  required
                />
              </label>

              <button
                type="submit"
                className="profile-primary-button"
                disabled={changingPassword}
              >
                {changingPassword ? (
                  <LoaderCircle className="spin-icon" size={17} />
                ) : (
                  <Save size={17} />
                )}
                Update password
              </button>
            </form>
          </article>

          <article className="profile-card profile-wallet-card">
            <WalletManagement />
          </article>
        </section>
      </main>
    </>
  );
}

const ProfileInfo = ({ icon, label, value }) => (
  <div className="profile-info-row">
    <div>{icon}</div>
    <span>{label}</span>
    <strong>{value}</strong>
  </div>
);

export default Profile;