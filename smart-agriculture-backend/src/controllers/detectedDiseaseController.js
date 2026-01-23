const { DetectedDisease, Disease, CultivationPlan } = require('../models/index');
const { get } = require('../routes/device');

// =================== ADD DETECTED DISEASE ===================
const addDetectedDisease = async (req, res) => {
  try {
    const { cultivationPlanId, diseaseId, imageUrl, confidence, status,notes } = req.body;

    if (!cultivationPlanId) {
      return res.status(400).json({ message: "cultivationPlanId is required" });
    }
    const exsistingDisease = await DetectedDisease.findAll({
      where:{cultivationPlanId:cultivationPlanId,diseaseId:diseaseId}
    })
    if(exsistingDisease){
      return res.status(400).json({
        success:false,
        message:"disease already detected"
      })
    }

    const detectedDisease = await DetectedDisease.create({
      cultivationPlanId,
      diseaseId,
      userId:req.user.id,
      imageUrl,
      confidence,
      status,
      notes,
    });

    return res.status(201).json({
      message: "Detected disease recorded successfully",
      detectedDisease,
    });
  } catch (error) {
    console.error("Error adding detected disease:", error);
    return res.status(500).json({ message: "Server error", error: message });
  }
};

// =================== GET ALL DETECTIONS ===================
const getAllDetectedDiseases = async (req, res) => {
  try {
    const detections = await DetectedDisease.findAll({
        where:{userId:req.user.id},
      include: [
        { model: Disease, as: "disease", attributes: ["diseaseName", "severity"] },
        { model: CultivationPlan, as: "plan", attributes: ["sectorName", "cropName"] },
      ],
      order: [["created_at", "DESC"]],
    });

    return res.json(detections);
  } catch (error) {
    console.error("Error fetching detected diseases:", error);
    return res.status(500).json({ message: "Server error" });
  }
};

// =================== UPDATE STATUS (e.g., resolved) ===================
const updateDetectedStatus = async (req, res) => {
  try {
    const { id } = req.params;
    const { status, notes } = req.body;

    const detection = await DetectedDisease.findByPk(id);
    if (!detection) {
      return res.status(404).json({ message: "Detected disease not found" });
    }

    detection.status = status || detection.status;
    detection.notes = notes || detection.notes;
    await detection.save();

    return res.json({ message: "Detected disease updated successfully", detection });
  } catch (error) {
    console.error("Error updating detected disease:", error);
    return res.status(500).json({ message: "Server error" });
  }
};

// =================== DELETE DETECTION ===================
const deleteDetectedDisease = async (req, res) => {

  if(req.user.role !== 'admin'){
        return res.status(403).json({success:false,message:'Access not denied '})
    }

  try {
    const { id } = req.params;
    const detection = await DetectedDisease.findByPk(id);

    if (!detection) {
      return res.status(404).json({ message: "Record not found" });
    }

    await detection.destroy();

    return res.json({ message: "Detected disease deleted successfully" });
  } catch (error) {
    console.error("Error deleting detected disease:", error);
    return res.status(500).json({ message: "Server error" });
  }
};
// =================== get DETECTION BY cultivation plan ===================
const getDetectionsByCultivationPlan = async (req, res) => {
  try {
    const { cultivationPlanId } = req.params;
    const detections = await DetectedDisease.findAll({
      where: { cultivationPlanId, userId: req.user.id },
      include: [
        { model: Disease, as: "disease", attributes: ["diseaseName", "severity","symptoms","treatment"] },
        { model: CultivationPlan, as: "plan", attributes: ["sectorName", "cropName"] },
      ],
      order: [["created_at", "DESC"]],
    });
    return res.status(200).json({success:true,data:detections});

  } catch (error) {
    console.error("Error fetching detections by cultivation plan:", error);
    return res.status(500).json({ success:false,message: "Server error" });
  }
};

module.exports = {
  addDetectedDisease,
  getAllDetectedDiseases,
  updateDetectedStatus,
  deleteDetectedDisease,
  getDetectionsByCultivationPlan,
}
