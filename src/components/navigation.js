import React from 'react'
import { Link } from 'gatsby'

import * as styles from './navigation.module.css'

const Navigation = () => (
  <nav role="navigation" className={styles.container} aria-label="Main">
    <Link to="/" className={styles.logoLink}>
      <span className={styles.navigationItem}>Secret Atomics</span>
    </Link>
    <ul className={styles.navigation}>
      <li className={styles.navigationItem}>
        <Link to="/" activeClassName="active">
          Home
        </Link>
      </li>
      <li className={styles.navigationItem}>
        <Link to="/blog/" activeClassName="active">
          Blog
        </Link>
      </li>
      <li className={styles.navigationItem}>
        <a href="https://voxels.github.io/professional_experience_08082022" target="_blank">iOS Development</a>
      </li>
      <li className={styles.navigationItem}>
        <a href="https://invertices.com" target="_blank">Unreal Engine Development</a>
      </li>
    </ul>
  </nav>
)

export default Navigation
