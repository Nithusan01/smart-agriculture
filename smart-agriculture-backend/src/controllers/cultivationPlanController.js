const { User, CultivationPlan } = require('../models/index');

// Create a new cultivation plan
const createCultivationPlan = async (req, res) => {

    try {

        const { sectorName, cropId, cropName, area, farmSoilType, farmLat, farmLng, plantingDate, expectedHarvestDate } = req.body;

        // Check if sector name already exists for the user
        const existingPlan = await CultivationPlan.findOne({
            where: {
                sectorName,
                userId: req.user.id,

            }
        });

        if (existingPlan && !["harvested", "cancelled"].includes(existingPlan.status)) {
            return res.status(400).json({
                success: false,
                message: 'Sector name already exists'
            });
        }

        // Create new cultivation plan
        const cultivationPlan = await CultivationPlan.create({

            sectorName,
            cropId,
            cropName,
            area,
            farmSoilType,
            farmLat,
            farmLng,
            plantingDate,
            expectedHarvestDate,
            userId: req.user.id

        });

        res.status(201).json({
            success: true,
            message: 'Cultivation plan created successfully',
            data: cultivationPlan
        });

    }


    catch (error) {
        console.error('Error creating cultivation plan:', error);
        res.status(500).json({ success: false, message: 'Server error during create plan' });
    }
};

// get all plans for logging in user

const getPlans = async (req, res) => {

    try {

        const plans = await CultivationPlan.findAll({
            where: { userId: req.user.id },
            include: [{ model: User, as: 'user', attributes: ['username', 'email'] }]
        });
        res.status(200).json({ success: true, data: plans })

    } catch (error) {

        console.error('get plans error', error);
        res.status(500).json({ success: false, message: 'error' })
    }
};

//update

const updatePlan = async (req, res) => {
    try {
        const plan = await CultivationPlan.findOne({
            where: { id: req.params.id, userId: req.user.id }
        });

        if (!plan) {
            return res.status(404).json({ success: false, message: 'Plan not found' });
        }

        await plan.update(req.body);
        res.status(200).json({ success: true, data: plan });
    } catch (error) {
        console.error('Update plan error:', error);
        res.status(500).json({ success: false, message: 'Server error' });
    }
};

const deletePlan = async (req, res) => {
    try {
        const plan = await CultivationPlan.findOne({
            where: { id: req.params.id, userId: req.user.id }
        });

        if (!plan) {
            return res.status(404).json({ success: false, message: 'Plan not found' });
        }

        // ✅ Correct method: use destroy() instead of delete()
        await plan.destroy();

        res.status(200).json({
            success: true,
            message: 'Plan deleted successfully'
        });

    } catch (error) {
        console.error('Delete plan error:', error);
        res.status(500).json({
            success: false,
            message: 'Server error'
        });
    }
};
const getPlanById = async (req, res) => {
    try {
        const plan = await CultivationPlan.findOne({
            where: { id: req.params.id, userId: req.user.id }
        });
        if (!plan) {
            return res.status(404).json({ success: false, message: 'Plan not found' });
        }
        res.status(200).json({ success: true, data: plan });
    } catch (error) {
        console.error('Get plan by ID error:', error);
        res.status(500).json({ success: false, message: 'Server error' });
    }
};


module.exports = {
    createCultivationPlan,
    getPlans,
    updatePlan,
    deletePlan,
    getPlanById

};
