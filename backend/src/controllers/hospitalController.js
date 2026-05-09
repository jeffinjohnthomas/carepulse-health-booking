const Hospital = require('../models/Hospital');

// Helper to calculate distance between two coordinates in km using Haversine formula
const calculateDistance = (lat1, lon1, lat2, lon2) => {
  const R = 6371; // km
  const dLat = (lat2 - lat1) * Math.PI / 180;
  const dLon = (lon2 - lon1) * Math.PI / 180;
  const a = Math.sin(dLat/2) * Math.sin(dLat/2) +
            Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) * 
            Math.sin(dLon/2) * Math.sin(dLon/2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
  return R * c;
};

// @desc    Get all hospitals from Database
// @route   GET /api/hospitals
// @access  Public
const getHospitals = async (req, res) => {
  try {
    const { search, lat, lng } = req.query;
    
    let targetLat = parseFloat(lat);
    let targetLng = parseFloat(lng);
    
    let query = {};

    // Advanced Search Filtering
    if (search) {
      query.$or = [
        { name: { $regex: search, $options: 'i' } },
        { city: { $regex: search, $options: 'i' } },
        { specialties: { $regex: search, $options: 'i' } }
      ];
    }

    // Fetch hospitals from MongoDB
    const hospitalsData = await Hospital.find(query);

    // Format for frontend and calculate distance if coordinates are provided
    const hospitals = hospitalsData.map(h => {
      let distance = 0;
      let hLat = h.location?.coordinates?.[1] || 0;
      let hLng = h.location?.coordinates?.[0] || 0;

      if (!isNaN(targetLat) && !isNaN(targetLng) && hLat !== 0 && hLng !== 0) {
        distance = calculateDistance(targetLat, targetLng, hLat, hLng);
      }

      return {
        _id: h._id.toString(),
        name: h.name,
        city: h.city || 'Unknown City',
        state: h.state || '',
        zipcode: h.zipcode || '',
        address: h.address || 'Address unavailable',
        phone: h.contact?.phone || 'N/A',
        rating: h.rating || 5.0,
        numReviews: h.numReviews || 0,
        image: h.image || "https://images.unsplash.com/photo-1586773860418-d37222d8fce3?ixlib=rb-1.2.1&auto=format&fit=crop&w=800&q=80",
        distance: distance.toFixed(1),
        services: h.services || [],
        location: { lat: hLat, lng: hLng },
        isCustom: h.isCustom || false
      };
    });

    // Sort by distance if a target location was provided
    if (!isNaN(targetLat) && !isNaN(targetLng)) {
      hospitals.sort((a, b) => parseFloat(a.distance) - parseFloat(b.distance));
    }

    res.json(hospitals);
  } catch (error) {
    console.error('Database Error:', error.message);
    res.status(500).json({ message: 'Server Error fetching hospitals' });
  }
};

// @desc    Get hospital by ID from Database
// @route   GET /api/hospitals/:id
// @access  Public
const getHospitalById = async (req, res) => {
  try {
    const hospital = await Hospital.findById(req.params.id);
    
    if (!hospital) {
      return res.status(404).json({ message: 'Hospital not found' });
    }

    let hLat = hospital.location?.coordinates?.[1] || 0;
    let hLng = hospital.location?.coordinates?.[0] || 0;

    res.json({
      _id: hospital._id.toString(),
      name: hospital.name,
      city: hospital.city || 'Unknown City',
      state: hospital.state || '',
      zipcode: hospital.zipcode || '',
      address: hospital.address || 'Address unavailable',
      phone: hospital.contact?.phone || 'Not provided',
      website: hospital.contact?.email || '',
      workingHours: hospital.timings || '24/7',
      rating: hospital.rating || 5.0,
      numReviews: hospital.numReviews || 0,
      image: hospital.image || 'https://images.unsplash.com/photo-1587351021759-3e566b6af7cc?q=80&w=2000&auto=format&fit=crop',
      services: hospital.services || [],
      location: { lat: hLat, lng: hLng }
    });
  } catch (error) {
    console.error('Database Error:', error.message);
    res.status(500).json({ message: 'Server Error fetching hospital details' });
  }
};

module.exports = {
  getHospitals,
  getHospitalById
};
