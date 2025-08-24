import express from 'express';
import { body, validationResult } from 'express-validator';
import jwt from 'jsonwebtoken';
import { logger } from '../utils/logger';

const router = express.Router();

// Mock data - replace with actual database queries
let mockBookings = [
  {
    id: 1,
    hotelId: 1,
    guestName: 'John Doe',
    guestEmail: 'john@email.com',
    roomNumber: '101',
    roomType: 'Deluxe Room',
    checkIn: new Date('2024-08-25'),
    checkOut: new Date('2024-08-28'),
    totalAmount: 600,
    status: 'confirmed',
    paymentStatus: 'paid',
    createdAt: new Date()
  },
  {
    id: 2,
    hotelId: 1,
    guestName: 'Jane Smith',
    guestEmail: 'jane@email.com',
    roomNumber: '102',
    roomType: 'Suite',
    checkIn: new Date('2024-08-24'),
    checkOut: new Date('2024-08-26'),
    totalAmount: 700,
    status: 'checked_in',
    paymentStatus: 'paid',
    createdAt: new Date()
  }
];

let mockRoomStatus = [
  { roomNumber: '101', status: 'occupied', guestName: 'John Doe', checkOut: '2024-08-28' },
  { roomNumber: '102', status: 'occupied', guestName: 'Jane Smith', checkOut: '2024-08-26' },
  { roomNumber: '103', status: 'available', guestName: null, checkOut: null },
  { roomNumber: '104', status: 'dirty', guestName: null, checkOut: null },
  { roomNumber: '105', status: 'maintenance', guestName: null, checkOut: null },
];

let mockTasks = [
  {
    id: 1,
    hotelId: 1,
    assignedTo: 'maintenance',
    title: 'Fix AC in room 105',
    description: 'Air conditioning not working properly',
    priority: 'high',
    status: 'pending',
    dueDate: new Date('2024-08-25'),
    createdAt: new Date()
  },
  {
    id: 2,
    hotelId: 1,
    assignedTo: 'cleaning',
    title: 'Clean room 104',
    description: 'Room needs deep cleaning after checkout',
    priority: 'medium',
    status: 'in_progress',
    dueDate: new Date('2024-08-24'),
    createdAt: new Date()
  }
];

// Middleware to verify token
const verifyToken = (req: any, res: any, next: any) => {
  const token = req.headers.authorization?.replace('Bearer ', '');
  
  if (!token) {
    return res.status(401).json({
      success: false,
      message: 'No token provided'
    });
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET || 'fallback_secret') as any;
    req.user = decoded;
    next();
  } catch (error) {
    return res.status(401).json({
      success: false,
      message: 'Invalid token'
    });
  }
};

// Role-based access control
const checkRole = (allowedRoles: string[]) => {
  return (req: any, res: any, next: any) => {
    if (!allowedRoles.includes(req.user.role)) {
      return res.status(403).json({
        success: false,
        message: 'Access denied. Insufficient permissions.'
      });
    }
    next();
  };
};

// Admin & Manager Dashboard - KPIs and Analytics
router.get('/admin/kpis', verifyToken, checkRole(['Hotel Admin', 'Manager']), (req: any, res) => {
  try {
    const { hotelId } = req.query;
    
    // Calculate KPIs from mock data
    const totalRooms = 20;
    const occupiedRooms = mockRoomStatus.filter(room => room.status === 'occupied').length;
    const occupancyRate = (occupiedRooms / totalRooms) * 100;
    
    const todayBookings = mockBookings.filter(booking => 
      booking.checkIn.toDateString() === new Date().toDateString()
    ).length;
    
    const totalRevenue = mockBookings
      .filter(booking => booking.paymentStatus === 'paid')
      .reduce((sum, booking) => sum + booking.totalAmount, 0);
    
    const averageDailyRate = totalRevenue / occupiedRooms || 0;

    res.json({
      success: true,
      data: {
        occupancyRate: Math.round(occupancyRate),
        totalRevenue,
        averageDailyRate: Math.round(averageDailyRate),
        todayBookings,
        occupiedRooms,
        availableRooms: totalRooms - occupiedRooms,
        maintenanceRooms: mockRoomStatus.filter(room => room.status === 'maintenance').length,
        dirtyRooms: mockRoomStatus.filter(room => room.status === 'dirty').length
      }
    });
  } catch (error) {
    logger.error('Get admin KPIs error:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error'
    });
  }
});

