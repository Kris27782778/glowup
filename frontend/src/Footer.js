function Footer() {
  return (
    <footer style={styles.footer}>
      <p style={styles.text}>© 2025 Glow Up｜輔大美妝交流平台</p>
    </footer>
  );
}

const styles = {
  footer: {
    backgroundColor: '#1a1a1a',
    color: '#ffffff',
    textAlign: 'center',
    padding: '24px',
  },
  text: {
    margin: 0,
    fontSize: '14px',
    letterSpacing: '2px',
  },
};

export default Footer;