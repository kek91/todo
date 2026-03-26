/**
 * PocketBase setup script — run once against a fresh PocketBase instance.
 *
 * Usage:
 *   npm run setup-pb
 */

import PocketBase from 'pocketbase'
import * as readline from 'readline'

const rl = readline.createInterface({ input: process.stdin, output: process.stdout })
const ask = (q: string): Promise<string> => new Promise((resolve) => rl.question(q, resolve))

function log(msg: string) { console.log(`  ${msg}`) }
function ok(msg: string)  { console.log(`  ✅ ${msg}`) }
function err(msg: string) { console.log(`  ❌ ${msg}`) }

const AUTH_RULE = `@request.auth.id != ""`
const OPEN_RULES = {
  listRule:   AUTH_RULE,
  viewRule:   AUTH_RULE,
  createRule: AUTH_RULE,
  updateRule: AUTH_RULE,
  deleteRule: AUTH_RULE,
}

// PocketBase 0.22+ uses flat field format — options are top-level, not nested.
// Relation collectionId uses placeholder keys resolved after creation.
// Placeholder format: "__COL:name__" → replaced with real ID before API call.

function rel(colName: string, opts: { required?: boolean; cascade?: boolean; max?: number } = {}) {
  return {
    type: 'relation',
    collectionId: `__COL:${colName}__`,  // resolved at runtime
    required:       opts.required  ?? false,
    cascadeDelete:  opts.cascade   ?? false,
    maxSelect:      opts.max       ?? 1,
    minSelect:      opts.required  ? 1 : 0,
  }
}

function sel(values: string[], opts: { required?: boolean } = {}) {
  return {
    type: 'select',
    values,
    required:  opts.required ?? false,
    maxSelect: 1,
  }
}

// Collection definitions — collectionId placeholders resolved at runtime
const COLLECTION_DEFS = [
  {
    name: 'households',
    ...OPEN_RULES,
    indexes: ['CREATE UNIQUE INDEX idx_household_invite ON households (invite_code)'],
    fields: [
      { name: 'name',        type: 'text', required: true },
      { name: 'invite_code', type: 'text', required: true },
      { name: 'created_by',  ...rel('_pb_users_auth_') },
    ],
  },
  {
    name: 'memberships',
    ...OPEN_RULES,
    fields: [
      { name: 'user',      ...rel('_pb_users_auth_', { required: true, cascade: true }) },
      { name: 'household', ...rel('households',       { required: true, cascade: true }) },
      { name: 'role',      ...sel(['admin', 'member'], { required: true }) },
      { name: 'joined_at', type: 'date' },
    ],
  },
  {
    name: 'lists',
    ...OPEN_RULES,
    fields: [
      { name: 'household',  ...rel('households', { required: true, cascade: true }) },
      { name: 'name',       type: 'text', required: true },
      { name: 'type',       ...sel(['todo', 'shopping'], { required: true }) },
      { name: 'color',      type: 'text' },
      { name: 'icon',       type: 'text' },
      { name: 'sort_order', type: 'number' },
    ],
  },
  {
    name: 'tasks',
    ...OPEN_RULES,
    indexes: [
      'CREATE INDEX idx_tasks_list_completed ON tasks (list, completed)',
      'CREATE INDEX idx_tasks_household_due  ON tasks (household, due_date)',
    ],
    fields: [
      { name: 'list',               ...rel('lists',            { required: true, cascade: true }) },
      { name: 'household',          ...rel('households',       { required: true, cascade: true }) },
      { name: 'title',              type: 'text', required: true },
      { name: 'description',        type: 'text' },
      { name: 'assigned_to',        ...rel('_pb_users_auth_') },
      { name: 'priority',           ...sel(['low', 'normal', 'high', 'urgent']) },
      { name: 'due_date',           type: 'date' },
      { name: 'completed',          type: 'bool' },
      { name: 'completed_at',       type: 'date' },
      { name: 'completed_by',       ...rel('_pb_users_auth_') },
      { name: 'recurring',          ...sel(['none', 'daily', 'weekly', 'custom']) },
      { name: 'recurring_interval', type: 'number' },
      { name: 'recurring_next',     type: 'date' },
      { name: 'xp_value',           type: 'number' },
      { name: 'sort_order',         type: 'number' },
    ],
  },
  {
    name: 'shopping_items',
    ...OPEN_RULES,
    indexes: ['CREATE INDEX idx_shopping_list_checked ON shopping_items (list, checked)'],
    fields: [
      { name: 'list',       ...rel('lists',            { required: true, cascade: true }) },
      { name: 'household',  ...rel('households',       { required: true, cascade: true }) },
      { name: 'title',      type: 'text', required: true },
      { name: 'category',   type: 'text' },
      { name: 'checked',    type: 'bool' },
      { name: 'checked_by', ...rel('_pb_users_auth_') },
      { name: 'checked_at', type: 'date' },
      { name: 'sort_order', type: 'number' },
    ],
  },
  {
    name: 'xp_events',
    listRule:   AUTH_RULE,
    viewRule:   AUTH_RULE,
    createRule: AUTH_RULE,
    updateRule: null,
    deleteRule: null,
    fields: [
      { name: 'user',       ...rel('_pb_users_auth_', { required: true, cascade: true }) },
      { name: 'household',  ...rel('households',      { cascade: true }) },
      { name: 'event_type', ...sel(['task_complete', 'streak_bonus', 'level_up']) },
      { name: 'xp_amount',  type: 'number' },
      { name: 'task',       ...rel('tasks', { cascade: true }) },
    ],
  },
]

