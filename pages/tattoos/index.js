import { memo } from 'react'
import VendorProvider from 'context/VendorContext'
import TattooList from 'components/vendors/TattooList'

const Page = () => {
	return (
		<VendorProvider>
			<TattooList />
		</VendorProvider>
	)
}

export default memo(Page)
