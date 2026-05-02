import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import api from '../services/api';
import styles from './ProductDetails.module.css';

const ProductDetails = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [product, setProduct] = useState(null);
  const [loading, setLoading] = useState(true);

  const [parsedOptions, setParsedOptions] = useState([]);
  const [selectedOptions, setSelectedOptions] = useState({});
  const [customText, setCustomText] = useState('');
  const [designImage, setDesignImage] = useState('');

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

  const handleImageUpload = (e) => {
    const file = e.target.files[0];
    if (file) {
      if (file.size > 5 * 1024 * 1024) {
        alert("File is too large. Please upload an image smaller than 5MB.");
        e.target.value = null;
        return;
      }

      const reader = new FileReader();
      reader.onloadend = () => {
        setDesignImage(reader.result);
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
      designImage: designImage 
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

  if (loading) return <div className={styles.pageMessage}>Loading product details...</div>;
  if (!product) return <div className={styles.pageMessage}>Product not found</div>;

  return (
    <div className={styles.pageContainer}>
      
      {/* New Back Button */}
      <button onClick={() => navigate('/')} className={styles.backButton}>
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <line x1="19" y1="12" x2="5" y2="12"></line>
          <polyline points="12 19 5 12 12 5"></polyline>
        </svg>
        Back to Home
      </button>

      <div className={styles.grid}>
        
        {/* Left Side: Product Image */}
        <div className={styles.imageGallery}>
          <div className={styles.mainImageWrapper}>
            <img src={product.image} alt={product.name} className={styles.productImage} />
          </div>
        </div>
        
        {/* Right Side: Product Details & Form */}
        <div className={styles.productInfo}>
          <div className={styles.header}>
            <h1 className={styles.title}>{product.name}</h1>
            <p className={styles.price}>₹{product.price.toFixed(2)}</p>
          </div>
          
          <p className={styles.description}>{product.description}</p>

          <div className={styles.optionsDivider} />

          <div className={styles.formSection}>
            {parsedOptions.length > 0 && parsedOptions.map((option, index) => (
              <div key={index} className={styles.inputGroup}>
                <label className={styles.label}>{option.name}</label>
                <div className={styles.selectWrapper}>
                  <select 
                    className={styles.selectInput}
                    value={selectedOptions[option.name] || ''} 
                    onChange={(e) => handleOptionChange(option.name, e.target.value)}
                  >
                    {option.values.map((val, i) => (
                      <option key={i} value={val}>{val}</option>
                    ))}
                  </select>
                  <svg className={styles.selectArrow} width="12" height="8" viewBox="0 0 12 8" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <path d="M1 1.5L6 6.5L11 1.5" stroke="#1A1A1A" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                  </svg>
                </div>
              </div>
            ))}

            <div className={styles.inputGroup}>
              <label className={styles.label}>Custom Text (Optional)</label>
              <input 
                className={styles.textInput}
                type="text" 
                placeholder="e.g., Happy Birthday" 
                value={customText}
                onChange={(e) => setCustomText(e.target.value)}
              />
            </div>

            <div className={styles.inputGroup}>
              <label className={styles.label}>Custom Design (Optional)</label>
              
              {!designImage ? (
                <div className={styles.uploadDropzone}>
                  <input 
                    type="file" 
                    accept="image/*"
                    onChange={handleImageUpload}
                    className={styles.hiddenFileInput}
                    id="file-upload"
                  />
                  <label htmlFor="file-upload" className={styles.dropzoneContent}>
                    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={styles.uploadIcon}>
                      <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"></path>
                      <polyline points="17 8 12 3 7 8"></polyline>
                      <line x1="12" y1="3" x2="12" y2="15"></line>
                    </svg>
                    <span className={styles.uploadText}>Click to upload an image</span>
                    <span className={styles.uploadSubtext}>Max file size: 5MB</span>
                  </label>
                </div>
              ) : (
                <div className={styles.uploadPreview}>
                  <img src={designImage} alt="Preview" className={styles.previewImage} />
                  <div className={styles.previewDetails}>
                    <span className={styles.successBadge}>Image Attached</span>
                    <button onClick={() => setDesignImage('')} className={styles.removeBtn}>
                      Remove image
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>

          <button className={styles.addToCartBtn} onClick={handleAddToCart}>
            Add to Cart
          </button>
        </div>
      </div>
    </div>
  );
};

export default ProductDetails;