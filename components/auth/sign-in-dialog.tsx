'use client'

import { useEffect, useState, useSyncExternalStore } from 'react'
import { ArrowLeftIcon, MailIcon } from 'lucide-react'
import { usePathname } from 'next/navigation'
import { toast } from 'sonner'

import { Button } from '@/components/ui/button'
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { Field, FieldDescription, FieldError, FieldGroup, FieldLabel, FieldSeparator } from '@/components/ui/field'
import { Input } from '@/components/ui/input'
import { InputOTP, InputOTPGroup, InputOTPSlot } from '@/components/ui/input-otp'
import { useSession } from '@/hooks/use-session'
import { type OAuthProvider, sendEmailCode, signInWithProvider, verifyEmailCode } from '@/lib/auth'

import { DiscordIcon, GoogleIcon } from './provider-icons'

// Global open state so any "Sign in" button can open the one dialog.
let open = false
const listeners = new Set<() => void>()
const setOpen = (next: boolean) => {
	open = next
	listeners.forEach(l => l())
}
export const openSignIn = () => setOpen(true)
const subscribe = (l: () => void) => {
	listeners.add(l)
	return () => listeners.delete(l)
}

const CODE_LENGTH = 6

export function SignInDialog() {
	const isOpen = useSyncExternalStore(subscribe, () => open, () => false)
	const session = useSession()
	const pathname = usePathname()
	const [step, setStep] = useState<'choose' | 'code'>('choose')
	const [email, setEmail] = useState('')
	const [code, setCode] = useState('')
	const [busy, setBusy] = useState<null | 'email' | 'code' | OAuthProvider>(null)
	const [error, setError] = useState<string | null>(null)

	// Close once the session arrives (code verified, or another tab signed in).
	useEffect(() => {
		if (isOpen && session.status === 'signed-in') {
			setOpen(false)
			toast.success('Signed in. Your schedule now syncs across devices.')
		}
	}, [isOpen, session.status])

	const reset = () => {
		setStep('choose')
		setCode('')
		setError(null)
		setBusy(null)
	}

	const withProvider = async (provider: OAuthProvider) => {
		setBusy(provider)
		setError(null)
		try {
			await signInWithProvider(provider, pathname)
			// Browser navigates away to the provider.
		} catch (e) {
			setError(e instanceof Error ? e.message : 'Could not start sign-in')
			setBusy(null)
		}
	}

	const sendCode = async (event: React.FormEvent) => {
		event.preventDefault()
		setBusy('email')
		setError(null)
		try {
			await sendEmailCode(email.trim())
			setStep('code')
		} catch (e) {
			setError(e instanceof Error ? e.message : 'Could not send the code')
		} finally {
			setBusy(null)
		}
	}

	const verify = async (token: string) => {
		setBusy('code')
		setError(null)
		try {
			await verifyEmailCode(email.trim(), token)
		} catch {
			setError('That code didn’t work. Check the latest email, or send a new code.')
			setCode('')
		} finally {
			setBusy(null)
		}
	}

	return (
		<Dialog
			open={isOpen}
			onOpenChange={next => {
				setOpen(next)
				if (!next) reset()
			}}
		>
			<DialogContent className="sm:max-w-sm">
				<DialogHeader>
					<DialogTitle>{step === 'choose' ? 'Sign in to sync' : 'Check your email'}</DialogTitle>
					<DialogDescription>
						{step === 'choose'
							? 'Keep your schedule on every device and never lose it. New here? This creates your account.'
							: `We sent a ${CODE_LENGTH}-digit code to ${email}. It expires in an hour.`}
					</DialogDescription>
				</DialogHeader>

				{step === 'choose' ? (
					<FieldGroup>
						<div className="flex flex-col gap-2">
							<Button variant="outline" size="lg" disabled={busy !== null} onClick={() => withProvider('google')}>
								<GoogleIcon data-icon="inline-start" />
								Continue with Google
							</Button>
							<Button variant="outline" size="lg" disabled={busy !== null} onClick={() => withProvider('discord')}>
								<DiscordIcon data-icon="inline-start" />
								Continue with Discord
							</Button>
						</div>
						<FieldSeparator>or</FieldSeparator>
						<form onSubmit={sendCode} className="flex flex-col gap-3">
							<Field data-invalid={!!error || undefined}>
								<FieldLabel htmlFor="sign-in-email">Email</FieldLabel>
								<Input
									id="sign-in-email"
									type="email"
									autoComplete="email"
									inputMode="email"
									required
									placeholder="you@example.com"
									value={email}
									onChange={e => setEmail(e.target.value)}
									aria-invalid={!!error || undefined}
								/>
								<FieldDescription>We&apos;ll email you a code. No password needed.</FieldDescription>
								{error && <FieldError>{error}</FieldError>}
							</Field>
							<Button type="submit" size="lg" disabled={busy !== null || !email.includes('@')}>
								<MailIcon data-icon="inline-start" />
								{busy === 'email' ? 'Sending…' : 'Email me a code'}
							</Button>
						</form>
					</FieldGroup>
				) : (
					<FieldGroup>
						<Field data-invalid={!!error || undefined} className="items-center">
							<FieldLabel htmlFor="sign-in-code" className="sr-only">
								Sign-in code
							</FieldLabel>
							<InputOTP
								id="sign-in-code"
								maxLength={CODE_LENGTH}
								autoFocus
								inputMode="numeric"
								autoComplete="one-time-code"
								value={code}
								disabled={busy === 'code'}
								onChange={value => {
									setCode(value)
									if (value.length === CODE_LENGTH) void verify(value)
								}}
							>
								<InputOTPGroup>
									{Array.from({ length: CODE_LENGTH }, (_, i) => (
										<InputOTPSlot key={i} index={i} aria-invalid={!!error || undefined} />
									))}
								</InputOTPGroup>
							</InputOTP>
							{error && <FieldError className="text-center">{error}</FieldError>}
						</Field>
						<div className="flex justify-between">
							<Button variant="ghost" size="sm" onClick={reset}>
								<ArrowLeftIcon data-icon="inline-start" />
								Back
							</Button>
							<Button
								variant="link"
								size="sm"
								disabled={busy !== null}
								onClick={async () => {
									try {
										await sendEmailCode(email.trim())
										toast.success('New code sent')
									} catch (e) {
										setError(e instanceof Error ? e.message : 'Could not send the code')
									}
								}}
							>
								Send a new code
							</Button>
						</div>
					</FieldGroup>
				)}
			</DialogContent>
		</Dialog>
	)
}
