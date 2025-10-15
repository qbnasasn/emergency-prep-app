'use client'

import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import * as z from 'zod'
import { useEffect, useState } from 'react'
import { Button } from '@/components/ui/button'
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form'
import { Input } from '@/components/ui/input'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import AddressAutocomplete from '@/components/ui/address-autocomplete'

const formSchema = z.object({
  first_name: z.string().min(1, 'First name is required'),
  last_name: z.string().min(1, 'Last name is required'),
  weight_lbs: z.coerce.number().positive('Weight must be positive').optional(),
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
  const [feet, setFeet] = useState(0)
  const [inches, setInches] = useState(0)
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

  useEffect(() => {
    if (initialData?.birth_date) {
      // The date from the DB is a string that might be interpreted in UTC.
      // We create a new Date to ensure we're working with a date object,
      // then adjust for the timezone offset to get the correct local date.
      const date = new Date(initialData.birth_date);
      date.setMinutes(date.getMinutes() + date.getTimezoneOffset());
      const formattedDate = date.toISOString().split('T')[0];
      form.setValue('birth_date', formattedDate, { shouldValidate: true, shouldDirty: true });
    }
    if (initialData?.height_inches) {
      const totalInches = initialData.height_inches;
      setFeet(Math.floor(totalInches / 12));
      setInches(totalInches % 12);
    }
  }, [initialData, form.setValue])

  function onSubmit(values: z.infer<typeof formSchema>) {
    onFormSubmit(values)
  }

  const handleAddressSelect = (address: any) => {
    // The new AddressAutocomplete component gives us the structured address directly.
    form.setValue('street_number', address.street_number);
    form.setValue('street_name', address.street_name);
    form.setValue('city', address.city);
    form.setValue('state', address.state);
    form.setValue('zip_code', address.zip_code);
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
          <div className="grid grid-cols-2 gap-2">
            <FormItem>
              <FormLabel>Height (ft)</FormLabel>
              <FormControl>
                <Input
                  type="number"
                  placeholder="5"
                  value={feet}
                  onChange={(e) => {
                    const newFeet = parseInt(e.target.value) || 0;
                    setFeet(newFeet);
                    form.setValue('height_inches', (newFeet * 12) + inches, { shouldValidate: true });
                  }}
                />
              </FormControl>
            </FormItem>
            <FormItem>
              <FormLabel>(in)</FormLabel>
              <FormControl>
                <Input
                  type="number"
                  placeholder="10"
                  value={inches}
                  onChange={(e) => {
                    const newInches = parseInt(e.target.value) || 0;
                    setInches(newInches);
                    form.setValue('height_inches', (feet * 12) + newInches, { shouldValidate: true });
                  }}
                />
              </FormControl>
            </FormItem>
          </div>
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
