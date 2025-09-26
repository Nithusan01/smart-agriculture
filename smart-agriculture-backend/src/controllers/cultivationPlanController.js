const { User, CultivationPlan } = require('../models');

// Create a new cultivation plan
const createCultivationPlan = async (req, res) => {

    try {

        const { sectorName, cropName,area,farmSoilType,farmLat,farmLng, plantingDate, expectedHarvestDate } = req.body;

        // Check if sector name already exists for the user
        const existingPlan = await CultivationPlan.findOne({
            where: {
                sectorName,
                userId: req.user.id
            }
        });

        if (existingPlan) {
            return res.status(400).json({
                success: false,
                message: 'Sector name already exists'
            });
        }
        // Create new cultivation plan
        const cultivationPlan = await CultivationPlan.create({

            sectorName,
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
            cultivationPlan: cultivationPlan
        });

    }


    catch (error) {
        console.error('Error creating cultivation plan:', error);
        res.status(500).json({ message: 'Server error'});
        

    }

};

// 

 

module.exports = {
    createCultivationPlan,

};
