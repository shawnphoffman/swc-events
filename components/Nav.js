import { memo } from 'react'
import { styled } from 'linaria/react'
import Link from 'next/link'
import { useRouter } from 'next/router'

import AuthNavIcon from 'components/auth/AuthNavIcon'
import { NavIcon } from 'components/styles'
import { NavRoutes } from 'config/routes'

const Nav = styled.div`
	margin: 16px 8px;
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

const NavBar = () => {
	const router = useRouter()
	return (
		<Nav id="nav">
			{NavRoutes.map(r => (
				<Link href={r.path} title={r.title} key={r.title}>
					<NavIcon className={router.asPath === r.path ? 'active' : ''}>
						<i className={`fa-sharp fa-solid ${r.icon}`}></i>
					</NavIcon>
				</Link>
			))}
			<AuthNavIcon />
		</Nav>
	)
}

export default memo(NavBar)
