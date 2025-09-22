'use client'

import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import * as z from 'zod'
import { Button } from '@/components/ui/button'
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form'
import { Input } from '@/components/ui/input'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import AddressAutocomplete from '@/components/ui/address-autocomplete'

const formSchema = z.object({
  first_name: z.string().min(1, 'First name is required'),
  last_name: z.string().min(1, 'Last name is required'),
  weight_lbs: z.coerce.number().positive('Weight must be positive'),
  height_inches: z.coerce.number().positive('Height must be positive'),
  birth_date: z.string().min(1, 'Birth date is required'),
  role: z.string().min(1, 'Role is required'),
  phone_number: z.string().optional(),
  email: z.string().email('Invalid email address').optional(),
  call_sign: z.string().optional(),
  full_address: z.string().optional(),
  street_number: z.string().optional(),
  street_name: z.string().optional(),
  city: z.string().optional(),
  state: z.string().optional(),
  zip_code: z.string().optional(),
})

const roles = [
  "Lead Coordinator", "Emergency Kit Manager", "Utilities Manager", "Communications Officer",
  "Nutrition Officer", "Pet / Animal Caretaker", "Assistant", "Out-of-Town Emergency Contact",
  "Neighborhood Coordinator", "Tactical Lead"
]

export function FamilyMemberForm({ onFormSubmit, initialData }) {
  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: initialData || {
      first_name: '',
      last_name: '',
      weight_lbs: '',
      height_inches: '',
      birth_date: '',
      role: '',
      phone_number: '',
      email: '',
      call_sign: '',
      full_address: '',
      street_number: '',
      street_name: '',
      city: '',
      state: '',
      zip_code: '',
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

      // Consolidate all state updates in this one function
      form.setValue('full_address', place.formatted_address || '');
      form.setValue('street_number', streetNumber);
      form.setValue('street_name', streetName);
      form.setValue('city', city);
      form.setValue('state', state);
      form.setValue('zip_code', zipCode);
    }
  }

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
        <div className="grid grid-cols-2 gap-4">
          <FormField
            control={form.control}
            name="first_name"
            render={({ field }) => (
              <FormItem>
                <FormLabel>First Name</FormLabel>
                <FormControl>
                  <Input placeholder="John" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="last_name"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Last Name</FormLabel>
                <FormControl>
                  <Input placeholder="Doe" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>
        <div className="grid grid-cols-3 gap-4">
          <FormField
            control={form.control}
            name="weight_lbs"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Weight (lbs)</FormLabel>
                <FormControl>
                  <Input type="number" placeholder="180" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="height_inches"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Height (in)</FormLabel>
                <FormControl>
                  <Input type="number" placeholder="72" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="birth_date"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Birth Date</FormLabel>
                <FormControl>
                  <Input type="date" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>
        <FormField
          control={form.control}
          name="role"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Role</FormLabel>
              <Select onValueChange={field.onChange} defaultValue={field.value}>
                <FormControl>
                  <SelectTrigger>
                    <SelectValue placeholder="Select a role" />
                  </SelectTrigger>
                </FormControl>
                <SelectContent>
                  {roles.map(role => (
                    <SelectItem key={role} value={role}>{role}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <FormMessage />
            </FormItem>
          )}
        />
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
          {/* Hidden fields to store address components */}
          <FormField control={form.control} name="street_number" render={({ field }) => <Input {...field} type="hidden" />} />
          <FormField control={form.control} name="street_name" render={({ field }) => <Input {...field} type="hidden" />} />
          <FormField control={form.control} name="city" render={({ field }) => <Input {...field} type="hidden" />} />
          <FormField control={form.control} name="state" render={({ field }) => <Input {...field} type="hidden" />} />
          <FormField control={form.control} name="zip_code" render={({ field }) => <Input {...field} type="hidden" />} />
        </div>
        <div className="grid grid-cols-2 gap-4">
          <FormField
            control={form.control}
            name="phone_number"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Phone Number</FormLabel>
                <FormControl>
                  <Input placeholder="(123) 456-7890" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="email"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Email</FormLabel>
                <FormControl>
                  <Input placeholder="john.doe@example.com" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>
        <FormField
          control={form.control}
          name="call_sign"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Radio Call Sign</FormLabel>
              <FormControl>
                <Input placeholder="W1XYZ" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <Button type="submit">Save</Button>
      </form>
    </Form>
  )
}
