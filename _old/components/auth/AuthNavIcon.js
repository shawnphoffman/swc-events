import { memo, useEffect, useState } from 'react'
import { icon } from '@fortawesome/fontawesome-svg-core/import.macro'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import Link from 'next/link'
import { useRouter } from 'next/router'

import { NavIcon } from 'components/styles'
import Routes from 'config/routes'
import { useAuth } from 'hooks/useAuth'

const AuthNavIcon = () => {
	const { isAuthed } = useAuth()
	const [mounted, setMounted] = useState(false)
	const router = useRouter()
	const isActive = router.asPath === Routes.Login.path ? 'active' : ''

	useEffect(() => {
		setMounted(true)
	}, [])

	if (!mounted) return null

	return (
		<Link href={Routes.Login.path}>
			<NavIcon className={isActive} title={isAuthed ? Routes.User.title : Routes.Login.title}>
				{isAuthed ? (
					<FontAwesomeIcon icon={icon({ name: 'user-bounty-hunter', family: 'sharp', style: 'solid' })} />
				) : (
					<FontAwesomeIcon icon={icon({ name: 'user', family: 'sharp', style: 'solid' })} />
				)}
			</NavIcon>
		</Link>
	)
}

export default memo(AuthNavIcon)
