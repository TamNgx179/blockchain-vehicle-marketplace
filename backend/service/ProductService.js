import Product from "../models/ProductModel.js";

/*
  Lấy toàn bộ sản phẩm
*/
export const getAllProductsService = async () => {
  return Product.find().sort({ createdAt: -1 });
};


/*
  Lấy 1 sản phẩm theo id
*/
export const getProductByIdService = async (id) => {

  const product = await Product.findById(id);

  if (!product) {
    throw new Error("Không tìm thấy sản phẩm");
  }

  return product;
};


/*
  Tạo sản phẩm mới
*/
export const createProductService = async ({ body, files }) => {

  const { name, brand, price, category, stock } = body;

  if (!name || !brand || !price || !category || stock === undefined) {
    throw new Error("Vui lòng điền đầy đủ thông tin sản phẩm");
  }

  if (!files) {
    throw new Error("Vui lòng upload hình ảnh");
  }

  if (!files.thumbnailImage) {
    throw new Error("Thumbnail image là bắt buộc");
  }

  if (!files.heroImage) {
    throw new Error("Hero image là bắt buộc");
  }

  const thumbnailImage = files.thumbnailImage[0].filename;
  const heroImage = files.heroImage[0].filename;

  let galleryImages = [];

  if (files.galleryImages) {
    galleryImages = files.galleryImages.map(file => file.filename);
  }

  const product = new Product({
    name,
    brand,
    price,
    category,
    stock,
    thumbnailImage,
    heroImage,
    galleryImages
  });

  return product.save();
};


/*
  Update sản phẩm (cách chuẩn production)
*/
export const updateProductService = async (id, { body, files }) => {

  const product = await Product.findById(id);

  if (!product) {
    throw new Error("Không tìm thấy sản phẩm");
  }

  Object.assign(product, body);

  if (files) {

    if (files.thumbnailImage) {
      product.thumbnailImage = files.thumbnailImage[0].filename;
    }

    if (files.heroImage) {
      product.heroImage = files.heroImage[0].filename;
    }

    if (files.galleryImages) {
      product.galleryImages = files.galleryImages.map(file => file.filename);
    }

  }

  return product.save();
};


/*
  Xóa sản phẩm
*/
export const deleteProductService = async (id) => {

  const product = await Product.findById(id);

  if (!product) {
    throw new Error("Không tìm thấy sản phẩm");
  }

  return Product.findByIdAndDelete(id);
};

export const filterProductsService = async (queryParams) => {
  const {
    brand,
    category,
    minPrice,
    maxPrice,
    page = 1,
    limit = 10
  } = queryParams;

  const filter = {};

  // lọc theo hãng
  if (brand) {
    filter.brand = { $regex: brand, $options: "i" };
  }

  // lọc theo loại xe
  if (category) {
    filter.category = { $regex: category, $options: "i" };
  }

  // lọc theo khoảng giá
  if (minPrice !== undefined || maxPrice !== undefined) {
    filter.price = {};

    if (minPrice !== undefined) {
      filter.price.$gte = Number(minPrice);
    }

    if (maxPrice !== undefined) {
      filter.price.$lte = Number(maxPrice);
    }
  }

  // phân trang
  const currentPage = Number(page) || 1;
  const perPage = Number(limit) || 10;
  const skip = (currentPage - 1) * perPage;

  const [products, total] = await Promise.all([
    Product.find(filter)
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(perPage),
    Product.countDocuments(filter)
  ]);

  return {
    products,
    pagination: {
      total,
      page: currentPage,
      limit: perPage,
      totalPages: Math.ceil(total / perPage)
    }
  };
};