import { useState, useEffect } from 'react';
import api from '../services/api';
import styles from './AdminDashboard.module.css';

const AdminDashboard = () => {
  const [success, setSuccess] = useState('');
  const [products, setProducts] = useState([]); 
  const [categories, setCategories] = useState([]); 
  const [editingId, setEditingId] = useState(null); 
  
  const [productData, setProductData] = useState({ name: '', description: '', price: '', image: '', categoryId: '' });
  const [optionsBuilder, setOptionsBuilder] = useState([{ name: 'Size', values: 'S, M, L' }]);
  
  const [newCategoryName, setNewCategoryName] = useState('');

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

  const handleCreateCategory = async (e) => {
    e.preventDefault();
    if (!newCategoryName.trim()) return;
    try {
      await api.post('/categories/create', { name: newCategoryName });
      setNewCategoryName('');
      fetchCategories(); 
      setSuccess(`Category "${newCategoryName}" created successfully!`);
      setTimeout(() => setSuccess(''), 3000);
    } catch (error) {
      console.error("Error creating category:", error);
      alert("Failed to create category.");
    }
  };

  const handleToggleTrending = async (id) => {
    try {
      await api.put(`/products/admin/${id}/toggle-trending`);
      fetchProducts(); 
    } catch (error) {
      console.error("Error toggling trending status:", error);
      alert("Failed to update trending status.");
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const formattedOptions = optionsBuilder.filter(opt => opt.name.trim() !== '')
      .map(opt => ({ name: opt.name, values: opt.values.split(',').map(val => val.trim()).filter(val => val !== '') }));

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
      
      setProductData({ name: '', description: '', price: '', image: '', categoryId: '' });
      setOptionsBuilder([{ name: '', values: '' }]);
      setEditingId(null);
      fetchProducts(); 
      setTimeout(() => setSuccess(''), 3000);
      window.scrollTo({ top: 0, behavior: 'smooth' }); 
    } catch (error) {
      console.error("Error saving product:", error);
      alert("Failed to save product.");
    }
  };

  const handleEdit = (prod) => {
    setEditingId(prod.id);
    setProductData({ 
      name: prod.name, 
      description: prod.description, 
      price: prod.price, 
      image: '',
      categoryId: prod.category ? prod.category.id : '' 
    }); 
    
    if (prod.customizationOptions) {
      const parsed = JSON.parse(prod.customizationOptions);
      setOptionsBuilder(parsed.map(opt => ({ name: opt.name, values: opt.values.join(', ') })));
    }
    window.scrollTo({ top: 0, behavior: 'smooth' }); 
  };

  const handleDelete = async (id, name) => {
    if (!window.confirm(`Are you absolutely sure you want to delete "${name}"?`)) return;
    try {
     await api.delete(`/admin/products/${id}`);
      fetchProducts(); 
      setSuccess(`Product deleted!`);
      setTimeout(() => setSuccess(''), 3000);
    } catch (error) {
      alert("Cannot delete this product. It is likely already attached to a customer's order history!");
    }
  };

  return (
    <div className={styles.adminContainer}>
      
      <div className={styles.header}>
        <div>
          <h1 className={styles.title}>Inventory Console</h1>
          <p className={styles.subtitle}>Manage your products, categories, and storefront visibility.</p>
        </div>
        <div className={styles.metricsGroup}>
          <div className={styles.metricBadge}>
            <span className={styles.metricValue}>{products.length}</span>
            <span className={styles.metricLabel}>Active Products</span>
          </div>
          <div className={styles.metricBadge}>
            <span className={styles.metricValue}>{categories.length}</span>
            <span className={styles.metricLabel}>Categories</span>
          </div>
        </div>
      </div>

      {success && (
        <div className={styles.successAlert}>
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"></path>
            <polyline points="22 4 12 14.01 9 11.01"></polyline>
          </svg>
          {success}
        </div>
      )}

      <div className={styles.topGrid}>
        
        {/* Category Creation Card */}
        <div className={styles.dashboardCard}>
          <div className={styles.cardHeader}>
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M22 19a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h5l2 3h9a2 2 0 0 1 2 2z"></path>
            </svg>
            <h2>New Category</h2>
          </div>
          <form onSubmit={handleCreateCategory} className={styles.inlineForm}>
            <input 
              type="text" 
              placeholder="e.g., Hoodies, Mugs" 
              value={newCategoryName} 
              onChange={(e) => setNewCategoryName(e.target.value)} 
              className={styles.input}
              required 
            />
            <button type="submit" className={styles.secondaryBtn}>Add</button>
          </form>
        </div>

        {/* UPGRADED: Product Creation/Edit Card */}
        <div className={`${styles.dashboardCard} ${styles.spanFull}`}>
          <div className={styles.cardHeaderLarge}>
            <div>
              <h2>{editingId ? 'Edit Product Configuration' : 'Create New Product'}</h2>
              <p>Add all the details, media, and variants for your product here.</p>
            </div>
            {editingId && (
              <span className={styles.editingBadge}>Editing Mode</span>
            )}
          </div>

          <form onSubmit={handleSubmit} className={styles.modernForm}>
            
            {/* Block 1: Basic Details */}
            <div className={styles.formBlock}>
              <div className={styles.blockHeader}>
                <div className={styles.blockIcon}>1</div>
                <h3>Basic Details</h3>
              </div>
              <div className={styles.formGrid}>
                <div className={styles.formGroup}>
                  <label className={styles.label}>Product Name</label>
                  <input type="text" name="name" className={styles.input} placeholder="e.g., Premium Cotton Tee" value={productData.name} onChange={handleChange} required />
                </div>

                <div className={styles.formGroup}>
                  <label className={styles.label}>Price (₹)</label>
                  <input type="number" step="0.01" name="price" className={styles.input} placeholder="0.00" value={productData.price} onChange={handleChange} required />
                </div>

                <div className={styles.formGroup}>
                  <label className={styles.label}>Category</label>
                  <div className={styles.selectWrapper}>
                    <select name="categoryId" className={styles.selectInput} value={productData.categoryId} onChange={handleChange} required>
                      <option value="">-- Select Category --</option>
                      {categories.map(cat => (
                        <option key={cat.id} value={cat.id}>{cat.name}</option>
                      ))}
                    </select>
                    <svg className={styles.selectArrow} width="10" height="6" viewBox="0 0 10 6" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                      <polyline points="1 1 5 5 9 1"></polyline>
                    </svg>
                  </div>
                </div>

                <div className={`${styles.formGroup} ${styles.fullWidth}`}>
                  <label className={styles.label}>Product Description</label>
                  <textarea name="description" className={styles.textarea} placeholder="Describe the product features, material, and fit..." value={productData.description} onChange={handleChange} rows="3" required />
                </div>
              </div>
            </div>

            {/* Block 2: Media Upload */}
            <div className={styles.formBlock}>
              <div className={styles.blockHeader}>
                <div className={styles.blockIcon}>2</div>
                <h3>Product Media</h3>
              </div>
              <div className={styles.formGroup}>
                <div className={styles.uploadArea}>
                  <input type="file" accept="image/*" onChange={handleImageUpload} className={styles.fileInput} required={!editingId && !productData.image} id="prod-img" />
                  <label htmlFor="prod-img" className={`${styles.uploadContent} ${productData.image ? styles.hasImage : ''}`}>
                    {productData.image ? (
                      <div className={styles.previewWrapper}>
                        <img src={productData.image} alt="Preview" className={styles.uploadPreview} />
                        <div className={styles.uploadTextGroup}>
                          <span className={styles.uploadSuccessText}>Image successfully attached!</span>
                          <span className={styles.uploadSubText}>Click or drag to replace with a new image.</span>
                        </div>
                      </div>
                    ) : (
                      <div className={styles.uploadPlaceholder}>
                        <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                          <rect x="3" y="3" width="18" height="18" rx="2" ry="2"></rect>
                          <circle cx="8.5" cy="8.5" r="1.5"></circle>
                          <polyline points="21 15 16 10 5 21"></polyline>
                        </svg>
                        <span className={styles.uploadMainText}>Click to upload a high-resolution image</span>
                        <span className={styles.uploadSubText}>PNG, JPG, or WEBP (Max 5MB)</span>
                      </div>
                    )}
                  </label>
                </div>
              </div>
            </div>

            {/* Block 3: Options Builder */}
            <div className={styles.formBlock}>
              <div className={styles.blockHeader}>
                <div className={styles.blockIcon}>3</div>
                <h3>Variants & Options</h3>
              </div>
              <p className={styles.blockDescription}>Allow customers to choose sizes, colors, or materials.</p>
              
              <div className={styles.optionsList}>
                {optionsBuilder.map((option, index) => (
                  <div key={index} className={styles.optionRowCard}>
                    <div className={styles.optionInputs}>
                      <div className={styles.formGroup}>
                        <label className={styles.label}>Option Name</label>
                        <input type="text" className={styles.input} placeholder="e.g., Size" value={option.name} onChange={(e) => handleOptionChange(index, 'name', e.target.value)} />
                      </div>
                      <div className={styles.formGroup}>
                        <label className={styles.label}>Values (Comma separated)</label>
                        <input type="text" className={styles.input} placeholder="e.g., S, M, L, XL" value={option.values} onChange={(e) => handleOptionChange(index, 'values', e.target.value)} />
                      </div>
                    </div>
                    <button type="button" onClick={() => handleRemoveOptionRow(index)} className={styles.removeOptionBtn} title="Remove Variant">
                      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                        <line x1="18" y1="6" x2="6" y2="18"></line>
                        <line x1="6" y1="6" x2="18" y2="18"></line>
                      </svg>
                    </button>
                  </div>
                ))}
                <button type="button" onClick={handleAddOptionRow} className={styles.addOptionBtn}>
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <line x1="12" y1="5" x2="12" y2="19"></line>
                    <line x1="5" y1="12" x2="19" y2="12"></line>
                  </svg>
                  Add Another Variant
                </button>
              </div>
            </div>

            {/* Form Footer Action Bar */}
            <div className={styles.formFooter}>
              {editingId && (
                <button type="button" onClick={() => { setEditingId(null); setProductData({ name: '', description: '', price: '', image: '', categoryId: '' }); }} className={styles.cancelBtn}>
                  Cancel Editing
                </button>
              )}
              <button type="submit" className={`${styles.primaryBtn} ${editingId ? styles.updateBtn : ''} ${styles.massiveSubmitBtn}`}>
                {editingId ? 'Save Changes to Product' : 'Publish Product to Store'}
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <line x1="5" y1="12" x2="19" y2="12"></line>
                  <polyline points="12 5 19 12 12 19"></polyline>
                </svg>
              </button>
            </div>
          </form>
        </div>
      </div>

      {/* --- INVENTORY TABLE --- */}
      <div className={styles.dashboardCard} style={{ marginTop: '32px' }}>
        <div className={styles.cardHeader} style={{ marginBottom: '24px' }}>
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <line x1="8" y1="6" x2="21" y2="6"></line>
            <line x1="8" y1="12" x2="21" y2="12"></line>
            <line x1="8" y1="18" x2="21" y2="18"></line>
            <line x1="3" y1="6" x2="3.01" y2="6"></line>
            <line x1="3" y1="12" x2="3.01" y2="12"></line>
            <line x1="3" y1="18" x2="3.01" y2="18"></line>
          </svg>
          <h2>Manage Inventory</h2>
        </div>

        <div className={styles.tableWrapper}>
          <table className={styles.dataTable}>
            <thead>
              <tr>
                <th>Image</th>
                <th>Product Name</th>
                <th>Category</th>
                <th className={styles.textCenter}>Visibility</th>
                <th className={styles.textRight}>Actions</th>
              </tr>
            </thead>
            <tbody>
              {products.map(prod => (
                <tr key={prod.id} className={styles.dataRow}>
                  <td>
                    <div className={styles.tableImageWrapper}>
                      <img src={prod.image} alt="Product" className={styles.tableImage} />
                    </div>
                  </td>
                  
                  <td>
                    <div className={styles.productCell}>
                      <span className={styles.fontBold}>{prod.name}</span>
                      <span className={styles.priceCell}>₹{prod.price.toFixed(2)}</span>
                    </div>
                  </td>
                  
                  <td className={styles.textMuted}>
                    {prod.category ? prod.category.name : <span className={styles.errorText}>Uncategorized</span>}
                  </td>
                  
                  <td className={styles.textCenter}>
                    <button 
                      onClick={() => handleToggleTrending(prod.id)} 
                      className={`${styles.trendingToggle} ${prod.trending ? styles.trendingActive : ''}`}
                    >
                      {prod.trending ? (
                        <><span className={styles.starIcon}>★</span> Trending</>
                      ) : (
                        'Set Trending'
                      )}
                    </button>
                  </td>

                  <td>
                    <div className={styles.actionGroup}>
                      <button onClick={() => handleEdit(prod)} className={styles.iconBtn} title="Edit Product">
                        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                          <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"></path>
                          <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"></path>
                        </svg>
                      </button>
                      <button onClick={() => handleDelete(prod.id, prod.name)} className={`${styles.iconBtn} ${styles.deleteBtn}`} title="Delete Product">
                        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                          <polyline points="3 6 5 6 21 6"></polyline>
                          <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path>
                        </svg>
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default AdminDashboard;