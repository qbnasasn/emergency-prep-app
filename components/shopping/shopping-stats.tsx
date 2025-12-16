import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { ShoppingCart, AlertTriangle, Calendar, DollarSign } from "lucide-react"

// Define the interface locally to avoid circular dependency issues, or export it from a shared file in the future.
// For now, mirroring the structure used in ShoppingList is safest.
interface ShoppingItem {
  id: string;
  shopping_list_id: string;
  item_name: string;
  quantity: number;
  is_purchased: boolean;
  inventory_item_id: string | null;
  category?: string;
  estimated_cost?: number;
  preferred_store?: string;
  upc?: string;
  image?: string;
  reason?: string;
}

interface ShoppingStatsProps {
  items?: ShoppingItem[];
}

export function ShoppingStats({ items = [] }: ShoppingStatsProps) {
  // Filter for unpurchased items for most stats, as purchased items are "done"
  const unpurchasedItems = items.filter(item => !item.is_purchased);

  // 1. Items to Buy (Total Unpurchased)
  const itemsToBuyCount = unpurchasedItems.length;
  const urgentCount = unpurchasedItems.filter(item => item.reason === 'out-of-stock').length;

  // 2. Out of Stock (Critical) - Based on 'reason'
  const outOfStockCount = unpurchasedItems.filter(item => item.reason === 'out-of-stock').length;
  // Note: This overlaps with 'urgentCount' logic above, but presents it as a distinct category as per original design.

  // 3. Expiring Soon - Based on 'reason'
  const expiringCount = unpurchasedItems.filter(item => item.reason === 'expiring').length;

  // 4. Estimated Cost - Sum of (cost * quantity) for unpurchased items
  const totalCost = unpurchasedItems.reduce((sum, item) => {
    return sum + ((item.estimated_cost || 0) * item.quantity);
  }, 0);

  const formattedCost = new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
    maximumFractionDigits: 0,
  }).format(totalCost);


  const stats = [
    {
      title: "Items to Buy",
      value: itemsToBuyCount.toString(),
      change: `${urgentCount} urgent`,
      icon: ShoppingCart,
      color: "text-primary",
      bgColor: "bg-primary/10",
    },
    {
      title: "Out of Stock",
      value: outOfStockCount.toString(),
      change: "Critical items",
      icon: AlertTriangle,
      color: "text-destructive",
      bgColor: "bg-destructive/10",
    },
    {
      title: "Expiring Soon",
      value: expiringCount.toString(),
      change: "From inventory",
      icon: Calendar,
      color: "text-primary",
      bgColor: "bg-primary/10",
    },
    {
      title: "Estimated Cost",
      value: formattedCost,
      change: "For unpurchased items",
      icon: DollarSign,
      color: "text-primary",
      bgColor: "bg-primary/10",
    },
  ]

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
      {stats.map((stat) => (
        <Card key={stat.title}>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="font-body text-sm font-medium text-muted-foreground">{stat.title}</CardTitle>
            <div className={`p-2 rounded-lg ${stat.bgColor}`}>
              <stat.icon className={`h-4 w-4 ${stat.color}`} />
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-heading font-bold text-foreground">{stat.value}</div>
            <p className="text-xs text-muted-foreground font-body mt-1">{stat.change}</p>
          </CardContent>
        </Card>
      ))}
    </div>
  )
}
