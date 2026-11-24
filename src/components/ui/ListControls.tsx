import { SearchInput } from '#/components/ui/SearchInput.tsx'

type Props<Sort extends string> = {
  searchLabel: string
  query: string
  onQueryChange: (query: string) => void
  /** Labels by sort key. */
  sorts: Record<Sort, string>
  sort: Sort
  onSortChange: (sort: Sort) => void
}

/** The search bar of a list, with the order next to it. */
export function ListControls<Sort extends string>(props: Props<Sort>) {
  const { searchLabel, query, onQueryChange, sorts, sort, onSortChange } = props

  return (
    <div className="flex flex-col gap-2 sm:flex-row">
      <div className="min-w-0 flex-1">
        <SearchInput label={searchLabel} value={query} onChange={onQueryChange} />
      </div>
      <select
        aria-label="Sort by"
        className="min-h-11 rounded-xl border-2 border-edge bg-well px-3 text-fg"
        value={sort}
        onChange={(event) => onSortChange(event.target.value as Sort)}
      >
        {(Object.entries(sorts) as [Sort, string][]).map(([key, label]) => (
          <option key={key} value={key}>
            {label}
          </option>
        ))}
      </select>
    </div>
  )
}
