/**
 * PocketBase setup script — run once against a fresh PocketBase instance.
 *
 * Usage:
 *   npx tsx scripts/setup-pocketbase.ts
 *
 * It will prompt for your PocketBase URL and superadmin credentials,
 * then create all required collections with the correct schema and rules.
 */

import PocketBase from 'pocketbase'
import * as readline from 'readline'

// ─── Helpers ─────────────────────────────────────────────────────────────────

const rl = readline.createInterface({ input: process.stdin, output: process.stdout })
const ask = (q: string): Promise<string> =>
  new Promise((resolve) => rl.question(q, resolve))

function log(msg: string) { console.log(`  ${msg}`) }
function ok(msg: string)  { console.log(`  ✅ ${msg}`) }
function err(msg: string) { console.log(`  ❌ ${msg}`) }

// ─── Collection definitions ──────────────────────────────────────────────────

/**
 * Each entry: [name, fields[], indexes[]?]
 * Fields use the PocketBase collection schema format.
 * Rules: authenticated users can do everything (tighten in production).
 */

const AUTH_RULE = `@request.auth.id != ""`
const rules = {
  listRule: AUTH_RULE,
  viewRule: AUTH_RULE,
  createRule: AUTH_RULE,
  updateRule: AUTH_RULE,
  deleteRule: AUTH_RULE,
}

const collections = [
  // ── households ──────────────────────────────────────────────────────────────
  {
    name: 'households',
    type: 'base',
    ...rules,
    fields: [
      { name: 'name',         type: 'text',     required: true },
      { name: 'invite_code',  type: 'text',     required: true },
      { name: 'created_by',   type: 'relation', options: { collectionId: '_pb_users_auth_', cascadeDelete: false, maxSelect: 1, minSelect: 0 } },
    ],
    indexes: ['CREATE UNIQUE INDEX idx_household_invite ON households (invite_code)'],
  },

  // ── memberships ─────────────────────────────────────────────────────────────
  {
    name: 'memberships',
    type: 'base',
    ...rules,
    fields: [
      { name: 'user',       type: 'relation', required: true, options: { collectionId: '_pb_users_auth_', cascadeDelete: true,  maxSelect: 1, minSelect: 1 } },
      { name: 'household',  type: 'relation', required: true, options: { collectionId: 'households',      cascadeDelete: true,  maxSelect: 1, minSelect: 1 } },
      { name: 'role',       type: 'select',   required: true, options: { maxSelect: 1, values: ['admin', 'member'] } },
      { name: 'joined_at',  type: 'date' },
    ],
  },

  // ── lists ────────────────────────────────────────────────────────────────────
  {
    name: 'lists',
    type: 'base',
    ...rules,
    fields: [
      { name: 'household',   type: 'relation', required: true, options: { collectionId: 'households', cascadeDelete: true, maxSelect: 1, minSelect: 1 } },
      { name: 'name',        type: 'text',     required: true },
      { name: 'type',        type: 'select',   required: true, options: { maxSelect: 1, values: ['todo', 'shopping'] } },
      { name: 'color',       type: 'text' },
      { name: 'icon',        type: 'text' },
      { name: 'sort_order',  type: 'number' },
    ],
  },

  // ── tasks ────────────────────────────────────────────────────────────────────
  {
    name: 'tasks',
    type: 'base',
    ...rules,
    fields: [
      { name: 'list',                type: 'relation', required: true, options: { collectionId: 'lists',            cascadeDelete: true,  maxSelect: 1, minSelect: 1 } },
      { name: 'household',           type: 'relation', required: true, options: { collectionId: 'households',       cascadeDelete: true,  maxSelect: 1, minSelect: 1 } },
      { name: 'title',               type: 'text',     required: true },
      { name: 'description',         type: 'text' },
      { name: 'assigned_to',         type: 'relation', options: { collectionId: '_pb_users_auth_', cascadeDelete: false, maxSelect: 1, minSelect: 0 } },
      { name: 'priority',            type: 'select',   options: { maxSelect: 1, values: ['low', 'normal', 'high', 'urgent'] } },
      { name: 'due_date',            type: 'date' },
      { name: 'completed',           type: 'bool' },
      { name: 'completed_at',        type: 'date' },
      { name: 'completed_by',        type: 'relation', options: { collectionId: '_pb_users_auth_', cascadeDelete: false, maxSelect: 1, minSelect: 0 } },
      { name: 'recurring',           type: 'select',   options: { maxSelect: 1, values: ['none', 'daily', 'weekly', 'custom'] } },
      { name: 'recurring_interval',  type: 'number' },
      { name: 'recurring_next',      type: 'date' },
      { name: 'xp_value',            type: 'number' },
      { name: 'sort_order',          type: 'number' },
    ],
    indexes: [
      'CREATE INDEX idx_tasks_list_completed ON tasks (list, completed)',
      'CREATE INDEX idx_tasks_household_due ON tasks (household, due_date)',
    ],
  },

  // ── shopping_items ───────────────────────────────────────────────────────────
  {
    name: 'shopping_items',
    type: 'base',
    ...rules,
    fields: [
      { name: 'list',       type: 'relation', required: true, options: { collectionId: 'lists',            cascadeDelete: true,  maxSelect: 1, minSelect: 1 } },
      { name: 'household',  type: 'relation', required: true, options: { collectionId: 'households',       cascadeDelete: true,  maxSelect: 1, minSelect: 1 } },
      { name: 'title',      type: 'text',     required: true },
      { name: 'category',   type: 'text' },
      { name: 'checked',    type: 'bool' },
      { name: 'checked_by', type: 'relation', options: { collectionId: '_pb_users_auth_', cascadeDelete: false, maxSelect: 1, minSelect: 0 } },
      { name: 'checked_at', type: 'date' },
      { name: 'sort_order', type: 'number' },
    ],
    indexes: [
      'CREATE INDEX idx_shopping_list_checked ON shopping_items (list, checked)',
    ],
  },

  // ── xp_events ────────────────────────────────────────────────────────────────
  {
    name: 'xp_events',
    type: 'base',
    listRule:   AUTH_RULE,
    viewRule:   AUTH_RULE,
    createRule: AUTH_RULE,
    updateRule: null,   // immutable log — no updates
    deleteRule: null,
    fields: [
      { name: 'user',       type: 'relation', required: true, options: { collectionId: '_pb_users_auth_', cascadeDelete: true,  maxSelect: 1, minSelect: 1 } },
      { name: 'household',  type: 'relation', options: { collectionId: 'households',       cascadeDelete: true,  maxSelect: 1, minSelect: 0 } },
      { name: 'event_type', type: 'select',   options: { maxSelect: 1, values: ['task_complete', 'streak_bonus', 'level_up'] } },
      { name: 'xp_amount',  type: 'number' },
      { name: 'task',       type: 'relation', options: { collectionId: 'tasks',            cascadeDelete: true,  maxSelect: 1, minSelect: 0 } },
    ],
  },
]

