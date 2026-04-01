import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import api from '../services/api';
import styles from './ProductDetails.module.css';

const ProductDetails = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [product, setProduct] = useState(null);
  const [loading, setLoading] = useState(true);

  // Dynamic Options State
  const [parsedOptions, setParsedOptions] = useState([]);
  const [selectedOptions, setSelectedOptions] = useState({});
  
  // Customization State
  const [customText, setCustomText] = useState('');
  const [designImage, setDesignImage] = useState(''); // Will now hold the Base64 image data!

  useEffect(() => {
    fetchProductDetails();
  }, [id]);

  const fetchProductDetails = async () => {
    try {
      const response = await api.get(`/products/${id}`);
      const fetchedProduct = response.data;
      setProduct(fetchedProduct);
      
      if (fetchedProduct.customizationOptions) {
        try {
          const optionsArray = JSON.parse(fetchedProduct.customizationOptions);
          setParsedOptions(optionsArray);
          
          const initialSelections = {};
          optionsArray.forEach(opt => {
            if (opt.values && opt.values.length > 0) {
              initialSelections[opt.name] = opt.values[0];
            }
          });
          setSelectedOptions(initialSelections);
        } catch (e) {
          console.error("Could not parse options JSON.", e);
        }
      }
      setLoading(false);
    } catch (error) {
      console.error("Error fetching product.", error);
      setLoading(false);
    }
  };

  const handleOptionChange = (optionName, value) => {
    setSelectedOptions({ ...selectedOptions, [optionName]: value });
  };

  // --- NEW MAGIC IMAGE UPLOADER FOR USERS ---
  const handleImageUpload = (e) => {
    const file = e.target.files[0];
    if (file) {
      // Safety check: Prevent files larger than 5MB
      if (file.size > 5 * 1024 * 1024) {
        alert("File is too large. Please upload an image smaller than 5MB.");
        e.target.value = null; // Clear the input
        return;
      }

      const reader = new FileReader();
      reader.onloadend = () => {
        setDesignImage(reader.result); // Save the Base64 string to state
      };
      reader.readAsDataURL(file);
    }
  };

  const handleAddToCart = async () => {
    const userString = localStorage.getItem('user');
    if (!userString) {
      alert("Please login first to add items to your cart!");
      navigate('/login');
      return;
    }
    
    const user = JSON.parse(userString);

    const cartItemData = {
      userId: user.id,
      productId: product.id,
      quantity: 1,
      selectedOptions: JSON.stringify(selectedOptions), 
      customText: customText,
      designImage: designImage // Sending the Base64 string to the backend
    };
    
    try {
      await api.post('/cart/add', cartItemData);
      alert("Product added to cart successfully!");
      navigate('/cart');
    } catch (error) {
      console.error("Error adding to cart:", error);
      alert("Failed to add to cart.");
    }
  };

  if (loading) return <h2>Loading product details...</h2>;
  if (!product) return <h2>Product not found</h2>;

  return (
    <div className={styles.container}>
      <div className={styles.imageSection}>
        <img src={product.image} alt={product.name} className={styles.productImage} />
      </div>
      
      <div className={styles.detailsSection}>
        <h1 className={styles.title}>{product.name}</h1>
        <p className={styles.price}>₹{product.price.toFixed(2)}</p>
        <p className={styles.description}>{product.description}</p>

        {/* Dynamic Dropdowns */}
        {parsedOptions.length > 0 && parsedOptions.map((option, index) => (
          <div key={index} className={styles.formGroup}>
            <label>Select {option.name}</label>
            <select 
              value={selectedOptions[option.name] || ''} 
              onChange={(e) => handleOptionChange(option.name, e.target.value)}
            >
              {option.values.map((val, i) => (
                <option key={i} value={val}>{val}</option>
              ))}
            </select>
          </div>
        ))}

        <div className={styles.formGroup}>
          <label>Custom Text to Print (Optional)</label>
          <input 
            type="text" 
            placeholder="e.g., Happy Birthday" 
            value={customText}
            onChange={(e) => setCustomText(e.target.value)}
          />
        </div>

        {/* NEW FILE UPLOAD FIELD */}
        <div className={styles.formGroup} style={{ backgroundColor: '#f9f9f9', padding: '15px', borderRadius: '4px', border: '1px dashed #ccc' }}>
          <label>Upload Custom Design/Logo (Optional)</label>
          <input 
            type="file" 
            accept="image/*"
            onChange={handleImageUpload}
          />
          
          {/* Image Preview for the User */}
          {designImage && (
            <div style={{ marginTop: '10px' }}>
              <p style={{ color: '#388e3c', fontSize: '0.9rem', marginBottom: '5px' }}>✓ Design attached</p>
              <img src={designImage} alt="Custom Design Preview" style={{ height: '80px', borderRadius: '4px', border: '1px solid #ccc' }} />
              <button 
                onClick={() => setDesignImage('')} 
                style={{ display: 'block', marginTop: '8px', color: '#ff4d4f', background: 'none', border: 'none', cursor: 'pointer', fontWeight: 'bold' }}
              >
                Remove Image
              </button>
            </div>
          )}
        </div>

        <button className={styles.addToCartBtn} onClick={handleAddToCart}>
          ADD TO CART
        </button>
      </div>
    </div>
  );
};

export default ProductDetails;