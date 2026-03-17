import Product from "../models/ProductModel.js";

/*
  Lấy toàn bộ sản phẩm
*/
export const getAllProductsService = async () => {
    return await Product.find().sort({ createdAt: -1 });
};


/*
  Lấy 1 sản phẩm theo id
*/
export const getProductByIdService = async (id) => {
    const product = await Product.findById(id);
    if (!product) {
        throw new Error("Không tìm thấy sản phẩm");
    }

    return await Product.findById(id);
};


/*
  Tạo sản phẩm mới
*/
export const createProductService = async (data) => {
    const { name, brand, price, category, stock } = data;
    if (!name || !brand || !price || !category || stock === undefined) {
        throw new Error("Vui lòng điền đầy đủ thông tin sản phẩm");
    }

    const product = new Product(data);
    return await product.save();
};


/*
  Update sản phẩm (cách chuẩn production)
*/
export const updateProductService = async (id, data) => {
    const product = await Product.findById(id);
    if (!product) {
        throw new Error("Không tìm thấy sản phẩm");
    }

    Object.assign(product, data);
    return await product.save();
};


/*
  Xóa sản phẩm
*/
export const deleteProductService = async (id) => {
    const product = await Product.findById(id);
    if (!product) {
        throw new Error("Không tìm thấy sản phẩm");
    }
    
    return await Product.findByIdAndDelete(id);
};