const mongoose = require('mongoose');
const dotenv = require('dotenv');
const bcrypt = require('bcryptjs');
const path = require('path');

dotenv.config({ path: path.join(__dirname, '../.env') });

const User = require('../models/User');
const Goal = require('../models/Goal');
const GoalSheet = require('../models/GoalSheet');
const AuditLog = require('../models/AuditLog');
const Notification = require('../models/Notification');

const connectDB = async () => {
  await mongoose.connect(process.env.MONGO_URI || 'mongodb://localhost:27017/atomalign');
  console.log('MongoDB Connected for seeding');
};

const seed = async () => {
  try {
    await connectDB();

    // Clear existing data
    await User.deleteMany({});
    await Goal.deleteMany({});
    await GoalSheet.deleteMany({});
    await AuditLog.deleteMany({});
    await Notification.deleteMany({});

    console.log('✅ Cleared existing data');

    // Create Admin
    const admin = await User.create({
      name: 'Admin User',
      email: 'admin@atomalign.com',
      password: 'password123',
      role: 'admin',
      department: 'HR',
      isActive: true
    });

    // Create Manager
    const manager = await User.create({
      name: 'Rahul Sharma',
      email: 'manager@atomalign.com',
      password: 'password123',
      role: 'manager',
      department: 'Sales',
      isActive: true
    });

    // Create Employee (reports to manager)
    const employee = await User.create({
      name: 'Priya Patel',
      email: 'employee@atomalign.com',
      password: 'password123',
      role: 'employee',
      department: 'Sales',
      managerId: manager._id,
      isActive: true
    });

    // Create additional employees
    const emp2 = await User.create({
      name: 'Arjun Kumar',
      email: 'arjun@atomalign.com',
      password: 'password123',
      role: 'employee',
      department: 'Sales',
      managerId: manager._id,
      isActive: true
    });

    const emp3 = await User.create({
      name: 'Sarah Williams',
      email: 'sarah@atomalign.com',
      password: 'password123',
      role: 'employee',
      department: 'Marketing',
      managerId: manager._id,
      isActive: true
    });

    const emp4 = await User.create({
      name: 'Tom Brown',
      email: 'tom@atomalign.com',
      password: 'password123',
      role: 'employee',
      department: 'Operations',
      managerId: manager._id,
      isActive: true
    });

    console.log('✅ Users created');

    // Create Goal Sheet for employee
    const goalSheet = await GoalSheet.create({
      employeeId: employee._id,
      managerId: manager._id,
      cycle: '2024-25',
      status: 'approved',
      totalWeightage: 100,
      submittedAt: new Date('2024-04-15'),
      approvedAt: new Date('2024-04-20')
    });

    // Create Goals for main employee
    const goal1 = await Goal.create({
      employeeId: employee._id,
      goalSheetId: goalSheet._id,
      thrustArea: 'Sales',
      title: 'Increase Sales Revenue',
      description: 'Achieve monthly sales target of INR 10 Lakhs consistently throughout the year',
      uomType: 'numeric',
      target: '100000',
      weightage: 30,
      actualAchievement: '72000',
      progressScore: 72,
      status: 'approved',
      isLocked: true,
      cycle: '2024-25',
      quarterlyUpdates: [
        { quarter: 'Q1', achievement: '18000', status: 'on_track' },
        { quarter: 'Q2', achievement: '20000', status: 'on_track' },
        { quarter: 'Q3', achievement: '34000', status: 'on_track' }
      ]
    });

    const goal2 = await Goal.create({
      employeeId: employee._id,
      goalSheetId: goalSheet._id,
      thrustArea: 'Customer Service',
      title: 'Customer Satisfaction Score',
      description: 'Maintain CSAT score of 95% or above throughout the year',
      uomType: 'percentage',
      target: '95',
      weightage: 25,
      actualAchievement: '88',
      progressScore: 93,
      status: 'approved',
      isLocked: true,
      cycle: '2024-25',
      quarterlyUpdates: [
        { quarter: 'Q1', achievement: '91', status: 'on_track' },
        { quarter: 'Q2', achievement: '88', status: 'on_track' }
      ]
    });

    const goal3 = await Goal.create({
      employeeId: employee._id,
      goalSheetId: goalSheet._id,
      thrustArea: 'Learning & Development',
      title: 'Complete Training Modules',
      description: 'Complete 10 mandatory training modules assigned by L&D team',
      uomType: 'numeric',
      target: '10',
      weightage: 20,
      actualAchievement: '10',
      progressScore: 100,
      status: 'approved',
      isLocked: true,
      cycle: '2024-25',
      quarterlyUpdates: [
        { quarter: 'Q1', achievement: '3', status: 'on_track' },
        { quarter: 'Q2', achievement: '7', status: 'on_track' },
        { quarter: 'Q3', achievement: '10', status: 'completed' }
      ]
    });

    const goal4 = await Goal.create({
      employeeId: employee._id,
      goalSheetId: goalSheet._id,
      thrustArea: 'Operations',
      title: 'Reduce Response Time',
      description: 'Reduce average customer response time to under 2 hours',
      uomType: 'numeric',
      target: '2',
      weightage: 25,
      actualAchievement: '1.5',
      progressScore: 75,
      status: 'approved',
      isLocked: true,
      cycle: '2024-25',
      quarterlyUpdates: [
        { quarter: 'Q1', achievement: '3', status: 'on_track' },
        { quarter: 'Q2', achievement: '1.5', status: 'completed' }
      ]
    });

    goalSheet.goals = [goal1._id, goal2._id, goal3._id, goal4._id];
    goalSheet.overallProgress = Math.round((72 + 93 + 100 + 75) / 4);
    await goalSheet.save();

    console.log('✅ Employee goals created');

    // Create goals for emp2 (Arjun) - in submitted state
    const goalSheet2 = await GoalSheet.create({
      employeeId: emp2._id,
      managerId: manager._id,
      cycle: '2024-25',
      status: 'submitted',
      totalWeightage: 100,
      submittedAt: new Date()
    });

    const g2_1 = await Goal.create({
      employeeId: emp2._id,
      goalSheetId: goalSheet2._id,
      thrustArea: 'Sales',
      title: 'New Customer Acquisition',
      description: 'Acquire 50 new enterprise customers in FY 2024-25',
      uomType: 'numeric',
      target: '50',
      weightage: 40,
      actualAchievement: '32',
      progressScore: 64,
      status: 'submitted',
      cycle: '2024-25'
    });

    const g2_2 = await Goal.create({
      employeeId: emp2._id,
      goalSheetId: goalSheet2._id,
      thrustArea: 'Product Knowledge',
      title: 'Product Certification',
      description: 'Achieve certification in all 5 product lines',
      uomType: 'numeric',
      target: '5',
      weightage: 30,
      actualAchievement: '3',
      progressScore: 60,
      status: 'submitted',
      cycle: '2024-25'
    });

    const g2_3 = await Goal.create({
      employeeId: emp2._id,
      goalSheetId: goalSheet2._id,
      thrustArea: 'Operations',
      title: 'Pipeline Management',
      description: 'Maintain CRM pipeline with 100% data accuracy',
      uomType: 'percentage',
      target: '100',
      weightage: 30,
      actualAchievement: '87',
      progressScore: 87,
      status: 'submitted',
      cycle: '2024-25'
    });

    goalSheet2.goals = [g2_1._id, g2_2._id, g2_3._id];
    await goalSheet2.save();

    // Create goals for Sarah - mix of statuses
    const goalSheet3 = await GoalSheet.create({
      employeeId: emp3._id,
      managerId: manager._id,
      cycle: '2024-25',
      status: 'approved',
      totalWeightage: 100,
      submittedAt: new Date('2024-04-15'),
      approvedAt: new Date('2024-04-20')
    });

    const g3_1 = await Goal.create({
      employeeId: emp3._id,
      goalSheetId: goalSheet3._id,
      thrustArea: 'Marketing',
      title: 'Sales Target Achievement',
      description: 'Achieve quarterly sales targets consistently',
      uomType: 'percentage',
      target: '100',
      weightage: 50,
      actualAchievement: '78',
      progressScore: 78,
      status: 'approved',
      isLocked: true,
      cycle: '2024-25',
      managerComments: [{
        managerId: manager._id,
        comment: 'Made significant progress this week, closed 3 major deals',
        createdAt: new Date('2026-05-15')
      }]
    });

    const g3_2 = await Goal.create({
      employeeId: emp3._id,
      goalSheetId: goalSheet3._id,
      thrustArea: 'Operations',
      title: 'Process Optimization',
      description: 'Identify and implement 3 process improvements',
      uomType: 'numeric',
      target: '3',
      weightage: 50,
      actualAchievement: '2',
      progressScore: 67,
      status: 'approved',
      isLocked: true,
      cycle: '2024-25',
      managerComments: [{
        managerId: manager._id,
        comment: 'Identified bottlenecks in workflow, implementing solutions',
        createdAt: new Date('2026-05-14')
      }]
    });

    goalSheet3.goals = [g3_1._id, g3_2._id];
    await goalSheet3.save();

    // Create notifications
    await Notification.create([
      {
        userId: employee._id,
        title: 'Goal Approved',
        message: 'Your goal "Increase Sales Revenue" has been approved',
        type: 'goal_approved',
        isRead: false
      },
      {
        userId: employee._id,
        title: 'Manager Added Check-in Comment',
        message: 'Manager added Q2 check-in comment for your Sales goal',
        type: 'manager_comment',
        isRead: false
      },
      {
        userId: employee._id,
        title: 'Check-in Reminder',
        message: 'Q3 check-in period is now open. Please update your goal progress',
        type: 'check_in_reminder',
        isRead: true
      },
      {
        userId: manager._id,
        title: 'Goals Submitted for Review',
        message: 'Arjun Kumar has submitted their goal sheet for your review',
        type: 'goal_submitted',
        isRead: false
      }
    ]);

    // Create audit logs
    await AuditLog.create([
      {
        userId: employee._id,
        userName: 'Priya Patel',
        userRole: 'employee',
        action: 'GOAL_CREATED',
        entityType: 'Goal',
        entityId: goal1._id,
        description: 'Goal created: "Increase Sales Revenue" with 30% weightage',
        createdAt: new Date('2024-04-10')
      },
      {
        userId: employee._id,
        userName: 'Priya Patel',
        userRole: 'employee',
        action: 'GOAL_SUBMITTED',
        entityType: 'GoalSheet',
        entityId: goalSheet._id,
        description: 'Goal sheet submitted for cycle 2024-25',
        createdAt: new Date('2024-04-15')
      },
      {
        userId: manager._id,
        userName: 'Rahul Sharma',
        userRole: 'manager',
        action: 'GOAL_APPROVED',
        entityType: 'Goal',
        entityId: goal1._id,
        description: 'Goal "Increase Sales Revenue" approved',
        createdAt: new Date('2024-04-20')
      },
      {
        userId: employee._id,
        userName: 'Priya Patel',
        userRole: 'employee',
        action: 'QUARTERLY_UPDATED',
        entityType: 'Goal',
        entityId: goal1._id,
        description: 'Q1 achievement updated for "Increase Sales Revenue": 18000 (on_track)',
        createdAt: new Date('2024-07-05')
      },
      {
        userId: manager._id,
        userName: 'Rahul Sharma',
        userRole: 'manager',
        action: 'MANAGER_COMMENT_ADDED',
        entityType: 'Goal',
        entityId: g3_1._id,
        description: 'Manager added Q2 check-in comment for "Sales Target Achievement"',
        createdAt: new Date('2026-05-15')
      },
      {
        userId: admin._id,
        userName: 'Admin User',
        userRole: 'admin',
        action: 'USER_CREATED',
        entityType: 'User',
        entityId: employee._id,
        description: 'Admin created user: Priya Patel (employee)',
        createdAt: new Date('2024-04-01')
      }
    ]);

    console.log('✅ Notifications and audit logs created');
    console.log('\n🎉 Database seeded successfully!');
    console.log('\n📋 Demo Credentials:');
    console.log('  Employee: employee@atomalign.com / password123');
    console.log('  Manager:  manager@atomalign.com / password123');
    console.log('  Admin:    admin@atomalign.com / password123');

    process.exit(0);
  } catch (error) {
    console.error('❌ Seed error:', error);
    process.exit(1);
  }
};

seed();
