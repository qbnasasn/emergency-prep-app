import { db } from '@/lib/db/local';

export async function buildOfflineContext(): Promise<string> {
  try {
    const parts: string[] = [];

    // 1. Fetch Profile (User)
    try {
        const profile = await db.user_settings.get('profile');
        if (profile && profile.value) {
            const p = profile.value;
            parts.push(`[USER_PROFILE]\nName: ${p.fullName || p.firstName || 'Unknown'}\nEmail: ${p.email || 'Unknown'}`);
        }
    } catch (e) {
        // Ignore profile error
    }

    // 2. Fetch Inventory
    try {
        const items = await db.inventory.toArray();
        if (items.length > 0) {
            const inventoryString = items.map(item => {
                return `- ${item.name} (Qty: ${item.quantity || 1}) [${item.category || 'Uncategorized'}] @ ${item.location || 'Unknown'}`;
            }).join('\n');
            parts.push(`[INVENTORY]\n${inventoryString}`);
        } else {
            parts.push(`[INVENTORY]\n(No items)`);
        }
    } catch (e) {
        parts.push(`[INVENTORY]\n(Error fetching data)`);
    }

    // 3. Fetch Kits
    try {
        const kits = await db.kits.toArray();
        if (kits.length > 0) {
            const kitsString = kits.map(kit => {
                return `- ${kit.name}: ${kit.description || 'No description'}`;
            }).join('\n');
            parts.push(`[KITS]\n${kitsString}`);
        }
    } catch (e) {
        // Ignore
    }

    // 4. Fetch Plans
    try {
        const plans = await db.plans.toArray();
        if (plans.length > 0) {
            const plansString = plans.map(plan => {
                const typeInfo = plan.type ? ` [Type: ${plan.type}]` : '';
                return `- ${plan.name}${typeInfo}: ${plan.description || 'No description'}`;
            }).join('\n');
            parts.push(`[PLANS]\n${plansString}`);
        }
    } catch (e) {
        // Ignore
    }

    if (parts.length === 0) return "Data unavailable (Database empty or inaccessible).";

    return parts.join('\n\n');

  } catch (error) {
    console.error("Failed to build offline context:", error);
    return "Data unavailable (Error accessing local database).";
  }
}
