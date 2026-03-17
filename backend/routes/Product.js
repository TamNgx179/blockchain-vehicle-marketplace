import express from 'express';
// import { getAllProducts, getProductById } from '../controllers/ProductCtrl';
import * as productCtrl from '../controllers/ProductCtrl.js';

const router = express.Router();

// router.get('/', getAllProducts.getAllProducts);// GET /api/products  cách import này có gợi ý cói nó khác j với dùng * as
router.get('/getAll', productCtrl.getAllProducts);          // GET /api/products 
router.get('/:id', productCtrl.getProductById);      // GET /api/products/:id
router.post('/create', productCtrl.createProduct);         // POST /api/products
router.put('/edit/:id', productCtrl.updateProduct);       // PUT /api/products/:id
router.delete('/deleteOne/:id', productCtrl.deleteProduct);    // DELETE /api/products/:id

export default router;