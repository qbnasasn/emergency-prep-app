'use client'

import React, { useEffect, useRef, useState } from 'react'
import { Loader } from '@googlemaps/js-api-loader'
import { Input } from '@/components/ui/input'

interface AddressAutocompleteProps {
  onAddressSelect: (address: google.maps.places.PlaceResult) => void;
}

const AddressAutocomplete: React.FC<AddressAutocompleteProps> = ({ onAddressSelect }) => {
  const inputRef = useRef<HTMLInputElement>(null)
  const [autocomplete, setAutocomplete] = useState<google.maps.places.Autocomplete | null>(null)

  useEffect(() => {
    const loader = new Loader({
      apiKey: process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY!,
      version: 'weekly',
      libraries: ['places'],
    })

    loader.load().then(() => {
      if (inputRef.current) {
        const autocompleteInstance = new google.maps.places.Autocomplete(inputRef.current, {
          types: ['address'],
          componentRestrictions: { country: 'us' }, // Restrict to US addresses for now
        })
        setAutocomplete(autocompleteInstance)
      }
    })
  }, [])

  useEffect(() => {
    if (autocomplete) {
      const listener = autocomplete.addListener('place_changed', () => {
        const place = autocomplete.getPlace()
        if (place.geometry) {
          onAddressSelect(place)
        }
      })
      return () => {
        google.maps.event.removeListener(listener)
      }
    }
  }, [autocomplete, onAddressSelect])

  return <Input ref={inputRef} type="text" placeholder="Enter an address" />
}

export default AddressAutocomplete
