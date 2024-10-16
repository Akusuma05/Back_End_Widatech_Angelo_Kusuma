const express = require('express');
const formdata = require('express-form-data');
const bodyParser = require('body-parser');
const cors = require('cors');
const productController = require('./controller/productController');
const invoiceController = require('./controller/invoiceController');
const productInvoiceController = require('./controller/productInvoiceController');

const app = express();
app.use(cors());
app.use(formdata.parse());
const PORT = 1234;

// set body parser
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true })); 

//Product
app.get('/api/product', productController.getProduct)
app.post('/api/product', productController.createProduct)
app.patch('/api/product/:id', productController.updateProduct)
app.delete('/api/product/:id', productController.deleteProduct)

//Invoice
app.get('/api/invoice', invoiceController.getInvoice)
app.post('/api/invoice', invoiceController.createInvoice)
app.patch('/api/invoice/:id', invoiceController.updateInvoice)
app.delete('/api/invoice/:id', invoiceController.deleteInvoice)

//ProductInvoice
app.get('/api/productinvoice', productInvoiceController.getProductInvoice)
app.post('/api/productinvoice', productInvoiceController.createProductInvoice)
app.patch('/api/productinvoice/:id', productInvoiceController.updateProductInvoice)
app.delete('/api/productinvoice/:id', productInvoiceController.deleteProductInvoice)

// Serve static images
app.use('/images', express.static('./images'));
// buat server nya
app.listen(PORT, () => console.log(`Server running at port: ${PORT}`))