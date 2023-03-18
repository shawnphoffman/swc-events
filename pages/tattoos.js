import { memo } from 'react'

import TattooList from 'components/vendors/TattooList'
import VendorProvider from 'context/VendorContext'

const Page = () => {
	return (
		<VendorProvider>
			<TattooList />
		</VendorProvider>
	)
}

export default memo(Page)
