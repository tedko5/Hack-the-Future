import { Search } from 'lucide-react'

type Props = {
  /** Such as "Search glitches". */
  label: string
  value: string
  onChange: (value: string) => void
}

export function SearchInput({ label, value, onChange }: Props) {
  return (
    <div className="relative">
      <Search
        size={18}
        aria-hidden="true"
        className="pointer-events-none absolute top-1/2 left-3.5 -translate-y-1/2 text-muted"
      />
      <input
        type="search"
        aria-label={label}
        placeholder={label}
        className="min-h-11 w-full rounded-xl border-2 border-edge bg-well pr-3 pl-10 text-fg placeholder:text-muted"
        value={value}
        onChange={(event) => onChange(event.target.value)}
        onKeyDown={(event) => event.key === 'Escape' && onChange('')}
        autoComplete="off"
      />
    </div>
  )
}
