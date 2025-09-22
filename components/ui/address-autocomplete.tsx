'use client'

import React, { useEffect, useRef, useState } from 'react'
import { Input } from '@/components/ui/input'
import { mapsLoader } from '@/lib/maps-loader'

interface AddressAutocompleteProps {
  value: string;
  onChange: (value: string) => void;
  onAddressSelect: (address: google.maps.places.PlaceResult) => void;
  placeholder?: string;
}

const AddressAutocomplete: React.FC<AddressAutocompleteProps> = ({
  value,
  onChange,
  onAddressSelect,
  placeholder = "Enter an address"
}) => {
  const inputRef = useRef<HTMLInputElement>(null)
  const [autocomplete, setAutocomplete] = useState<google.maps.places.Autocomplete | null>(null)

  // Effect to initialize the Google Maps Autocomplete
  useEffect(() => {
    mapsLoader.load().then(() => {
      if (inputRef.current) {
        const autocompleteInstance = new google.maps.places.Autocomplete(inputRef.current, {
          types: ['address'],
          componentRestrictions: { country: 'us' },
          fields: ['address_components', 'geometry', 'formatted_address']
        })
        setAutocomplete(autocompleteInstance)
      }
    })
  }, [])

  // Effect to handle place selection
  useEffect(() => {
    if (autocomplete) {
      const listener = autocomplete.addListener('place_changed', () => {
        const place = autocomplete.getPlace();
        // Ensure the place has address components before calling the handler.
        // This prevents errors if a user selects an option that isn't a detailed address.
        if (place && place.address_components) {
          onAddressSelect(place); // Pass the full place object for parsing
        }
      });
      return () => {
        google.maps.event.removeListener(listener);
      };
    }
  }, [autocomplete, onAddressSelect]);

  return <Input ref={inputRef} value={value} onChange={(e) => onChange(e.target.value)} type="text" placeholder={placeholder} />
}

export default AddressAutocomplete
