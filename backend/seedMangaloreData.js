const mongoose = require('mongoose');
const dotenv = require('dotenv');
const Doctor = require('./src/models/Doctor');
const Hospital = require('./src/models/Hospital');
const connectDB = require('./src/config/db');

dotenv.config();

const seedMangaloreData = async () => {
  try {
    await connectDB();
    console.log('Connected to DB. Clearing old mock data...');
    
    await Doctor.deleteMany();
    await Hospital.deleteMany();

    console.log('Inserting real Mangalore Hospitals...');

    const hospitalsData = [
      {
        name: "KMC Hospital (Kasturba Medical College Hospital)",
        image: "https://images.unsplash.com/photo-1587351021759-3e566b6af7cc?auto=format&fit=crop&w=800&q=80",
        address: "Dr. B. R. Ambedkar Circle, Mangalore",
        city: "Mangalore",
        state: "Karnataka",
        zipcode: "575001",
        location: { type: 'Point', coordinates: [74.8466, 12.8711] },
        rating: 4.8,
        numReviews: 1250,
        services: ["ICU", "Blood Bank", "Emergency 24x7", "Pharmacy", "Laboratory"],
        departments: ["Cardiology", "Neurology", "Orthopedics", "Pediatrics", "Oncology"],
        timings: "Open 24/7",
        contact: { phone: "+91 824 242 2271", email: "info@kmc.edu" },
        isCustom: true
      },
      {
        name: "Father Muller Medical College Hospital",
        image: "https://images.unsplash.com/photo-1519494026892-80bbd2d6fd0d?auto=format&fit=crop&w=800&q=80",
        address: "Father Muller Road, Kankanady, Mangalore",
        city: "Mangalore",
        state: "Karnataka",
        zipcode: "575002",
        location: { type: 'Point', coordinates: [74.8573, 12.8647] },
        rating: 4.7,
        numReviews: 980,
        services: ["NICU", "Trauma Care", "Emergency 24x7", "Pharmacy", "Pathology Lab"],
        departments: ["General Medicine", "Surgery", "Psychiatry", "Dermatology", "Gynecology"],
        timings: "Open 24/7",
        contact: { phone: "+91 824 223 8000", email: "muller@fathermuller.in" },
        isCustom: true
      },
      {
        name: "A.J. Hospital & Research Centre",
        image: "https://images.unsplash.com/photo-1538108149393-cecf8ba25a46?auto=format&fit=crop&w=800&q=80",
        address: "Kuntikana, NH 66, Mangalore",
        city: "Mangalore",
        state: "Karnataka",
        zipcode: "575004",
        location: { type: 'Point', coordinates: [74.8460, 12.8942] },
        rating: 4.6,
        numReviews: 750,
        services: ["Robotic Surgery", "ICU", "Emergency 24x7", "Dialysis", "Pharmacy"],
        departments: ["Gastroenterology", "Urology", "Cardiology", "Nephrology"],
        timings: "Open 24/7",
        contact: { phone: "+91 824 222 5533", email: "info@ajhospital.in" },
        isCustom: true
      },
      {
        name: "Yenepoya Medical College Hospital",
        image: "https://images.unsplash.com/photo-1586773860418-d37222d8fce3?auto=format&fit=crop&w=800&q=80",
        address: "University Road, Deralakatte, Mangalore",
        city: "Mangalore",
        state: "Karnataka",
        zipcode: "575018",
        location: { type: 'Point', coordinates: [74.8690, 12.8024] },
        rating: 4.5,
        numReviews: 610,
        services: ["Dental Care", "Physiotherapy", "Emergency 24x7", "Blood Bank"],
        departments: ["Dentistry", "Ophthalmology", "ENT", "Orthopedics"],
        timings: "Open 24/7",
        contact: { phone: "+91 824 220 4668", email: "reachus@yenepoya.org" },
        isCustom: true
      },
      {
        name: "Mangala Hospital & Mangala Kidney Foundation",
        image: "https://images.unsplash.com/photo-1512678080530-7760d81faba6?auto=format&fit=crop&w=800&q=80",
        address: "Vajra Rao Road, Kadri, Mangalore",
        city: "Mangalore",
        state: "Karnataka",
        zipcode: "575003",
        location: { type: 'Point', coordinates: [74.8512, 12.8790] },
        rating: 4.4,
        numReviews: 420,
        services: ["Kidney Transplant", "Dialysis", "Emergency 24x7", "Pharmacy"],
        departments: ["Nephrology", "Urology", "General Medicine"],
        timings: "Open 24/7",
        contact: { phone: "+91 824 244 4899", email: "info@mangalahospital.com" },
        isCustom: true
      },
      {
        name: "Omega Hospital",
        image: "https://images.unsplash.com/photo-1504439468489-c8920d786a2b?auto=format&fit=crop&w=800&q=80",
        address: "Pumpwell Junction, Mangalore",
        city: "Mangalore",
        state: "Karnataka",
        zipcode: "575002",
        location: { type: 'Point', coordinates: [74.8590, 12.8615] },
        rating: 4.3,
        numReviews: 380,
        services: ["Cardiac Care", "Orthopedic Surgery", "Emergency 24x7"],
        departments: ["Cardiology", "Orthopedics", "Neurology"],
        timings: "Open 24/7",
        contact: { phone: "+91 824 243 0000", email: "omegahospital@gmail.com" },
        isCustom: true
      }
    ];

    const insertedHospitals = await Hospital.insertMany(hospitalsData);
    console.log(`Inserted ${insertedHospitals.length} hospitals.`);

    const today = new Date().toISOString().split('T')[0];
    const tomorrow = new Date(Date.now() + 86400000).toISOString().split('T')[0];
    const dayAfter = new Date(Date.now() + 172800000).toISOString().split('T')[0];

    const generateAvailability = () => [
      { date: today, slots: ["09:00 AM", "11:00 AM", "02:00 PM", "04:00 PM"].filter(() => Math.random() > 0.3) },
      { date: tomorrow, slots: ["10:00 AM", "01:00 PM", "03:30 PM"].filter(() => Math.random() > 0.2) },
      { date: dayAfter, slots: ["09:30 AM", "12:00 PM", "05:00 PM"].filter(() => Math.random() > 0.2) }
    ];

    const doctorsData = [
      // KMC Hospital Doctors
      {
        name: "Dr. B. M. Hegde", specialty: "Cardiology", experience: 35, consultationFee: 1500,
        about: "Renowned cardiologist and medical scientist with decades of experience.",
        hospital: insertedHospitals[0]._id, hospitalName: insertedHospitals[0].name,
        gender: "Male", insuranceAccepted: ["BlueCross", "Aetna"], symptomsTreated: ["Chest Pain", "Palpitations"],
        availability: generateAvailability(), rating: 4.9, numReviews: 500
      },
      {
        name: "Dr. Sandeep Kumar", specialty: "Neurology", experience: 18, consultationFee: 1200,
        about: "Specializes in treating migraines, epilepsy, and stroke management.",
        hospital: insertedHospitals[0]._id, hospitalName: insertedHospitals[0].name,
        gender: "Male", insuranceAccepted: ["Medicare", "Aetna"], symptomsTreated: ["Headache", "Seizures"],
        availability: generateAvailability(), rating: 4.8, numReviews: 320
      },
      {
        name: "Dr. Ananya Shetty", specialty: "Pediatrics", experience: 14, consultationFee: 800,
        about: "Expert in newborn care, vaccinations, and pediatric asthma.",
        hospital: insertedHospitals[0]._id, hospitalName: insertedHospitals[0].name,
        gender: "Female", insuranceAccepted: ["Cigna"], symptomsTreated: ["Fever", "Cough", "Asthma"],
        availability: generateAvailability(), rating: 4.7, numReviews: 290
      },
      {
        name: "Dr. Ramesh Bhat", specialty: "Orthopedics", experience: 22, consultationFee: 1000,
        about: "Specialist in joint replacement and trauma surgery.",
        hospital: insertedHospitals[0]._id, hospitalName: insertedHospitals[0].name,
        gender: "Male", insuranceAccepted: ["BlueCross"], symptomsTreated: ["Joint Pain", "Fracture", "Back Pain"],
        availability: generateAvailability(), rating: 4.8, numReviews: 410
      },

      // Father Muller Doctors
      {
        name: "Dr. JP Alva", specialty: "General Medicine", experience: 25, consultationFee: 700,
        about: "Veteran physician focused on holistic adult medicine and chronic disease management.",
        hospital: insertedHospitals[1]._id, hospitalName: insertedHospitals[1].name,
        gender: "Male", insuranceAccepted: ["Medicare"], symptomsTreated: ["Fever", "Diabetes", "Hypertension"],
        availability: generateAvailability(), rating: 4.9, numReviews: 600
      },
      {
        name: "Dr. Preethi D'Souza", specialty: "Gynecology", experience: 16, consultationFee: 900,
        about: "Compassionate care in obstetrics, high-risk pregnancies, and women's health.",
        hospital: insertedHospitals[1]._id, hospitalName: insertedHospitals[1].name,
        gender: "Female", insuranceAccepted: ["Aetna", "Cigna"], symptomsTreated: ["Pregnancy", "PCOS", "Menstrual Issues"],
        availability: generateAvailability(), rating: 4.8, numReviews: 350
      },
      {
        name: "Dr. Sukesh", specialty: "Dermatology", experience: 12, consultationFee: 800,
        about: "Expert in clinical dermatology, acne treatments, and hair fall therapies.",
        hospital: insertedHospitals[1]._id, hospitalName: insertedHospitals[1].name,
        gender: "Male", insuranceAccepted: ["BlueCross"], symptomsTreated: ["Acne", "Hair Fall", "Rashes"],
        availability: generateAvailability(), rating: 4.6, numReviews: 210
      },
      {
        name: "Dr. Safeek", specialty: "Psychiatry", experience: 15, consultationFee: 1000,
        about: "Dedicated to mental health, anxiety disorders, and depression management.",
        hospital: insertedHospitals[1]._id, hospitalName: insertedHospitals[1].name,
        gender: "Male", insuranceAccepted: ["All"], symptomsTreated: ["Anxiety", "Depression", "Stress"],
        availability: generateAvailability(), rating: 4.7, numReviews: 180
      },

      // A.J. Hospital Doctors
      {
        name: "Dr. Prashanth Marla", specialty: "Urology", experience: 28, consultationFee: 1200,
        about: "Pioneer in kidney transplant and advanced urological surgeries.",
        hospital: insertedHospitals[2]._id, hospitalName: insertedHospitals[2].name,
        gender: "Male", insuranceAccepted: ["BlueCross", "Aetna"], symptomsTreated: ["Kidney Stones", "Prostate Issues"],
        availability: generateAvailability(), rating: 4.9, numReviews: 550
      },
      {
        name: "Dr. Purushotham", specialty: "Cardiology", experience: 20, consultationFee: 1100,
        about: "Specialized in non-invasive cardiology and preventative heart care.",
        hospital: insertedHospitals[2]._id, hospitalName: insertedHospitals[2].name,
        gender: "Male", insuranceAccepted: ["Medicare"], symptomsTreated: ["High BP", "Chest Pain"],
        availability: generateAvailability(), rating: 4.7, numReviews: 310
      },
      {
        name: "Dr. Sudhir Hegde", specialty: "Gastroenterology", experience: 18, consultationFee: 1000,
        about: "Expert in liver diseases, endoscopy, and digestive health.",
        hospital: insertedHospitals[2]._id, hospitalName: insertedHospitals[2].name,
        gender: "Male", insuranceAccepted: ["Cigna"], symptomsTreated: ["Stomach Ache", "Acidity", "Ulcer"],
        availability: generateAvailability(), rating: 4.8, numReviews: 280
      },
      {
        name: "Dr. Rohan Shetty", specialty: "Nephrology", experience: 14, consultationFee: 1000,
        about: "Focuses on chronic kidney diseases and dialysis management.",
        hospital: insertedHospitals[2]._id, hospitalName: insertedHospitals[2].name,
        gender: "Male", insuranceAccepted: ["All"], symptomsTreated: ["Kidney Failure", "UTI"],
        availability: generateAvailability(), rating: 4.6, numReviews: 190
      },

      // Yenepoya Hospital Doctors
      {
        name: "Dr. Akhtar Husain", specialty: "Dentistry", experience: 25, consultationFee: 600,
        about: "Renowned orthodontist with vast academic and clinical expertise.",
        hospital: insertedHospitals[3]._id, hospitalName: insertedHospitals[3].name,
        gender: "Male", insuranceAccepted: ["All"], symptomsTreated: ["Toothache", "Braces"],
        availability: generateAvailability(), rating: 4.8, numReviews: 400
      },
      {
        name: "Dr. Rashmi", specialty: "Ophthalmology", experience: 15, consultationFee: 800,
        about: "Specialist in cataract surgery and vision correction.",
        hospital: insertedHospitals[3]._id, hospitalName: insertedHospitals[3].name,
        gender: "Female", insuranceAccepted: ["Medicare"], symptomsTreated: ["Blurry Vision", "Eye Pain"],
        availability: generateAvailability(), rating: 4.7, numReviews: 230
      },
      {
        name: "Dr. Vijay", specialty: "ENT", experience: 12, consultationFee: 700,
        about: "Expert in treating ear, nose, and throat disorders.",
        hospital: insertedHospitals[3]._id, hospitalName: insertedHospitals[3].name,
        gender: "Male", insuranceAccepted: ["BlueCross"], symptomsTreated: ["Hearing Loss", "Sinusitis", "Throat Pain"],
        availability: generateAvailability(), rating: 4.6, numReviews: 150
      },
      {
        name: "Dr. Mohammed", specialty: "Orthopedics", experience: 16, consultationFee: 900,
        about: "Sports injury and joint preservation specialist.",
        hospital: insertedHospitals[3]._id, hospitalName: insertedHospitals[3].name,
        gender: "Male", insuranceAccepted: ["Aetna"], symptomsTreated: ["Sports Injury", "Knee Pain"],
        availability: generateAvailability(), rating: 4.7, numReviews: 200
      },

      // Mangala Hospital Doctors
      {
        name: "Dr. Aravind", specialty: "Nephrology", experience: 20, consultationFee: 1000,
        about: "Leading nephrologist with extensive experience in kidney care.",
        hospital: insertedHospitals[4]._id, hospitalName: insertedHospitals[4].name,
        gender: "Male", insuranceAccepted: ["Cigna"], symptomsTreated: ["Kidney Issues", "Dialysis"],
        availability: generateAvailability(), rating: 4.8, numReviews: 320
      },
      {
        name: "Dr. Shwetha", specialty: "General Medicine", experience: 10, consultationFee: 600,
        about: "Compassionate physician for all general health needs.",
        hospital: insertedHospitals[4]._id, hospitalName: insertedHospitals[4].name,
        gender: "Female", insuranceAccepted: ["All"], symptomsTreated: ["Fever", "Cold", "Fatigue"],
        availability: generateAvailability(), rating: 4.5, numReviews: 140
      },
      {
        name: "Dr. Karthik", specialty: "Urology", experience: 14, consultationFee: 900,
        about: "Expert in male reproductive health and urinary tract disorders.",
        hospital: insertedHospitals[4]._id, hospitalName: insertedHospitals[4].name,
        gender: "Male", insuranceAccepted: ["BlueCross"], symptomsTreated: ["Prostate Issues", "Kidney Stones"],
        availability: generateAvailability(), rating: 4.6, numReviews: 170
      },

      // Omega Hospital Doctors
      {
        name: "Dr. Mukund", specialty: "Cardiology", experience: 24, consultationFee: 1200,
        about: "Senior interventional cardiologist handling complex cases.",
        hospital: insertedHospitals[5]._id, hospitalName: insertedHospitals[5].name,
        gender: "Male", insuranceAccepted: ["Medicare", "Aetna"], symptomsTreated: ["Heart Attack", "Arrhythmia"],
        availability: generateAvailability(), rating: 4.9, numReviews: 480
      },
      {
        name: "Dr. Sumanth", specialty: "Orthopedics", experience: 18, consultationFee: 1000,
        about: "Renowned for complex fracture management and arthroscopy.",
        hospital: insertedHospitals[5]._id, hospitalName: insertedHospitals[5].name,
        gender: "Male", insuranceAccepted: ["Cigna"], symptomsTreated: ["Fracture", "Ligament Tear"],
        availability: generateAvailability(), rating: 4.8, numReviews: 290
      },
      {
        name: "Dr. Rekha", specialty: "Neurology", experience: 15, consultationFee: 1100,
        about: "Dedicated neurologist with a focus on neurodegenerative diseases.",
        hospital: insertedHospitals[5]._id, hospitalName: insertedHospitals[5].name,
        gender: "Female", insuranceAccepted: ["BlueCross"], symptomsTreated: ["Memory Loss", "Tremors"],
        availability: generateAvailability(), rating: 4.7, numReviews: 220
      }
    ];

    const insertedDoctors = await Doctor.insertMany(doctorsData);
    console.log(`Inserted ${insertedDoctors.length} doctors.`);

    console.log('Seed completed successfully!');
    process.exit(0);
  } catch (error) {
    console.error('Error with seed data', error);
    process.exit(1);
  }
};

seedMangaloreData();
