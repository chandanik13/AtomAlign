const User = require('../models/User');
const AuditLog = require('../models/AuditLog');

// @desc    Get all users
// @route   GET /api/users
const getUsers = async (req, res) => {
  try {
    const users = await User.find().populate('managerId', 'name email').sort({ createdAt: -1 });
    res.json({ success: true, users });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Server error' });
  }
};

// @desc    Get employees under a manager
// @route   GET /api/users/my-team
const getMyTeam = async (req, res) => {
  try {
    const employees = await User.find({ managerId: req.user._id, role: 'employee' })
      .select('-password');
    res.json({ success: true, employees });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Server error' });
  }
};

// @desc    Get single user
// @route   GET /api/users/:id
const getUser = async (req, res) => {
  try {
    const user = await User.findById(req.params.id).populate('managerId', 'name email');
    if (!user) return res.status(404).json({ success: false, message: 'User not found' });
    res.json({ success: true, user });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Server error' });
  }
};

// @desc    Create user (Admin only)
// @route   POST /api/users
const createUser = async (req, res) => {
  try {
    const { name, email, password, role, department, managerId } = req.body;

    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(400).json({ success: false, message: 'Email already registered' });
    }

    const user = await User.create({ name, email, password: password || 'password123', role, department, managerId });

    await AuditLog.create({
      userId: req.user._id,
      userName: req.user.name,
      userRole: req.user.role,
      action: 'USER_CREATED',
      entityType: 'User',
      entityId: user._id,
      description: `Admin created user: ${user.name} (${user.role})`
    });

    res.status(201).json({ success: true, user });
  } catch (error) {
    console.error(error);
    res.status(500).json({ success: false, message: 'Server error' });
  }
};

// @desc    Update user
// @route   PUT /api/users/:id
const updateUser = async (req, res) => {
  try {
    const user = await User.findById(req.params.id);
    if (!user) return res.status(404).json({ success: false, message: 'User not found' });

    const { name, email, role, department, managerId, isActive } = req.body;
    const oldData = { name: user.name, role: user.role, department: user.department };

    user.name = name || user.name;
    user.email = email || user.email;
    user.role = role || user.role;
    user.department = department !== undefined ? department : user.department;
    user.managerId = managerId !== undefined ? managerId : user.managerId;
    user.isActive = isActive !== undefined ? isActive : user.isActive;

    await user.save();

    await AuditLog.create({
      userId: req.user._id,
      userName: req.user.name,
      userRole: req.user.role,
      action: 'USER_UPDATED',
      entityType: 'User',
      entityId: user._id,
      oldValue: oldData,
      newValue: { name: user.name, role: user.role, department: user.department },
      description: `User ${user.name} updated`
    });

    res.json({ success: true, user });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Server error' });
  }
};

// @desc    Delete user
// @route   DELETE /api/users/:id
const deleteUser = async (req, res) => {
  try {
    const user = await User.findById(req.params.id);
    if (!user) return res.status(404).json({ success: false, message: 'User not found' });

    await User.findByIdAndDelete(req.params.id);

    await AuditLog.create({
      userId: req.user._id,
      userName: req.user.name,
      userRole: req.user.role,
      action: 'USER_DELETED',
      entityType: 'User',
      entityId: user._id,
      description: `User ${user.name} deleted by admin`
    });

    res.json({ success: true, message: 'User deleted' });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Server error' });
  }
};

// @desc    Get all managers (for dropdown)
// @route   GET /api/users/managers
const getManagers = async (req, res) => {
  try {
    const managers = await User.find({ role: 'manager' }).select('name email department');
    res.json({ success: true, managers });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Server error' });
  }
};

module.exports = { getUsers, getMyTeam, getUser, createUser, updateUser, deleteUser, getManagers };
