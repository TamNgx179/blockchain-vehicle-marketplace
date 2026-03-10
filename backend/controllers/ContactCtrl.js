import {
    createContactService,
    getAllContactsService,
    getContactByIdService,
    readContactService
} from '../service/ContactService.js';

// Lấy toàn bộ liên hệ
export const getAllContacts = async (req, res) => {
    try {
        const contacts = await getAllContactsService();
        res.status(200).json(contacts);
    }
    catch (error) {
        res.status(500).json({ message: error.message });
    }
}

// Lấy 1 liên hệ theo id
export const getContactById = async (req, res) => {
    try {
        const { id } = req.params;
        const contact = await getContactByIdService(id);
        res.status(200).json(contact);
    }
    catch (error) {
        res.status(500).json({ message: error.message });
    }
}

// Tạo liên hệ mới
export const createContact = async (req, res) => {
    try {
        const contact = await createContactService(req.body);
        res.status(201).json(contact);
    }
    catch (error) {
        res.status(500).json({ message: error.message });
    }
}

// Đánh dấu liên hệ đã đọc
export const readContact = async (req, res) => {
    try {
        const { id } = req.params;
        const contact = await readContactService(id);
        res.status(200).json(contact);
    }
    catch (error) {
        res.status(500).json({ message: error.message });
    }
}
