import { memo } from 'react'

import Link from 'next/link'

import { NavIcon } from 'components/styles'
import Routes from 'config/routes'
import { useUser } from 'hooks/useUser'

const AuthNavIcon = () => {
	const { isAuthed } = useUser()

	if (isAuthed) {
		return (
			<Link href={Routes.User.path} title={Routes.User.title}>
				<NavIcon>
					<i className={`fa-regular ${Routes.User.icon}`}></i>
				</NavIcon>
			</Link>
		)
	}

	return (
		<Link href={Routes.Login.path} title={Routes.Login.title}>
			<NavIcon>
				<i className={`fa-solid ${Routes.Login.icon}`}></i>
			</NavIcon>
		</Link>
	)
}

export default memo(AuthNavIcon)
