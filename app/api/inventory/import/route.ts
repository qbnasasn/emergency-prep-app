import { NextResponse } from 'next/server';
import pool from '@/lib/db';
import { getAuthUser } from "@/lib/auth"

export async function POST(req: Request) {
  const user = await getAuthUser();
  if (!user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const userId = user.id;
  const householdId = user.householdId; // Use correct field from AuthUser

  try {
    const body = await req.json();
    const { items } = body;

    if (!items || !Array.isArray(items) || items.length === 0) {
      return NextResponse.json({ error: 'No items provided' }, { status: 400 });
    }

    const client = await pool.connect();

    try {
      await client.query('BEGIN');

      // Efficient Bulk Insert using unnest
      // We need to prepare arrays for each column
      const names = [];
      const descriptions = [];
      const quantities = [];
      const categories = [];
      const locations = [];
      const suppliers = [];
      const costs = [];
      const purchaseDates = [];
      const expiryDates = [];
      const minStocks = [];
      const caloriesList = [];
      const upcs = [];

      for (const item of items) {
        names.push(item.name);
        descriptions.push(item.description || null);
        quantities.push(parseInt(item.quantity) || 0);
        categories.push(item.category);
        locations.push(item.location || null);
        suppliers.push(item.supplier || null);
        costs.push(parseFloat(item.cost_per_unit) || null);
        purchaseDates.push(item.purchase_date ? new Date(item.purchase_date) : null);
        // Handle empty expiry dates correctly
        expiryDates.push(item.expiry_date ? new Date(item.expiry_date) : null);
        minStocks.push(parseInt(item.min_stock) || 0);
        caloriesList.push(parseInt(item.calories) || null);
        upcs.push(item.upc || null);
      }

      // Query to insert multiple rows efficiently
      // We assign household_id from the authenticated user
      const queryText = `
        INSERT INTO inventory_items (
          user_id,
          household_id,
          name,
          description,
          quantity,
          category,
          location,
          supplier,
          cost_per_unit,
          purchase_date,
          expiry_date,
          min_stock,
          calories,
          upc
        )
        SELECT
          $1 as user_id,
          $2 as household_id,
          u.name,
          u.description,
          u.quantity,
          u.category,
          u.location,
          u.supplier,
          u.cost_per_unit,
          u.purchase_date,
          u.expiry_date,
          u.min_stock,
          u.calories,
          u.upc
        FROM unnest(
          $3::text[],
          $4::text[],
          $5::int[],
          $6::text[],
          $7::text[],
          $8::text[],
          $9::decimal[],
          $10::date[],
          $11::date[],
          $12::int[],
          $13::int[],
          $14::text[]
        ) AS u(name, description, quantity, category, location, supplier, cost_per_unit, purchase_date, expiry_date, min_stock, calories, upc)
      `;

      await client.query(queryText, [
        userId,
        householdId,
        names,
        descriptions,
        quantities,
        categories,
        locations,
        suppliers,
        costs,
        purchaseDates,
        expiryDates,
        minStocks,
        caloriesList,
        upcs
      ]);

      await client.query('COMMIT');
      return NextResponse.json({ message: 'Import successful', count: items.length });
    } catch (error) {
      await client.query('ROLLBACK');
      console.error('SQL Error during bulk import:', error);
      // Return a more friendly error if possible (e.g., date format issues)
      return NextResponse.json({ error: 'Failed to save items to database. Please check data formats (e.g. dates).' }, { status: 500 });
    } finally {
      client.release();
    }
  } catch (error) {
    console.error('Error importing inventory:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
