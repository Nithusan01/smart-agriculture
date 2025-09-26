const { User } = require('../models');
const { generateToken } = require('../middlewares/auth');
const { Op } = require('sequelize');

// Register user
const register = async (req, res) => {
  try {
    const { username, email, password, firstName, lastName, phoneNumber, farmName, farmTotalArea, farmSoilType, farmLat, farmLng } = req.body;

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
      phoneNumber,
      farmName,
      farmTotalArea: parseFloat(farmTotalArea) || null,
      farmSoilType,
      farmLat,
      farmLng

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
        role: user.role
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

    res.json({
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
        role: user.role
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

module.exports = {
  register,
  login,
  getMe
};
