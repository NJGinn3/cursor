#!/usr/bin/env node

/**
 * Database Migration Script: SQLite to PostgreSQL
 *
 * This script helps migrate your existing SQLite data to PostgreSQL for production.
 * Run this before deploying to production with PostgreSQL.
 *
 * Prerequisites:
 * 1. Set up a PostgreSQL database (Vercel Postgres, Railway, Supabase, etc.)
 * 2. Update your .env.local with the PostgreSQL DATABASE_URL
 * 3. Run: npm run db:migrate-to-postgres
 */

// eslint-disable-next-line @typescript-eslint/no-require-imports
const { PrismaClient } = require('@prisma/client');
// eslint-disable-next-line @typescript-eslint/no-require-imports
const fs = require('fs');
// const path = require('path'); // Not currently used

// Note: This script contains intentional unused variable destructuring
// to extract only the fields we need while ignoring IDs that shouldn't be migrated

async function migrateToPostgres() {
  console.log('🚀 Starting SQLite to PostgreSQL migration...\n');

  // Initialize Prisma clients for both databases
  const sqlitePrisma = new PrismaClient({
    datasourceUrl: 'file:./dev.db'
  });

  const postgresPrisma = new PrismaClient();

  try {
    console.log('📊 Checking existing SQLite data...');

    // Check if SQLite database exists and has data
    const sqliteExists = fs.existsSync('./prisma/dev.db');

    if (!sqliteExists) {
      console.log('❌ No SQLite database found. Please run the development setup first.');
      console.log('   Run: npm run db:migrate && npm run db:seed');
      return;
    }

    // Connect to SQLite
    await sqlitePrisma.$connect();
    console.log('✅ Connected to SQLite database');

    // Get all data from SQLite
    const users = await sqlitePrisma.user.findMany({
      include: {
        profile: true,
        kinkRatings: true,
        habits: true,
        rewards: true,
        punishments: true,
        pointsEvents: true
      }
    });

    const kinks = await sqlitePrisma.kink.findMany();
    const levels = await sqlitePrisma.level.findMany();
    const competitions = await sqlitePrisma.competition.findMany({
      include: { participants: true }
    });

    console.log(`📈 Found ${users.length} users, ${kinks.length} kinks, ${levels.length} levels`);

    if (users.length === 0) {
      console.log('⚠️  No data found in SQLite database. Migration skipped.');
      console.log('   You can run this script after setting up initial data.');
      return;
    }

    // Connect to PostgreSQL
    await postgresPrisma.$connect();
    console.log('✅ Connected to PostgreSQL database');

    // Clear existing data in PostgreSQL (if any)
    console.log('🧹 Clearing existing PostgreSQL data...');
    await postgresPrisma.competitionParticipant.deleteMany();
    await postgresPrisma.message.deleteMany();
    await postgresPrisma.habitLog.deleteMany();
    await postgresPrisma.pointsEvent.deleteMany();
    await postgresPrisma.kinkRating.deleteMany();
    await postgresPrisma.profilePreferredRole.deleteMany();
    await postgresPrisma.pairing.deleteMany();
    await postgresPrisma.punishment.deleteMany();
    await postgresPrisma.reward.deleteMany();
    await postgresPrisma.habit.deleteMany();
    await postgresPrisma.profile.deleteMany();
    await postgresPrisma.user.deleteMany();
    await postgresPrisma.competition.deleteMany();
    await postgresPrisma.kink.deleteMany();
    await postgresPrisma.level.deleteMany();

    // Migrate foundational data
    console.log('📥 Migrating foundational data...');

    // Migrate levels first
    if (levels.length > 0) {
      await postgresPrisma.level.createMany({ data: levels });
      console.log(`✅ Migrated ${levels.length} levels`);
    }

    // Migrate kinks
    if (kinks.length > 0) {
      await postgresPrisma.kink.createMany({ data: kinks });
      console.log(`✅ Migrated ${kinks.length} kinks`);
    }

    // Migrate users and related data
    for (const user of users) {
      console.log(`👤 Migrating user: ${user.username} (${user.email})`);

      // Create user without relations first
      const { profile, kinkRatings, habits, rewards, punishments, pointsEvents, ...userData } = user;
      const newUser = await postgresPrisma.user.create({ data: userData });

      // Migrate profile if exists
      if (profile) {
        const { id, ...profileData } = profile;
        await postgresPrisma.profile.create({
          data: {
            ...profileData,
            userId: newUser.id
          }
        });
      }

      // Migrate kink ratings
      if (kinkRatings.length > 0) {
        const kinkRatingsData = kinkRatings.map(rating => ({
          userId: newUser.id,
          kinkId: rating.kinkId,
          value: rating.value,
          intensity: rating.intensity,
          notes: rating.notes
        }));
        await postgresPrisma.kinkRating.createMany({ data: kinkRatingsData });
      }

      // Migrate habits
      if (habits.length > 0) {
        for (const habit of habits) {
          const { id, userId, logs, ...habitData } = habit;
          const newHabit = await postgresPrisma.habit.create({
            data: {
              ...habitData,
              userId: newUser.id
            }
          });

          // Migrate habit logs
          if (logs.length > 0) {
            const habitLogsData = logs.map(log => ({
              habitId: newHabit.id,
              userId: newUser.id,
              doneAt: log.doneAt
            }));
            await postgresPrisma.habitLog.createMany({ data: habitLogsData });
          }
        }
      }

      // Migrate rewards
      if (rewards.length > 0) {
        const rewardsData = rewards.map(reward => {
          const { id, userId, ...rewardData } = reward;
          return { ...rewardData, userId: newUser.id };
        });
        await postgresPrisma.reward.createMany({ data: rewardsData });
      }

      // Migrate punishments
      if (punishments.length > 0) {
        const punishmentsData = punishments.map(punishment => {
          const { id, userId, ...punishmentData } = punishment;
          return { ...punishmentData, userId: newUser.id };
        });
        await postgresPrisma.punishment.createMany({ data: punishmentsData });
      }

      // Migrate points events
      if (pointsEvents.length > 0) {
        const pointsEventsData = pointsEvents.map(event => {
          const { id, userId, ...eventData } = event;
          return { ...eventData, userId: newUser.id };
        });
        await postgresPrisma.pointsEvent.createMany({ data: pointsEventsData });
      }
    }

    // Migrate competitions and participants
    if (competitions.length > 0) {
      for (const competition of competitions) {
        const { participants, ...competitionData } = competition;
        const newCompetition = await postgresPrisma.competition.create({
          data: competitionData
        });

        if (participants.length > 0) {
          const participantsData = participants.map(participant => {
            const { id, competitionId, userId, user, ...participantData } = participant;
            return {
              ...participantData,
              competitionId: newCompetition.id,
              userId: participant.userId
            };
          });
          await postgresPrisma.competitionParticipant.createMany({ data: participantsData });
        }
      }
    }

    console.log('\n🎉 Migration completed successfully!');
    console.log('📋 Summary:');
    console.log(`   • Users: ${users.length}`);
    console.log(`   • Kinks: ${kinks.length}`);
    console.log(`   • Competitions: ${competitions.length}`);
    console.log('\n✅ Your data has been successfully migrated to PostgreSQL!');
    console.log('🚀 You can now deploy your application with the PostgreSQL database.');

  } catch (error) {
    console.error('❌ Migration failed:', error);
    throw error;
  } finally {
    await sqlitePrisma.$disconnect();
    await postgresPrisma.$disconnect();
  }
}

// Run migration if this script is executed directly
if (require.main === module) {
  migrateToPostgres()
    .catch((error) => {
      console.error('💥 Migration script failed:', error);
      process.exit(1);
    });
}

module.exports = { migrateToPostgres };