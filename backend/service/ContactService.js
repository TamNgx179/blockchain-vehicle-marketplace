import Contact from '../models/ContactModel.js';
import sendMail from '../utils/mailer.js';

// Lấy toàn bộ liên hệ
export const getAllContactsService = async () => {
    return await Contact.find().sort({ createdAt: -1 });
};

// Lấy 1 liên hệ theo id
export const getContactByIdService = async (id) => {
    const contact = await Contact.findById(id);
    if(!contact) {
        throw new Error("Không tìm thấy liên hệ");
    }

    return await contact;
}

// Tạo liên hệ mới
export const createContactService = async (data) => {
    const { name, email, phone, subject, message } = data;
    if (!name || !email || !phone || !subject || !message) {
        throw new Error("Vui lòng điền đầy đủ thông tin liên hệ");
    }

    const contact = new Contact(data);
    const savedContact = await contact.save();

    // Gửi email xác nhận đên khách hàng sau khi tạo liên hệ thành công
    await sendMail(
        contact.email,
        "Chúng tôi đã nhận được liên hệ của bạn",
        `<h3>Xin chào ${contact.name}</h3>
         <p>Chúng tôi sẽ phản hồi sớm nhất.</p>`
    );

    return savedContact;
};

// Đọc liên hệ
export const readContactService = async (id) => {
    const contact = await Contact.findById(id);
    if(!contact) {
        throw new Error("Không tìm thấy liên hệ");
    }

    contact.ischecked = true;
    return await contact.save();
}