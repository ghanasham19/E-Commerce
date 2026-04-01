import { useState, useEffect } from 'react';
import api from '../services/api';
import styles from './AdminDashboard.module.css';

const AdminDashboard = () => {
  const [success, setSuccess] = useState('');
  const [products, setProducts] = useState([]); 
  const [categories, setCategories] = useState([]); // NEW: Holds all categories
  const [editingId, setEditingId] = useState(null); 
  
  // NEW: Added categoryId to the product state
  const [productData, setProductData] = useState({ name: '', description: '', price: '', image: '', categoryId: '' });
  const [optionsBuilder, setOptionsBuilder] = useState([{ name: 'Size', values: 'S, M, L' }]);
  
  // NEW: State for creating a brand new category
  const [newCategoryName, setNewCategoryName] = useState('');

  // Fetch products AND categories when page loads
  useEffect(() => {
    fetchProducts();
    fetchCategories();
  }, []);

  const fetchProducts = async () => {
    try {
      const response = await api.get('/products');
      setProducts(response.data);
    } catch (error) {
      console.error("Error fetching products:", error);
    }
  };

  // NEW: Fetch categories from backend
  const fetchCategories = async () => {
    try {
      const response = await api.get('/categories');
      setCategories(response.data);
    } catch (error) {
      console.error("Error fetching categories:", error);
    }
  };

  const handleChange = (e) => setProductData({ ...productData, [e.target.name]: e.target.value });

  const handleImageUpload = (e) => {
    const file = e.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => setProductData({ ...productData, image: reader.result });
      reader.readAsDataURL(file);
    }
  };

  const handleAddOptionRow = () => setOptionsBuilder([...optionsBuilder, { name: '', values: '' }]);
  
  const handleOptionChange = (index, field, value) => {
    const newOptions = [...optionsBuilder];
    newOptions[index][field] = value;
    setOptionsBuilder(newOptions);
  };

  const handleRemoveOptionRow = (index) => setOptionsBuilder(optionsBuilder.filter((_, i) => i !== index));

  // --- NEW: CREATE CATEGORY LOGIC ---
  const handleCreateCategory = async (e) => {
    e.preventDefault();
    if (!newCategoryName.trim()) return;
    try {
      await api.post('/categories/create', { name: newCategoryName });
      setNewCategoryName('');
      fetchCategories(); // Refresh the dropdown list!
      setSuccess(`Category "${newCategoryName}" created successfully!`);
      setTimeout(() => setSuccess(''), 3000);
    } catch (error) {
      console.error("Error creating category:", error);
      alert("Failed to create category.");
    }
  };

  // --- NEW: TOGGLE TRENDING STATUS ---
  const handleToggleTrending = async (id) => {
    try {
      await api.put(`/products/admin/${id}/toggle-trending`);
      fetchProducts(); // Refresh the table to show the new status
    } catch (error) {
      console.error("Error toggling trending status:", error);
      alert("Failed to update trending status.");
    }
  };

  // --- SAVE OR UPDATE LOGIC ---
  const handleSubmit = async (e) => {
    e.preventDefault();
    const formattedOptions = optionsBuilder.filter(opt => opt.name.trim() !== '')
      .map(opt => ({ name: opt.name, values: opt.values.split(',').map(val => val.trim()).filter(val => val !== '') }));

    // NEW: Attach the Category Object so Spring Boot Hibernate understands it
    const finalProductData = { 
      ...productData, 
      customizationOptions: JSON.stringify(formattedOptions),
      category: productData.categoryId ? { id: productData.categoryId } : null
    };

    try {
      if (editingId) {
        await api.put(`/admin/products/${editingId}`, finalProductData);
        setSuccess(`Successfully updated ${productData.name}!`);
      } else {
        await api.post('/admin/products', finalProductData);
        setSuccess(`Successfully added ${productData.name}!`);
      }
      
      // Reset form and refresh table
      setProductData({ name: '', description: '', price: '', image: '', categoryId: '' });
      setOptionsBuilder([{ name: '', values: '' }]);
      setEditingId(null);
      fetchProducts(); 
      setTimeout(() => setSuccess(''), 3000);
    } catch (error) {
      console.error("Error saving product:", error);
      alert("Failed to save product.");
    }
  };

  // --- EDIT PRODUCT BUTTON ---
  const handleEdit = (prod) => {
    setEditingId(prod.id);
    setProductData({ 
      name: prod.name, 
      description: prod.description, 
      price: prod.price, 
      image: '',
      categoryId: prod.category ? prod.category.id : '' // NEW: Pre-select their existing category
    }); 
    
    if (prod.customizationOptions) {
      const parsed = JSON.parse(prod.customizationOptions);
      setOptionsBuilder(parsed.map(opt => ({ name: opt.name, values: opt.values.join(', ') })));
    }
    window.scrollTo({ top: 0, behavior: 'smooth' }); 
  };

  // --- DELETE PRODUCT BUTTON ---
  const handleDelete = async (id, name) => {
    if (!window.confirm(`Are you sure you want to delete "${name}"?`)) return;
    try {
     await api.delete(`/admin/products/${id}`);
      fetchProducts(); 
      alert("Product deleted!");
    } catch (error) {
      alert("Cannot delete this product. It is likely already attached to a customer's order history!");
    }
  };

  return (
    <div className={styles.dashboardContainer}>
      <div className={styles.header}>
        <h1>Admin Control Panel</h1>
        <p style={{ fontSize: '1.2rem', color: '#ffe500', fontWeight: 'bold' }}>
          Total Active Products in Store: {products.length}
        </p>
      </div>

      {success && <div className={styles.successMsg} style={{ marginBottom: '20px', padding: '15px', backgroundColor: '#d4edda', color: '#155724', borderRadius: '4px', textAlign: 'center', fontWeight: 'bold' }}>{success}</div>}

      {/* NEW: CATEGORY CREATION SECTION */}
      <div className={styles.section} style={{ marginBottom: '30px', backgroundColor: '#f0f4f8', padding: '20px', borderRadius: '8px' }}>
        <h2 className={styles.sectionTitle} style={{ margin: '0 0 15px 0', fontSize: '1.2rem' }}>📂 Create New Category</h2>
        <form onSubmit={handleCreateCategory} style={{ display: 'flex', gap: '10px' }}>
          <input 
            type="text" 
            placeholder="e.g., T-Shirts, Mugs, Hoodies" 
            value={newCategoryName} 
            onChange={(e) => setNewCategoryName(e.target.value)} 
            style={{ flex: 1, padding: '10px', borderRadius: '4px', border: '1px solid #ccc' }}
            required 
          />
          <button type="submit" style={{ backgroundColor: '#2874f0', color: 'white', border: 'none', padding: '10px 20px', borderRadius: '4px', cursor: 'pointer', fontWeight: 'bold' }}>
            + Add Category
          </button>
        </form>
      </div>

      <div className={styles.section} style={{ marginBottom: '30px' }}>
        <h2 className={styles.sectionTitle}>{editingId ? 'Edit Product' : 'Add New Product'}</h2>

        <form className={styles.formGrid} onSubmit={handleSubmit}>
          <div className={styles.formGroup}>
            <label>Product Name</label>
            <input type="text" name="name" value={productData.name} onChange={handleChange} required />
          </div>

          <div className={styles.formGroup}>
            <label>Price (₹)</label>
            <input type="number" step="0.01" name="price" value={productData.price} onChange={handleChange} required />
          </div>

          {/* NEW: CATEGORY DROPDOWN */}
          <div className={`${styles.formGroup} ${styles.fullWidth}`}>
            <label>Product Category</label>
            <select 
              name="categoryId" 
              value={productData.categoryId} 
              onChange={handleChange} 
              required
              style={{ padding: '10px', width: '100%', borderRadius: '4px', border: '1px solid #ccc' }}
            >
              <option value="">-- Select a Category --</option>
              {categories.map(cat => (
                <option key={cat.id} value={cat.id}>{cat.name}</option>
              ))}
            </select>
          </div>

          <div className={`${styles.formGroup} ${styles.fullWidth}`}>
            <label>Description</label>
            <textarea name="description" value={productData.description} onChange={handleChange} rows="2" required />
          </div>

          <div className={`${styles.formGroup} ${styles.fullWidth}`} style={{ backgroundColor: '#f9f9f9', padding: '15px', borderRadius: '4px', border: '1px dashed #ccc' }}>
            <label>{editingId ? 'Upload New Image (Leave blank to keep old image)' : 'Upload Product Image'}</label>
            <input type="file" accept="image/*" onChange={handleImageUpload} required={!editingId && !productData.image} />
            {productData.image && <img src={productData.image} alt="Preview" style={{ height: '80px', marginTop: '10px' }} />}
          </div>

          <div className={`${styles.formGroup} ${styles.fullWidth}`} style={{ borderTop: '2px solid #eee', paddingTop: '20px' }}>
            <label style={{ fontSize: '1.2rem', color: '#2874f0' }}>Dropdown Options</label>
            {optionsBuilder.map((option, index) => (
              <div key={index} style={{ display: 'flex', gap: '10px', marginBottom: '10px' }}>
                <input type="text" placeholder="Name (e.g., Size)" value={option.name} onChange={(e) => handleOptionChange(index, 'name', e.target.value)} style={{ flex: 1 }} />
                <input type="text" placeholder="Choices (e.g., S, M, L)" value={option.values} onChange={(e) => handleOptionChange(index, 'values', e.target.value)} style={{ flex: 2 }} />
                <button type="button" onClick={() => handleRemoveOptionRow(index)} style={{ backgroundColor: '#ff6161', color: 'white', border: 'none', padding: '0 15px', borderRadius: '4px', cursor: 'pointer' }}>X</button>
              </div>
            ))}
            <button type="button" onClick={handleAddOptionRow} style={{ backgroundColor: '#e0e0e0', padding: '10px', border: 'none', borderRadius: '4px', cursor: 'pointer' }}>+ Add Option</button>
          </div>

          <button type="submit" className={styles.submitBtn} style={{ backgroundColor: editingId ? '#388e3c' : '#2874f0' }}>
            {editingId ? 'Update Product' : 'Save Product'}
          </button>
          
          {editingId && (
            <button type="button" onClick={() => { setEditingId(null); setProductData({ name: '', description: '', price: '', image: '', categoryId: '' }); }} style={{ backgroundColor: '#9e9e9e', color: 'white', padding: '15px', border: 'none', marginTop: '10px', cursor: 'pointer', borderRadius: '2px', fontWeight: 'bold' }}>
              Cancel Edit
            </button>
          )}
        </form>
      </div>

      <div className={styles.section}>
        <h2 className={styles.sectionTitle}>Manage Inventory</h2>
        <table style={{ width: '100%', borderCollapse: 'collapse', marginTop: '10px' }}>
          <thead>
            <tr style={{ backgroundColor: '#f4f4f9', textAlign: 'left', borderBottom: '2px solid #ddd' }}>
              <th style={{ padding: '12px' }}>Image</th>
              <th style={{ padding: '12px' }}>Product</th>
              <th style={{ padding: '12px' }}>Category</th>
              <th style={{ padding: '12px', textAlign: 'center' }}>Homepage Status</th>
              <th style={{ padding: '12px', textAlign: 'right' }}>Actions</th>
            </tr>
          </thead>
          <tbody>
            {products.map(prod => (
              <tr key={prod.id} style={{ borderBottom: '1px solid #eee' }}>
                <td style={{ padding: '12px' }}><img src={prod.image} alt="img" style={{ height: '50px', width: '50px', objectFit: 'cover', borderRadius: '4px' }}/></td>
                
                <td style={{ padding: '12px', fontWeight: '500' }}>
                  {prod.name}
                  <div style={{ color: '#388e3c', fontSize: '0.9rem' }}>₹{prod.price.toFixed(2)}</div>
                </td>
                
                {/* Display the Category Name */}
                <td style={{ padding: '12px', color: '#666' }}>
                  {prod.category ? prod.category.name : <span style={{ color: 'red' }}>None</span>}
                </td>
                
                {/* NEW: TRENDING TOGGLE BUTTON */}
                <td style={{ padding: '12px', textAlign: 'center' }}>
                  <button 
                    onClick={() => handleToggleTrending(prod.id)} 
                    style={{ 
                      backgroundColor: prod.trending ? '#ffc107' : '#e0e0e0', 
                      color: prod.trending ? '#000' : '#666', 
                      border: 'none', 
                      padding: '6px 12px', 
                      borderRadius: '20px', 
                      cursor: 'pointer',
                      fontWeight: 'bold',
                      fontSize: '0.8rem',
                      transition: '0.3s'
                    }}
                  >
                    {prod.trending ? '⭐ Trending' : 'Set Trending'}
                  </button>
                </td>

                <td style={{ padding: '12px', textAlign: 'right', gap: '10px' }}>
                  <button onClick={() => handleEdit(prod)} style={{ backgroundColor: '#2874f0', color: 'white', border: 'none', padding: '6px 15px', borderRadius: '4px', cursor: 'pointer', marginRight: '5px' }}>Edit</button>
                  <button onClick={() => handleDelete(prod.id, prod.name)} style={{ backgroundColor: '#ff4d4f', color: 'white', border: 'none', padding: '6px 15px', borderRadius: '4px', cursor: 'pointer' }}>Delete</button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default AdminDashboard;