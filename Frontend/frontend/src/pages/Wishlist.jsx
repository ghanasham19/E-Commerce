import { Link } from 'react-router-dom';
import { useWishlist } from '../context/WishlistContext';
import homeStyles from './Home.module.css'; // Importing your beautiful home styles

const Wishlist = () => {
  const { wishlist, toggleWishlist } = useWishlist();

  if (wishlist.length === 0) {
    return (
      <div className={homeStyles.pageWrapper} style={{ textAlign: 'center', padding: '100px 20px', minHeight: '60vh', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center' }}>
        <h2 className={homeStyles.sectionHeading}>Your Wishlist is Empty</h2>
        <p style={{ color: '#6b7280', marginBottom: '30px' }}>You haven't saved any items yet.</p>
        <Link to="/" className={homeStyles.loginBtn} style={{ display: 'inline-block' }}>
          Discover Collection
        </Link>
      </div>
    );
  }

  return (
    <div className={homeStyles.pageWrapper}>
      <main className={homeStyles.mainContent}>
        <section className={homeStyles.contentSection}>
          <h2 className={homeStyles.sectionHeading}>Your Curated Favorites</h2>
          
          <div className={homeStyles.productGrid}>
            {wishlist.map((product, index) => (
              <div key={product.id} className={homeStyles.productCard} style={{ '--index': index }}>
                
                <div className={homeStyles.imageContainer}>
                  {/* Remove Button (Solid Red Heart) */}
                  <button 
                    className={homeStyles.wishlistBtn} 
                    onClick={(e) => {
                      e.preventDefault(); // Prevents the image link underneath from triggering
                      toggleWishlist(product);
                    }}
                    style={{ color: '#ef4444' }}
                    title="Remove from wishlist"
                  >
                    <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor" stroke="currentColor" strokeWidth="1.5">
                      <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"></path>
                    </svg>
                  </button>

                  <Link to={`/product/${product.id}`}>
                    <img src={product.image} alt={product.name} className={homeStyles.productImg} />
                  </Link>

                  {/* Restored the Quick Add Hover Pill */}
                  <Link to={`/product/${product.id}`} className={homeStyles.quickAddPill} aria-label="View Product">
                    <span>+ Quick Add</span>
                  </Link>
                </div>
                
                <div className={homeStyles.productDetails}>
                  <div className={homeStyles.namePriceRow}>
                    <Link to={`/product/${product.id}`} className={homeStyles.pName}>{product.name}</Link>
                    <span className={homeStyles.pPrice}>₹{product.price.toLocaleString()}</span>
                  </div>
                  
                  {/* Restored the Card Footer (Description & Color Swatches) */}
                  <div className={homeStyles.cardFooter}>
                    <p className={homeStyles.pMeta} title={product.description}>
                      {product.description 
                        ? (product.description.length > 40 ? `${product.description.substring(0, 40)}...` : product.description) 
                        : 'Premium Collection'}
                    </p>
                    
                    <div className={homeStyles.colorSwatches}>
                      <span className={homeStyles.swatch} style={{ backgroundColor: '#0f172a' }}></span>
                      <span className={homeStyles.swatch} style={{ backgroundColor: '#e2e8f0' }}></span>
                      <span className={homeStyles.swatch} style={{ backgroundColor: '#d4a373' }}></span>
                    </div>
                  </div>
                </div>

              </div>
            ))}
          </div>

        </section>
      </main>
    </div>
  );
};

export default Wishlist;