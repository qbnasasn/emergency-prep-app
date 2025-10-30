import React from 'react';

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

interface Plan {
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
  return (
    <div className="printable-plan p-8 bg-white text-black">
      <h1 className="text-3xl font-bold mb-2 border-b-2 border-black pb-2">{plan.name}</h1>
      <p className="mb-4 italic">{plan.description}</p>

      <div className="mb-6">
        <h2 className="text-xl font-semibold">Hazard Type</h2>
        <p>{plan.hazard_type}</p>
      </div>

      <div className="mb-6">
        <h2 className="text-2xl font-bold mb-2 border-b border-gray-400 pb-1">Contacts</h2>
        {plan.contacts.map(contact => (
          <div key={contact.id} className="mb-2">
            <p className="font-semibold">{contact.first_name} {contact.last_name}</p>
            <p>Phone: {contact.phone_number}</p>
            <p>Email: {contact.email}</p>
          </div>
        ))}
      </div>

      <div className="mb-6">
        <h2 className="text-2xl font-bold mb-2 border-b border-gray-400 pb-1">Pets</h2>
        {plan.pets.map(pet => (
          <div key={pet.id} className="mb-2">
            <p className="font-semibold">{pet.name} ({pet.type} - {pet.breed})</p>
          </div>
        ))}
      </div>

      <div className="mb-6">
        <h2 className="text-2xl font-bold mb-2 border-b border-gray-400 pb-1">Locations</h2>
        {plan.locations.map(location => (
          <div key={location.id} className="mb-2">
            <p className="font-semibold">{location.name}</p>
            <p>{location.address}</p>
          </div>
        ))}
      </div>

      <div>
        <h2 className="text-2xl font-bold mb-2 border-b border-gray-400 pb-1">Inventory Items</h2>
        <ul>
          {plan.inventory_items.map(item => (
            <li key={item.id} className="flex justify-between">
              <span>{item.name}</span>
              <span>Quantity: {item.quantity}</span>
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
};

export default PrintablePlan;
