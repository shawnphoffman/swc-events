/* eslint-disable react/no-unescaped-entities */
import { memo, useCallback, useEffect, useState } from 'react'
import { styled } from 'linaria/react'
import Link from 'next/link'
import { ButtonWrapper, FormWrapper, InputContainer, InputWrapper, Label, TextInput } from 'styles/forms'

import Button from 'components/Button'
import ReminderListItem from 'components/reminders/ReminderListItem'
import { Divider, PageTitle } from 'components/styles'
import { useAuth } from 'hooks/useAuth'

const ListWrapper = styled.div`
	max-width: 600px;
`
const NextLink = styled.div`
	color: var(--linkAlt);
	font-weight: bold;
	text-decoration: none;
	display: inline-block;

	&:hover {
		color: var(--linkHover);
	}
`

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
			let { data, error } = await client.from('reminders').select().eq('user_id', user?.id).order('created_at', { ascending: true })
			if (error) {
				console.error(error)
			}
			// console.log('REMINDERS', data)
			setReminders(data)
		} catch (e) {
			// console.log(e)
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
		setSummary(e.target.value)
	}, [])

	const insertRecord = useCallback(
		async reminder => {
			const { data, error } = await client.from('reminders').insert([
				{
					summary: reminder.summary,
					user_id: user?.id,
					priority: reminder.priority,
				},
			])
			// console.log('CREATE REMINDER', { data, error, reminder })
		},
		[client, user?.id]
	)

	const updateRecord = useCallback(
		async reminder => {
			// console.log('UPDATING')
			const { data, error } = await client
				.from('reminders')
				.update({
					id: reminder.id,
					summary: reminder.summary,
					user_id: user?.id,
					complete: reminder.complete,
					priority: reminder.priority,
				})
				.eq('id', reminder.id)
			// console.log('UPDATE REMINDER', { data, error, reminder })
		},
		[client, user?.id]
	)

	const deleteReminder = useCallback(
		async id => {
			// console.log('DELETING')
			const { data, error } = await client.from('reminders').delete().match({
				id: id,
				user_id: user?.id,
			})
			// console.log('DELETE REMINDER', { data, error, id })
			await fetchReminders()
		},
		[client, fetchReminders, user?.id]
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
		// console.log('SUBMIT')

		await editReminder({
			summary: summary,
		})

		resetForm()
	}, [editReminder, resetForm, summary])

	if (!isAuthed) {
		return (
			<>
				<PageTitle>Reminders</PageTitle>
				<NextLink>
					<Link href="/auth">Please log in to use reminders</Link>
				</NextLink>
			</>
		)
	}

	return (
		<>
			<PageTitle>Reminders</PageTitle>
			{/* <Warning>THIS PAGE IS CURRENTLY IN DEVELOPMENT</Warning> */}
			{/* <div>Create your own simple reminders for Celebration</div> */}

			{reminders.length ? (
				<ListWrapper>
					{reminders.map(r => (
						<ReminderListItem key={r.id} reminder={r} onSave={editReminder} onDelete={deleteReminder} />
					))}
				</ListWrapper>
			) : (
				<div>No reminders to display (yet).</div>
			)}

			<Divider />

			<PageTitle>Create a Reminder</PageTitle>
			<FormWrapper>
				<InputWrapper>
					<Label>Reminder:</Label>
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
