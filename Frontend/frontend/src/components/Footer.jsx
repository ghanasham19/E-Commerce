import styles from './Footer.module.css'; // Import the CSS module

const Footer = () => {
  return (
    <footer className={styles.footer}>
      <p>&copy; {new Date().getFullYear()} CustomPrint Shop. All rights reserved.</p>
    </footer>
  );
};

export default Footer;