const USER_EXTRA_FIELDS = [
  { name: 'xp',                 type: 'number' },
  { name: 'level',              type: 'number' },
  { name: 'streak',             type: 'number' },
  { name: 'streak_last_active', type: 'date' },
]

// Resolve "__COL:name__" placeholders to real PocketBase collection IDs
function resolveIds(fields: any[], idMap: Record<string, string>): any[] {
  return fields.map((f) => {
    if (typeof f.collectionId === 'string' && f.collectionId.startsWith('__COL:')) {
      const colName = f.collectionId.slice(6, -2)
      const resolvedId = idMap[colName]
      if (!resolvedId) throw new Error(`No ID found for collection "${colName}" — check creation order`)
      return { ...f, collectionId: resolvedId }
    }
    return f
  })
}

async function main() {
  console.log('\n🏠  PocketBase Setup — Household Todo\n')

  const pbUrl    = (await ask('  PocketBase URL [http://localhost:8090]: ')).trim() || 'http://localhost:8090'
  const email    = (await ask('  Admin email: ')).trim()
  const password = (await ask('  Admin password: ')).trim()
  rl.close()
  console.log()

  const pb = new PocketBase(pbUrl)

  // Auth — try both old (admins) and new (0.23+ _superusers) APIs
  try {
    await pb.admins.authWithPassword(email, password)
    ok('Authenticated')
  } catch {
    try {
      await (pb as any).collection('_superusers').authWithPassword(email, password)
      ok('Authenticated')
    } catch {
      err('Authentication failed — check your credentials')
      process.exit(1)
    }
  }

  // Build ID map: name → real collection ID (seeded with known system IDs)
  const idMap: Record<string, string> = {
    '_pb_users_auth_': '_pb_users_auth_',
  }

  // Extend built-in users collection with extra fields
  try {
    const col = await pb.collections.getOne('users')
    const existingNames = new Set((col.fields ?? col.schema ?? []).map((f: any) => f.name))
    const toAdd = USER_EXTRA_FIELDS.filter((f) => !existingNames.has(f.name))
    if (toAdd.length) {
      const current = col.fields ?? col.schema ?? []
      await pb.collections.update('users', { fields: [...current, ...toAdd] })
      ok(`Extended users (+${toAdd.map((f) => f.name).join(', ')})`)
    } else {
      log('users already extended, skipping')
    }
  } catch (e: any) {
    err(`Failed to extend users: ${e.message}`)
  }

  // Create collections in order
  for (const def of COLLECTION_DEFS) {
    // Skip if already exists — record its ID
    try {
      const existing = await pb.collections.getOne(def.name)
      idMap[def.name] = existing.id
      log(`${def.name} already exists, skipping`)
      continue
    } catch { /* not found — create it */ }

    // Resolve relation placeholders using IDs collected so far
    let fields: any[]
    try {
      fields = resolveIds(def.fields as any[], idMap)
    } catch (e: any) {
      err(`Cannot resolve fields for ${def.name}: ${e.message}`)
      continue
    }

    try {
      const created = await pb.collections.create({ ...def, fields } as any)
      idMap[def.name] = created.id
      ok(`Created: ${def.name}  (id: ${created.id})`)
    } catch (e: any) {
      err(`Failed to create ${def.name}: ${e.message}`)
      if (e.response?.data) {
        console.error('    Details:', JSON.stringify(e.response.data, null, 2))
      }
    }
  }

  console.log('\n  Done! Your PocketBase instance is ready.')
  console.log('  Run: npm run dev  →  http://localhost:5173\n')
}

main().catch((e) => { console.error(e); process.exit(1) })
