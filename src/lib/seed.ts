import { db } from '@/database/connection';
import { sql } from 'drizzle-orm';

export async function seedPatients() {
  try {
    // Clear existing data
    await db.execute(sql`DELETE FROM patients`);

    // Insert mock patients
    await db.execute(sql`
      INSERT INTO patients (
        patient_code, first_name, last_name, emergency_name, 
        emergency_relation, emergency_phone, address, age, 
        gender, height_cm, weight_kg, shoe_size, created_at, updated_at
      ) VALUES 
        ('P001', 'John', 'Smith', 'Mary Smith', 'Spouse', '+1234567890', '123 Main St, City', 45, 'Male', 175, 80, '42', NOW(), NOW()),
        ('P002', 'Sarah', 'Johnson', 'Mike Johnson', 'Husband', '+1234567891', '456 Oak Ave, Town', 32, 'Female', 165, 60, '38', NOW(), NOW()),
        ('P003', 'Michael', 'Brown', 'Lisa Brown', 'Wife', '+1234567892', '789 Pine Rd, Village', 28, 'Male', 180, 75, '44', NOW(), NOW()),
        ('P004', 'Emily', 'Davis', 'Robert Davis', 'Father', '+1234567893', '321 Elm St, Borough', 19, 'Female', 160, 55, '36', NOW(), NOW()),
        ('P005', 'David', 'Wilson', 'Jennifer Wilson', 'Sister', '+1234567894', '654 Maple Dr, County', 52, 'Male', 178, 85, '43', NOW(), NOW()),
        ('P006', 'Lisa', 'Miller', 'Tom Miller', 'Brother', '+1234567895', '987 Cedar Ln, District', 38, 'Female', 168, 62, '39', NOW(), NOW()),
        ('P007', 'James', 'Taylor', 'Patricia Taylor', 'Mother', '+1234567896', '147 Birch Way, Region', 41, 'Male', 182, 88, '45', NOW(), NOW()),
        ('P008', 'Amanda', 'Anderson', 'Chris Anderson', 'Partner', '+1234567897', '258 Spruce Ct, Area', 29, 'Female', 163, 58, '37', NOW(), NOW()),
        ('P009', 'Robert', 'Thomas', 'Karen Thomas', 'Wife', '+1234567898', '369 Willow Pl, Zone', 47, 'Male', 176, 82, '42', NOW(), NOW()),
        ('P010', 'Jessica', 'Jackson', 'Mark Jackson', 'Husband', '+1234567899', '741 Aspen Blvd, Sector', 35, 'Female', 167, 64, '40', NOW(), NOW()),
        ('P011', 'Christopher', 'White', 'Rachel White', 'Sister', '+1234567800', '852 Poplar Ave, Quarter', 24, 'Male', 179, 77, '44', NOW(), NOW()),
        ('P012', 'Ashley', 'Harris', 'Daniel Harris', 'Brother', '+1234567801', '963 Sycamore St, Division', 31, 'Female', 166, 61, '38', NOW(), NOW()),
        ('P013', 'Matthew', 'Martin', 'Stephanie Martin', 'Wife', '+1234567802', '159 Chestnut Rd, Section', 43, 'Male', 181, 86, '45', NOW(), NOW()),
        ('P014', 'Nicole', 'Thompson', 'Kevin Thompson', 'Husband', '+1234567803', '357 Hickory Ln, Territory', 27, 'Female', 164, 57, '37', NOW(), NOW()),
        ('P015', 'Andrew', 'Garcia', 'Michelle Garcia', 'Sister', '+1234567804', '486 Walnut Dr, Province', 39, 'Male', 177, 79, '43', NOW(), NOW())
    `);

    console.log('✅ Mock patients data seeded successfully!');
  } catch (error) {
    console.error('❌ Error seeding patients:', error);
    throw error;
  }
}

export async function seedUsers() {
  try {
    // Clear existing data
    await db.execute(sql`DELETE FROM users`);

    // Insert mock users (with hashed passwords)
    await db.execute(sql`
      INSERT INTO users (
        email, hashed_password, is_active, created_at, updated_at
      ) VALUES 
        ('admin@hospital.com', '$2b$10$rQZ8K9vX2mN3pL4qR5sT6u', true, NOW(), NOW()),
        ('doctor@hospital.com', '$2b$10$rQZ8K9vX2mN3pL4qR5sT6u', true, NOW(), NOW()),
        ('nurse@hospital.com', '$2b$10$rQZ8K9vX2mN3pL4qR5sT6u', true, NOW(), NOW())
    `);

    console.log('✅ Mock users data seeded successfully!');
  } catch (error) {
    console.error('❌ Error seeding users:', error);
    throw error;
  }
}

export async function seedRoles() {
  try {
    // Clear existing data
    await db.execute(sql`DELETE FROM roles`);

    // Insert mock roles
    await db.execute(sql`
      INSERT INTO roles (
        name, description, created_at, updated_at
      ) VALUES 
        ('admin', 'System Administrator', NOW(), NOW()),
        ('doctor', 'Medical Doctor', NOW(), NOW()),
        ('nurse', 'Registered Nurse', NOW(), NOW()),
        ('receptionist', 'Front Desk Staff', NOW(), NOW())
    `);

    console.log('✅ Mock roles data seeded successfully!');
  } catch (error) {
    console.error('❌ Error seeding roles:', error);
    throw error;
  }
}

export async function seedAll() {
  console.log('🌱 Starting database seeding...');
  
  try {
    await seedRoles();
    await seedUsers();
    await seedPatients();
    
    console.log('🎉 All mock data seeded successfully!');
  } catch (error) {
    console.error('💥 Seeding failed:', error);
    throw error;
  }
} 