import express from "express";
import * as contactCtrl from "../controllers/ContactCtrl.js";

const router = express.Router();

router.get("/getAll", contactCtrl.getAllContacts);
router.post("/create", contactCtrl.createContact);
router.put("/read/:id", contactCtrl.readContact);
router.get("/:id", contactCtrl.getContactById);

export default router;