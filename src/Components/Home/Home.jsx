import { Link } from 'react-router-dom';
import styles from './Home.module.css';

function Home() {
    return (
        <div className={styles.container}>
            <div className={styles.containerOption}>
                <Link to="/create" className={styles.option}>
                    <span style={{ fontSize: '2rem', marginBottom: '10px' }}>➕</span>
                    Create Mondai
                </Link>
                
                <Link to="/list" className={styles.option}>
                    <span style={{ fontSize: '2rem', marginBottom: '10px' }}>📋</span>
                    List Mondai
                </Link>
            </div>
        </div>
    );
}

export default Home;