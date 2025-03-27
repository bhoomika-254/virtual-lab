import React from 'react';
import '../styles/footer.css';

function Footer() {
  return (
    <footer className="footer">
      <div className="footer-content">
        <p>© {new Date().getFullYear()} VirtualLab - Making science accessible</p>
        <p>A project for educational purposes</p>
      </div>
    </footer>
  );
}

export default Footer;