import { db } from "@/lib/db"
import { auth } from "@clerk/nextjs/server"
import { NextResponse } from "next/server"

export const dynamic = "force-dynamic"

export async function GET() {
  try {
    const { userId } = auth()

    if (!userId) {
      return new NextResponse("Unauthorized", { status: 401 })
    }

    const thirtyDaysFromNow = new Date()
    thirtyDaysFromNow.setDate(thirtyDaysFromNow.getDate() + 30)

    const expiringSoon = await db.inventory_item.count({
      where: {
        userId,
        expiry_date: {
          lte: thirtyDaysFromNow,
          gte: new Date(),
        },
      },
    })

    return NextResponse.json({ count: expiringSoon })
  } catch (error) {
    console.error("[EXPIRING_SOON_GET]", error)
    return new NextResponse("Internal Error", { status: 500 })
  }
}
