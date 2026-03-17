import {
    getAllProductsService,
    getProductByIdService,
    createProductService,
    updateProductService,
    deleteProductService
} from "../service/ProductService.js";


// READ ALL
export const getAllProducts = async (req, res) => {
    try {
        const products = await getAllProductsService();
        res.status(200).json(products);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};


// READ ONE
export const getProductById = async (req, res) => {
    try {
        const product = await getProductByIdService(req.params.id);

        res.status(200).json(product);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};


// CREATE
export const createProduct = async (req, res) => {
    try {
        const product = await createProductService(req.body);
        res.status(201).json(product);
    } catch (error) {
        res.status(400).json({ message: error.message });
    }
};


// UPDATE
export const updateProduct = async (req, res) => {
    try {
        const product = await updateProductService(req.params.id, req.body);

        res.status(200).json(product);
    } catch (error) {
        res.status(400).json({ message: error.message });
    }
};


// DELETE
export const deleteProduct = async (req, res) => {
    try {
        const deleted = await deleteProductService(req.params.id);

        res.status(200).json({ message: "Đã xóa thành công" });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};