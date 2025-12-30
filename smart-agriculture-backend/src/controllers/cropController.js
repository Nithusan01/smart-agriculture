const {Crop} = require('../models/index');
//add new crop
const addCrop =async (req,res)=>{

    // check if user is admin
    if(req.user.role !== 'admin'){
        return res.status(403).json({success:false, message:'Access denied '})
    }
    

    try {

        const { cropName, cropType, durationDays, waterRequirement, season, recommendedSoil } = req.body;

        // check exsisting crop
        const existingCrop = await Crop.findOne({
            where: {
                cropName
            }
        })

        if(existingCrop){
            return res.status(400).json({
                success:false,
                message:"crop name already exists"
            })

        }

        const newCrop =await Crop.create({
            cropName,
            cropType,
            durationDays: durationDays ? parseInt(durationDays, 10) : null,
            waterRequirement,
            season,
            recommendedSoil
        })
        res.status(200).json({
            succes:true,
            message:'Crop added successfully',
            data:newCrop
        })
        
    } catch (error) {

        console.error('Error adding crop:', error);
        res.status(500).json({success:false, message:'Server error during adding crop'});   
    }

}

//get all crops

const getAllCrops = async (req,res) => {

    try {
        const crops = await Crop.findAll();
        res.status(200).json({success:true, data:crops});
        
    } catch (error) {
        console.error('Error fetching crops:', error);
        res.status(500).json({success:false, message:'Server error during fetching crops' });
        
    }
}


//get crop by id
const getCropById = async (req,res) => {
    try {
        const cropId = req.params.id;
        const foundCrop = await Crop.findByPk({where:{id:cropId}});
        if(!foundCrop){
            return res.status(404).json({success:false, message:'Crop not found'});
        }   
        res.status(200).json({success:true, data:foundCrop});

        
    } catch (error) {
        
        console.error('Error fetching crop by ID:', error);
        res.status(500).json({success:false, message:'Server error during fetching crop by ID' });
        
    }
}

//get crop by name
const getCropByName = async (req,res) => {

    try {
        const cropName = req.params.name;
        const foundCrop = await Crop.findOne({where:{crop_name:cropName}});
        if(!foundCrop){
            return res.status(404).json({success:false, message:'Crop not found'});
        }
        res.status(200).json({success:true, data:foundCrop});
        
    } catch (error) {

        console.error('Error fetching crop by name:', error);
        res.status(500).json({success:false, message:'Server error during fetching crop by name' });
        
    }

}


//update crop
const updateCrop = async (req,res) =>{

//check user is admin
if(req.user.role !== 'admin'){
    res.status(403),json({succes:false,message:'access denied'})

  }
    try {
        const crop = await Crop.findOne({
            where:{id:req.params.id}
        });
        if(!crop){
            res.status(404).json({succes:false,message:'crop not found'});
        }
        await crop.update(req.body)
        res.status(200).json({succes:true,message:'update crop successfully'})
        
    } catch (error) {
        console.error('error update crop',error)
        res.status(500).json({succes:false,message:'server error during update crop'})
    }
}

//delete crop   
const deleteCrop = async (req,res) => {

    //check user is admin
if(req.user.role !== 'admin'){

    res.status(403),json({succes:false,message:'access denied'})

  }
   
    
    try {
     const cropId = req.params.id;
    const crop = await Crop.findOne({where:{id:cropId}})

    if(!crop){
        res.status(404).json({succes:false,message:'crop not found'});

    }
    await crop.destroy();
    res.status(200).json({succes:true,message:'delete crop successfully'});

    } catch (error) {
        console.error('delete crop error',error)
        res.status(500).json({success:false,message:'server error during delete'});
        
    }
}

module.exports = { 
    addCrop,
    getAllCrops,
    getCropById,
    getCropByName,
    updateCrop,
    deleteCrop
}