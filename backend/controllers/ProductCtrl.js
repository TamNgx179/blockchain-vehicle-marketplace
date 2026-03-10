import {
  getAllProductsService,
  getProductByIdService,
  createProductService,
  updateProductService,
  deleteProductService,
  filterProductsService
} from "../service/ProductService.js";


// GET ALL
export const getAllProducts = async (req, res) => {
  try {

    const products = await getAllProductsService();

    res.status(200).json(products);

  } catch (error) {

    res.status(500).json({ message: error.message });

  }
};


// GET ONE
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

    const product = await createProductService({
      body: req.body,
      files: req.files
    });

    res.status(201).json({
      success: true,
      message: "Tạo sản phẩm thành công",
      data: product
    });

  } catch (error) {

    res.status(400).json({
      success: false,
      message: error.message
    });

  }
};


// UPDATE
export const updateProduct = async (req, res) => {
  try {

    const product = await updateProductService(
      req.params.id,
      {
        body: req.body,
        files: req.files
      }
    );

    res.status(200).json({
      success: true,
      message: "Cập nhật sản phẩm thành công",
      data: product
    });

  } catch (error) {

    res.status(400).json({
      success: false,
      message: error.message
    });

  }
};


// DELETE
export const deleteProduct = async (req, res) => {
  try {

    await deleteProductService(req.params.id);

    res.status(200).json({
      message: "Đã xóa sản phẩm"
    });

  } catch (error) {

    res.status(500).json({ message: error.message });

  }
};

// FILTER
export const filterProducts = async (req, res) => {
  try {
    const result = await filterProductsService(req.query);

    res.status(200).json({
      success: true,
      message: "Lọc xe thành công",
      ...result
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};