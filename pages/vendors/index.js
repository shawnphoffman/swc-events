import { memo } from 'react'
import VendorProvider from 'context/VendorContext'
import FavoriteVendorsProvider from 'context/FavoriteVendorsContext'
import VendorList from 'components/vendors/VendorList'

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
