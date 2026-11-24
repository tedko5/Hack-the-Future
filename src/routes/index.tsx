import { queryOptions, useMutation, useQueryClient, useSuspenseQuery } from '@tanstack/react-query'
import { createFileRoute } from '@tanstack/react-router'
import { addPing, getHealth } from '../server.functions'

const healthQuery = queryOptions({
  queryKey: ['health'],
  queryFn: () => getHealth(),
  refetchInterval: 5000,
})

export const Route = createFileRoute('/')({
  loader: ({ context }) => context.queryClient.ensureQueryData(healthQuery),
  component: Home,
})

function Home() {
  const queryClient = useQueryClient()
  const { data: health } = useSuspenseQuery(healthQuery)
  const ping = useMutation({
    mutationFn: () => addPing(),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['health'] }),
  })

  return (
    <main className="mx-auto max-w-xl space-y-4 p-8">
      <h1 className="text-3xl font-bold">Guardians of the Grid</h1>
      {health.ok ? (
        <div>
          <p className="text-emerald-400">Database connected ({health.latencyMs} ms)</p>
          <p>Server time: {health.serverTime}</p>
          <p>Pings stored: {health.pings}</p>
        </div>
      ) : (
        <p className="text-red-400">Database down: {health.error}</p>
      )}
      <button
        type="button"
        className="rounded bg-indigo-600 px-4 py-2 disabled:opacity-50"
        disabled={ping.isPending}
        onClick={() => ping.mutate()}
      >
        Write a ping
      </button>
      {ping.isError && <p className="text-red-400">Ping failed</p>}
    </main>
  )
}
