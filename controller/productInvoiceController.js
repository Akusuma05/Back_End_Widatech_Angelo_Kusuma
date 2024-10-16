const mysql = require('../config/server');

// Get ProductInvoice
function getProductInvoice(req, res) {
    const querySql = 'SELECT * FROM product_invoice';

    // Execute the get query 
    mysql.query(querySql, (err, rows, field) => {
        // Error
        if (err) {
            return res.status(500).json({ message: 'ProductInvoiceController(getProductInvoice): Error getting ProductInvoice', error: err });
        }

        // Success
        res.status(200).json({ success: true, data: rows });
    });
}

// Create ProductInvoice
function createProductInvoice(req, res){
    console.log('ProductInvoiceController(createProductInvoice): Received data:', req.body);

    const { invoice_id, product_id } = req.body;

    // Create a new ProductInvoice object
    const newProductInvoice = {
        invoice_id,
        product_id
    };

    const querySql = 'INSERT INTO product_invoice SET ?';

    // Execute the create query 
    mysql.query(querySql, newProductInvoice, (err, updateResult) => {
        // Error
        if (err) {
            return res.status(500).json({ message: 'ProductInvoiceController(createProductInvoice): Error saving ProductInvoice', error: err });
        }

        // Success
        res.status(201).json({
            success: true,
            message: 'ProductInvoiceController(createProductInvoice): ProductInvoice created successfully',
            invoice: newProductInvoice
        });
    });
}

// Update ProductInvoice
function updateProductInvoice(req, res){
    let querySql = 'UPDATE product_invoice SET ';

    const { invoice_id, product_id } = req.body;
  
    // Create a new ProductInvoice object
    const updates = {};
    if (invoice_id !== null && invoice_id !== undefined) {
        updates.invoice_id = invoice_id;
    }
    if (product_id !== null && product_id !== undefined) {
        updates.product_id = product_id;
    }
  
    // Build the update string
    let updateString = '';
    for (const key in updates) {
        if (updates[key] !== null) {  
            updateString += `${key} = ?, `;
        }
    }
  
    // Remove the trailing comma and space
    updateString = updateString.slice(0, -2);
  
    querySql += updateString;
    querySql += ` WHERE product_invoice_id = ` + req.params.id;
  
    // Execute the update query 
    mysql.query(querySql, [ ...Object.values(updates), req.params.id ], (err, rows, field) => {
      // Error
      if (err) {
      return res.status(500).json({ message: 'ProductInvoiceController(updateProductInvoice): Error updating ProductInvoice', error: err });
      }
      
      // Error Not Found
      if (rows.affectedRows === 0) {
         return res.status(404).json({ message: 'ProductInvoiceController(updateProductInvoice): ProductInvoice not found!', query: querySql, objects: Object.values(updates), id: req.params.id}); 
      }
  
      // Success
      res.status(200).json({ success: true, message: 'ProductInvoiceController(updateProductInvoice): ProductInvoice updated successfully!' });
    });
}

// Delete ProductInvoice
function deleteProductInvoice(req, res){
    const queryDelete = 'DELETE FROM product_invoice WHERE product_invoice_id = ?';

    // Execute the delete query 
    mysql.query(queryDelete, req.params.id, (err, rows, field) => {
        // Error
        if (err) {
            return res.status(500).json({ message: 'ProductInvoiceController(deleteProductInvoice): Error deleting ProductInvoice', error: err });
        }

        // Success
        res.status(200).json({ success: true, message: 'ProductInvoiceController(deleteProductInvoice): ProductInvoice Deleted Successfully!' });
    });
}

module.exports = {
    getProductInvoice,
    createProductInvoice,
    updateProductInvoice,
    deleteProductInvoice
};