const Doctor = require('../models/Doctor');


// @desc    Get all doctors with filters and search
// @route   GET /api/doctors
// @access  Public
const getDoctors = async (req, res) => {
  try {
    const { search, gender, insurance, availableToday, hospital, hospitalName } = req.query;
    let query = {};

    if (search) {
      query.$or = [
        { name: { $regex: search, $options: 'i' } },
        { specialty: { $regex: search, $options: 'i' } },
        { symptomsTreated: { $regex: search, $options: 'i' } }
      ];
    }

    if (gender) query.gender = gender;
    
    if (insurance) {
      query.insuranceAccepted = { $regex: insurance, $options: 'i' };
    }

    if (hospital) {
      const mongoose = require('mongoose');
      if (mongoose.Types.ObjectId.isValid(hospital) && String(new mongoose.Types.ObjectId(hospital)) === hospital) {
        query.hospital = new mongoose.Types.ObjectId(hospital);
      } else {
        query.hospital = hospital;
      }
    }

    if (availableToday === 'true') {
      const today = new Date().toISOString().split('T')[0];
      query['availability.date'] = today;
    }

    let doctors = await Doctor.find(query).lean();

    
    // Manually populate hospital if it's a valid ObjectId
    const mongoose = require('mongoose');
    const Hospital = require('../models/Hospital');
    for (let d of doctors) {
      if (mongoose.Types.ObjectId.isValid(d.hospital)) {
        const hosp = await Hospital.findById(d.hospital, 'city state address name').lean();
        if (hosp) {
          d.hospital = hosp;
        }
      }
    }
    
    // Process availability to show next available slot string
    const processedDoctors = doctors.map(doc => {
      const d = doc; // Already lean
      d.nextAvailable = getNextAvailableSlot(d.availability);
      return d;
    });

    res.json(processedDoctors);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server Error fetching doctors' });
  }
};

// @desc    Get doctor by ID
// @route   GET /api/doctors/:id
// @access  Public
const getDoctorById = async (req, res) => {
  try {
    const doctor = await Doctor.findById(req.params.id);
    if (!doctor) return res.status(404).json({ message: 'Doctor not found' });
    res.json(doctor);
  } catch (error) {
    res.status(500).json({ message: 'Server Error fetching doctor details' });
  }
};

function getNextAvailableSlot(availabilityArr) {
  if (!availabilityArr || availabilityArr.length === 0) return "No slots available";
  const firstDay = availabilityArr[0];
  if (firstDay && firstDay.slots && firstDay.slots.length > 0) {
    const today = new Date().toISOString().split('T')[0];
    const dateStr = firstDay.date === today ? "Today" : firstDay.date;
    return `Next available ${dateStr} at ${firstDay.slots[0]}`;
  }
  return "No slots available";
}

module.exports = { getDoctors, getDoctorById };
