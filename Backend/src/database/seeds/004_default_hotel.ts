import { Knex } from 'knex';

export async function seed(knex: Knex): Promise<void> {
  // Deletes ALL existing entries
  await knex('hotels').del();

  // Inserts seed entries
  await knex('hotels').insert([
    {
      id: 1,
      hotel_id: '1000000000', // 10-digit hotel ID
      vendor_id: 1, // References the default vendor
      name: 'Grand Hotel Downtown',
      slug: 'grand-hotel-downtown',
      description: 'A luxury hotel in the heart of downtown',
      address: '123 Main Street',
      city: 'New York',
      state: 'NY',
      country: 'USA',
      postal_code: '10001',
      phone: '+1-555-0101',
      email: 'admin@grandhoteldowntown.com',
      star_rating: 5,
      check_in_time: '15:00:00',
      check_out_time: '11:00:00',
      status: 'active',
      is_featured: true,
      avg_rating: 4.8,
      total_reviews: 250
    },
    {
      id: 2,
      hotel_id: '1000000001', // 10-digit hotel ID
      vendor_id: 1, // References the default vendor
      name: 'Luxury Resort & Spa',
      slug: 'luxury-resort-spa',
      description: 'A premium resort with world-class spa facilities',
      address: '456 Ocean Drive',
      city: 'Miami',
      state: 'FL',
      country: 'USA',
      postal_code: '33139',
      phone: '+1-555-0102',
      email: 'admin@luxuryresortspa.com',
      star_rating: 5,
      check_in_time: '16:00:00',
      check_out_time: '12:00:00',
      status: 'active',
      is_featured: true,
      avg_rating: 4.9,
      total_reviews: 180
    }
  ]);
}