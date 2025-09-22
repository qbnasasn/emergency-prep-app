'use client'

import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import * as z from 'zod'
import { Button } from '@/components/ui/button'
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import AddressAutocomplete from '../ui/address-autocomplete'

const formSchema = z.object({
  name: z.string().min(1, 'Location name is required'),
  type: z.string().min(1, 'Location type is required'),
  full_address: z.string().optional(),
  street_number: z.string().optional(),
  street_name: z.string().optional(),
  city: z.string().optional(),
  state: z.string().optional(),
  zip_code: z.string().optional(),
  notes: z.string().optional(),
  latitude: z.number().optional(),
  longitude: z.number().optional(),
})

const locationTypes = [
    "Home", "Work", "School", "Bug-Out Location", "Rally Point", "Evacuation Shelter",
    "Family/Friend's House", "Hospital/Medical Center", "Emergency Cache"
];

export function LocationForm({ onFormSubmit, initialData }) {
  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: initialData || {
      name: '',
      type: '',
      full_address: '',
      street_number: '',
      street_name: '',
      city: '',
      state: '',
      zip_code: '',
      notes: '',
      latitude: undefined,
      longitude: undefined,
    },
  })

  function onSubmit(values: z.infer<typeof formSchema>) {
    onFormSubmit(values)
  }

  const handleAddressSelect = (place: google.maps.places.PlaceResult) => {
    if (place.address_components) {
      const streetNumber = place.address_components.find(c => c.types.includes('street_number'))?.long_name || ''
      const streetName = place.address_components.find(c => c.types.includes('route'))?.long_name || ''
      const city = place.address_components.find(c => c.types.includes('locality'))?.long_name || ''
      const state = place.address_components.find(c => c.types.includes('administrative_area_level_1'))?.short_name || ''
      const zipCode = place.address_components.find(c => c.types.includes('postal_code'))?.long_name || ''

      form.setValue('street_number', streetNumber)
      form.setValue('street_name', streetName)
      form.setValue('city', city)
      form.setValue('state', state)
      form.setValue('zip_code', zipCode)

      if (place.geometry?.location) {
        form.setValue('latitude', place.geometry.location.lat())
        form.setValue('longitude', place.geometry.location.lng())
      }
    }
  }

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
        <div className="grid grid-cols-2 gap-4">
            <FormField
              control={form.control}
              name="name"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Location Name</FormLabel>
                  <FormControl>
                    <Input placeholder="e.g., Home Base" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="type"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Location Type</FormLabel>
                  <Select onValueChange={field.onChange} defaultValue={field.value}>
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Select a type" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      {locationTypes.map(type => (
                        <SelectItem key={type} value={type}>{type}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />
        </div>

        <div className="space-y-2">
          <h3 className="text-sm font-medium">Address</h3>
          <FormField
            control={form.control}
            name="full_address"
            render={({ field }) => (
              <FormItem>
                <FormControl>
                  <AddressAutocomplete
                    value={field.value || ''}
                    onChange={field.onChange}
                    onAddressSelect={handleAddressSelect}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <div className="grid grid-cols-6 gap-4 mt-2">
            <div className="col-span-2">
              <FormField
                control={form.control}
                name="street_number"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Street No.</FormLabel>
                    <FormControl>
                      <Input placeholder="123" {...field} />
                    </FormControl>
                  </FormItem>
                )}
              />
            </div>
            <div className="col-span-4">
              <FormField
                control={form.control}
                name="street_name"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Street Name</FormLabel>
                    <FormControl>
                      <Input placeholder="Main St" {...field} />
                    </FormControl>
                  </FormItem>
                )}
              />
            </div>
            <div className="col-span-3">
              <FormField
                control={form.control}
                name="city"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>City</FormLabel>
                    <FormControl>
                      <Input placeholder="Anytown" {...field} />
                    </FormControl>
                  </FormItem>
                )}
              />
            </div>
            <div className="col-span-1">
              <FormField
                control={form.control}
                name="state"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>State</FormLabel>
                    <FormControl>
                      <Input placeholder="CA" {...field} />
                    </FormControl>
                  </FormItem>
                )}
              />
            </div>
            <div className="col-span-2">
              <FormField
                control={form.control}
                name="zip_code"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Zip Code</FormLabel>
                    <FormControl>
                      <Input placeholder="12345" {...field} />
                    </FormControl>
                  </FormItem>
                )}
              />
            </div>
          </div>
          {/* Hidden fields for lat/lng */}
          <FormField control={form.control} name="latitude" render={({ field }) => <Input {...field} type="hidden" />} />
          <FormField control={form.control} name="longitude" render={({ field }) => <Input {...field} type="hidden" />} />
        </div>

        <FormField
          control={form.control}
          name="notes"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Notes</FormLabel>
              <FormControl>
                <Textarea placeholder="e.g., Backdoor code is 1234. Emergency key under the fake rock." {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <Button type="submit">Save Location</Button>
      </form>
    </Form>
  )
}