// Admin & Manager Dashboard - Recent Activity
router.get('/admin/activity', verifyToken, checkRole(['Hotel Admin', 'Manager']), (req: any, res) => {
  try {
    const recentBookings = mockBookings
      .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
      .slice(0, 5);
    
    const pendingTasks = mockTasks.filter(task => task.status === 'pending').length;
    const completedTasks = mockTasks.filter(task => task.status === 'completed').length;

    res.json({
      success: true,
      data: {
        recentBookings,
        tasksSummary: {
          pending: pendingTasks,
          inProgress: mockTasks.filter(task => task.status === 'in_progress').length,
          completed: completedTasks
        },
        notifications: [
          {
            id: 1,
            type: 'maintenance',
            message: 'AC repair needed in room 105',
            priority: 'high',
            createdAt: new Date()
          },
          {
            id: 2,
            type: 'booking',
            message: 'New booking received for tomorrow',
            priority: 'medium',
            createdAt: new Date()
          }
        ]
      }
    });
  } catch (error) {
    logger.error('Get admin activity error:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error'
    });
  }
});

// Front Desk Dashboard - Today's Overview
router.get('/frontdesk/overview', verifyToken, checkRole(['Front Desk', 'Hotel Admin', 'Manager']), (req: any, res) => {
  try {
    const today = new Date().toDateString();
    
    const todayCheckIns = mockBookings.filter(booking => 
      booking.checkIn.toDateString() === today
    );
    
    const todayCheckOuts = mockBookings.filter(booking => 
      booking.checkOut.toDateString() === today
    );
    
    const roomStatus = mockRoomStatus.map(room => ({
      ...room,
      needsAttention: room.status === 'dirty' || room.status === 'maintenance'
    }));

    res.json({
      success: true,
      data: {
        todayCheckIns,
        todayCheckOuts,
        roomStatus,
        summary: {
          totalCheckIns: todayCheckIns.length,
          totalCheckOuts: todayCheckOuts.length,
          availableRooms: roomStatus.filter(room => room.status === 'available').length,
          occupiedRooms: roomStatus.filter(room => room.status === 'occupied').length,
          roomsNeedingAttention: roomStatus.filter(room => room.needsAttention).length
        }
      }
    });
  } catch (error) {
    logger.error('Get frontdesk overview error:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error'
    });
  }
});

// Finance Dashboard - Revenue and Transactions
router.get('/finance/overview', verifyToken, checkRole(['Finance Department', 'Hotel Admin', 'Manager']), (req: any, res) => {
  try {
    const { period = 'today' } = req.query;
    
    let startDate: Date;
    let endDate = new Date();
    
    switch (period) {
      case 'today':
        startDate = new Date();
        startDate.setHours(0, 0, 0, 0);
        break;
      case 'week':
        startDate = new Date();
        startDate.setDate(startDate.getDate() - 7);
        break;
      case 'month':
        startDate = new Date();
        startDate.setMonth(startDate.getMonth() - 1);
        break;
      default:
        startDate = new Date();
        startDate.setHours(0, 0, 0, 0);
    }
    
    const filteredBookings = mockBookings.filter(booking => 
      booking.createdAt >= startDate && booking.createdAt <= endDate
    );
    
    const totalRevenue = filteredBookings
      .filter(booking => booking.paymentStatus === 'paid')
      .reduce((sum, booking) => sum + booking.totalAmount, 0);
    
    const pendingPayments = filteredBookings
      .filter(booking => booking.paymentStatus === 'pending')
      .reduce((sum, booking) => sum + booking.totalAmount, 0);
    
    const transactions = filteredBookings.map(booking => ({
      id: booking.id,
      guestName: booking.guestName,
      amount: booking.totalAmount,
      status: booking.paymentStatus,
      type: 'booking',
      date: booking.createdAt
    }));

    res.json({
      success: true,
      data: {
        summary: {
          totalRevenue,
          pendingPayments,
          completedTransactions: filteredBookings.filter(b => b.paymentStatus === 'paid').length,
          pendingTransactions: filteredBookings.filter(b => b.paymentStatus === 'pending').length
        },
        transactions,
        chartData: {
          daily: [
            { date: '2024-08-20', revenue: 1200 },
            { date: '2024-08-21', revenue: 1800 },
            { date: '2024-08-22', revenue: 2100 },
            { date: '2024-08-23', revenue: 1500 },
            { date: '2024-08-24', revenue: 2300 }
          ]
        }
      }
    });
  } catch (error) {
    logger.error('Get finance overview error:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error'
    });
  }
});

