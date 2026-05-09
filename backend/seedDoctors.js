const mongoose = require('mongoose');
const dotenv = require('dotenv');
const Doctor = require('./src/models/Doctor');
const Hospital = require('./src/models/Hospital');
const connectDB = require('./src/config/db');

dotenv.config();

const seedDoctors = async () => {
  try {
    await connectDB();
    await Doctor.deleteMany();

    const hospitals = await Hospital.find();
    if (hospitals.length === 0) {
      console.error('No hospitals found. Seed hospitals first.');
      process.exit(1);
    }

    const today = new Date().toISOString().split('T')[0];
    const tomorrow = new Date(Date.now() + 86400000).toISOString().split('T')[0];

    const doctors = [
      {
        name: "Dr. Sarah Johnson",
        specialty: "Cardiology",
        experience: 12,
        consultationFee: 1500,
        about: "Expert in interventional cardiology and heart failure.",
        hospital: hospitals[0]._id, // St. Mary's
        hospitalName: hospitals[0].name,
        gender: "Female",
        insuranceAccepted: ["BlueCross", "Aetna", "Cigna"],
        symptomsTreated: ["Chest Pain", "Palpitations", "High Blood Pressure"],
        availability: [
          { date: today, slots: ["09:00 AM", "11:00 AM", "02:00 PM"] },
          { date: tomorrow, slots: ["10:00 AM", "01:00 PM"] }
        ],
        rating: 4.8,
        numReviews: 320,
        imageUrl: "https://images.unsplash.com/photo-1559839734-2b71ea197ec2?auto=format&fit=crop&w=400&q=80"
      },
      {
        name: "Dr. Michael Chen",
        specialty: "Neurology",
        experience: 15,
        consultationFee: 2000,
        about: "Specializes in treating migraines, epilepsy, and stroke.",
        hospital: hospitals[0]._id, // St. Mary's
        hospitalName: hospitals[0].name,
        gender: "Male",
        insuranceAccepted: ["Medicare", "Aetna"],
        symptomsTreated: ["Headache", "Dizziness", "Seizures"],
        availability: [
          { date: today, slots: ["03:00 PM", "04:30 PM"] },
          { date: tomorrow, slots: ["09:00 AM", "11:30 AM"] }
        ],
        rating: 4.9,
        numReviews: 450,
        imageUrl: "https://images.unsplash.com/photo-1612349317150-e413f6a5b16d?auto=format&fit=crop&w=400&q=80"
      },
      {
        name: "Dr. Emily Davis",
        specialty: "Pediatrics",
        experience: 8,
        consultationFee: 1000,
        about: "Compassionate care for infants, children, and adolescents.",
        hospital: hospitals[2]._id, // Riverside Pediatric
        hospitalName: hospitals[2].name,
        gender: "Female",
        insuranceAccepted: ["BlueCross", "UnitedHealthcare", "Cigna"],
        symptomsTreated: ["Fever", "Cough", "Vaccination", "Rashes"],
        availability: [
          { date: today, slots: ["10:00 AM", "12:00 PM", "04:00 PM"] }
        ],
        rating: 4.7,
        numReviews: 210,
        imageUrl: "https://images.unsplash.com/photo-1594824436951-7f12bc00ce04?auto=format&fit=crop&w=400&q=80"
      },
      {
        name: "Dr. Robert Smith",
        specialty: "Orthopedics",
        experience: 20,
        consultationFee: 2500,
        about: "Renowned orthopedic surgeon specializing in joint replacement.",
        hospital: hospitals[3]._id, // Central Ortho
        hospitalName: hospitals[3].name,
        gender: "Male",
        insuranceAccepted: ["Aetna", "Cigna"],
        symptomsTreated: ["Joint Pain", "Back Pain", "Fractures", "Arthritis"],
        availability: [
          { date: tomorrow, slots: ["08:00 AM", "10:00 AM"] }
        ],
        rating: 4.6,
        numReviews: 500,
        imageUrl: "https://images.unsplash.com/photo-1537368910025-702800bf8465?auto=format&fit=crop&w=400&q=80"
      }
    ];

    await Doctor.insertMany(doctors);
    console.log('Doctors Seeded Successfully!');
    process.exit();
  } catch (error) {
    console.error('Error Seeding Doctors:', error);
    process.exit(1);
  }
};

seedDoctors();
