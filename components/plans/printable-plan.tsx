import React, { useState, useEffect } from 'react';
import StaticMap from '../maps/static-map';

interface Contact {
  id: string;
  first_name: string;
  last_name: string;
  phone_number: string;
  email: string;
}

interface Pet {
  id: string;
  name: string;
  type: string;
  breed: string;
}

interface Location {
  id: string;
  name: string;
  address: string;
}

interface InventoryItem {
  id: string;
  name: string;
  quantity: number;
}

interface Waypoint {
  latitude: number;
  longitude: number;
}

interface Route {
  id: string;
  name: string;
  waypoints: Waypoint[];
}

interface Plan {
  id: string;
  name: string;
  description: string;
  hazard_type: string;
  contacts: Contact[];
  pets: Pet[];
  locations: Location[];
  inventory_items: InventoryItem[];
}

interface PrintablePlanProps {
  plan: Plan;
}

const PrintablePlan: React.FC<PrintablePlanProps> = ({ plan }) => {
  const [routes, setRoutes] = useState<Route[]>([]);
  const apiKey = process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY!;

  useEffect(() => {
    const fetchRoutes = async () => {
      if (plan.id) {
        try {
          const response = await fetch(`/api/plans/${plan.id}/routes`);
          if (response.ok) {
            const data = await response.json();
            setRoutes(data);
          } else {
            console.error("Failed to fetch routes");
          }
        } catch (error) {
          console.error("Error fetching routes:", error);
        }
      }
    };
    fetchRoutes();
  }, [plan.id]);

  return (
    <div className="printable-plan p-8 bg-white text-black font-sans">
      {/* Page 1: General Info */}
      <div className="page-break">
        <h1 className="text-4xl font-extrabold mb-2 border-b-4 border-black pb-2">{plan.name}</h1>
        <p className="mb-6 text-lg italic text-gray-600">{plan.description}</p>
        <div className="rounded-md bg-gray-100 p-4">
          <h2 className="text-2xl font-bold mb-2 text-gray-800">Primary Hazard</h2>
          <p className="text-lg">{plan.hazard_type}</p>
        </div>
      </div>

      {/* Page 2: Contacts & Pets */}
      <div className="page-break">
        <h2 className="text-3xl font-bold mb-4 border-b-2 border-gray-400 pb-2">Contacts & Pets</h2>
        <div className="grid grid-cols-2 gap-8">
          <div>
            <h3 className="text-2xl font-semibold mb-3">Emergency Contacts</h3>
            {plan.contacts.map(contact => (
              <div key={contact.id} className="mb-3 p-2 border-l-4 border-blue-500">
                <p className="font-bold text-lg">{contact.first_name} {contact.last_name}</p>
                <p>Phone: {contact.phone_number}</p>
                <p>Email: {contact.email}</p>
              </div>
            ))}
          </div>
          <div>
            <h3 className="text-2xl font-semibold mb-3">Pets</h3>
            {plan.pets.map(pet => (
              <div key={pet.id} className="mb-3 p-2 border-l-4 border-green-500">
                <p className="font-bold text-lg">{pet.name}</p>
                <p>{pet.type} - {pet.breed}</p>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Page 3: Locations */}
      <div className="page-break">
        <h2 className="text-3xl font-bold mb-4 border-b-2 border-gray-400 pb-2">Key Locations</h2>
        {plan.locations.map(location => (
          <div key={location.id} className="mb-4 p-3 rounded-lg bg-gray-50">
            <p className="font-bold text-xl">{location.name}</p>
            <p className="text-gray-700">{location.address}</p>
          </div>
        ))}
      </div>

      {/* Page 4 onwards: Routes */}
      {routes.map(route => (
        <div key={route.id} className="page-break">
          <h2 className="text-3xl font-bold mb-4 border-b-2 border-gray-400 pb-2">Route: {route.name}</h2>
          <div className="flex justify-center">
            <StaticMap waypoints={route.waypoints} apiKey={apiKey} />
          </div>
        </div>
      ))}

      {/* Final Page: Inventory */}
      <div className="page-break">
        <h2 className="text-3xl font-bold mb-4 border-b-2 border-gray-400 pb-2">Inventory Checklist</h2>
        <ul className="list-disc pl-5">
          {plan.inventory_items.map(item => (
            <li key={item.id} className="mb-2 text-lg">
              <span className="font-semibold">{item.name}</span> -
              <span className="text-gray-600"> Quantity: {item.quantity}</span>
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
};

export default PrintablePlan;
