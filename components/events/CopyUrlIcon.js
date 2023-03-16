import { memo, useCallback, useEffect, useMemo, useState } from 'react'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { icon } from '@fortawesome/fontawesome-svg-core/import.macro'
import { styled } from '@linaria/react'
import copy from 'copy-to-clipboard'

import { useAuth } from 'hooks/useAuth'

// import Routes from 'config/routes'

export const Button = styled.div`
	color: ${p => (p.copied ? 'var(--green)' : 'var(--linkAlt)')};
	transition: all 0.5s;
	cursor: pointer;
	margin-left: 8px;

	&:hover {
		color: ${p => (p.copied ? 'var(--green)' : 'var(--linkHover)')};
	}
`

const CopyUrlIcon = () => {
	const [copied, setCopied] = useState(false)
	const { user, isAuthed } = useAuth()
	const [baseUrl, setBaseUrl] = useState('')

	const uid = useMemo(() => user?.id, [user])

	const url = useMemo(() => `${baseUrl}/favorites/${uid}`, [uid, baseUrl])

	const logCopy = useCallback(
		e => {
			e.stopPropagation()
			copy(url)
			setCopied(true)
		},
		[url]
	)

	useEffect(() => {
		setBaseUrl(window.location.origin)
	}, [])

	useEffect(() => {
		let t = () => {}
		if (copied) {
			t = setTimeout(() => {
				setCopied(false)
			}, 3000)
		}
		return () => t
	}, [copied])

	if (!isAuthed || !uid) {
		return null
	}

	return (
		<Button copied={copied} key={`link-${uid}-${copied}`} onClickCapture={logCopy} title="Copy Link to Share">
			{copied ? (
				<FontAwesomeIcon icon={icon({ name: 'clipboard-check', family: 'sharp', style: 'regular' })} beatFade />
			) : (
				<FontAwesomeIcon icon={icon({ name: 'clipboard', family: 'sharp', style: 'regular' })} />
			)}
		</Button>
	)
}

export default memo(CopyUrlIcon)
