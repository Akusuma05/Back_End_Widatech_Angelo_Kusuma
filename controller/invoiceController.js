const mysql = require('../config/server');

// Get Invoice
function getInvoice(req, res) {
  const querySql = `
    SELECT 
      i.invoice_id,
      i.invoice_date,
      i.invoice_customer_name,
      i.invoice_salesperson_name,
      i.invoice_notes,
      p.product_id,
      p.product_name,
      p.product_picture,
      p.product_stock,
      p.product_price
    FROM invoice i
    LEFT JOIN product_invoice pi ON i.invoice_id = pi.invoice_id
    LEFT JOIN product p ON pi.product_id = p.product_id
  `;

  // Execute the get query 
  mysql.query(querySql, (err, rows, fields) => {
    // Error
    if (err) {
      return res.status(500).json({ message: 'InvoiceController(getInvoice): Error getting Invoice', error: err });
    }

    // Group the results by invoice_id and format the response
    const formattedData = rows.reduce((acc, row) => {
      const invoiceId = row.invoice_id;
      if (!acc[invoiceId]) {
        acc[invoiceId] = {
          invoice_id: invoiceId,
          invoice_date: row.invoice_date,
          invoice_customer_name: row.invoice_customer_name,
          invoice_salesperson_name: row.invoice_salesperson_name,
          invoice_notes: row.invoice_notes,
          products: [],
        };
      }

      // Check if the row has product data
      if (row.product_id) {
        acc[invoiceId].products.push({
          product_id: row.product_id,
          product_name: row.product_name,
          product_picture: row.product_picture,
          product_stock: row.product_stock,
          product_price: row.product_price,
        });
      }

      return acc;
    }, {});

    // Success
    const response = Object.values(formattedData);
    res.status(200).json({ success: true, data: response });
  });
}
// Create Invoice
function createInvoice(req, res) {
  console.log('InvoiceController(createInvoice): Received data:', req.body);
  const { invoice_date, invoice_customer_name, invoice_salesperson_name, invoice_notes } = req.body;

  // Create a new Invoice object
  const newInvoice = {
    invoice_date,
    invoice_customer_name,
    invoice_salesperson_name
  };

  if (invoice_notes !== null && invoice_notes !== undefined) {
    newInvoice.invoice_notes = invoice_notes;
  } else {
    newInvoice.invoice_notes = "null";
  }

  const querySql = 'INSERT INTO invoice SET ?';

  // Execute the create query
  mysql.query(querySql, newInvoice, (err, updateResult) => {
    // Error
    if (err) {
      return res.status(500).json({ 
        message: 'InvoiceController(createInvoice): Error saving invoice', 
        error: err 
      });
    }

    // Success
    const invoiceId = updateResult.insertId; // Get the newly created invoice ID
    res.status(201).json({
      success: true,
      message: 'InvoiceController(createInvoice): Invoice created successfully',
      invoice: {
        ...newInvoice,
        invoice_id: invoiceId
      }
    });
  });
}


// Update Invoice
function updateInvoice(req, res){
  let querySql = 'UPDATE invoice SET ';

  // Extract data from the request body
  const { invoice_date, invoice_customer_name, invoice_salesperson_name, invoice_notes } = req.body;

  // Create a new product object
  const updates = {};
  if (invoice_date !== null && invoice_date !== undefined) {
      updates.invoice_date = invoice_date;
  }
  if (invoice_customer_name !== null && invoice_customer_name !== undefined) {
      updates.invoice_customer_name = invoice_customer_name;
  }
  if (invoice_salesperson_name !== null && invoice_salesperson_name !== undefined) {
      updates.invoice_salesperson_name = invoice_salesperson_name;
  }
  if (invoice_notes !== null && invoice_notes !== undefined) {
    updates.invoice_notes = invoice_notes;
  }

  // Build the update string
  let updateString = '';
  for (const key in updates) {
      if (updates[key] !== null) {  // Update only if the property has a value
          updateString += `${key} = ?, `;
      }
  }

  // Remove the trailing comma and space
  updateString = updateString.slice(0, -2);

  querySql += updateString;
  querySql += ` WHERE invoice_id = ` + req.params.id;

  // Execute the update query 
  mysql.query(querySql, [ ...Object.values(updates), req.params.id ], (err, rows, field) => {
    // Error
    if (err) {
    return res.status(500).json({ message: 'InvoiceController(updateInvoice): Error updating invoice', error: err });
    }

    // Error Invoice not Found
    if (rows.affectedRows === 0) {
       return res.status(404).json({ message: 'InvoiceController(updateInvoice): Invoice not found!', query: querySql, objects: Object.values(updates), id: req.params.id}); 
    }

    // Success
    res.status(200).json({ success: true, message: 'InvoiceController(updateInvoice): Invoice updated successfully' });
  });
}

// Delete Invoice
function deleteInvoice(req, res){
  const queryDelete = 'DELETE FROM invoice WHERE invoice_id = ?';

  // Execute the delete query 
  mysql.query(queryDelete, req.params.id, (err, rows, field) => {
    // Error
    if (err) {
        return res.status(500).json({ message: 'InvoiceController(deleteInvoice): Error deleting Invoice', error: err });
    }

    // Success
    res.status(200).json({ success: true, message: 'InvoiceController(deleteInvoice): Invoice Deleted Successfully!' });
  });
}

module.exports = {
  getInvoice,
  createInvoice,
  updateInvoice,
  deleteInvoice
};