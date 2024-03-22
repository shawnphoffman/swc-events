import { memo, useCallback, useEffect, useMemo, useState } from 'react'
import { icon } from '@fortawesome/fontawesome-svg-core/import.macro'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { styled } from '@linaria/react'
import copy from 'copy-to-clipboard'

export const Button = styled.div`
	color: ${p => (p.copied ? 'var(--green)' : 'var(--linkAlt)')};
	font-size: 26px;
	margin-top: 4px;
	transition: all 0.5s;
	cursor: pointer;

	&:hover {
		color: ${p => (p.copied ? 'var(--green)' : 'var(--linkHover)')};
	}
`

const EventLinkIcon = ({ event }) => {
	const [copied, setCopied] = useState(false)
	const [baseUrl, setBaseUrl] = useState('')

	const url = useMemo(() => `${baseUrl}/event/${event.id}`, [baseUrl, event.id])

	const logCopy = useCallback(
		e => {
			e.stopPropagation()
			copy(url)
			setCopied(true)
		},
		[url]
	)

	useEffect(() => {
		let t = () => {}
		if (copied) {
			t = setTimeout(() => {
				setCopied(false)
			}, 3000)
		}
		return () => t
	}, [copied])

	useEffect(() => {
		setBaseUrl(window.location.origin)
	}, [])

	if (!event) return null

	return (
		<Button copied={copied} key={`link-${event.id}-${copied}`} onClickCapture={logCopy} title="Copy Link to Event">
			{copied ? (
				<FontAwesomeIcon icon={icon({ name: 'clipboard-check', family: 'sharp', style: 'regular' })} beatFade />
			) : (
				<FontAwesomeIcon icon={icon({ name: 'clipboard', family: 'sharp', style: 'regular' })} />
			)}
		</Button>
	)
}

export default memo(EventLinkIcon)
