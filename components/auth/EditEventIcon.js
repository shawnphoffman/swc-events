import { memo, useCallback } from 'react'
import { styled } from '@linaria/react'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { icon } from '@fortawesome/fontawesome-svg-core/import.macro'

export const Button = styled.div`
	color: var(--linkAlt);
	font-size: 26px;
	margin-top: 4px;
	transition: all 0.5s;
	cursor: pointer;

	&:hover {
		color: var(--linkHover);
	}
`

const EditEventIcon = ({ event, onEdit }) => {
	const handleClick = useCallback(() => {
		onEdit(event)
	}, [event, onEdit])

	if (!event) return null

	return (
		<Button title="Edit User Event" onClick={handleClick}>
			<FontAwesomeIcon icon={icon({ name: 'pen-to-square', family: 'sharp', style: 'regular' })} />
		</Button>
	)
}

export default memo(EditEventIcon)
