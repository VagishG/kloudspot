import { Badge } from '../ui'

export function StatusBadge({ status }: { status: boolean }) {
  return status ? (
    <Badge tone="success" dot>
      Active
    </Badge>
  ) : (
    <Badge tone="neutral" dot>
      Inactive
    </Badge>
  )
}
