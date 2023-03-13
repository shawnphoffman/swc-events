import { memo } from 'react'
import { styled } from 'linaria/react'
import Link from 'next/link'

import AuthNavIcon from 'components/auth/AuthNavIcon'
import { NavIcon } from 'components/styles'
import { NavRoutes } from 'config/routesNew'

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
	return (
		<Nav id="nav">
			{NavRoutes.map(r => (
				<Link href={r.path} title={r.title} key={r.title}>
					<NavIcon>
						<i className={`fa-solid ${r.icon}`}></i>
					</NavIcon>
				</Link>
			))}
			<AuthNavIcon />
		</Nav>
	)
}

export default memo(NavBar)
