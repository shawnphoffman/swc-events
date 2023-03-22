import { memo, useEffect, useState } from 'react'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { styled } from 'linaria/react'
import Link from 'next/link'
import { useRouter } from 'next/router'

import AuthNavIcon from 'components/auth/AuthNavIcon'
import { NavIcon } from 'components/styles'
import { NavRoutes } from 'config/routes'

const Nav = styled.div`
	margin: 16px 8px 8px 8px;
	flex-direction: row;
	align-items: center;
	justify-content: center;
	flex-wrap: wrap;
	display: flex;

	@media print {
		display: none;
		background: none;
		border: none;
	}
`

const TempIcon = ({ children }) => {
	const [mounted, setMounted] = useState(false)

	useEffect(() => {
		setMounted(true)
	}, [])

	return mounted ? children : null
}

const NavBar = () => {
	const router = useRouter()
	return (
		<Nav id="nav">
			{NavRoutes.map(r => (
				<Link href={r.path} key={r.title}>
					<NavIcon className={router.asPath === r.path ? 'active' : ''} title={r.title}>
						<TempIcon>
							<FontAwesomeIcon icon={`fa-sharp fa-solid ${r.icon}`} />
						</TempIcon>
					</NavIcon>
				</Link>
			))}
			<AuthNavIcon />
		</Nav>
	)
}

export default memo(NavBar)
