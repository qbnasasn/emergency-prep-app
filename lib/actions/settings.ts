'use server';

import { getAuthUser } from '@/lib/auth';
import { checkUserInventory } from '@/lib/inventory-check';

export async function forceInventoryCheck() {
  try {
    const { user } = await getAuthUser();
    if (!user) {
      return { success: false, error: 'Unauthorized' };
    }

    await checkUserInventory(user.id, true);

    return { success: true, message: 'Inventory check initiated successfully.' };
  } catch (error) {
    console.error('Error forcing inventory check:', error);
    return { success: false, error: 'Failed to perform inventory check.' };
  }
}
