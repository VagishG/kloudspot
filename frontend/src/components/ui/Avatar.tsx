import { avatarColor } from '../../lib/avatar'
import { getInitials } from '../../lib/format'
import { cn } from '../../lib/cn'

type AvatarSize = 'sm' | 'md' | 'xl'

const sizes: Record<AvatarSize, string> = {
  sm: 'size-8 text-xs',
  md: 'size-9 text-xs',
  xl: 'size-16 text-lg',
}

interface AvatarProps {
  name: string
  size?: AvatarSize
  className?: string
}

export function Avatar({ name, size = 'sm', className }: AvatarProps) {
  return (
    <span
      className={cn(
        'inline-flex shrink-0 items-center justify-center rounded-full font-semibold ring-1 ring-inset ring-black/5',
        sizes[size],
        avatarColor(name),
        className,
      )}
      aria-hidden="true"
    >
      {getInitials(name)}
    </span>
  )
}
