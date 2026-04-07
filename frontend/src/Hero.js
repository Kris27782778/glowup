function Hero() {
  return (
    <div style={styles.hero}>
      <h1 style={styles.title}>Glow Up</h1>
      <hr style={styles.line} />
      <p style={styles.subtitle}>輔大美妝交流平台</p>
      <p style={styles.enter}>CLICK TO ENTER</p>
    </div>
  );
}

const styles = {
  hero: {
    backgroundColor: '#f4b8b8',
    height: '80vh',
    display: 'flex',
    flexDirection: 'column',
    justifyContent: 'center',
    alignItems: 'center',
  },
  title: {
    fontSize: '96px',
    fontFamily: 'serif',
    margin: '0',
  },
  line: {
    width: '500px',
    borderColor: '#1a1a1a',
  },
  subtitle: {
    fontSize: '24px',
    letterSpacing: '4px',
    margin: '16px 0',
  },
  enter: {
    fontSize: '14px',
    letterSpacing: '6px',
    marginTop: '32px',
    cursor: 'pointer',
  },
};

export default Hero;