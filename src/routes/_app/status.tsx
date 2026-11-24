import { queryOptions, useMutation, useQueryClient, useSuspenseQuery } from '@tanstack/react-query'
import { createFileRoute } from '@tanstack/react-router'
import { addPing, getHealth } from '#/lib/health.functions.ts'

const healthQuery = queryOptions({
  queryKey: ['health'],
  queryFn: () => getHealth(),
  refetchInterval: 5000,
})

export const Route = createFileRoute('/_app/status')({
  loader: ({ context }) => context.queryClient.ensureQueryData(healthQuery),
  component: StatusPage,
})

function StatusPage() {
  const queryClient = useQueryClient()
  const { data: health } = useSuspenseQuery(healthQuery)
  const ping = useMutation({
    mutationFn: () => addPing(),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['health'] }),
  })

  return (
    <div className="space-y-4 rounded-[18px] bg-panel p-3 md:p-4.5">
      <h2 className="font-display text-[1.6rem] font-bold">Status</h2>
      {health.ok ? (
        <div>
          <p className="text-cyan">Database connected ({health.latencyMs} ms)</p>
          <p>Server time: {health.serverTime}</p>
          <p>Pings stored: {health.pings}</p>
        </div>
      ) : (
        <p className="text-magenta">Database down: {health.error}</p>
      )}
      <button
        type="button"
        className="rounded bg-accent px-4 py-2 text-white disabled:opacity-50"
        disabled={ping.isPending}
        onClick={() => ping.mutate()}
      >
        Write a ping
      </button>
      {ping.isError && <p className="text-magenta">Ping failed</p>}
    </div>
  )
}
