'use client'

import { CloudAlertIcon, CloudCheckIcon, CloudOffIcon, LogOutIcon, RefreshCwIcon, UserIcon } from 'lucide-react'
import Link from 'next/link'
import { toast } from 'sonner'

import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { Button } from '@/components/ui/button'
import {
	DropdownMenu,
	DropdownMenuContent,
	DropdownMenuGroup,
	DropdownMenuItem,
	DropdownMenuLabel,
	DropdownMenuSeparator,
	DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { useFavorites } from '@/hooks/use-favorites'
import { useSession } from '@/hooks/use-session'
import { signOut } from '@/lib/auth'
import type { SyncStatus } from '@/lib/sync/synced-set'

import { openSignIn } from './sign-in-dialog'

const statusCopy: Record<SyncStatus, { label: string; icon: typeof CloudCheckIcon }> = {
	local: { label: 'Saved on this device', icon: CloudOffIcon },
	syncing: { label: 'Syncing…', icon: RefreshCwIcon },
	synced: { label: 'Synced', icon: CloudCheckIcon },
	offline: { label: 'Offline, will sync when back online', icon: CloudOffIcon },
	error: { label: 'Sync failed, retrying', icon: CloudAlertIcon },
}

export function AccountButton() {
	const session = useSession()
	const { status } = useFavorites()

	if (session.status === 'disabled') return null
	if (session.status !== 'signed-in') {
		return (
			<Button size="sm" variant="outline" onClick={openSignIn} disabled={session.status === 'loading'}>
				Sign in
			</Button>
		)
	}

	const { user } = session
	const name = (user.user_metadata.full_name as string | undefined) ?? (user.user_metadata.name as string | undefined) ?? user.email ?? 'Account'
	const avatar = user.user_metadata.avatar_url as string | undefined
	const { label, icon: StatusIcon } = statusCopy[status]

	return (
		<DropdownMenu>
			<DropdownMenuTrigger asChild>
				<Button variant="ghost" size="icon" aria-label={`Account: ${name}. ${label}`} className="relative rounded-full">
					<Avatar className="size-7">
						{avatar && <AvatarImage src={avatar} alt="" />}
						<AvatarFallback className="text-xs">{name.slice(0, 1).toUpperCase()}</AvatarFallback>
					</Avatar>
					{(status === 'error' || status === 'offline') && (
						<span aria-hidden className="absolute top-0 right-0 size-2.5 rounded-full border-2 border-background bg-destructive" />
					)}
				</Button>
			</DropdownMenuTrigger>
			<DropdownMenuContent align="end" className="w-64">
				<DropdownMenuLabel className="flex flex-col gap-0.5">
					<span className="truncate">{name}</span>
					{user.email && user.email !== name && <span className="truncate text-xs font-normal text-muted-foreground">{user.email}</span>}
				</DropdownMenuLabel>
				<DropdownMenuLabel className="flex items-center gap-2 text-xs font-normal text-muted-foreground">
					<StatusIcon className="size-3.5" aria-hidden />
					{label}
				</DropdownMenuLabel>
				<DropdownMenuSeparator />
				<DropdownMenuGroup>
					<DropdownMenuItem asChild>
						<Link href="/account">
							<UserIcon />
							Account &amp; sharing
						</Link>
					</DropdownMenuItem>
					<DropdownMenuItem
						onSelect={async () => {
							await signOut()
							toast.success('Signed out. Your schedule is saved to your account.')
						}}
					>
						<LogOutIcon />
						Sign out
					</DropdownMenuItem>
				</DropdownMenuGroup>
			</DropdownMenuContent>
		</DropdownMenu>
	)
}