// Maintenance & Cleaning Tasks Dashboard
router.get('/tasks/overview', verifyToken, checkRole(['Maintenance', 'Kitchen', 'Service Boy', 'Hotel Admin', 'Manager']), (req: any, res) => {
  try {
    const userRole = req.user.role.toLowerCase();
    
    // Filter tasks based on user role
    let filteredTasks = mockTasks;
    if (userRole !== 'hotel admin' && userRole !== 'manager') {
      filteredTasks = mockTasks.filter(task => 
        task.assignedTo === userRole || 
        (userRole === 'service boy' && task.assignedTo === 'room_service')
      );
    }
    
    const tasksSummary = {
      pending: filteredTasks.filter(task => task.status === 'pending').length,
      inProgress: filteredTasks.filter(task => task.status === 'in_progress').length,
      completed: filteredTasks.filter(task => task.status === 'completed').length,
      overdue: filteredTasks.filter(task => 
        task.status !== 'completed' && new Date(task.dueDate) < new Date()
      ).length
    };

    res.json({
      success: true,
      data: {
        tasks: filteredTasks,
        summary: tasksSummary,
        todayTasks: filteredTasks.filter(task => 
          new Date(task.dueDate).toDateString() === new Date().toDateString()
        )
      }
    });
  } catch (error) {
    logger.error('Get tasks overview error:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error'
    });
  }
});

// Update task status
router.put('/tasks/:taskId/status', verifyToken, (req: any, res) => {
  try {
    const taskId = parseInt(req.params.taskId);
    const { status, notes } = req.body;
    
    const taskIndex = mockTasks.findIndex(task => task.id === taskId);
    if (taskIndex === -1) {
      return res.status(404).json({
        success: false,
        message: 'Task not found'
      });
    }
    
    mockTasks[taskIndex] = {
      ...mockTasks[taskIndex],
      status,
      notes,
      updatedAt: new Date(),
      updatedBy: req.user.userId
    };
    
    // Emit socket event for real-time updates
    const io = req.app.get('io');
    if (io) {
      io.to(`hotel-${mockTasks[taskIndex].hotelId}`).emit('task-updated', {
        taskId,
        status,
        updatedBy: req.user.name || req.user.email
      });
    }

    res.json({
      success: true,
      message: 'Task status updated successfully',
      data: mockTasks[taskIndex]
    });
  } catch (error) {
    logger.error('Update task status error:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error'
    });
  }
});

// Create new task/maintenance request
router.post('/tasks', verifyToken, [
  body('title').isLength({ min: 3, max: 100 }),
  body('description').isLength({ min: 10, max: 500 }),
  body('assignedTo').isIn(['maintenance', 'cleaning', 'kitchen', 'room_service']),
  body('priority').isIn(['low', 'medium', 'high', 'urgent'])
], (req: any, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        message: 'Validation failed',
        errors: errors.array()
      });
    }

    const { title, description, assignedTo, priority, dueDate, roomNumber } = req.body;
    
    const newTask = {
      id: mockTasks.length + 1,
      hotelId: req.user.hotelId || 1,
      title,
      description,
      assignedTo,
      priority,
      status: 'pending',
      roomNumber,
      dueDate: dueDate ? new Date(dueDate) : new Date(),
      createdAt: new Date(),
      createdBy: req.user.userId
    };
    
    mockTasks.push(newTask);
    
    // Emit socket event for real-time updates
    const io = req.app.get('io');
    if (io) {
      io.to(`hotel-${newTask.hotelId}`).emit('new-task', newTask);
    }

    res.status(201).json({
      success: true,
      message: 'Task created successfully',
      data: newTask
    });
  } catch (error) {
    logger.error('Create task error:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error'
    });
  }
});

// Quick booking search
router.get('/search/bookings', verifyToken, checkRole(['Front Desk', 'Hotel Admin', 'Manager', 'Booking Agent']), (req: any, res) => {
  try {
    const { query } = req.query;
    
    if (!query) {
      return res.status(400).json({
        success: false,
        message: 'Search query required'
      });
    }
    
    const searchResults = mockBookings.filter(booking =>
      booking.guestName.toLowerCase().includes((query as string).toLowerCase()) ||
      booking.guestEmail.toLowerCase().includes((query as string).toLowerCase()) ||
      booking.id.toString().includes(query as string)
    );

    res.json({
      success: true,
      data: searchResults
    });
  } catch (error) {
    logger.error('Search bookings error:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error'
    });
  }
});

export default router;