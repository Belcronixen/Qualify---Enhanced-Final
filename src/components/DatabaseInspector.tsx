import {useEffect, useState} from 'react'
import {supabase} from '../lib/supabase'

interface T {
  name: string
  rowCount: number
  columns: {name: string; type: string; nullable: string; default_value: string | null}[]
}

export function DatabaseInspector() {
  const [t, sT] = useState<T[]>([])
  const [l, sL] = useState(true)
  const [e, sE] = useState<string|null>(null)

  useEffect(() => {
    ;(async () => {
      try {
        const {data: dt, error: de} = await supabase.rpc('get_tables')
        if (de) throw de
        if (!dt) throw new Error('No tables data')
        const arr = await Promise.all(
          dt.map(async (tn: string) => {
            const [cr, cnt] = await Promise.all([
              supabase.rpc('get_columns', {table_name: tn}),
              supabase.from(tn).select('*', {count: 'exact', head: true})
            ])
            if (cr.error) throw cr.error
            if (cnt.error) throw cnt.error
            return {
              name: tn,
              rowCount: cnt.count || 0,
              columns: (cr.data || []).map(
                ({column_name, data_type, is_nullable, column_default}: any) => ({
                  name: column_name,
                  type: data_type,
                  nullable: is_nullable,
                  default_value: column_default
                })
              )
            }
          })
        )
        sT(arr)
      } catch (err: any) {
        sE(err instanceof Error ? err.message : 'Error')
      } finally {
        sL(false)
      }
    })()
  }, [])

  if (l) return <div className="p-4">Loading database information...</div>
  if (e) return <div className="p-4 text-red-600">Error: {e}</div>

  return (
    <div className="p-4">
      <h2 className="mb-4 text-2xl font-bold">Database Structure</h2>
      <div className="space-y-6">
        {t.map(({name, rowCount, columns}) => (
          <div key={name} className="rounded-lg border border-neutral-200 p-4">
            <h3 className="mb-2 text-lg font-semibold">
              {name}{' '}
              <span className="text-sm text-neutral-500">
                ({rowCount} rows)
              </span>
            </h3>
            <table className="min-w-full">
              <thead>
                <tr>
                  <th className="px-4 py-2 text-left text-sm font-medium text-neutral-500">Column</th>
                  <th className="px-4 py-2 text-left text-sm font-medium text-neutral-500">Type</th>
                  <th className="px-4 py-2 text-left text-sm font-medium text-neutral-500">Nullable</th>
                  <th className="px-4 py-2 text-left text-sm font-medium text-neutral-500">Default</th>
                </tr>
              </thead>
              <tbody>
                {columns.map(({name, type, nullable, default_value}) => (
                  <tr key={name} className="border-t border-neutral-100">
                    <td className="px-4 py-2">{name}</td>
                    <td className="px-4 py-2 text-neutral-600">{type}</td>
                    <td className="px-4 py-2 text-neutral-600">{nullable}</td>
                    <td className="px-4 py-2 text-neutral-600">{default_value || '-'}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ))}
      </div>
    </div>
  )
}
