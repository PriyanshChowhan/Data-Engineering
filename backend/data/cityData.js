const CITY_DATA = {
  Mumbai: {
    state: "Maharashtra",
    coordinates: { lat: 19.076, lng: 72.8777 },
    areas: [
      "Andheri West",
      "Powai",
      "Bandra",
      "Worli",
      "Chembur",
      "Borivali",
      "Goregaon",
      "Lower Parel"
    ]
  },
  Delhi: {
    state: "Delhi",
    coordinates: { lat: 28.6139, lng: 77.209 },
    areas: [
      "Dwarka",
      "Rohini",
      "Saket",
      "Vasant Kunj",
      "Karol Bagh",
      "Punjabi Bagh",
      "Janakpuri",
      "Greater Kailash"
    ]
  },
  Bangalore: {
    state: "Karnataka",
    coordinates: { lat: 12.9716, lng: 77.5946 },
    areas: [
      "Whitefield",
      "Koramangala",
      "Indiranagar",
      "Electronic City",
      "HSR Layout",
      "Yelahanka",
      "Sarjapur Road",
      "Jayanagar"
    ]
  },
  Hyderabad: {
    state: "Telangana",
    coordinates: { lat: 17.385, lng: 78.4867 },
    areas: [
      "Gachibowli",
      "Madhapur",
      "Kondapur",
      "Banjara Hills",
      "Jubilee Hills",
      "Kukatpally",
      "Miyapur",
      "Secunderabad"
    ]
  },
  Pune: {
    state: "Maharashtra",
    coordinates: { lat: 18.5204, lng: 73.8567 },
    areas: [
      "Hinjewadi",
      "Kharadi",
      "Wakad",
      "Baner",
      "Viman Nagar",
      "Hadapsar",
      "Aundh",
      "Pimple Saudagar"
    ]
  },
  Chennai: {
    state: "Tamil Nadu",
    coordinates: { lat: 13.0827, lng: 80.2707 },
    areas: [
      "OMR",
      "Anna Nagar",
      "Velachery",
      "Tambaram",
      "Porur",
      "Sholinganallur",
      "Thoraipakkam",
      "Adyar"
    ]
  },
  Chandigarh: {
    state: "Punjab",
    coordinates: { lat: 30.7333, lng: 76.7794 },
    areas: [
      "Sector 17",
      "Sector 22",
      "Sector 35",
      "Sector 43",
      "Sector 44",
      "Sector 46",
      "Manimajra",
      "Zirakpur Edge"
    ]
  },
  Jaipur: {
    state: "Rajasthan",
    coordinates: { lat: 26.9124, lng: 75.7873 },
    areas: [
      "Malviya Nagar",
      "Vaishali Nagar",
      "Mansarovar",
      "Jagatpura",
      "C Scheme",
      "Tonk Road",
      "Ajmer Road",
      "Vidhyadhar Nagar"
    ]
  },
  Ahmedabad: {
    state: "Gujarat",
    coordinates: { lat: 23.0225, lng: 72.5714 },
    areas: [
      "SG Highway",
      "Satellite",
      "Bopal",
      "Prahlad Nagar",
      "Navrangpura",
      "Thaltej",
      "Science City",
      "Maninagar"
    ]
  },
  Kolkata: {
    state: "West Bengal",
    coordinates: { lat: 22.5726, lng: 88.3639 },
    areas: [
      "Salt Lake",
      "New Town",
      "Ballygunge",
      "Behala",
      "Park Street",
      "Tollygunge",
      "Rajarhat",
      "Dum Dum"
    ]
  }
};

const CITY_NAMES = Object.keys(CITY_DATA);

module.exports = {
  CITY_DATA,
  CITY_NAMES
};
