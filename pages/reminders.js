import { memo, useCallback, useEffect, useState } from 'react'
import { styled } from 'linaria/react'
import {
	ButtonWrapper,
	Checkbox,
	CheckboxLabel,
	CheckboxWrapper,
	CheckHint,
	FormWrapper,
	InputContainer,
	InputWrapper,
	Label,
	TextInput,
} from 'styles/forms'

import Button from 'components/Button'
import { Divider, PageTitle } from 'components/styles'
import { useAuth } from 'hooks/useAuth'

const Warning = styled.div`
	color: var(--color4);
	font-size: 18px;
	font-weight: bold;
`

const ReminderListItem = ({ reminder }) => {
	const [checked, setChecked] = useState('')
	const handleChange = () => {}
	return (
		<>
			<CheckboxWrapper>
				<Checkbox type="checkbox" onChange={handleChange} checked={checked} />
				{/* <CheckHint isPrivate={checked}>{checked ? 'Yes, this is private' : 'No, I want this to be public'}</CheckHint> */}
				<CheckboxLabel>{reminder.summary}</CheckboxLabel>
			</CheckboxWrapper>
		</>
	)
}

const Page = () => {
	const { user, client, isAuthed } = useAuth()
	const [summary, setSummary] = useState('')
	const [reminders, setReminders] = useState([])

	// FETCH
	const fetchReminders = useCallback(async () => {
		if (!isAuthed || !user?.id || !client) {
			return
		}
		try {
			let { data, error } = await client.from('reminders').select().eq('user_id', user?.id)
			if (error) {
				console.error(error)
			}
			console.log('REMINDERS', data)
			setReminders(data)
		} catch (e) {
			console.log(e)
		}
	}, [client, isAuthed, user?.id])

	// INIT
	useEffect(() => {
		fetchReminders()
	}, [fetchReminders])

	const resetForm = useCallback(() => {
		setSummary('')
	}, [])

	const handleSummaryChange = useCallback(e => {
		const value = e.target.value
		setSummary(value)
	}, [])

	const insertRecord = useCallback(
		async reminder => {
			const { data, error } = await client.from('reminders').insert([
				{
					summary: reminder.summary,
					user_id: user?.id,
				},
			])
			console.log('CREATE REMINDER', { data, error, reminder })
		},
		[client, user?.id]
	)

	const updateRecord = useCallback(
		async reminder => {
			console.log('UPDATING')
			const { data, error } = await client
				.from('reminders')
				.update({
					id: reminder.id,
					summary: reminder.summary,
					user_id: user?.id,
				})
				.eq('id', reminder.id)
			console.log('UPDATE REMINDER', { data, error, reminder })
		},
		[client, user?.id]
	)

	//
	const editReminder = useCallback(
		async reminder => {
			if (!reminder.id) {
				// reminder.id = uuidv4()
				await insertRecord(reminder)
			} else {
				await updateRecord(reminder)
			}
			await fetchReminders()
		},
		[fetchReminders, insertRecord, updateRecord]
	)

	const handleSubmit = useCallback(async () => {
		console.log('SUBMIT')

		await editReminder({
			summary: summary,
		})

		resetForm()
	}, [editReminder, resetForm, summary])

	return (
		<>
			<PageTitle>Reminders</PageTitle>
			<Warning>THIS PAGE IS CURRENTLY IN DEVELOPMENT</Warning>
			{/* <div>Create your own simple reminders for Celebration</div> */}

			{reminders.length ? (
				<div>
					{reminders.map(r => (
						// <div key={r.id}>{r.summary}</div>
						<ReminderListItem key={r.id} reminder={r} />
					))}
				</div>
			) : (
				<div>No reminders to display (yet).</div>
			)}

			<Divider />

			<PageTitle>Create a Reminder</PageTitle>
			<FormWrapper>
				<InputWrapper>
					<Label>Title*:</Label>
					<InputContainer>
						<TextInput type="text" placeholder="What would you like to remember?" onChange={handleSummaryChange} value={summary} />
					</InputContainer>
				</InputWrapper>
				<ButtonWrapper>
					<Button as="button" disabled={false} onClick={handleSubmit}>
						Save Reminder
					</Button>
				</ButtonWrapper>
			</FormWrapper>
		</>
	)
}

export default memo(Page)
