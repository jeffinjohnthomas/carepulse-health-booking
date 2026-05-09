const mongoose = require('mongoose');
const dotenv = require('dotenv');
const Hospital = require('./src/models/Hospital');
const connectDB = require('./src/config/db');

dotenv.config();

const hospitals = [
  {
    name: "Apollo Hospitals",
    image: "https://images.unsplash.com/photo-1586773860418-d319a39855df?auto=format&fit=crop&w=800&q=80",
    address: "154/11, Bannerghatta Road, Opp. IIM",
    city: "Bangalore",
    state: "Karnataka",
    zipcode: "560076",
    location: { type: "Point", coordinates: [77.5961, 12.8964] }, 
    rating: 4.8,
    numReviews: 2450,
    services: ["Cardiology", "Neurology", "Oncology", "Orthopedics", "Emergency"],
    departments: ["Surgery", "Radiology", "ICU", "Pathology"],
    contact: { phone: "+91 80 2630 4050", email: "info@apollohospitals.com" },
    isCustom: false,
    reviews: [
      { user: "Rajesh Kumar", rating: 5, comment: "World-class facilities and excellent doctors." },
      { user: "Anita Sharma", rating: 4, comment: "Very good care, but billing took some time." }
    ]
  },
  {
    name: "Fortis Hospital",
    image: "https://images.unsplash.com/photo-1519494026892-80bbd2d6fd0d?auto=format&fit=crop&w=800&q=80",
    address: "154/9, Bannerghatta Road, Opposite IIM-B",
    city: "Bangalore",
    state: "Karnataka",
    zipcode: "560076",
    location: { type: "Point", coordinates: [77.5960, 12.8950] },
    rating: 4.7,
    numReviews: 1850,
    services: ["Gastroenterology", "Urology", "Cardiology", "Orthopedics"],
    departments: ["ICU", "Outpatient", "Surgery"],
    contact: { phone: "+91 80 6621 4444", email: "contactus.bgroad@fortishealthcare.com" },
    isCustom: false,
    reviews: [
      { user: "Priya Singh", rating: 5, comment: "Top-notch specialized care." }
    ]
  },
  {
    name: "Manipal Hospital",
    image: "https://images.unsplash.com/photo-1512678080530-7760d81faba6?auto=format&fit=crop&w=800&q=80",
    address: "98, HAL Old Airport Rd, Kodihalli",
    city: "Bangalore",
    state: "Karnataka",
    zipcode: "560017",
    location: { type: "Point", coordinates: [77.6493, 12.9592] },
    rating: 4.6,
    numReviews: 3200,
    services: ["Pediatrics", "Oncology", "Neurology", "Transplant"],
    departments: ["Child Care", "NICU", "Blood Bank", "Emergency"],
    contact: { phone: "+91 80 2502 4444", email: "info@manipalhospitals.com" },
    isCustom: false,
    reviews: [
      { user: "Sunil Verma", rating: 4, comment: "Great doctors, very crowded." }
    ]
  },
  {
    name: "Narayana Multispeciality Hospital",
    image: "https://images.unsplash.com/photo-1516549655169-df83a0774514?auto=format&fit=crop&w=800&q=80",
    address: "258/A, Bommasandra Industrial Area, Anekal Taluk",
    city: "Bangalore",
    state: "Karnataka",
    zipcode: "560099",
    location: { type: "Point", coordinates: [77.6833, 12.8159] },
    rating: 4.5,
    numReviews: 2100,
    services: ["Cardiac Surgery", "Neurosurgery", "Orthopedics"],
    departments: ["Emergency", "Surgery", "ICU"],
    contact: { phone: "+91 80 7122 2222", email: "info.nms@narayanahealth.org" },
    isCustom: false,
    reviews: [
      { user: "Vikram Reddy", rating: 5, comment: "Excellent cardiac care facility." }
    ]
  },
  {
    name: "Aster CMI Hospital",
    image: "https://images.unsplash.com/photo-1538108149393-cebb47ac19cb?auto=format&fit=crop&w=800&q=80",
    address: "No. 43/2, New Airport Road, NH-7, Hebbal",
    city: "Bangalore",
    state: "Karnataka",
    zipcode: "560092",
    location: { type: "Point", coordinates: [77.5946, 13.0360] },
    rating: 4.8,
    numReviews: 1540,
    services: ["Gastroenterology", "Neurology", "Pediatrics", "Transplant"],
    departments: ["Radiology", "ICU", "Laboratory"],
    contact: { phone: "+91 80 4342 0100", email: "customercare.astercmi@asterhospital.com" },
    isCustom: false,
    reviews: [
      { user: "Sneha Nair", rating: 5, comment: "Very modern facility and caring staff." }
    ]
  },
  {
    name: "Max Super Speciality Hospital",
    image: "https://images.unsplash.com/photo-1587351021759-3e566b6af7cc?auto=format&fit=crop&w=800&q=80",
    address: "1, Press Enclave Road, Saket",
    city: "New Delhi",
    state: "Delhi",
    zipcode: "110017",
    location: { type: "Point", coordinates: [77.2139, 28.5273] },
    rating: 4.7,
    numReviews: 4100,
    services: ["Cardiology", "Neurology", "Oncology", "Orthopedics"],
    departments: ["Emergency", "ICU", "Surgery"],
    contact: { phone: "+91 11 2651 5050", email: "info@maxhealthcare.com" },
    isCustom: false,
    reviews: [
      { user: "Amit Gupta", rating: 4, comment: "Premium healthcare services." }
    ]
  },
  {
    name: "Medanta - The Medicity",
    image: "https://images.unsplash.com/photo-1551076805-e1869033e561?auto=format&fit=crop&w=800&q=80",
    address: "CH Baktawar Singh Road, Sector 38",
    city: "Gurugram",
    state: "Haryana",
    zipcode: "122001",
    location: { type: "Point", coordinates: [77.0422, 28.4354] },
    rating: 4.9,
    numReviews: 5600,
    services: ["Cardiology", "Oncology", "Transplant", "Neurology"],
    departments: ["Surgery", "Emergency", "Pathology"],
    contact: { phone: "+91 124 414 1414", email: "info@medanta.org" },
    isCustom: false,
    reviews: [
      { user: "Rahul Desai", rating: 5, comment: "Best hospital in North India." }
    ]
  },
  {
    name: "Tata Memorial Hospital",
    image: "https://images.unsplash.com/photo-1504813184591-01572f98c85f?auto=format&fit=crop&w=800&q=80",
    address: "Dr. E Borges Road, Parel",
    city: "Mumbai",
    state: "Maharashtra",
    zipcode: "400012",
    location: { type: "Point", coordinates: [72.8428, 19.0063] },
    rating: 4.8,
    numReviews: 8900,
    services: ["Oncology", "Radiotherapy", "Surgery"],
    departments: ["Chemotherapy", "Pathology", "Research"],
    contact: { phone: "+91 22 2417 7000", email: "msoffice@tmc.gov.in" },
    isCustom: false,
    reviews: [
      { user: "Kavita Patil", rating: 5, comment: "A temple for cancer patients." }
    ]
  },
  {
    name: "Lilavati Hospital and Research Centre",
    image: "https://images.unsplash.com/photo-1586773860418-d319a39855df?auto=format&fit=crop&w=800&q=80",
    address: "A-791, Bandra Reclamation, Bandra West",
    city: "Mumbai",
    state: "Maharashtra",
    zipcode: "400050",
    location: { type: "Point", coordinates: [72.8315, 19.0526] },
    rating: 4.6,
    numReviews: 2800,
    services: ["Cardiology", "Neurology", "Orthopedics"],
    departments: ["ICU", "Emergency", "Maternity"],
    contact: { phone: "+91 22 2675 1000", email: "info@lilavatihospital.com" },
    isCustom: false,
    reviews: [
      { user: "Sanjay Joshi", rating: 4, comment: "Good facilities, but expensive." }
    ]
  },
  {
    name: "Christian Medical College (CMC)",
    image: "https://images.unsplash.com/photo-1519494026892-80bbd2d6fd0d?auto=format&fit=crop&w=800&q=80",
    address: "IDA Scudder Road",
    city: "Vellore",
    state: "Tamil Nadu",
    zipcode: "632004",
    location: { type: "Point", coordinates: [79.1352, 12.9248] },
    rating: 4.9,
    numReviews: 12000,
    services: ["General Medicine", "Surgery", "Oncology", "Pediatrics"],
    departments: ["Outpatient", "Emergency", "Research"],
    contact: { phone: "+91 416 228 2000", email: "pro@cmcvellore.ac.in" },
    isCustom: false,
    reviews: [
      { user: "Meenakshi Iyer", rating: 5, comment: "Exceptional service and highly ethical practices." }
    ]
  }
];

const seedHospitals = async () => {
  try {
    await connectDB();
    await Hospital.deleteMany();
    await Hospital.insertMany(hospitals);
    console.log('Real Hospitals Seeded Successfully!');
    process.exit();
  } catch (error) {
    console.error('Error Seeding Hospitals:', error);
    process.exit(1);
  }
};

seedHospitals();
