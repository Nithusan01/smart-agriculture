const {Disease,Crop} = require('../models/index');

// create disease
const createDisease = async (req,res) => {

    if(req.user.role !== 'admin'){
        return res.status(403).json({success:false,message:'Access not denied '})
    }

    try {
        const {cropId,diseaseName,cause,symptoms,treatment,severity,prevention,imageUrl,spreadRate} =req.body;

        if (!cropId || !diseaseName) {
      return res.status(400).json({ message: "cropId and diseaseName are required" });
    }

      //check if disease exsists
      const exsistingDisease = await Disease.findOne({
        where:{
            diseaseName
        }
      })
      if(exsistingDisease){
        return res.status(400).json({success:false,message:"disease name already exsist"});

      }

      const newDisease = await Disease.create({
        cropId,
        diseaseName,
        cause,
        symptoms,
        treatment,
        severity,
        prevention,
        spreadRate,
        imageUrl
        
      })
      res.status(200).json({success:true,message:'disease add successfully',data:newDisease})
        
    } catch (error) {

        console.error("Error adding disease",error)
        res.status(500).json({sucess:false,error: error.message})
    }

}

//get all diseases 

const getAllDiseases = async (req,res) => {

    try {
       const  diseases = await Disease.findAll({include: [{ model: Crop, as: "crop", attributes: ["cropName", "cropType"] }],
      order: [["created_at", "DESC"]],});

       res.status(200).json({success:true,data:diseases})
        
    } catch (error) {

    console.error('error fetching diseases',error)
    res.status(500).json({success:false, message:'server error during fetching'})
        
    }
}
const getDiseaseById = async (req,res) => {
    try {
    const { id } = req.params;
    const disease = await Disease.findByPk(id, {
      include: [{ model: Crop, as: "crop" }],
    });

    if (!disease) {
      return res.status(404).json({ message: "Disease not found" });
    }

    return res.json({success:true,data:disease});
  } catch (error) {
    console.error("Error fetching disease:", error);
    return res.status(500).json({ message: "Server error" });
  }
}
// =================== UPDATE DISEASE ===================
  const updateDisease = async (req, res) => {
  try {
    const { id } = req.params;
    const disease = await Disease.findByPk(id);

    if (!disease) {
      return res.status(404).json({ message: "Disease not found" });
    }

    await disease.update(req.body);

    return res.json({ message: "Disease updated successfully", disease });
  } catch (error) {
    console.error("Error updating disease:", error);
    return res.status(500).json({ message: "Server error" });
  }
};

// =================== DELETE DISEASE ===================
const deleteDisease = async (req, res) => {
  try {
    const { id } = req.params;
    const disease = await Disease.findByPk(id);

    if (!disease) {
      return res.status(404).json({ message: "Disease not found" });
    }

    await disease.destroy();

    return res.json({ message: "Disease deleted successfully" });
  } catch (error) {
    console.error("Error deleting disease:", error);
    return res.status(500).json({ message: "Server error" });
  }
};
// =================== GET DISEASE BY CROP NAME ===================
const getDiseasesByCropName = async (req, res) => {
  try {
    const { cropName } = req.params;  
    const crop = await Crop.findOne({ where: { cropName } });

    if (!crop) {
      return res.status(404).json({ message: "Crop not found" });
    }
    const diseases = await Disease.findAll({ where: { cropId: crop.id } });

    return res.json({ success: true, data: diseases });
  }
  catch (error) {
    console.error("Error fetching diseases by crop name:", error);
    return res.status(500).json({ message: "Server error" });
  }
};

module.exports = {
    createDisease,
    getAllDiseases,
    getDiseaseById,
    updateDisease,
    deleteDisease,
    getDiseasesByCropName,
}


