import { memo } from 'react'
import styles from './index.module.css'

const Page = () => {
	return (
		<div>
			<h1>Search</h1>
			<div className={styles.button}>TEST</div>
			<div className={styles.greenButton}>TEST</div>
		</div>
	)
}

export default memo(Page)
