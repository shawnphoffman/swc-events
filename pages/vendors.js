import { memo } from 'react'

import VendorList from 'components/vendors/VendorList'
import FavoriteVendorsProvider from 'context/FavoriteVendorsContext'
import VendorProvider from 'context/VendorContext'

const Page = () => {
	return (
		<VendorProvider>
			<FavoriteVendorsProvider>
				<VendorList />
			</FavoriteVendorsProvider>
		</VendorProvider>
	)
}

export default memo(Page)