// ─── User collection extensions ──────────────────────────────────────────────
// These are added to the built-in `users` auth collection.

const userExtraFields = [
  { name: 'xp',                 type: 'number' },
  { name: 'level',              type: 'number' },
  { name: 'streak',             type: 'number' },
  { name: 'streak_last_active', type: 'date' },
]

// ─── Main ─────────────────────────────────────────────────────────────────────

async function main() {
  console.log('\n🏠  PocketBase Setup — Household Todo\n')

  const pbUrl = (await ask('  PocketBase URL [http://localhost:8090]: ')).trim() || 'http://localhost:8090'
  const email = (await ask('  Admin email: ')).trim()
  const password = (await ask('  Admin password: ')).trim()
  rl.close()

  console.log()

  const pb = new PocketBase(pbUrl)

  // Authenticate as superadmin
  try {
    await pb.admins.authWithPassword(email, password)
    ok('Authenticated as admin')
  } catch {
    // PocketBase 0.23+ uses superusers collection
    try {
      await (pb as any).collection('_superusers').authWithPassword(email, password)
      ok('Authenticated as superuser')
    } catch (e) {
      err('Authentication failed — check your email/password')
      process.exit(1)
    }
  }

  // Extend users collection first
  try {
    const usersCollection = await pb.collections.getOne('users')
    const existingFieldNames = new Set((usersCollection.fields ?? usersCollection.schema ?? []).map((f: any) => f.name))
    const fieldsToAdd = userExtraFields.filter((f) => !existingFieldNames.has(f.name))

    if (fieldsToAdd.length > 0) {
      const currentFields = usersCollection.fields ?? usersCollection.schema ?? []
      await pb.collections.update('users', {
        fields: [...currentFields, ...fieldsToAdd],
        schema: [...currentFields, ...fieldsToAdd],
      })
      ok(`Extended users collection (+${fieldsToAdd.map((f) => f.name).join(', ')})`)
    } else {
      log('users collection already extended, skipping')
    }
  } catch (e: any) {
    err(`Failed to extend users: ${e.message}`)
  }

  // Create collections
  for (const col of collections) {
    try {
      // Check if already exists
      try {
        await pb.collections.getOne(col.name)
        log(`${col.name} already exists, skipping`)
        continue
      } catch {
        // doesn't exist — create it
      }

      await pb.collections.create(col as any)
      ok(`Created collection: ${col.name}`)
    } catch (e: any) {
      err(`Failed to create ${col.name}: ${e.message}`)
      if (e.response?.data) {
        console.error('    Details:', JSON.stringify(e.response.data, null, 2))
      }
    }
  }

  console.log('\n  Done! Your PocketBase instance is ready.\n')
  console.log('  Next: npm run dev  →  http://localhost:5173\n')
}

main().catch((e) => {
  console.error(e)
  process.exit(1)
})
