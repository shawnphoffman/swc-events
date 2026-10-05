'use client'

import { Share2Icon } from 'lucide-react'
import { toast } from 'sonner'

import { Button } from '@/components/ui/button'

export function ShareButton({ title, text, path, label = 'Share' }: { title: string; text?: string; path: string; label?: string }) {
	return (
		<Button
			variant="outline"
			onClick={async () => {
				const url = new URL(path, window.location.origin).toString()
				if (navigator.share) {
					try {
						await navigator.share({ title, text, url })
						return
					} catch (error) {
						if (error instanceof DOMException && error.name === 'AbortError') return
					}
				}
				try {
					await navigator.clipboard.writeText(url)
					toast.success('Link copied')
				} catch {
					toast.error('Couldn’t copy the link', { description: url })
				}
			}}
		>
			<Share2Icon data-icon="inline-start" />
			{label}
		</Button>
	)
}
