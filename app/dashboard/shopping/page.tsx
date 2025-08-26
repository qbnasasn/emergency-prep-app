"use client"

import { useState, useEffect } from "react"
import { ShoppingHeader } from "@/components/shopping/shopping-header"
import { ShoppingStats } from "@/components/shopping/shopping-stats"
import { ShoppingList } from "@/components/shopping/shopping-list"
import { ShoppingFilters } from "@/components/shopping/shopping-filters"

export default function ShoppingPage() {
  const [shoppingList, setShoppingList] = useState(null);
  const [loading, setLoading] = useState(true);

  const fetchShoppingList = async () => {
    setLoading(true);
    try {
      const response = await fetch('/api/shopping-lists');
      const data = await response.json();
      setShoppingList(data);
    } catch (error) {
      console.error("Failed to fetch shopping list", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchShoppingList();
  }, []);

  if (loading) {
    return <div>Loading shopping list...</div>;
  }

  if (!shoppingList) {
    return <div>Could not load shopping list.</div>;
  }

  return (
    <div className="space-y-6">
      <ShoppingHeader shoppingListId={shoppingList.id} onListUpdate={fetchShoppingList} />
      <ShoppingStats />
      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        <div className="lg:col-span-1">
          <ShoppingFilters />
        </div>
        <div className="lg:col-span-3">
          <ShoppingList shoppingListId={shoppingList.id} items={shoppingList.items} onListUpdate={fetchShoppingList} />
        </div>
      </div>
    </div>
  )
}
