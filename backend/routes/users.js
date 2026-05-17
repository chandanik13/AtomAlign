const express = require('express');
const router = express.Router();
const { getUsers, getMyTeam, getUser, createUser, updateUser, deleteUser, getManagers } = require('../controllers/userController');
const { protect } = require('../middleware/auth');
const { roleCheck } = require('../middleware/roleCheck');

router.get('/managers', protect, getManagers);
router.get('/my-team', protect, roleCheck('manager'), getMyTeam);
router.get('/', protect, roleCheck('admin'), getUsers);
router.get('/:id', protect, getUser);
router.post('/', protect, roleCheck('admin'), createUser);
router.put('/:id', protect, roleCheck('admin'), updateUser);
router.delete('/:id', protect, roleCheck('admin'), deleteUser);

module.exports = router;
