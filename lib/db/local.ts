import Dexie, { type EntityTable } from 'dexie';

interface InventoryItem {
  id: number;
  sync_status: string;
  category: string;
  [key: string]: any;
}

interface Kit {
  id: number;
  sync_status: string;
  [key: string]: any;
}

interface Plan {
  id: number;
  sync_status: string;
  [key: string]: any;
}

interface ShoppingListItem {
  id: number;
  sync_status: string;
  is_checked: boolean;
  [key: string]: any;
}

interface KnowledgeBaseItem {
  id: number;
  [key: string]: any;
}

interface UserSetting {
  key: string;
  value: any;
}

interface SyncQueueItem {
  id: number;
  operation: string;
  endpoint: string;
  payload: any;
  created_at: string;
  status?: string;
}

const db = new Dexie('PrepSafeLocal') as Dexie & {
  inventory: EntityTable<InventoryItem, 'id'>;
  kits: EntityTable<Kit, 'id'>;
  plans: EntityTable<Plan, 'id'>;
  shopping_list: EntityTable<ShoppingListItem, 'id'>;
  knowledge_base: EntityTable<KnowledgeBaseItem, 'id'>;
  user_settings: EntityTable<UserSetting, 'key'>;
  sync_queue: EntityTable<SyncQueueItem, 'id'>;
};

db.version(1).stores({
  inventory: '++id, sync_status, category',
  kits: '++id, sync_status',
  plans: '++id, sync_status',
  shopping_list: '++id, sync_status, is_checked',
  knowledge_base: '++id',
  user_settings: 'key',
  sync_queue: '++id, operation, endpoint, created_at'
});

export { db };
export type { InventoryItem, Kit, Plan, ShoppingListItem, KnowledgeBaseItem, UserSetting, SyncQueueItem };
