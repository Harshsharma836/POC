import 'reflect-metadata';
import { AppDataSource } from '../src/config/database';
import { Notification } from '../src/models/notification.model';
import { User } from '../src/models/user.model';

async function seed() {
  try {
    console.log('Initializing database connection...');
    await AppDataSource.initialize();
    console.log('✅ Database connected');

    const userRepo = AppDataSource.getRepository(User);
    const notificationRepo = AppDataSource.getRepository(Notification);

    let user = await userRepo.findOne({ where: { id: 'test-user-123' } });
    
    if (!user) {
      user = userRepo.create({
        id: 'test-user-123',
        username: 'testuser',
        password: 'testpass123',
      });
      await userRepo.save(user);
      console.log('✅ Created test user');
    }

    await notificationRepo.delete({ userId: user.id });
    console.log('🧹 Cleared existing notifications for user');

    const notifications = [
      { 
        userId: user.id, 
        data: { 
          title: 'Welcome!', 
          message: 'Thanks for joining!', 
          type: 'info' 
        }, 
        read: false 
      },
      { 
        userId: user.id, 
        data: { 
          title: 'New Feature', 
          message: 'Check out our latest update!', 
          type: 'update' 
        }, 
        read: false 
      },
      { 
        userId: user.id, 
        data: { 
          title: 'Reminder', 
          message: 'Your trial ends soon', 
          type: 'alert' 
        }, 
        read: true 
      }
    ];

    await notificationRepo.save(notifications);
    console.log(`✅ Created ${notifications.length} test notifications`);
    console.log('🎉 Database seeded successfully!');
    process.exit(0);

  } catch (error) {
    console.error('❌ Error seeding database:', error);
    process.exit(1);
  }
}

seed();