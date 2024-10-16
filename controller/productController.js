const mysql = require('../config/server');
const fs = require('fs');

// Get Product
function getProduct(req, res) {
    const querySql = 'SELECT * FROM product';

    // Execute the get query 
    mysql.query(querySql, (err, rows, field) => {
        // Error
        if (err) {
            return res.status(500).json({ message: 'ProductController(getProduct): Error get Product!', error: err });
        }

        // Success
        res.status(200).json({ success: true, data: rows });
    });
}

// Create Product
function createProduct(req, res) {
    console.log('ProductController(createProduct): Received data:', req.files);
  
    const { product_name, product_stock, product_price } = req.body;
  
    // Create a new product object
    const newProduct = {
      product_name,
      product_stock: parseInt(product_stock),
      product_price: parseInt(product_price),
      product_picture: ""
    };
  
    const imageFile = req.files.product_picture;
    const imageExtension = imageFile.name.split('.').pop();
    const querySql = 'INSERT INTO product SET ?';

    // MySQL query to insert product
    mysql.query(querySql, newProduct, (err, result) => {
      if (err) {
        return res.status(500).json({ message: 'ProductController(createProduct): Error inserting product', error: err });
      }
  
      const productId = result.insertId;
      const newFileName = `${productId}.${imageExtension}`;
      const imagePath = `images/${newFileName}`; 
  
      // Move and save the uploaded image
      fs.readFile(imageFile.path, (err, data) => {
        if (err) {
          return res.status(500).json({ message: 'ProductController(createProduct): Error reading image', error: err });
        }
  
        fs.writeFile(imagePath, data, (err) => {
          if (err) {
            return res.status(500).json({ message: 'ProductController(createProduct): Error saving image', error: err });
          }
  
          // Update the newProduct object with the image path
          newProduct.product_picture = imagePath;

          const updateQuery = `UPDATE product SET product_picture = '${imagePath}' WHERE product_id = ${productId}`;
          
          // MySQL query to update New Product Image Path with the new Product Id 
          mysql.query(updateQuery, (err, updateResult) => {
            // Error
            if (err) {
                return res.status(500).json({ message: 'ProductController(createProduct): Error saving image path', error: err });
            }

            // Success
            res.status(201).json({
                success: true,
                message: 'ProductController(createProduct): Product created successfully',
                product: { ...newProduct, id: productId },
            });
          });
        });
      });
    });
}

// Update Product
function updateProduct(req, res) {
    let querySql = 'UPDATE product SET ';

    const { product_name, product_stock, product_price} = req.body;

    const updates = {};
    if (product_name !== null && product_name !== undefined) {
        updates.product_name = product_name;
    }
    if (product_stock !== null && product_stock !== undefined) {
        updates.product_stock = product_stock;
    }
    if (product_price !== null && product_price !== undefined) {
        updates.product_price = product_price;
    }
    if (req.files && req.files.product_picture) {
        updates.product_picture = "";
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
    querySql += ` WHERE product_id = ` + req.params.id;

    //If a picture is uploaded
    if (req.files && req.files.product_picture) {
      const imageFile = req.files.product_picture;
      const newFileName = `${req.params.id}.${imageFile.name.split('.').pop()}`;
      const imagePath = `images/${newFileName}`; 
  
      // Replace the current image file
      fs.readFile(imageFile.path, (err, data) => {
          //Error Reading Image
          if (err) {
          return res.status(500).json({ message: 'ProductController(updateProduct): Error reading image', error: err });
          }
  
          fs.writeFile(imagePath, data, (err) => {
              // Error Saving Image
              if (err) {
                  return res.status(500).json({ message: 'ProductController(updateProduct): Error saving image', error: err });
              }
      
              // Update the newProduct object with the image path
              updates.product_picture = imagePath;
      
              // Execute the update query with the updated image path
              mysql.query(querySql, [ ...Object.values(updates), req.params.id ], (err, rows, field) => {
                  // Error
                  if (err) {
                  return res.status(500).json({ message: 'ProductController(updateProduct): Error updating product with picture', error: err });
                  }
                  
                  //Error Product Not Found
                  if (rows.affectedRows === 0) {
                     return res.status(404).json({ message: 'ProductController(updateProduct): Product not found!', query: querySql, objects: Object.values(updates), id: req.params.id}); 
                  }
      
                  // Success
                  res.status(200).json({ success: true, message: 'ProductController(updateProduct): Product updated successfully' });
              });
          });
      });
  }else{
      // Execute the update query with no new image provided
      mysql.query(querySql, [ ...Object.values(updates), req.params.id ], (err, rows, field) => {
          // Error
          if (err) {
          return res.status(500).json({ message: 'ProductController(updateProduct): Error updating product without picture', error: err });
          }
          
          // Error Product Not Found
          if (rows.affectedRows === 0) {
              return res.status(404).json({ message: 'ProductController(updateProduct): Product not found!', query: querySql, objects: Object.values(updates), id: req.params.id}); 
          }
  
          // Success
          res.status(200).json({ success: true, message: 'ProductController(updateProduct): Product updated successfully' });
      });
  }
  }

// Delete Product
function deleteProduct(req, res) {
  const querySearch = 'SELECT * FROM product WHERE product_id = ?';
  const queryDelete = 'DELETE FROM product WHERE product_id = ?';

  // Execute the find the current product query 
  mysql.query(querySearch, req.params.id, (err, rows, field) => {
    // Error 
    if (err) {
      return res.status(500).json({ message: 'ProductController(deleteProduct): Error Deleting Product', error: err });
    }

    // If product found
    if (rows.length) {
      const productToDelete = rows[0]; // Get product data

      // Check if product_picture path exists
      if (productToDelete.product_picture) {
        const imagePath = productToDelete.product_picture;

        // Delete the image
        fs.unlink(imagePath, (err) => {
          // Error cannot delete image
          if (err) {
            console.error('ProductController(deleteProduct):  Error deleting image:', err);
          }

          // Execute the delete query 
          mysql.query(queryDelete, req.params.id, (err, rows, field) => {
            // Error
            if (err) {
                return res.status(500).json({ message: 'ProductController(deleteProduct): Error Deleting Product', error: err });
            }

            // Success
            res.status(200).json({ success: true, message: 'ProductController(deleteProduct): Successfully Deleting Product!' });
          });
        });
      } else {
        // Execute the delete query with no image
        mysql.query(queryDelete, req.params.id, (err, rows, field) => {
          // Error 
          if (err) {
            return res.status(500).json({ message: 'ProductController(deleteProduct): Error Deleting Product', error: err });
          }

          // Success
          res.status(200).json({ success: true, message: 'ProductController(deleteProduct): Successfully Deleting Product!' });
        });
      }
    } else {
      // Error Product Not Found
      return res.status(404).json({ message: 'ProductController(deleteProduct): Product Not Found!', success: false });
    }
  });
}

module.exports = {
    getProduct,
    createProduct,
    updateProduct,
    deleteProduct
};