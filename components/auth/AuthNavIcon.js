import { memo, useEffect } from 'react'

import Link from 'next/link'

import { NavIcon } from 'components/styles'
import Routes from 'config/routes'
import { useAuth } from 'hooks/useAuth'

const AuthNavIcon = () => {
	const { isAuthed } = useAuth()

	useEffect(() => {
		console.log({
			isAuthed,
		})
	}, [isAuthed])

	if (isAuthed) {
		return (
			<Link href={Routes.User.path} title={Routes.User.title}>
				<NavIcon key="user">
					<i className={`fa-sharp fa-regular ${Routes.User.icon}`}></i>
				</NavIcon>
			</Link>
		)
	}

	return (
		<Link href={Routes.Login.path} title={Routes.Login.title}>
			<NavIcon key="boba">
				<i className={`fa-sharp fa-solid ${Routes.Login.icon}`}></i>
			</NavIcon>
		</Link>
	)
}

export default memo(AuthNavIcon)
