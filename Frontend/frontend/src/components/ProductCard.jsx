import { Link } from 'react-router-dom';
import styles from './ProductCard.module.css';

const ProductCard = ({ product }) => {
  return (
    <div className={styles.card}>
      {/* If the product has no image, we show a grey placeholder box */}
      <img 
        src={product.image || "https://via.placeholder.com/250"} 
        alt={product.name} 
        className={styles.image} 
      />
      <div className={styles.content}>
        <h3 className={styles.title}>{product.name}</h3>
        <p className={styles.price}>${product.price}</p>
        <Link to={`/product/${product.id}`} className={styles.button}>
          View Details
        </Link>
      </div>
    </div>
  );
};

export default ProductCard;