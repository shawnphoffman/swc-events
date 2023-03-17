import { memo, useCallback, useEffect, useState } from 'react'
import { styled } from '@linaria/react'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { icon } from '@fortawesome/fontawesome-svg-core/import.macro'

import { useAuth } from 'hooks/useAuth'

export const Button = styled.div`
	color: ${p => (p.confirm ? 'red' : 'var(--linkAlt)')};
	font-size: 26px;
	margin-top: 4px;
	transition: all 0.5s;
	cursor: pointer;

	&:hover {
		color: ${p => (p.confirm ? 'red' : 'var(--linkHover)')};
	}
`

const DeleteEventIcon = ({ event }) => {
	const [confirm, setConfirm] = useState(false)
	const { client, user, isAuthed } = useAuth()

	// Delete User Event
	const deleteUserEvent = useCallback(
		// TODO Update the user events context????
		async id => {
			let { status, error } = await client.from('userEvents').delete().match({
				id: id,
				creator_id: user?.id,
			})
			alert("Event deleted. Refresh the page or navigate. I'll fix this as soon as I can")
		},
		[client, user?.id]
	)

	const handleClick = useCallback(() => {
		if (confirm) {
			deleteUserEvent(event.id)
		} else {
			setConfirm(true)
		}
	}, [confirm, deleteUserEvent, event.id])

	useEffect(() => {
		let t = () => {}
		if (confirm) {
			t = setTimeout(() => {
				setConfirm(false)
			}, 8000)
		}
		return () => t
	}, [confirm])

	if (!event) return null

	return (
		<Button
			confirm={confirm}
			key={`link-${event.id}-${confirm}`}
			title={confirm ? 'Are you sure?' : 'Delete User Event'}
			onClick={handleClick}
		>
			{confirm ? (
				<FontAwesomeIcon icon={icon({ name: 'trash-can-check', family: 'sharp', style: 'regular' })} beatFade />
			) : (
				<FontAwesomeIcon icon={icon({ name: 'trash-can', family: 'sharp', style: 'regular' })} />
			)}
		</Button>
	)
}

export default memo(DeleteEventIcon)
