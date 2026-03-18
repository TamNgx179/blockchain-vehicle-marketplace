import Product from "../models/ProductModel.js";

/*
  HELPER
*/
const parseJSON = (field, name) => {
  try {
    return typeof field === "string" ? JSON.parse(field) : field;
  } catch {
    throw new Error(`${name} JSON không hợp lệ`);
  }
};

const toNumber = (value, fieldName) => {
  const num = Number(value);
  if (isNaN(num)) {
    throw new Error(`${fieldName} phải là số`);
  }
  return num;
};

/*
  GET ALL
*/
export const getAllProductsService = async () => {
  return Product.find().sort({ createdAt: -1 });
};

/*
  GET BY ID
*/
export const getProductByIdService = async (id) => {
  const product = await Product.findById(id);
  if (!product) throw new Error("NOT_FOUND");
  return product;
};

/*
  CREATE
*/
export const createProductService = async ({ body, files }) => {
  let {
    name,
    brand,
    price,
    category,
    stock,
    description,
    specifications,
    safety,
    convenience
  } = body;

  if (!name || !brand || price === undefined || !category || stock === undefined) {
    throw new Error("Vui lòng điền đầy đủ thông tin sản phẩm");
  }

  // ===== PARSE =====
  const parsedSpecs = parseJSON(specifications, "Specifications");
  const parsedSafety = safety ? parseJSON(safety, "Safety") : [];
  const parsedConvenience = convenience ? parseJSON(convenience, "Convenience") : [];

  // ===== VALIDATE SPEC =====
  if (!parsedSpecs || !parsedSpecs.model || !parsedSpecs.engine) {
    throw new Error("Specifications thiếu model hoặc engine");
  }

  // ===== NUMBER =====
  price = toNumber(price, "Price");
  stock = toNumber(stock, "Stock");

  // ===== FILE CHECK =====
  if (!files?.thumbnailImage?.[0] || !files?.heroImage?.[0]) {
    throw new Error("Thiếu hình ảnh bắt buộc");
  }

  const thumbnailImage = files.thumbnailImage[0].filename;
  const heroImage = files.heroImage[0].filename;

  const galleryImages = files?.galleryImages
    ? files.galleryImages.map((f) => f.filename)
    : [];

  const product = new Product({
    name,
    brand,
    price,
    category,
    stock,
    description,
    thumbnailImage,
    heroImage,
    galleryImages,
    specifications: parsedSpecs,
    safety: parsedSafety,
    convenience: parsedConvenience
  });

  return product.save();
};

/*
  UPDATE
*/
export const updateProductService = async (id, { body, files }) => {
  const product = await Product.findById(id);
  if (!product) throw new Error("NOT_FOUND");

  const { specifications, safety, convenience, ...rest } = body;

  // ===== SANITIZE NUMBER =====
  if (rest.price !== undefined) rest.price = toNumber(rest.price, "Price");
  if (rest.stock !== undefined) rest.stock = toNumber(rest.stock, "Stock");

  Object.assign(product, rest);

  // ===== PARSE JSON =====
  if (specifications) {
    product.specifications = parseJSON(specifications, "Specifications");
  }

  if (safety) {
    product.safety = parseJSON(safety, "Safety");
  }

  if (convenience) {
    product.convenience = parseJSON(convenience, "Convenience");
  }

  // ===== FILE UPDATE =====
  if (files?.thumbnailImage?.[0]) {
    product.thumbnailImage = files.thumbnailImage[0].filename;
  }

  if (files?.heroImage?.[0]) {
    product.heroImage = files.heroImage[0].filename;
  }

  if (files?.galleryImages) {
    product.galleryImages = files.galleryImages.map((f) => f.filename);
  }

  return product.save();
};

/*
  DELETE
*/
export const deleteProductService = async (id) => {
  const product = await Product.findById(id);
  if (!product) throw new Error("NOT_FOUND");

  return Product.findByIdAndDelete(id);
};

/*
  FILTER
*/
export const filterProductsService = async (queryParams) => {
  const {
    brand,
    category,
    minPrice,
    maxPrice,
    minPower,
    maxPower,
    minGear,
    maxGear,
    safety,
    page = 1,
    limit = 10
  } = queryParams;

  const filter = {};

  if (brand) {
    filter.brand = { $regex: brand, $options: "i" };
  }

  if (category) {
    filter.category = { $regex: category, $options: "i" };
  }

  if (minPrice || maxPrice) {
    filter.price = {};
    if (minPrice) filter.price.$gte = Number(minPrice);
    if (maxPrice) filter.price.$lte = Number(maxPrice);
  }

  if (minPower || maxPower) {
    filter["specifications.power"] = {};
    if (minPower) filter["specifications.power"].$gte = Number(minPower);
    if (maxPower) filter["specifications.power"].$lte = Number(maxPower);
  }

  if (minGear || maxGear) {
    filter["specifications.gear"] = {};
    if (minGear) filter["specifications.gear"].$gte = Number(minGear);
    if (maxGear) filter["specifications.gear"].$lte = Number(maxGear);
  }

  // đổi sang $all nếu muốn match đủ
  if (safety) {
    filter.safety = {
      $in: Array.isArray(safety) ? safety : [safety]
    };
  }

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