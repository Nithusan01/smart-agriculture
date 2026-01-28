const { User, CultivationPlan, Device } = require('../models/index');

const isValidUUID = (uuid) => {
  const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
  return uuidRegex.test(uuid);
};

// Create a new cultivation plan
const createCultivationPlan = async (req, res) => {

    try {

        const { sectorName, cropId, cropName, area, farmSoilType, farmLat, farmLng, plantingDate, expectedHarvestDate,deviceId } = req.body;

        // Check if sector name already exists for the user
        const existingPlan = await CultivationPlan.findOne({
            where: {
                sectorName,
                userId: req.user.id,

            }
        });


        
         // Handle empty device_id - convert to null
    // if (deviceId === '' || deviceId === undefined) {
    //   deviceId = null;
    // }

    // Validate UUID format if provided
    if (deviceId && !isValidUUID(deviceId)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid device ID format'
      });
    }





        if (existingPlan && !["harvested", "cancelled"].includes(existingPlan.status)) {
            return res.status(400).json({
                success: false,
                message: 'Sector name already exists'
            });
        }
        // If deviceId is provided, verify that the device exists and belongs to the user
        if (deviceId) {
            const device = await Device.findOne({
                where: { id: deviceId, userId: req.user.id}
            });
            const existingPlanWithDevice = await CultivationPlan.findOne({
                where: { deviceId: deviceId, userId: req.user.id }
            });
            if (!device){
                return res.status(400).jason({
                    success: false,
                    message: "invalid deviceId: Device not found or does not belong to user"
                })
            }
            
                if (existingPlanWithDevice) {
                    return res.status(400).json({
                        success: false,
                        message: "Device is already assigned to another cultivation plan"
                    });
                }
            
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
            userId: req.user.id,
            deviceId

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
         const updateData = req.body;
        const plan = await CultivationPlan.findOne({
            where: { id: req.params.id, userId: req.user.id }
        });

         // Handle empty device_id - convert to null
    if (updateData.deviceId === '' || updateData.deviceId === undefined) {
      updateData.deviceId = null;
    }

    // Validate UUID format if provided
    if (updateData.deviceId && !isValidUUID(updateData.deviceId)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid device ID format'
      });
    }


    // If deviceId is provided, verify that the device exists and belongs to the user
        if (updateData.deviceId) {
            const device = await Device.findOne({
                where: { id: updateData.deviceId, userId: req.user.id}
            });
            const existingPlanWithDevice = await CultivationPlan.findOne({
                where: { deviceId: updateData.deviceId, userId: req.user.id }
            });
            if (!device){
                return res.status(400).jason({
                    success: false,
                    message: "invalid deviceId: Device not found or does not belong to user"
                })
            }
            
                if (existingPlanWithDevice && existingPlanWithDevice.deviceId !== plan.deviceId) {
                    return res.status(400).json({
                        success: false,
                        message: "Device is already assigned to another cultivation plan"
                    });
                

                }
                
            
        }

        

        if (!plan) {
            return res.status(404).json({ success: false, message: 'Plan not found' });
        }

        await plan.update(updateData);
        res.status(200).json({ success: true, data: plan });
    } catch (error) {
        console.error('Update plan error:', error);
        res.status(500).json({ success: false, message: 'Server error during update' });
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
const getPlanByDeviceId = async (req, res) => {
    try {
        const plan = await CultivationPlan.findOne({
            where: { deviceId: req.params.deviceId, userId: req.user.id}
        });
        if (!plan) {
            return res.status(404).json({ success: false, message: 'Plan not found' });
        }
        res.status(200).json({ success: true, data: plan });
    } catch (error) {
        console.error('Get plan by device ID error:', error);
        res.status(500).json({ success: false, message: 'Server error' });
    }
};
const removeDeviceFromPlan =async( req,res) =>{
    try {
        const {id} = req.params;
        const plan = await CultivationPlan.findOne({
            where: { id:id ,userId:req.user.id}
        })
        if(!plan){
        return res.status(404).json({ success: false, message: 'Plan not found' });

        }
        plan.deviceId=null;
        await plan.save();
        res.status(200).json({success:true,message:"plan remove successfully"})
        
    } catch (error) {

         console.error('remove device Id from plan error:', error);
        res.status(500).json({ success: false, message: 'Server error' });

        
    }
    
}




module.exports = {
    createCultivationPlan,
    getPlans,
    updatePlan,
    deletePlan,
    getPlanById,
    getPlanByDeviceId,
    removeDeviceFromPlan

};
