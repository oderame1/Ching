import { Pool } from 'pg';
import bcrypt from 'bcryptjs';
import dotenv from 'dotenv';

dotenv.config();

const pool = new Pool({
  connectionString: process.env.DATABASE_URL || 'postgresql://escrow_user:escrow_password@localhost:5432/escrow_db',
  ssl: process.env.NODE_ENV === 'production' ? { rejectUnauthorized: false } : false,
});

interface User {
  email: string;
  password_hash: string;
  name: string;
  role: string;
  phone?: string;
}

const hashPassword = async (password: string): Promise<string> => {
  return bcrypt.hash(password, 10);
};

const seedUsers = async () => {
  console.log('🌱 Seeding database with dummy data...\n');

  try {
    // Clear existing test data (optional - comment out if you want to keep existing data)
    console.log('Clearing existing test users...');
    await pool.query("DELETE FROM users WHERE email LIKE '%@test.escrow%' OR email LIKE '%@example.com%'");

    // Seed Buyers
    const buyers: User[] = [
      {
        email: 'buyer1@test.escrow',
        password_hash: await hashPassword('password123'),
        name: 'John Buyer',
        role: 'buyer',
        phone: '+1234567890',
      },
      {
        email: 'buyer2@test.escrow',
        password_hash: await hashPassword('password123'),
        name: 'Jane Purchaser',
        role: 'buyer',
        phone: '+1234567891',
      },
      {
        email: 'buyer3@test.escrow',
        password_hash: await hashPassword('password123'),
        name: 'Bob Customer',
        role: 'buyer',
        phone: '+1234567892',
      },
    ];

    // Seed Sellers
    const sellers: User[] = [
      {
        email: 'seller1@test.escrow',
        password_hash: await hashPassword('password123'),
        name: 'Alice Seller',
        role: 'seller',
        phone: '+1234567900',
      },
      {
        email: 'seller2@test.escrow',
        password_hash: await hashPassword('password123'),
        name: 'Charlie Merchant',
        role: 'seller',
        phone: '+1234567901',
      },
      {
        email: 'seller3@test.escrow',
        password_hash: await hashPassword('password123'),
        name: 'Diana Vendor',
        role: 'seller',
        phone: '+1234567902',
      },
    ];

    // Seed Admins
    const admins: User[] = [
      {
        email: 'admin@test.escrow',
        password_hash: await hashPassword('admin123'),
        name: 'Admin User',
        role: 'admin',
        phone: '+1234567999',
      },
      {
        email: 'admin2@test.escrow',
        password_hash: await hashPassword('admin123'),
        name: 'Super Admin',
        role: 'admin',
        phone: '+1234567998',
      },
    ];

    // Insert Buyers
    console.log('Creating buyers...');
    for (const buyer of buyers) {
      const result = await pool.query(
        `INSERT INTO users (email, password_hash, name, role, phone, email_verified, phone_verified)
         VALUES ($1, $2, $3, $4, $5, $6, $7)
         ON CONFLICT (email) DO UPDATE SET
           password_hash = EXCLUDED.password_hash,
           name = EXCLUDED.name,
           role = EXCLUDED.role,
           phone = EXCLUDED.phone
         RETURNING id, email, name, role`,
        [buyer.email, buyer.password_hash, buyer.name, buyer.role, buyer.phone, true, true]
      );
      console.log(`  ✅ Created buyer: ${result.rows[0].email} (${result.rows[0].name})`);
    }

    // Insert Sellers
    console.log('\nCreating sellers...');
    for (const seller of sellers) {
      const result = await pool.query(
        `INSERT INTO users (email, password_hash, name, role, phone, email_verified, phone_verified)
         VALUES ($1, $2, $3, $4, $5, $6, $7)
         ON CONFLICT (email) DO UPDATE SET
           password_hash = EXCLUDED.password_hash,
           name = EXCLUDED.name,
           role = EXCLUDED.role,
           phone = EXCLUDED.phone
         RETURNING id, email, name, role`,
        [seller.email, seller.password_hash, seller.name, seller.role, seller.phone, true, true]
      );
      console.log(`  ✅ Created seller: ${result.rows[0].email} (${result.rows[0].name})`);
    }

    // Insert Admins
    console.log('\nCreating admins...');
    for (const admin of admins) {
      const result = await pool.query(
        `INSERT INTO users (email, password_hash, name, role, phone, email_verified, phone_verified)
         VALUES ($1, $2, $3, $4, $5, $6, $7)
         ON CONFLICT (email) DO UPDATE SET
           password_hash = EXCLUDED.password_hash,
           name = EXCLUDED.name,
           role = EXCLUDED.role,
           phone = EXCLUDED.phone
         RETURNING id, email, name, role`,
        [admin.email, admin.password_hash, admin.name, admin.role, admin.phone, true, true]
      );
      console.log(`  ✅ Created admin: ${result.rows[0].email} (${result.rows[0].name})`);
    }

    // Get user IDs for wallet creation
    console.log('\nCreating wallets for users...');
    const userResult = await pool.query('SELECT id, email, role FROM users WHERE email LIKE \'%@test.escrow\'');
    
    for (const user of userResult.rows) {
      // Check if wallet exists
      const walletCheck = await pool.query('SELECT id FROM wallets WHERE user_id = $1', [user.id]);
      
      if (walletCheck.rows.length === 0) {
        await pool.query(
          `INSERT INTO wallets (user_id, currency, balance)
           VALUES ($1, $2, $3)`,
          [user.id, 'USD', user.role === 'buyer' ? 1000.00 : user.role === 'seller' ? 500.00 : 0.00]
        );
        console.log(`  ✅ Created wallet for ${user.email} with balance $${user.role === 'buyer' ? '1000' : user.role === 'seller' ? '500' : '0'}`);
      } else {
        console.log(`  ⏭️  Wallet already exists for ${user.email}`);
      }
    }

    // Summary
    console.log('\n📊 Seeding Summary:');
    const counts = await pool.query(
      `SELECT role, COUNT(*) as count 
       FROM users 
       WHERE email LIKE '%@test.escrow' 
       GROUP BY role`
    );
    
    for (const row of counts.rows) {
      console.log(`  ${row.role}: ${row.count} users`);
    }

    const walletCount = await pool.query(
      `SELECT COUNT(*) as count 
       FROM wallets w
       JOIN users u ON w.user_id = u.id
       WHERE u.email LIKE '%@test.escrow'`
    );
    console.log(`  Wallets: ${walletCount.rows[0].count}`);

    console.log('\n✅ Database seeding completed successfully!');
    console.log('\n📝 Test Credentials:');
    console.log('  Buyers:');
    buyers.forEach(b => console.log(`    ${b.email} / password123`));
    console.log('  Sellers:');
    sellers.forEach(s => console.log(`    ${s.email} / password123`));
    console.log('  Admins:');
    admins.forEach(a => console.log(`    ${a.email} / admin123`));

  } catch (error) {
    console.error('❌ Error seeding database:', error);
    process.exit(1);
  } finally {
    await pool.end();
  }
};

seedUsers();

