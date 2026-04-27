import { useEffect, useMemo, useState } from "react";
import {
  CheckCircle2,
  Clock3,
  LoaderCircle,
  Mail,
  MailOpen,
  Phone,
  RefreshCw,
  Search,
  UserRound,
} from "lucide-react";
import ContactService from "../../../services/contactService";
import "./ContactList.css";

const getErrorMessage = (error, fallback) =>
  error?.response?.data?.message ||
  error?.response?.data?.error ||
  error?.message ||
  fallback;

const formatDateTime = (value) => {
  if (!value) return "Không có";
  return new Date(value).toLocaleString("vi-VN", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
};

function ContactList() {
  const [contacts, setContacts] = useState([]);
  const [selectedContactId, setSelectedContactId] = useState("");
  const [loading, setLoading] = useState(true);
  const [actionId, setActionId] = useState("");
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [error, setError] = useState("");

  const selectedContact = useMemo(
    () => contacts.find((contact) => contact._id === selectedContactId) || contacts[0],
    [contacts, selectedContactId]
  );

  const stats = useMemo(
    () => ({
      total: contacts.length,
      unread: contacts.filter((contact) => !contact.ischecked).length,
      handled: contacts.filter((contact) => contact.ischecked).length,
    }),
    [contacts]
  );

  const filteredContacts = useMemo(() => {
    const keyword = searchTerm.trim().toLowerCase();

    return contacts.filter((contact) => {
      const matchesStatus =
        statusFilter === "all" ||
        (statusFilter === "unread" && !contact.ischecked) ||
        (statusFilter === "handled" && contact.ischecked);

      const matchesKeyword =
        !keyword ||
        [contact.name, contact.email, contact.phone, contact.subject, contact.message]
          .some((value) => String(value || "").toLowerCase().includes(keyword));

      return matchesStatus && matchesKeyword;
    });
  }, [contacts, searchTerm, statusFilter]);

  const fetchContacts = async () => {
    try {
      setLoading(true);
      setError("");
      const response = await ContactService.getAllContacts();
      const list = Array.isArray(response?.data) ? response.data : [];
      setContacts(list);
      setSelectedContactId((currentId) =>
        list.some((contact) => contact._id === currentId) ? currentId : list[0]?._id || ""
      );
    } catch (err) {
      setError(getErrorMessage(err, "Không thể tải danh sách liên hệ."));
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchContacts();
  }, []);

  const markAsRead = async (contactId) => {
    if (!contactId || actionId) return;

    try {
      setActionId(contactId);
      const response = await ContactService.markAsRead(contactId);
      const updatedContact = response?.data;

      setContacts((current) =>
        current.map((contact) =>
          contact._id === contactId ? { ...contact, ...updatedContact, ischecked: true } : contact
        )
      );
    } catch (err) {
      setError(getErrorMessage(err, "Không thể đánh dấu liên hệ này là đã đọc."));
    } finally {
      setActionId("");
    }
  };

  return (
    <main className="admin-contact-page">
      <header className="admin-contact-header">
        <div>
          <p>Tin nhắn khách hàng</p>
          <h1>Quản lý liên hệ</h1>
          <span>Xem yêu cầu từ khách hàng và đánh dấu những liên hệ đã xử lý.</span>
        </div>
        <button className="admin-contact-refresh" onClick={fetchContacts} disabled={loading || Boolean(actionId)}>
          <RefreshCw size={17} className={loading ? "spin-icon" : ""} />
          Làm mới
        </button>
      </header>

      <section className="admin-contact-stats">
        <StatCard icon={<Mail size={21} />} label="Tổng liên hệ" value={stats.total} />
        <StatCard icon={<Clock3 size={21} />} label="Chưa đọc" value={stats.unread} tone="warning" />
        <StatCard icon={<CheckCircle2 size={21} />} label="Đã xử lý" value={stats.handled} tone="success" />
      </section>

      <section className="admin-contact-toolbar">
        <div className="admin-contact-search">
          <Search size={18} />
          <input
            value={searchTerm}
            onChange={(event) => setSearchTerm(event.target.value)}
            placeholder="Tìm theo tên, email, số điện thoại, chủ đề..."
          />
        </div>
        <select value={statusFilter} onChange={(event) => setStatusFilter(event.target.value)}>
          <option value="all">Tất cả liên hệ</option>
          <option value="unread">Chỉ chưa đọc</option>
          <option value="handled">Chỉ đã xử lý</option>
        </select>
      </section>

      {error && <div className="admin-contact-alert">{error}</div>}

      <section className="admin-contact-workspace">
        <div className="admin-contact-list">
          {loading ? (
            <div className="admin-contact-empty">
              <LoaderCircle className="spin-icon" size={23} />
              Đang tải liên hệ...
            </div>
          ) : filteredContacts.length === 0 ? (
            <div className="admin-contact-empty">Không tìm thấy liên hệ phù hợp.</div>
          ) : (
            filteredContacts.map((contact) => (
              <button
                type="button"
                key={contact._id}
                className={`admin-contact-item ${
                  selectedContact?._id === contact._id ? "active" : ""
                } ${contact.ischecked ? "handled" : "unread"}`}
                onClick={() => setSelectedContactId(contact._id)}
              >
                <div className="admin-contact-item-top">
                  <strong>{contact.name}</strong>
                  <span>{contact.ischecked ? "Đã xử lý" : "Chưa đọc"}</span>
                </div>
                <p>{contact.subject}</p>
                <small>{formatDateTime(contact.createdAt)}</small>
              </button>
            ))
          )}
        </div>

        <article className="admin-contact-detail">
          {!selectedContact ? (
            <div className="admin-contact-empty">Chọn một liên hệ để xem chi tiết.</div>
          ) : (
            <>
              <div className="admin-contact-detail-header">
                <div>
                  <span className={`admin-contact-status ${selectedContact.ischecked ? "handled" : "unread"}`}>
                    {selectedContact.ischecked ? "Đã xử lý" : "Chưa đọc"}
                  </span>
                  <h2>{selectedContact.subject}</h2>
                  <p>{formatDateTime(selectedContact.createdAt)}</p>
                </div>

                {!selectedContact.ischecked && (
                  <button
                    type="button"
                    className="admin-contact-read-btn"
                    onClick={() => markAsRead(selectedContact._id)}
                    disabled={actionId === selectedContact._id}
                  >
                    {actionId === selectedContact._id ? (
                      <LoaderCircle className="spin-icon" size={17} />
                    ) : (
                      <MailOpen size={17} />
                    )}
                    Đánh dấu đã đọc
                  </button>
                )}
              </div>

              <div className="admin-contact-person">
                <InfoPill icon={<UserRound size={17} />} label="Khách hàng" value={selectedContact.name} />
                <InfoPill icon={<Mail size={17} />} label="Email" value={selectedContact.email} />
                <InfoPill icon={<Phone size={17} />} label="Số điện thoại" value={selectedContact.phone} />
              </div>

              <div className="admin-contact-message">
                <span>Nội dung liên hệ</span>
                <p>{selectedContact.message}</p>
              </div>
            </>
          )}
        </article>
      </section>
    </main>
  );
}

const StatCard = ({ icon, label, value, tone = "primary" }) => (
  <article className={`admin-contact-stat ${tone}`}>
    <div>{icon}</div>
    <span>{label}</span>
    <strong>{value}</strong>
  </article>
);

const InfoPill = ({ icon, label, value }) => (
  <div className="admin-contact-info-pill">
    <div>{icon}</div>
    <span>{label}</span>
    <strong>{value || "Không có"}</strong>
  </div>
);

export default ContactList;
