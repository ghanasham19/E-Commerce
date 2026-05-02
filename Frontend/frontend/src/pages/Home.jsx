import { useState, useEffect, useRef } from 'react';
import { Link } from 'react-router-dom';
import api from '../services/api';
import styles from './Home.module.css';
import { useWishlist } from '../context/WishlistContext'; 

const Home = () => {
  const [allProducts, setAllProducts] = useState([]);
  const [categories, setCategories] = useState([]);
  const [trending, setTrending] = useState([]);
  const [newArrivals, setNewArrivals] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [activeCategory, setActiveCategory] = useState(null);
  const [categoryProducts, setCategoryProducts] = useState([]);

  const { toggleWishlist, isInWishlist } = useWishlist();
  const resultsRef = useRef(null);

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
    if (activeCategory?.id === category.id) {
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

  const scrollToResults = () => {
    if (resultsRef.current) {
      const yOffset = -100;
      const y = resultsRef.current.getBoundingClientRect().top + window.scrollY + yOffset;
      window.scrollTo({ top: y, behavior: 'smooth' });
    }
  };

  const handleKeyDown = (e) => {
    if (e.key === 'Enter') {
      scrollToResults();
    }
  };

  const searchedProducts = allProducts.filter(product =>
    product.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    product.description.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const renderProductGrid = (productsList) => {
    if (productsList.length === 0) return (
      <div className={styles.emptyState}>
        <p>Curating our latest designs. Please check back soon.</p>
      </div>
    );

    return (
      <div className={styles.productGrid}>
        {productsList.map((product, index) => {
          const isLiked = isInWishlist(product.id);

          return (
            <div key={product.id} className={styles.productCard} style={{ '--index': index }}>
              
              <div className={styles.imageContainer}>
                {index < 2 && <div className={styles.exclusiveBadge}>New In</div>}
                
                <button 
                  className={styles.wishlistBtn} 
                  aria-label="Toggle wishlist"
                  onClick={(e) => {
                    e.preventDefault(); 
                    toggleWishlist(product);
                  }}
                  style={{ color: isLiked ? '#ef4444' : 'currentColor' }} 
                >
                  <svg width="18" height="18" viewBox="0 0 24 24" fill={isLiked ? "currentColor" : "none"} stroke="currentColor" strokeWidth="1.5">
                    <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"></path>
                  </svg>
                </button>

                <Link to={`/product/${product.id}`}>
                  <img src={product.image} alt={product.name} className={styles.productImg} />
                </Link>
                
                <Link to={`/product/${product.id}`} className={styles.quickAddPill} aria-label="View Product">
                  <span>+ Quick Add</span>
                </Link>
              </div>
              
              <div className={styles.productDetails}>
                <div className={styles.namePriceRow}>
                  <Link to={`/product/${product.id}`} className={styles.pName}>{product.name}</Link>
                  <span className={styles.pPrice}>₹{product.price.toLocaleString()}</span>
                </div>
                
                <div className={styles.cardFooter}>
                  <p className={styles.pMeta} title={product.description}>
                    {product.description 
                      ? (product.description.length > 40 ? `${product.description.substring(0, 40)}...` : product.description) 
                      : 'Premium Collection'}
                  </p>
                  
                  <div className={styles.colorSwatches}>
                    <span className={styles.swatch} style={{ backgroundColor: '#0f172a' }}></span>
                    <span className={styles.swatch} style={{ backgroundColor: '#e2e8f0' }}></span>
                    <span className={styles.swatch} style={{ backgroundColor: '#d4a373' }}></span>
                  </div>
                </div>
              </div>
              
            </div>
          );
        })}
      </div>
    );
  };

  if (loading) return (
    <div className={styles.loaderContainer}>
      <div className={styles.loadingPulse}></div>
      <span>ESTABLISHING ELEGANCE</span>
    </div>
  );

  return (
    <div className={styles.pageWrapper}>
      <section className={styles.heroSection}>
        <div className={styles.heroGrid}>
          <div className={styles.heroContent}>
            
            {/* --- NEW: Editorial Metadata --- */}
            <div className={styles.heroTopMeta}>
              <span className={styles.metaText}>EST. 2025</span>
              <span className={styles.metaDivider}></span>
              <span className={styles.metaText}>PUNE, MAHARASHTRA</span>
            </div>

            <span className={styles.heroBadge}>New Season Launch</span>
            <h1 className={styles.heroTitle}>
              Style in its <br />
              <span className={styles.serifText}>Purest</span> Form.
            </h1>
            <p className={styles.heroSubtitle}>
              Experience a meticulously curated collection where modern aesthetics
              meet timeless craftsmanship.
            </p>

            {/* --- NEW: Trust Indicator --- */}
            <div className={styles.trustIndicator}>
              <div className={styles.stars}>
                <svg width="14" height="14" viewBox="0 0 24 24" fill="#cda434" stroke="#cda434"><polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"></polygon></svg>
                <svg width="14" height="14" viewBox="0 0 24 24" fill="#cda434" stroke="#cda434"><polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"></polygon></svg>
                <svg width="14" height="14" viewBox="0 0 24 24" fill="#cda434" stroke="#cda434"><polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"></polygon></svg>
                <svg width="14" height="14" viewBox="0 0 24 24" fill="#cda434" stroke="#cda434"><polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"></polygon></svg>
                <svg width="14" height="14" viewBox="0 0 24 24" fill="#cda434" stroke="#cda434"><polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"></polygon></svg>
              </div>
              <span className={styles.trustText}>Loved by 5,000+ customers</span>
            </div>

            <div className={styles.searchBarBox}>
              <input
                type="text"
                placeholder="Search collection..."
                className={styles.searchInp}
                value={searchQuery}
                onChange={handleSearch}
                onKeyDown={handleKeyDown} 
              />
              <div className={styles.searchBtnInner} onClick={scrollToResults}>
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                  <circle cx="11" cy="11" r="8" /><path d="m21 21-4.3-4.3" />
                </svg>
              </div>
            </div>
          </div>

          <div className={styles.heroImageWrapper}>
            <img
              src="https://images.unsplash.com/photo-1523381210434-271e8be1f52b?auto=format&fit=crop&q=80&w=1000"
              alt="Model"
              className={styles.heroImg}
            />
            <div className={styles.imageFloatingCard}>
              <span>Est. 2025</span>
              <p>Premium Quality</p>
            </div>
          </div>
        </div>
      </section>

      <nav className={styles.categoryNavSticky}>
        <div className={styles.navContainer}>
          <div className={styles.navTrack}>
            <button 
              onClick={() => {setActiveCategory(null); setSearchQuery('');}} 
              className={`${styles.navLink} ${!activeCategory && !searchQuery ? styles.navActive : ''}`}
            >
              All Pieces
            </button>
            {categories.map(cat => (
              <button 
                key={cat.id} 
                onClick={() => handleCategoryClick(cat)} 
                className={`${styles.navLink} ${activeCategory?.id === cat.id ? styles.navActive : ''}`}
              >
                {cat.name}
              </button>
            ))}
          </div>
        </div>
      </nav>

      <main className={styles.mainContent} ref={resultsRef}>
        {searchQuery ? (
          <section className={styles.contentSection}>
            <h2 className={styles.sectionHeading}>Search Results</h2>
            {renderProductGrid(searchedProducts)}
          </section>
        ) : activeCategory ? (
          <section className={styles.contentSection}>
            <h2 className={styles.sectionHeading}>{activeCategory.name}</h2>
            {renderProductGrid(categoryProducts)}
          </section>
        ) : (
          <>
            <section className={styles.contentSection}>
              <div className={styles.sectionTitleRow}>
                <h2 className={styles.sectionHeading}>Trending Now</h2>
                <Link to="/trending" className={styles.textLink}>Explore All</Link>
              </div>
              {renderProductGrid(trending)}
            </section>

            <section className={styles.contentSection}>
              <div className={styles.sectionTitleRow}>
                <h2 className={styles.sectionHeading}>New Arrivals</h2>
                <Link to="/new" className={styles.textLink}>Explore All</Link>
              </div>
              {renderProductGrid(newArrivals)}
            </section>
          </>
        )}
      </main>
    </div>
  );
};

export default Home;