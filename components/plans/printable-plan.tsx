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
  street_number: string;
  street_name: string;
  city: string;
  state: string;
  zip_code: string;
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
  routes: Route[];
}

interface PrintablePlanProps {
  plan: Plan;
}

const PrintablePlan: React.FC<PrintablePlanProps> = ({ plan }) => {
  const apiKey = process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY!;
  const { routes = [] } = plan;

  // Define styles with explicit hex colors to avoid oklch issues with html2pdf/html2canvas
  const styles = {
    container: { backgroundColor: '#ffffff', color: '#000000', fontFamily: 'ui-sans-serif, system-ui, sans-serif', padding: '2rem' },
    headerBorder: { borderBottom: '4px solid #000000', paddingBottom: '0.5rem', marginBottom: '0.5rem' },
    subHeaderBorder: { borderBottom: '2px solid #9ca3af', paddingBottom: '0.5rem', marginBottom: '1rem' },
    grayBox: { backgroundColor: '#f3f4f6', padding: '1rem', borderRadius: '0.375rem' },
    contactBorder: { borderLeft: '4px solid #3b82f6', padding: '0.5rem', marginBottom: '0.75rem' }, // Blue-500
    petBorder: { borderLeft: '4px solid #22c55e', padding: '0.5rem', marginBottom: '0.75rem' }, // Green-500
    locationBox: { backgroundColor: '#f9fafb', padding: '0.75rem', borderRadius: '0.5rem', marginBottom: '1rem' },
  };

  return (
    <div className="printable-plan" style={styles.container}>
      {/* Page 1: General Info */}
      <div className="page-break">
        <h1 className="text-4xl font-extrabold" style={styles.headerBorder}>{plan.name}</h1>
        <p className="mb-6 text-lg italic text-gray-600" style={{ color: '#4b5563' }}>{plan.description}</p>
        <div style={styles.grayBox}>
          <h2 className="text-2xl font-bold mb-2" style={{ color: '#1f2937' }}>Primary Hazard</h2>
          <p className="text-lg">{plan.hazard_type}</p>
        </div>
      </div>

      {/* Page 2: Contacts & Pets */}
      <div className="page-break" style={{ marginTop: '2rem' }}>
        <h2 className="text-3xl font-bold" style={styles.subHeaderBorder}>Contacts & Pets</h2>
        <div className="grid grid-cols-2 gap-8" style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '2rem' }}>
          <div>
            <h3 className="text-2xl font-semibold mb-3">Emergency Contacts</h3>
            {plan.contacts.map(contact => (
              <div key={contact.id} style={styles.contactBorder}>
                <p className="font-bold text-lg">{contact.first_name} {contact.last_name}</p>
                <p>Phone: {contact.phone_number}</p>
                <p>Email: {contact.email}</p>
              </div>
            ))}
          </div>
          <div>
            <h3 className="text-2xl font-semibold mb-3">Pets</h3>
            {plan.pets.map(pet => (
              <div key={pet.id} style={styles.petBorder}>
                <p className="font-bold text-lg">{pet.name}</p>
                <p>{pet.type} - {pet.breed}</p>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Page 3: Locations */}
      <div className="page-break" style={{ marginTop: '2rem' }}>
        <h2 className="text-3xl font-bold" style={styles.subHeaderBorder}>Key Locations</h2>
        {plan.locations.map(location => (
          <div key={location.id} style={styles.locationBox}>
            <p className="font-bold text-xl">{location.name}</p>
            <p style={{ color: '#374151' }}>{location.street_number} {location.street_name}, {location.city}, {location.state} {location.zip_code}</p>
          </div>
        ))}
      </div>

      {/* Page 4 onwards: Routes */}
      {routes.map(route => (
        <div key={route.id} className="page-break" style={{ marginTop: '2rem' }}>
          <h2 className="text-3xl font-bold" style={styles.subHeaderBorder}>Route: {route.name}</h2>
          <div style={{ display: 'flex', justifyContent: 'center' }}>
            <StaticMap waypoints={route.waypoints} apiKey={apiKey} />
          </div>
        </div>
      ))}

      {/* Final Page: Inventory */}
      <div className="page-break" style={{ marginTop: '2rem' }}>
        <h2 className="text-3xl font-bold" style={styles.subHeaderBorder}>Inventory Checklist</h2>
        <ul className="list-disc pl-5" style={{ paddingLeft: '1.25rem', listStyleType: 'disc' }}>
          {plan.inventory_items.map(item => (
            <li key={item.id} className="mb-2 text-lg" style={{ marginBottom: '0.5rem' }}>
              <span className="font-semibold">{item.name}</span> -
              <span style={{ color: '#4b5563' }}> Quantity: {item.quantity}</span>
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
};

export default PrintablePlan;
