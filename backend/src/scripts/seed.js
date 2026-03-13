import { v4 as uuidv4 } from 'uuid';
import { hashPassword } from '../utils/hash.util.js';
import { testConnection } from '../config/db.js';
import { User, Event, Inscription, Payment } from '../models/index.js';
import logger from '../config/logger.js';

/**
 * Seed data for OneLastEvent
 */
async function seed() {
  console.log('🌱 Starting database seeding...\n');

  try {
    // Test connection
    const connected = await testConnection();
    if (!connected) {
      console.error('❌ Cannot connect to database.');
      process.exit(1);
    }

    // Check if data already exists
    const existingUsers = await User.count();
    if (existingUsers > 0) {
      console.log('⚠️  Database already has data. Skipping seed.');
      console.log('   Run with --force to override (will delete existing data).');
      
      if (!process.argv.includes('--force')) {
        process.exit(0);
      }
      
      console.log('🗑️  Deleting existing data...');
      await Payment.destroy({ where: {} });
      await Inscription.destroy({ where: {} });
      await Event.destroy({ where: {} });
      await User.destroy({ where: {} });
    }

    // Create password hashes
    const adminPassword = await hashPassword('Admin123!');
    const userPassword = await hashPassword('User1234!');
    const organizerPassword = await hashPassword('Organizer1!');

    // Create users
    console.log('👤 Creating users...');
    
    const admin = await User.create({
      id: uuidv4(),
      email: 'admin@onelastevent.com',
      password_hash: adminPassword,
      full_name: 'Admin User',
      role: 'ADMIN',
      is_verified: true,
      bio: 'Platform administrator',
    });
    console.log(`   ✅ Admin: ${admin.email}`);

    const organizer1 = await User.create({
      id: uuidv4(),
      email: 'organizer1@example.com',
      password_hash: organizerPassword,
      full_name: 'Marie Dupont',
      role: 'ORGANIZER',
      is_verified: true,
      bio: 'Event organizer specializing in tech conferences',
    });
    console.log(`   ✅ Organizer: ${organizer1.email}`);

    const organizer2 = await User.create({
      id: uuidv4(),
      email: 'organizer2@example.com',
      password_hash: organizerPassword,
      full_name: 'Jean Martin',
      role: 'ORGANIZER',
      is_verified: true,
      bio: 'Cultural event organizer',
    });
    console.log(`   ✅ Organizer: ${organizer2.email}`);

    const users = [];
    for (let i = 1; i <= 5; i++) {
      const user = await User.create({
        id: uuidv4(),
        email: `user${i}@example.com`,
        password_hash: userPassword,
        full_name: `User ${i}`,
        role: 'USER',
        is_verified: true,
        bio: `Regular user ${i}`,
      });
      users.push(user);
      console.log(`   ✅ User: ${user.email}`);
    }

    // Create events
    console.log('\n📅 Creating events...');

    const events = [];

    // Free event
    const event1 = await Event.create({
      id: uuidv4(),
      organizer_id: organizer1.id,
      title: 'Introduction to Web Development',
      description: 'A free workshop for beginners to learn the basics of HTML, CSS, and JavaScript. Perfect for those starting their coding journey.',
      location: 'Paris, France - Online',
      start_datetime: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000), // 7 days from now
      end_datetime: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000 + 3 * 60 * 60 * 1000),
      capacity: 100,
      price: 0,
      currency: 'EUR',
      status: 'PUBLISHED',
      tags: ['tech', 'workshop', 'free', 'beginner'],
    });
    events.push(event1);
    console.log(`   ✅ Event: ${event1.title}`);

    // Paid event
    const event2 = await Event.create({
      id: uuidv4(),
      organizer_id: organizer1.id,
      title: 'Advanced React Patterns Workshop',
      description: 'Deep dive into advanced React patterns including compound components, render props, and custom hooks. Includes hands-on exercises.',
      location: 'Lyon, France',
      start_datetime: new Date(Date.now() + 14 * 24 * 60 * 60 * 1000),
      end_datetime: new Date(Date.now() + 14 * 24 * 60 * 60 * 1000 + 8 * 60 * 60 * 1000),
      capacity: 30,
      price: 149.99,
      currency: 'EUR',
      status: 'PUBLISHED',
      tags: ['react', 'javascript', 'workshop', 'advanced'],
    });
    events.push(event2);
    console.log(`   ✅ Event: ${event2.title}`);

    const event3 = await Event.create({
      id: uuidv4(),
      organizer_id: organizer2.id,
      title: 'Summer Music Festival 2025',
      description: 'Three days of amazing live music featuring local and international artists. Food trucks, art installations, and more!',
      location: 'Bordeaux, France',
      start_datetime: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
      end_datetime: new Date(Date.now() + 33 * 24 * 60 * 60 * 1000),
      capacity: 5000,
      price: 89.00,
      currency: 'EUR',
      status: 'PUBLISHED',
      tags: ['music', 'festival', 'outdoor', 'summer'],
    });
    events.push(event3);
    console.log(`   ✅ Event: ${event3.title}`);

    const event4 = await Event.create({
      id: uuidv4(),
      organizer_id: organizer1.id,
      title: 'Startup Networking Night',
      description: 'Connect with fellow entrepreneurs, investors, and tech enthusiasts. Pitch your ideas and find your next co-founder!',
      location: 'Paris, France',
      start_datetime: new Date(Date.now() + 5 * 24 * 60 * 60 * 1000),
      end_datetime: new Date(Date.now() + 5 * 24 * 60 * 60 * 1000 + 4 * 60 * 60 * 1000),
      capacity: 150,
      price: 25.00,
      currency: 'EUR',
      status: 'PUBLISHED',
      tags: ['networking', 'startup', 'business', 'tech'],
    });
    events.push(event4);
    console.log(`   ✅ Event: ${event4.title}`);

    const event5 = await Event.create({
      id: uuidv4(),
      organizer_id: organizer2.id,
      title: 'Wine Tasting Experience',
      description: 'Discover French wines with our sommelier. Taste 8 different wines paired with local cheeses and charcuterie.',
      location: 'Toulouse, France',
      start_datetime: new Date(Date.now() + 10 * 24 * 60 * 60 * 1000),
      end_datetime: new Date(Date.now() + 10 * 24 * 60 * 60 * 1000 + 3 * 60 * 60 * 1000),
      capacity: 25,
      price: 75.00,
      currency: 'EUR',
      status: 'PUBLISHED',
      tags: ['wine', 'tasting', 'food', 'culture'],
    });
    events.push(event5);
    console.log(`   ✅ Event: ${event5.title}`);

    const event6 = await Event.create({
      id: uuidv4(),
      organizer_id: organizer1.id,
      title: 'Node.js Backend Masterclass',
      description: 'Learn to build scalable backend applications with Node.js, Express, and databases. From basics to deployment.',
      location: 'Online',
      start_datetime: new Date(Date.now() + 21 * 24 * 60 * 60 * 1000),
      end_datetime: new Date(Date.now() + 21 * 24 * 60 * 60 * 1000 + 6 * 60 * 60 * 1000),
      capacity: 50,
      price: 199.00,
      currency: 'EUR',
      status: 'PUBLISHED',
      tags: ['nodejs', 'backend', 'workshop', 'programming'],
    });
    events.push(event6);
    console.log(`   ✅ Event: ${event6.title}`);

    // Draft event (not published)
    const event7 = await Event.create({
      id: uuidv4(),
      organizer_id: organizer1.id,
      title: 'AI/ML Workshop - Coming Soon',
      description: 'Machine learning fundamentals with Python.',
      location: 'TBD',
      start_datetime: new Date(Date.now() + 60 * 24 * 60 * 60 * 1000),
      capacity: 40,
      price: 299.00,
      currency: 'EUR',
      status: 'DRAFT',
      tags: ['ai', 'ml', 'python'],
    });
    events.push(event7);
    console.log(`   ✅ Event (draft): ${event7.title}`);

    // Free community event
    const event8 = await Event.create({
      id: uuidv4(),
      organizer_id: organizer2.id,
      title: 'Community Yoga in the Park',
      description: 'Free outdoor yoga session for all levels. Bring your mat and water bottle!',
      location: 'Parc de la Tête d\'Or, Lyon',
      start_datetime: new Date(Date.now() + 3 * 24 * 60 * 60 * 1000),
      end_datetime: new Date(Date.now() + 3 * 24 * 60 * 60 * 1000 + 1.5 * 60 * 60 * 1000),
      capacity: 50,
      price: 0,
      currency: 'EUR',
      status: 'PUBLISHED',
      tags: ['yoga', 'free', 'outdoor', 'wellness'],
    });
    events.push(event8);
    console.log(`   ✅ Event: ${event8.title}`);

    // Create inscriptions
    console.log('\n📝 Creating inscriptions...');

    const inscriptions = [];

    // Register users for free events
    for (let i = 0; i < 3; i++) {
      const inscription = await Inscription.create({
        id: uuidv4(),
        event_id: event1.id,
        user_id: users[i].id,
        status: 'CONFIRMED',
      });
      inscriptions.push(inscription);
      await event1.increment('current_participants');
    }
    console.log(`   ✅ 3 inscriptions for "${event1.title}"`);

    // Register for yoga
    for (let i = 0; i < 2; i++) {
      const inscription = await Inscription.create({
        id: uuidv4(),
        event_id: event8.id,
        user_id: users[i + 2].id,
        status: 'CONFIRMED',
      });
      inscriptions.push(inscription);
      await event8.increment('current_participants');
    }
    console.log(`   ✅ 2 inscriptions for "${event8.title}"`);

    // Register for paid event with payment
    const paidInscription1 = await Inscription.create({
      id: uuidv4(),
      event_id: event2.id,
      user_id: users[0].id,
      status: 'CONFIRMED',
    });
    inscriptions.push(paidInscription1);
    await event2.increment('current_participants');

    // Create payment
    console.log('\n💳 Creating payments...');
    
    const payment1 = await Payment.create({
      id: uuidv4(),
      user_id: users[0].id,
      event_id: event2.id,
      inscription_id: paidInscription1.id,
      amount: event2.price,
      currency: event2.currency,
      provider: 'mock',
      provider_payment_id: `mock_${Date.now()}`,
      status: 'PAID',
    });
    console.log(`   ✅ Payment: ${payment1.amount} ${payment1.currency} for "${event2.title}"`);

    // Pending inscription/payment
    const paidInscription2 = await Inscription.create({
      id: uuidv4(),
      event_id: event4.id,
      user_id: users[1].id,
      status: 'PENDING',
    });
    inscriptions.push(paidInscription2);
    await event4.increment('current_participants');

    const payment2 = await Payment.create({
      id: uuidv4(),
      user_id: users[1].id,
      event_id: event4.id,
      inscription_id: paidInscription2.id,
      amount: event4.price,
      currency: event4.currency,
      provider: 'mock',
      status: 'PENDING',
    });
    console.log(`   ✅ Pending payment: ${payment2.amount} ${payment2.currency} for "${event4.title}"`);

    console.log('\n✨ Seeding completed successfully!\n');
    console.log('📋 Summary:');
    console.log(`   - Users: 8 (1 admin, 2 organizers, 5 regular users)`);
    console.log(`   - Events: 8 (7 published, 1 draft)`);
    console.log(`   - Inscriptions: ${inscriptions.length}`);
    console.log(`   - Payments: 2`);
    console.log('\n🔑 Test accounts:');
    console.log(`   Admin: admin@onelastevent.com / Admin123!`);
    console.log(`   Organizer: organizer1@example.com / Organizer1!`);
    console.log(`   User: user1@example.com / User1234!`);

    process.exit(0);
  } catch (error) {
    console.error('❌ Seeding failed:', error.message);
    console.error(error.stack);
    process.exit(1);
  }
}

// Run seed
seed();

