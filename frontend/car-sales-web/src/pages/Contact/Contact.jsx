import { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import {
  AtSign,
  Clock3,
  LoaderCircle,
  MapPin,
  MessageSquareText,
  Phone,
  Send,
} from "lucide-react";
import Navbar from "../../components/Navbar/Navbar";
import Footer from "../../components/Footer/Footer";
import AccountService from "../../services/accountService";
import ContactService from "../../services/contactService";
import "./Contact.css";

const initialForm = {
  name: "",
  email: "",
  phone: "",
  subject: "",
  message: "",
};

const getErrorMessage = (error, fallback) =>
  error?.response?.data?.message ||
  error?.response?.data?.error ||
  error?.message ||
  fallback;

function Contact() {
  const [form, setForm] = useState(initialForm);
  const [loadingProfile, setLoadingProfile] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [success, setSuccess] = useState("");
  const [error, setError] = useState("");

  const isAuthed = useMemo(() => Boolean(localStorage.getItem("authToken")), []);

  useEffect(() => {
    if (!isAuthed) return;

    const loadProfile = async () => {
      try {
        setLoadingProfile(true);
        const response = await AccountService.getProfile();
        const profile = response?.data?.data || {};

        setForm((current) => ({
          ...current,
          name: current.name || profile.username || "",
          email: current.email || profile.email || "",
          phone: current.phone || profile.phoneNumber || "",
        }));
      } catch {
        setForm((current) => ({
          ...current,
          email: current.email || localStorage.getItem("authEmail") || "",
          name: current.name || localStorage.getItem("authUsername") || "",
        }));
      } finally {
        setLoadingProfile(false);
      }
    };

    loadProfile();
  }, [isAuthed]);

  const updateField = (field, value) => {
    setForm((current) => ({ ...current, [field]: value }));
  };

  const submitContact = async (event) => {
    event.preventDefault();
    setSuccess("");
    setError("");

    if (!localStorage.getItem("authToken")) {
      setError("Please sign in before sending a contact request.");
      return;
    }

    try {
      setSubmitting(true);
      await ContactService.createContact({
        name: form.name.trim(),
        email: form.email.trim(),
        phone: form.phone.trim(),
        subject: form.subject.trim(),
        message: form.message.trim(),
      });

      setSuccess("Your message has been sent. Our team will contact you soon.");
      setForm((current) => ({
        ...current,
        subject: "",
        message: "",
      }));
    } catch (err) {
      setError(getErrorMessage(err, "Could not send your message. Please try again."));
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <>
      <Navbar />
      <main className="contact-page">
        <section className="contact-hero">
          <div>
            <p className="contact-eyebrow">Contact showroom</p>
            <h1>Tell us what you need</h1>
            <p>
              Send your question to our team. We will review your request and follow up
              with the right showroom support.
            </p>
          </div>
        </section>

        <section className="contact-layout">
          <aside className="contact-info-panel">
            <div className="contact-panel-title">
              <span>Support channels</span>
              <h2>We are here to help</h2>
            </div>

            <div className="contact-info-list">
              <ContactInfo icon={<Phone size={18} />} label="Hotline" value="+84 909 123 456" />
              <ContactInfo icon={<AtSign size={18} />} label="Email" value="support@carsales.local" />
              <ContactInfo icon={<MapPin size={18} />} label="Address" value="Thu Duc, Ho Chi Minh City" />
              <ContactInfo icon={<Clock3 size={18} />} label="Working hours" value="Mon - Sat, 8:00 AM - 6:00 PM" />
            </div>
          </aside>

          <section className="contact-form-panel">
            <div className="contact-panel-title">
              <span>Send message</span>
              <h2>Contact form</h2>
            </div>

            {!isAuthed && (
              <div className="contact-signin-note">
                <MessageSquareText size={18} />
                <span>Please sign in to send a message to the showroom.</span>
                <Link to="/login">Sign in</Link>
              </div>
            )}

            {success && <div className="contact-alert success">{success}</div>}
            {error && <div className="contact-alert error">{error}</div>}

            <form className="contact-form" onSubmit={submitContact}>
              <div className="contact-form-grid">
                <label className="contact-field">
                  <span>Full name</span>
                  <input
                    value={form.name}
                    onChange={(event) => updateField("name", event.target.value)}
                    placeholder="Your name"
                    required
                  />
                </label>

                <label className="contact-field">
                  <span>Email</span>
                  <input
                    type="email"
                    value={form.email}
                    onChange={(event) => updateField("email", event.target.value)}
                    placeholder="you@example.com"
                    required
                  />
                </label>

                <label className="contact-field">
                  <span>Phone number</span>
                  <input
                    value={form.phone}
                    onChange={(event) => updateField("phone", event.target.value)}
                    placeholder="Your phone number"
                    required
                  />
                </label>

                <label className="contact-field">
                  <span>Subject</span>
                  <input
                    value={form.subject}
                    onChange={(event) => updateField("subject", event.target.value)}
                    placeholder="How can we help?"
                    required
                  />
                </label>
              </div>

              <label className="contact-field">
                <span>Message</span>
                <textarea
                  value={form.message}
                  onChange={(event) => updateField("message", event.target.value)}
                  placeholder="Tell us more about your request..."
                  rows={7}
                  required
                />
              </label>

              <button type="submit" className="contact-submit-btn" disabled={submitting || loadingProfile}>
                {submitting ? <LoaderCircle className="spin-icon" size={18} /> : <Send size={18} />}
                {submitting ? "Sending..." : "Send message"}
              </button>
            </form>
          </section>
        </section>
      </main>
      <Footer />
    </>
  );
}

const ContactInfo = ({ icon, label, value }) => (
  <div className="contact-info-row">
    <div>{icon}</div>
    <span>{label}</span>
    <strong>{value}</strong>
  </div>
);

export default Contact;
