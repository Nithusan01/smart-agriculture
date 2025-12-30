const {CropScheduleRule} = require("../models");

//add new crop schedule rule
const addCropScheduleRule = async (req,res) => {    
    // check if user is admin
    if(req.user.role !== 'admin'){
        return  res.status(403).json({success:false, message:'Access denied '})
    }
    try {
        const {stageName,startDay,endDay,fertilizer,irrigation,cropId} = req.body;
        const newRule = await CropScheduleRule.create({
            stageName,
            startDay,
            endDay,
            fertilizer,
            irrigation,
            cropId
        });
        res.status(201).json({success:true,message:'Crop schedule rule added successfully',data:newRule});
    } catch (error) {
        console.error('Error adding crop schedule rule:', error);
        res.status(500).json({success:false, message:'Server error during adding crop schedule rule'}); 
    }
}
//get crop schedule rules for a crop
const getCropScheduleRules = async (req,res) => {
    try {
        const {cropId} = req.params;
        const rules = await CropScheduleRule.findAll({
            where:{cropId}
        });
        res.status(200).json({success:true,data:rules});
    } catch (error) {
        console.error('Error fetching crop schedule rules:', error);
        res.status(500).json({success:false, message:'Server error during fetching crop schedule rules'}); 
    }
}

//update crop schedule rule
const updateCropScheduleRule = async (req,res) => {
    // check if user is admin
    if(req.user.role !== 'admin'){
        return  res.status(403).json({success:false, message:'Access denied '})
    }
    try {
        const {ruleId} = req.params;
        const {stageName,startDay,endDay,fertilizer,irrigation} = req.body;

        const rule = await CropScheduleRule.findByPk(ruleId);
        if(!rule){
            return res.status(404).json({success:false,message:'Crop schedule rule not found'});
        }
        await rule.update({
            stageName,
            startDay,
            endDay,
            fertilizer,
            irrigation
        });
        res.status(200).json({success:true,message:'Crop schedule rule updated successfully',data:rule});
    } catch (error) {
        console.error('Error updating crop schedule rule:', error);
        res.status(500).json({success:false, message:'Server error during updating crop schedule rule'}); 
    }
}

//delete crop schedule rule
const deleteCropScheduleRule = async (req,res) => {
    // check if user is admin   
    if(req.user.role !== 'admin'){
        return  res.status(403).json({success:false, message:'Access denied '})
    }
    try {
        const {ruleId} = req.params;
        const rule = await CropScheduleRule.findByPk(ruleId);
        if(!rule){
            return res.status(404).json({success:false,message:'Crop schedule rule not found'});
        }   

        await rule.destroy();
        res.status(200).json({success:true,message:'Crop schedule rule deleted successfully'});
    }
        catch (error) { 
        console.error('Error deleting crop schedule rule:', error);
        res.status(500).json({success:false, message:'Server error during deleting crop schedule rule'}); 
    }
}
//get all crop schedule rules by crop
const getAllCropScheduleRules = async (req,res) => {
    try {
        const rules = await CropScheduleRule.findAll();
        res.status(200).json({success:true,data:rules});
    } catch (error) {
        console.error('Error fetching all crop schedule rules:', error);
        res.status(500).json({success:false, message:'Server error during fetching all crop schedule rules'}); 
    }
}




module.exports = {
    addCropScheduleRule,
    getCropScheduleRules,
    getAllCropScheduleRules,
    updateCropScheduleRule,
    deleteCropScheduleRule
}
