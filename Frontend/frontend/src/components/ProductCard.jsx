import { Link } from 'react-router-dom';
import styles from './ProductCard.module.css';

const ProductCard = ({ product }) => {
  return (
    <div className={styles.card}>
      {/* Image wrapper now handles the sweep/shine effect */}
      <div className={styles.imageWrapper}>
        <img 
          src={product.image || "https://via.placeholder.com/400x400?text=No+Image"} 
          alt={product.name} 
          className={styles.image} 
          loading="lazy"
        />
      </div>
      
      <div className={styles.content}>
        <h3 className={styles.title} title={product.name}>
          {product.name}
        </h3>
        
        {/* Price wrapped in a new modern pill container */}
        <div className={styles.priceContainer}>
          <span className={styles.price}>${product.price}</span>
        </div>
        
        <Link to={`/product/${product.id}`} className={styles.button}>
          <span className={styles.buttonText}>View Details</span>
          {/* Subtle arrow added purely via UI for a modern touch */}
          <svg className={styles.buttonIcon} xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <line x1="5" y1="12" x2="19" y2="12"></line>
            <polyline points="12 5 19 12 12 19"></polyline>
          </svg>
        </Link>
      </div>
    </div>
  );
};

export default ProductCard;