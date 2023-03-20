import { memo, useCallback, useEffect, useState } from 'react'
import { icon } from '@fortawesome/fontawesome-svg-core/import.macro'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { styled } from 'linaria/react'
import { Checkbox, CheckboxWrapper, InputContainer, InputWrapper, TextInput } from 'styles/forms'

const Wrapper = styled.div`
	display: flex;
	padding: 8px 16px;

	&:hover {
		background: var(--outlineHover);
	}
`

const ItemLabel = styled.div`
	flex-wrap: wrap;
	font-weight: bold;
	flex: 1;
	margin-right: 8px;
	margin-top: 0px;
	line-height: 1.2;
`

const ActionButton = styled.div`
	color: var(--linkAlt);
	font-size: 28px;
	margin: 2px 16px;
	transition: all 0.5s;
	cursor: pointer;
	display: flex;
	align-items: center;

	&:hover {
		color: var(--linkHover);
	}
`

const DeleteButton = styled(ActionButton)`
	color: ${p => (p.confirm ? 'var(--color13)' : 'var(--linkAlt)')};
	&:hover {
		color: ${p => (p.confirm ? 'var(--color13)' : 'var(--linkHover)')};
	}
`

const SaveButton = styled(ActionButton)`
	color: var(--color5);
	&:hover {
		color: var(--color5);
	}
`

const CleanContainer = styled(InputContainer)`
	margin-bottom: 0;
`

const ReminderListItem = ({ reminder, onSave, onDelete }) => {
	const [editing, setEditing] = useState(false)
	const [confirmDelete, setConfirmDelete] = useState(false)
	const [tempSummary, setTempSummary] = useState(reminder?.summary)
	const [checked, setChecked] = useState('')

	const handleChange = useCallback(
		e => {
			const checked = e.target.checked
			setChecked(checked)
			// console.log('SAVE', {
			// 	reminder,
			// 	checked,
			// })
			onSave({
				...reminder,
				complete: checked,
			})
		},
		[onSave, reminder]
	)

	const handleEdit = useCallback(() => {
		setEditing(true)
	}, [])

	const handleSave = useCallback(() => {
		setEditing(false)
		onSave({
			...reminder,
			summary: tempSummary,
		})
	}, [onSave, reminder, tempSummary])

	const handleDelete = useCallback(() => {
		if (confirmDelete) {
			onDelete(reminder?.id)
		} else {
			setConfirmDelete(true)
		}
	}, [confirmDelete, onDelete, reminder?.id])

	useEffect(() => {
		let t = () => {}
		if (confirmDelete) {
			t = setTimeout(() => {
				setConfirmDelete(false)
			}, 8000)
		}
		return () => t
	}, [confirmDelete])

	if (!reminder) {
		return null
	}

	if (editing) {
		return (
			<Wrapper>
				<InputWrapper>
					<CleanContainer>
						<TextInput type="text" onChange={e => setTempSummary(e.target.value)} value={tempSummary} />
					</CleanContainer>
					<SaveButton title="Save" onClick={handleSave}>
						<FontAwesomeIcon icon={icon({ name: 'floppy-disk-circle-arrow-right', family: 'sharp', style: 'solid' })} />
					</SaveButton>
					<ActionButton title="Cancel" onClick={() => setEditing(false)}>
						<FontAwesomeIcon icon={icon({ name: 'xmark', family: 'sharp', style: 'solid' })} />
					</ActionButton>
				</InputWrapper>
			</Wrapper>
		)
	}

	return (
		<Wrapper>
			<CheckboxWrapper>
				<Checkbox type="checkbox" onChange={handleChange} checked={checked} />
				<ItemLabel>{reminder.summary}</ItemLabel>
			</CheckboxWrapper>
			<ActionButton title="Edit" onClick={handleEdit}>
				<FontAwesomeIcon icon={icon({ name: 'pen-to-square', family: 'sharp', style: 'regular' })} />
			</ActionButton>

			<DeleteButton confirm={confirmDelete} title={confirmDelete ? 'Are you sure?' : 'Delete reminder'} onClick={handleDelete}>
				{confirmDelete ? (
					<FontAwesomeIcon icon={icon({ name: 'trash-can-check', family: 'sharp', style: 'regular' })} beatFade />
				) : (
					<FontAwesomeIcon icon={icon({ name: 'trash-can', family: 'sharp', style: 'regular' })} />
				)}
			</DeleteButton>
		</Wrapper>
	)
}

export default memo(ReminderListItem)
