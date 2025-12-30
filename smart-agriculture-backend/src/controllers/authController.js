const { User } = require('../models/index');
const { generateToken } = require('../middlewares/auth');
const { Op } = require('sequelize');

// Register user
const register = async (req, res) => {
  try {
    const { username, email, password, firstName, lastName, farmName, farmTotalArea, role } = req.body;

    // Check if user already exists
    const existingUser = await User.findOne({
      where: {
        [Op.or]: [{ username }, { email }]
      }
    });

    if (existingUser) {
      return res.status(400).json({
        success: false,
        message: 'User already exists'
      });
    }

    // Create user
    const user = await User.create({
      username,
      email,
      passwordHash: password,
      firstName,
      lastName,
      farmName,
      farmTotalArea: parseFloat(farmTotalArea) || null,
      role


    });

    // Generate token
    const token = generateToken(user.id);

    // Update last login
    await user.update({ lastLogin: new Date() });


    res.status(201).json({
      success: true,
      message: 'User created successfully',
      token,
      user: {
        id: user.id,
        username: user.username,
        email: user.email,
        firstName: user.firstName,
        lastName: user.lastName,
        farmName: user.farmName,
        role: user.role,
        farmTotalArea: user.farmTotalArea,
      }
    });
  } catch (error) {
    console.error('Registration error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error during registration'
    });
  }
};

// Login user
const login = async (req, res) => {
  try {
    const { username, password } = req.body;

    // Find user by username or email
    const user = await User.findOne({
      where: {
        [Op.or]: [
          { username: username },
          { email: username }
        ]
      }
    });

    // Check if user exists
    if (!user) {
      return res.status(401).json({
        success: false,
        message: 'Incorrect username or email'  // user not found
      });
    }

    // Check if password is correct
    const isPasswordValid = await user.validatePassword(password);
    if (!isPasswordValid) {
      return res.status(401).json({
        success: false,
        message: 'Incorrect password'  // wrong password
      });
    }


    // Generate token
    const token = generateToken(user.id);

    // Update last login
    await user.update({ lastLogin: new Date() });

    res.status(200).json({
      success: true,
      message: 'Login successful',
      token,
      user: {
        id: user.id,
        username: user.username,
        email: user.email,
        firstName: user.firstName,
        lastName: user.lastName,
        farmName: user.farmName,
        role: user.role,
        createdAt: user.createdAt
      }
    });

  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error during login'
    });
  }
};

// Get current user
const getMe = async (req, res) => {
  try {
    res.status(200).json({
      user: req.user
    });
  } catch (error) {
    console.error('Get user error:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

//get all user
const getAllUsers = async (req, res) => {

  //check user is admin
  if (req.user.role !== 'admin') {
    res.status(403), json({ succes: false, message: 'access denied' })
  }

  try {
    const users = await User.findAll();
    res.status(200).json({ success: true, data: users });

  } catch (error) {

    console.error("error fetch users ", error)
    res.status(500).json({ succes: false, message: "server error during fetch user " })

  }

}

const deleteUser = async (req, res) => {

  //check user is admin
  if (req.user.role !== 'admin') {
    res.status(403), json({ succes: false, message: 'access denied' })
  }

  try {
    const userId = req.params.id
    const user = await User.findOne({ where: { id: userId } })
    if (!user) {
      res.status(404).json({ succes: false, message: 'user not found' });

    }
    await user.destroy();
    res.status(200).json({ succes: true, message: 'delete user successfully' });

  } catch (error) {
    console.error('delete user error', error)
    res.status(500).json({ success: false, message: 'server error during delete' });
  }


}
// update user
const updateUser = async (req, res) => {
  //check user is admin
  if (req.user.role !== 'admin') {
    res.status(403), json({ succes: false, message: 'access denied' })
  }
  try {
    const userId = req.params.id
    const { firstName, lastName,username, email, password, farmName, role } = req.body;
    const user = await User.findOne({ where: { id: userId } })
    if (!user) {
      res.status(404).json({ succes: false, message: 'user not found' });
    }
    await user.update({
      firstName,
      lastName,
      username,
      email,
      passwordHash: password,
      farmName,
      role
    });
    res.status(200).json({ succes: true, message: 'update user successfully' });
   } catch (error) {
      console.error('update user error', error)
      res.status(500).json({ success: false, message: 'server error during update' });
    }
}
// create user  by admin
const createUserByAdmin = async (req, res) => {
  //check user is admin
  if (req.user.role !== 'admin') {  
    res.status(403), json({ succes: false, message: 'access denied' })
  }
  try {
    const { username, email, password, firstName, lastName, farmName, role } = req.body;

    // Check if user already exists
    const existingUser = await User.findOne({
      where: {
        [Op.or]: [{ username }, { email }]
      }
    }); 
    if (existingUser) {
      return res.status(400).json({
        success: false,
        message: 'User already exists'
      });
    }
    // Create user
    const user = await User.create({
      username,
      email,
      passwordHash: password,
      firstName,
      lastName,
      farmName,
      role
    });
    res.status(201).json({
      success: true,
      message: 'User created successfully by admin',
      user: {
        id: user.id,  
        username: user.username,
        email: user.email,
        firstName: user.firstName,
        lastName: user.lastName,
        farmName: user.farmName,
        role: user.role
      }
    });
  } catch (error) {
    console.error('Create user by admin error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error during user creation by admin'
    });
  }
};


module.exports = {
  register,
  login,
  getMe,
  getAllUsers,
  deleteUser,
  updateUser,
  createUserByAdmin
};
