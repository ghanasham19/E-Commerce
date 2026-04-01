import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import api from '../services/api';
import styles from './Home.module.css';

const Home = () => {
  const [allProducts, setAllProducts] = useState([]);
  const [categories, setCategories] = useState([]);
  const [trending, setTrending] = useState([]);
  const [newArrivals, setNewArrivals] = useState([]);
  
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [activeCategory, setActiveCategory] = useState(null);
  const [categoryProducts, setCategoryProducts] = useState([]);

  useEffect(() => {
    const fetchHomeData = async () => {
      try {
        const [prodRes, catRes, trendRes, newRes] = await Promise.all([
          api.get('/products'),
          api.get('/categories'),
          api.get('/products/trending'),
          api.get('/products/new-arrivals')
        ]);
        
        setAllProducts(prodRes.data);
        setCategories(catRes.data);
        setTrending(trendRes.data);
        setNewArrivals(newRes.data);
        setLoading(false);
      } catch (error) {
        console.error("Error fetching homepage data", error);
        setLoading(false);
      }
    };

    fetchHomeData();
  }, []);

  const handleCategoryClick = async (category) => {
    if (activeCategory && activeCategory.id === category.id) {
      setActiveCategory(null);
    } else {
      setActiveCategory(category);
      setSearchQuery('');
      try {
        const response = await api.get(`/products/category/${category.id}`);
        setCategoryProducts(response.data);
      } catch (error) {
        console.error("Error fetching category products:", error);
      }
    }
  };

  const handleSearch = (e) => {
    setSearchQuery(e.target.value);
    if (activeCategory) setActiveCategory(null);
  };

  const searchedProducts = allProducts.filter(product => 
    product.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    product.description.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const renderProductGrid = (productsList) => {
    if (productsList.length === 0) {
      return (
        <div className={styles.emptyState}>
          <p>No products available in this section.</p>
        </div>
      );
    }
    return (
      <div className={styles.productGrid}>
        {/* NEW: We grab the 'index' to create a staggered waterfall animation */}
        {productsList.map((product, index) => (
          <Link 
            to={`/product/${product.id}`} 
            key={product.id} 
            className={styles.productCard}
            style={{ animationDelay: `${index * 0.08}s` }} 
          >
            <div className={styles.productImageContainer}>
              <img src={product.image} alt={product.name} className={styles.productImage} />
            </div>
            <div className={styles.productInfo}>
              <div className={styles.productHeader}>
                <h3 className={styles.productName}>{product.name}</h3>
                <p className={styles.productPrice}>₹{product.price.toFixed(2)}</p>
              </div>
              <p className={styles.productDesc}>
                {product.description?.substring(0, 50)}...
              </p>
              <div className={styles.viewBtn}>Customize Design</div>
            </div>
          </Link>
        ))}
      </div>
    );
  };

  if (loading) return (
    <div className={styles.loaderContainer}>
      <div className={styles.spinner}></div>
      <h2 className={styles.loaderText}>Loading Collection</h2>
    </div>
  );

  return (
    <div className={styles.homeContainer}>
      
      {/* Sleek, Animated Hero Section */}
      <div className={styles.heroSection}>
        <div className={styles.heroContent}>
          <h1 className={styles.heroTitle}>Create Your Signature Look</h1>
          <p className={styles.heroSubtitle}>Premium custom printing for your brand, business, or personal style.</p>
          
          <div className={styles.searchWrapper}>
            <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={styles.searchIcon}>
              <circle cx="11" cy="11" r="8"></circle>
              <line x1="21" y1="21" x2="16.65" y2="16.65"></line>
            </svg>
            <input 
              type="text" 
              placeholder="Search products, designs, categories..." 
              className={styles.searchInput}
              value={searchQuery}
              onChange={handleSearch}
            />
          </div>
        </div>
      </div>

      <div className={styles.mainLayout}>
        
        {/* Minimalist Category Tabs */}
        {categories.length > 0 && (
          <div className={styles.categoryNavigation}>
            <button 
              onClick={() => {setActiveCategory(null); setSearchQuery('');}}
              className={`${styles.categoryTab} ${!activeCategory && !searchQuery ? styles.activeTab : ''}`}
            >
              All Products
            </button>
            {categories.map(cat => (
              <button 
                key={cat.id} 
                onClick={() => handleCategoryClick(cat)}
                className={`${styles.categoryTab} ${activeCategory?.id === cat.id ? styles.activeTab : ''}`}
              >
                {cat.name}
              </button>
            ))}
          </div>
        )}

        {/* Dynamic Content Area */}
        <div className={styles.contentArea}>
          {searchQuery ? (
            <div className={styles.sectionBlock}>
              <h2 className={styles.sectionTitle}>SEARCH RESULTS FOR "{searchQuery.toUpperCase()}"</h2>
              {renderProductGrid(searchedProducts)}
            </div>
          ) : 
          activeCategory ? (
            <div className={styles.sectionBlock}>
              <h2 className={styles.sectionTitle}>{activeCategory.name.toUpperCase()} COLLECTION</h2>
              {renderProductGrid(categoryProducts)}
            </div>
          ) : (
            <>
              {trending.length > 0 && (
                <div className={styles.sectionBlock}>
                  <h2 className={styles.sectionTitle}>TRENDING NOW</h2>
                  {renderProductGrid(trending)}
                </div>
              )}

              <div className={styles.sectionBlock}>
                <h2 className={styles.sectionTitle}>NEW ARRIVALS</h2>
                {renderProductGrid(newArrivals)}
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
};

export default Home;