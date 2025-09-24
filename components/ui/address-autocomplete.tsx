'use client'

import React from 'react';
import GooglePlacesAutocomplete, { geocodeByAddress, getLatLng } from 'react-google-places-autocomplete';
import { Input } from '@/components/ui/input';

interface AddressAutocompleteProps {
  // This is the value of the input field (the full address string)
  value: any;
  // This is the onChange handler from react-hook-form
  onChange: (value: string) => void;
  // This is our custom handler to pass up the structured address data
  onAddressSelect: (address: StructuredAddress) => void;
}

export interface StructuredAddress {
  street_number: string;
  street_name: string;
  city: string;
  state: string;
  zip_code: string;
  latitude: number | null;
  longitude: number | null;
}

const AddressAutocomplete: React.FC<AddressAutocompleteProps> = ({ value, onChange, onAddressSelect }) => {

  const handleSelect = async (place: any) => {
    // Update the visible input field using the form's onChange
    onChange(place.label);

    try {
      const results = await geocodeByAddress(place.label);
      const latLng = await getLatLng(results[0]);

      const addressComponents = results[0].address_components;

      const street_number = addressComponents.find(c => c.types.includes('street_number'))?.long_name || '';
      const street_name = addressComponents.find(c => c.types.includes('route'))?.long_name || '';
      const city = addressComponents.find(c => c.types.includes('locality'))?.long_name || '';
      const state = addressComponents.find(c => c.types.includes('administrative_area_level_1'))?.short_name || '';
      const zip_code = addressComponents.find(c => c.types.includes('postal_code'))?.long_name || '';

      onAddressSelect({
        street_number,
        street_name,
        city,
        state,
        zip_code,
        latitude: latLng.lat,
        longitude: latLng.lng,
      });

    } catch (error) {
      console.error('Error getting address details:', error);
      // Handle error case, maybe clear the fields
      onAddressSelect({
        street_number: '',
        street_name: '',
        city: '',
        state: '',
        zip_code: '',
        latitude: null,
        longitude: null,
      });
    }
  };

  return (
    <GooglePlacesAutocomplete
      apiKey={process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY}
      selectProps={{
        value,
        onChange: handleSelect,
        placeholder: 'Enter an address...',
        styles: {
          input: (provided) => ({
            ...provided,
            // You can use tailwind classes here if you set up your project that way
            // For now, using inline styles to match the existing Input component
            height: '40px',
            padding: '8px 12px',
            borderRadius: '0.375rem',
            border: '1px solid hsl(240 5.9% 90%)',
          }),
          option: (provided) => ({
            ...provided,
            // style for dropdown options
          }),
        },
      }}
      autocompletionRequest={{
        componentRestrictions: {
          country: ['us'],
        },
      }}
    />
  );
};

export default AddressAutocomplete;
