import { memo, useEffect } from 'react'
import Link from 'next/link'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { icon } from '@fortawesome/fontawesome-svg-core/import.macro'

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
				<NavIcon>
					<FontAwesomeIcon icon={icon({ name: 'user-bounty-hunter', family: 'sharp', style: 'regular' })} />
				</NavIcon>
			</Link>
		)
	}

	return (
		<Link href={Routes.Login.path} title={Routes.Login.title}>
			<NavIcon>
				<FontAwesomeIcon icon={icon({ name: 'user', family: 'sharp', style: 'regular' })} />
			</NavIcon>
		</Link>
	)
}

export default memo(AuthNavIcon)
