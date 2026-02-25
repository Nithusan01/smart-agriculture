const Soil = require('../models/index');
const addSoilData = async (req, res) => {

    try {
        const {soilType,phLevel,nutrientContent,moistureLevel } = req.body;
        const soil = await Soil.create({
            soilType,
            phLevel,
            nutrientContent,
            moistureLevel
        });
        res.status(201).json({success:true,message:'Soil data added successfully',data:soil});

        
    } catch (error) {
        console.error('Error adding soil data:', error);
        res.status(500).json({success:false, message:'Server error during adding soil data'});
        
    }
}
const getAllSoilData = async (req,res) => {

    try {
        const soilData = await Soil.findAll();
        res.status(200).json({success:true, data:soilData});
    }
    catch (error) {
        console.error('Error fetching soil data:', error);
        res.status(500).json({success:false, message:'Server error during fetching soil data'});
    }
}

module.exports={
    addSoilData,
    getAllSoilData
}