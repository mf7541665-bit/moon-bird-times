// Offline place database — Tamil Nadu districts/taluks + major Indian cities.
// Coordinates are city-center approximations. All Indian entries use IST (330 min).
// Kept intentionally compact; supplement via online geocoder when unmatched.

export type OfflinePlace = {
  name: string;      // English city
  ta?: string;       // Tamil name (optional)
  state: string;
  lat: number;
  lon: number;
  tz: number;        // minutes east of UTC
};

export const OFFLINE_PLACES: OfflinePlace[] = [
  // ── Tamil Nadu (districts + prominent towns) ─────────────────
  { name: "Chennai", ta: "சென்னை", state: "Tamil Nadu", lat: 13.0827, lon: 80.2707, tz: 330 },
  { name: "Coimbatore", ta: "கோயம்புத்தூர்", state: "Tamil Nadu", lat: 11.0168, lon: 76.9558, tz: 330 },
  { name: "Madurai", ta: "மதுரை", state: "Tamil Nadu", lat: 9.9252, lon: 78.1198, tz: 330 },
  { name: "Tiruchirappalli", ta: "திருச்சிராப்பள்ளி", state: "Tamil Nadu", lat: 10.7905, lon: 78.7047, tz: 330 },
  { name: "Salem", ta: "சேலம்", state: "Tamil Nadu", lat: 11.6643, lon: 78.146, tz: 330 },
  { name: "Tirunelveli", ta: "திருநெல்வேலி", state: "Tamil Nadu", lat: 8.7139, lon: 77.7567, tz: 330 },
  { name: "Tiruppur", ta: "திருப்பூர்", state: "Tamil Nadu", lat: 11.1085, lon: 77.3411, tz: 330 },
  { name: "Erode", ta: "ஈரோடு", state: "Tamil Nadu", lat: 11.341, lon: 77.7172, tz: 330 },
  { name: "Vellore", ta: "வேலூர்", state: "Tamil Nadu", lat: 12.9165, lon: 79.1325, tz: 330 },
  { name: "Thoothukudi", ta: "தூத்துக்குடி", state: "Tamil Nadu", lat: 8.7642, lon: 78.1348, tz: 330 },
  { name: "Dindigul", ta: "திண்டுக்கல்", state: "Tamil Nadu", lat: 10.3673, lon: 77.9803, tz: 330 },
  { name: "Thanjavur", ta: "தஞ்சாவூர்", state: "Tamil Nadu", lat: 10.787, lon: 79.1378, tz: 330 },
  { name: "Ranipet", ta: "ராணிப்பேட்டை", state: "Tamil Nadu", lat: 12.9243, lon: 79.3336, tz: 330 },
  { name: "Sivakasi", ta: "சிவகாசி", state: "Tamil Nadu", lat: 9.4482, lon: 77.7965, tz: 330 },
  { name: "Karur", ta: "கரூர்", state: "Tamil Nadu", lat: 10.9601, lon: 78.0766, tz: 330 },
  { name: "Cuddalore", ta: "கடலூர்", state: "Tamil Nadu", lat: 11.748, lon: 79.7714, tz: 330 },
  { name: "Kanchipuram", ta: "காஞ்சிபுரம்", state: "Tamil Nadu", lat: 12.8342, lon: 79.7036, tz: 330 },
  { name: "Nagercoil", ta: "நாகர்கோவில்", state: "Tamil Nadu", lat: 8.1833, lon: 77.4119, tz: 330 },
  { name: "Kumbakonam", ta: "கும்பகோணம்", state: "Tamil Nadu", lat: 10.9601, lon: 79.3845, tz: 330 },
  { name: "Hosur", ta: "ஓசூர்", state: "Tamil Nadu", lat: 12.7409, lon: 77.8253, tz: 330 },
  { name: "Karaikudi", ta: "காரைக்குடி", state: "Tamil Nadu", lat: 10.0669, lon: 78.7809, tz: 330 },
  { name: "Neyveli", ta: "நெய்வேலி", state: "Tamil Nadu", lat: 11.6089, lon: 79.4831, tz: 330 },
  { name: "Nagapattinam", ta: "நாகப்பட்டினம்", state: "Tamil Nadu", lat: 10.7672, lon: 79.8449, tz: 330 },
  { name: "Viluppuram", ta: "விழுப்புரம்", state: "Tamil Nadu", lat: 11.9401, lon: 79.4861, tz: 330 },
  { name: "Tiruvannamalai", ta: "திருவண்ணாமலை", state: "Tamil Nadu", lat: 12.2253, lon: 79.0747, tz: 330 },
  { name: "Pollachi", ta: "பொள்ளாச்சி", state: "Tamil Nadu", lat: 10.6608, lon: 77.0086, tz: 330 },
  { name: "Rajapalayam", ta: "ராஜபாளையம்", state: "Tamil Nadu", lat: 9.4517, lon: 77.5533, tz: 330 },
  { name: "Gudiyatham", state: "Tamil Nadu", lat: 12.9439, lon: 78.8721, tz: 330 },
  { name: "Pudukkottai", ta: "புதுக்கோட்டை", state: "Tamil Nadu", lat: 10.3833, lon: 78.8001, tz: 330 },
  { name: "Ambur", state: "Tamil Nadu", lat: 12.7912, lon: 78.7157, tz: 330 },
  { name: "Namakkal", ta: "நாமக்கல்", state: "Tamil Nadu", lat: 11.2189, lon: 78.1674, tz: 330 },
  { name: "Krishnagiri", ta: "கிருஷ்ணகிரி", state: "Tamil Nadu", lat: 12.5266, lon: 78.2141, tz: 330 },
  { name: "Dharmapuri", ta: "தர்மபுரி", state: "Tamil Nadu", lat: 12.1211, lon: 78.1582, tz: 330 },
  { name: "Ariyalur", ta: "அரியலூர்", state: "Tamil Nadu", lat: 11.14, lon: 79.0783, tz: 330 },
  { name: "Perambalur", ta: "பெரம்பலூர்", state: "Tamil Nadu", lat: 11.2333, lon: 78.8833, tz: 330 },
  { name: "Ramanathapuram", ta: "இராமநாதபுரம்", state: "Tamil Nadu", lat: 9.3639, lon: 78.8395, tz: 330 },
  { name: "Sivaganga", ta: "சிவகங்கை", state: "Tamil Nadu", lat: 9.8433, lon: 78.4809, tz: 330 },
  { name: "Theni", ta: "தேனி", state: "Tamil Nadu", lat: 10.0104, lon: 77.4768, tz: 330 },
  { name: "Virudhunagar", ta: "விருதுநகர்", state: "Tamil Nadu", lat: 9.5851, lon: 77.9624, tz: 330 },
  { name: "Tenkasi", ta: "தென்காசி", state: "Tamil Nadu", lat: 8.9599, lon: 77.3152, tz: 330 },
  { name: "Kallakurichi", ta: "கள்ளக்குறிச்சி", state: "Tamil Nadu", lat: 11.7385, lon: 78.9597, tz: 330 },
  { name: "Chengalpattu", ta: "செங்கல்பட்டு", state: "Tamil Nadu", lat: 12.6819, lon: 79.9865, tz: 330 },
  { name: "Tirupathur", state: "Tamil Nadu", lat: 12.4956, lon: 78.5678, tz: 330 },
  { name: "Mayiladuthurai", ta: "மயிலாடுதுறை", state: "Tamil Nadu", lat: 11.1018, lon: 79.6521, tz: 330 },
  { name: "Ooty", ta: "உதகமண்டலம்", state: "Tamil Nadu", lat: 11.4102, lon: 76.695, tz: 330 },
  { name: "Kodaikanal", ta: "கொடைக்கானல்", state: "Tamil Nadu", lat: 10.2381, lon: 77.4892, tz: 330 },
  { name: "Rameswaram", ta: "இராமேஸ்வரம்", state: "Tamil Nadu", lat: 9.2876, lon: 79.3129, tz: 330 },
  { name: "Kanyakumari", ta: "கன்னியாகுமரி", state: "Tamil Nadu", lat: 8.0883, lon: 77.5385, tz: 330 },
  { name: "Chidambaram", ta: "சிதம்பரம்", state: "Tamil Nadu", lat: 11.3994, lon: 79.6939, tz: 330 },
  { name: "Palani", ta: "பழனி", state: "Tamil Nadu", lat: 10.4499, lon: 77.5218, tz: 330 },
  { name: "Srirangam", ta: "ஸ்ரீரங்கம்", state: "Tamil Nadu", lat: 10.8624, lon: 78.6867, tz: 330 },
  { name: "Mettur", state: "Tamil Nadu", lat: 11.7891, lon: 77.8022, tz: 330 },
  { name: "Bhavani", state: "Tamil Nadu", lat: 11.4457, lon: 77.6816, tz: 330 },
  { name: "Gobichettipalayam", state: "Tamil Nadu", lat: 11.4553, lon: 77.4419, tz: 330 },
  { name: "Udumalaipettai", state: "Tamil Nadu", lat: 10.5867, lon: 77.2497, tz: 330 },
  { name: "Valparai", state: "Tamil Nadu", lat: 10.3268, lon: 76.9552, tz: 330 },
  { name: "Arakkonam", state: "Tamil Nadu", lat: 13.0819, lon: 79.6699, tz: 330 },
  { name: "Tambaram", ta: "தாம்பரம்", state: "Tamil Nadu", lat: 12.9249, lon: 80.1, tz: 330 },
  { name: "Avadi", state: "Tamil Nadu", lat: 13.1147, lon: 80.1093, tz: 330 },

  // ── Puducherry ─────────────────
  { name: "Puducherry", ta: "புதுச்சேரி", state: "Puducherry", lat: 11.9139, lon: 79.8145, tz: 330 },
  { name: "Karaikal", ta: "காரைக்கால்", state: "Puducherry", lat: 10.9254, lon: 79.8380, tz: 330 },

  // ── Major India metros & capitals ─────────────────
  { name: "Bengaluru", state: "Karnataka", lat: 12.9716, lon: 77.5946, tz: 330 },
  { name: "Mysuru", state: "Karnataka", lat: 12.2958, lon: 76.6394, tz: 330 },
  { name: "Mangaluru", state: "Karnataka", lat: 12.9141, lon: 74.856, tz: 330 },
  { name: "Hubballi", state: "Karnataka", lat: 15.3647, lon: 75.124, tz: 330 },
  { name: "Belagavi", state: "Karnataka", lat: 15.8497, lon: 74.4977, tz: 330 },
  { name: "Kalaburagi", state: "Karnataka", lat: 17.3297, lon: 76.8343, tz: 330 },
  { name: "Hyderabad", state: "Telangana", lat: 17.385, lon: 78.4867, tz: 330 },
  { name: "Warangal", state: "Telangana", lat: 17.9689, lon: 79.5941, tz: 330 },
  { name: "Nizamabad", state: "Telangana", lat: 18.6725, lon: 78.094, tz: 330 },
  { name: "Vijayawada", state: "Andhra Pradesh", lat: 16.5062, lon: 80.648, tz: 330 },
  { name: "Visakhapatnam", state: "Andhra Pradesh", lat: 17.6868, lon: 83.2185, tz: 330 },
  { name: "Guntur", state: "Andhra Pradesh", lat: 16.3067, lon: 80.4365, tz: 330 },
  { name: "Tirupati", state: "Andhra Pradesh", lat: 13.6288, lon: 79.4192, tz: 330 },
  { name: "Nellore", state: "Andhra Pradesh", lat: 14.4426, lon: 79.9865, tz: 330 },
  { name: "Kurnool", state: "Andhra Pradesh", lat: 15.8281, lon: 78.0373, tz: 330 },
  { name: "Kochi", state: "Kerala", lat: 9.9312, lon: 76.2673, tz: 330 },
  { name: "Thiruvananthapuram", state: "Kerala", lat: 8.5241, lon: 76.9366, tz: 330 },
  { name: "Kozhikode", state: "Kerala", lat: 11.2588, lon: 75.7804, tz: 330 },
  { name: "Kollam", state: "Kerala", lat: 8.8932, lon: 76.6141, tz: 330 },
  { name: "Thrissur", state: "Kerala", lat: 10.5276, lon: 76.2144, tz: 330 },
  { name: "Palakkad", state: "Kerala", lat: 10.7867, lon: 76.6548, tz: 330 },
  { name: "Kannur", state: "Kerala", lat: 11.8745, lon: 75.3704, tz: 330 },
  { name: "Alappuzha", state: "Kerala", lat: 9.4981, lon: 76.3388, tz: 330 },
  { name: "Kottayam", state: "Kerala", lat: 9.5916, lon: 76.5222, tz: 330 },
  { name: "Mumbai", state: "Maharashtra", lat: 19.076, lon: 72.8777, tz: 330 },
  { name: "Pune", state: "Maharashtra", lat: 18.5204, lon: 73.8567, tz: 330 },
  { name: "Nagpur", state: "Maharashtra", lat: 21.1458, lon: 79.0882, tz: 330 },
  { name: "Nashik", state: "Maharashtra", lat: 19.9975, lon: 73.7898, tz: 330 },
  { name: "Aurangabad", state: "Maharashtra", lat: 19.8762, lon: 75.3433, tz: 330 },
  { name: "Solapur", state: "Maharashtra", lat: 17.6599, lon: 75.9064, tz: 330 },
  { name: "Kolhapur", state: "Maharashtra", lat: 16.705, lon: 74.2433, tz: 330 },
  { name: "Thane", state: "Maharashtra", lat: 19.2183, lon: 72.9781, tz: 330 },
  { name: "Delhi", state: "Delhi", lat: 28.6139, lon: 77.209, tz: 330 },
  { name: "New Delhi", state: "Delhi", lat: 28.6139, lon: 77.209, tz: 330 },
  { name: "Noida", state: "Uttar Pradesh", lat: 28.5355, lon: 77.391, tz: 330 },
  { name: "Ghaziabad", state: "Uttar Pradesh", lat: 28.6692, lon: 77.4538, tz: 330 },
  { name: "Gurugram", state: "Haryana", lat: 28.4595, lon: 77.0266, tz: 330 },
  { name: "Faridabad", state: "Haryana", lat: 28.4089, lon: 77.3178, tz: 330 },
  { name: "Chandigarh", state: "Chandigarh", lat: 30.7333, lon: 76.7794, tz: 330 },
  { name: "Lucknow", state: "Uttar Pradesh", lat: 26.8467, lon: 80.9462, tz: 330 },
  { name: "Kanpur", state: "Uttar Pradesh", lat: 26.4499, lon: 80.3319, tz: 330 },
  { name: "Varanasi", state: "Uttar Pradesh", lat: 25.3176, lon: 82.9739, tz: 330 },
  { name: "Agra", state: "Uttar Pradesh", lat: 27.1767, lon: 78.0081, tz: 330 },
  { name: "Prayagraj", state: "Uttar Pradesh", lat: 25.4358, lon: 81.8463, tz: 330 },
  { name: "Meerut", state: "Uttar Pradesh", lat: 28.9845, lon: 77.7064, tz: 330 },
  { name: "Kolkata", state: "West Bengal", lat: 22.5726, lon: 88.3639, tz: 330 },
  { name: "Howrah", state: "West Bengal", lat: 22.5958, lon: 88.2636, tz: 330 },
  { name: "Durgapur", state: "West Bengal", lat: 23.5204, lon: 87.3119, tz: 330 },
  { name: "Siliguri", state: "West Bengal", lat: 26.7271, lon: 88.3953, tz: 330 },
  { name: "Ahmedabad", state: "Gujarat", lat: 23.0225, lon: 72.5714, tz: 330 },
  { name: "Surat", state: "Gujarat", lat: 21.1702, lon: 72.8311, tz: 330 },
  { name: "Vadodara", state: "Gujarat", lat: 22.3072, lon: 73.1812, tz: 330 },
  { name: "Rajkot", state: "Gujarat", lat: 22.3039, lon: 70.8022, tz: 330 },
  { name: "Gandhinagar", state: "Gujarat", lat: 23.2156, lon: 72.6369, tz: 330 },
  { name: "Jaipur", state: "Rajasthan", lat: 26.9124, lon: 75.7873, tz: 330 },
  { name: "Jodhpur", state: "Rajasthan", lat: 26.2389, lon: 73.0243, tz: 330 },
  { name: "Udaipur", state: "Rajasthan", lat: 24.5854, lon: 73.7125, tz: 330 },
  { name: "Kota", state: "Rajasthan", lat: 25.2138, lon: 75.8648, tz: 330 },
  { name: "Ajmer", state: "Rajasthan", lat: 26.4499, lon: 74.6399, tz: 330 },
  { name: "Bhopal", state: "Madhya Pradesh", lat: 23.2599, lon: 77.4126, tz: 330 },
  { name: "Indore", state: "Madhya Pradesh", lat: 22.7196, lon: 75.8577, tz: 330 },
  { name: "Gwalior", state: "Madhya Pradesh", lat: 26.2183, lon: 78.1828, tz: 330 },
  { name: "Jabalpur", state: "Madhya Pradesh", lat: 23.1815, lon: 79.9864, tz: 330 },
  { name: "Ujjain", state: "Madhya Pradesh", lat: 23.1765, lon: 75.7885, tz: 330 },
  { name: "Patna", state: "Bihar", lat: 25.5941, lon: 85.1376, tz: 330 },
  { name: "Gaya", state: "Bihar", lat: 24.7914, lon: 85.0002, tz: 330 },
  { name: "Bhagalpur", state: "Bihar", lat: 25.2425, lon: 86.9842, tz: 330 },
  { name: "Ranchi", state: "Jharkhand", lat: 23.3441, lon: 85.3096, tz: 330 },
  { name: "Jamshedpur", state: "Jharkhand", lat: 22.8046, lon: 86.2029, tz: 330 },
  { name: "Dhanbad", state: "Jharkhand", lat: 23.7957, lon: 86.4304, tz: 330 },
  { name: "Bhubaneswar", state: "Odisha", lat: 20.2961, lon: 85.8245, tz: 330 },
  { name: "Cuttack", state: "Odisha", lat: 20.4625, lon: 85.8828, tz: 330 },
  { name: "Puri", state: "Odisha", lat: 19.8135, lon: 85.8312, tz: 330 },
  { name: "Guwahati", state: "Assam", lat: 26.1445, lon: 91.7362, tz: 330 },
  { name: "Dibrugarh", state: "Assam", lat: 27.4728, lon: 94.9119, tz: 330 },
  { name: "Silchar", state: "Assam", lat: 24.8333, lon: 92.7789, tz: 330 },
  { name: "Shillong", state: "Meghalaya", lat: 25.5788, lon: 91.8933, tz: 330 },
  { name: "Imphal", state: "Manipur", lat: 24.817, lon: 93.9368, tz: 330 },
  { name: "Aizawl", state: "Mizoram", lat: 23.7271, lon: 92.7176, tz: 330 },
  { name: "Kohima", state: "Nagaland", lat: 25.6751, lon: 94.1086, tz: 330 },
  { name: "Itanagar", state: "Arunachal Pradesh", lat: 27.0844, lon: 93.6053, tz: 330 },
  { name: "Agartala", state: "Tripura", lat: 23.8315, lon: 91.2868, tz: 330 },
  { name: "Gangtok", state: "Sikkim", lat: 27.3389, lon: 88.6065, tz: 330 },
  { name: "Amritsar", state: "Punjab", lat: 31.634, lon: 74.8723, tz: 330 },
  { name: "Ludhiana", state: "Punjab", lat: 30.901, lon: 75.8573, tz: 330 },
  { name: "Jalandhar", state: "Punjab", lat: 31.326, lon: 75.5762, tz: 330 },
  { name: "Patiala", state: "Punjab", lat: 30.3398, lon: 76.3869, tz: 330 },
  { name: "Srinagar", state: "Jammu & Kashmir", lat: 34.0837, lon: 74.7973, tz: 330 },
  { name: "Jammu", state: "Jammu & Kashmir", lat: 32.7266, lon: 74.857, tz: 330 },
  { name: "Leh", state: "Ladakh", lat: 34.1526, lon: 77.5771, tz: 330 },
  { name: "Shimla", state: "Himachal Pradesh", lat: 31.1048, lon: 77.1734, tz: 330 },
  { name: "Dehradun", state: "Uttarakhand", lat: 30.3165, lon: 78.0322, tz: 330 },
  { name: "Haridwar", state: "Uttarakhand", lat: 29.9457, lon: 78.1642, tz: 330 },
  { name: "Raipur", state: "Chhattisgarh", lat: 21.2514, lon: 81.6296, tz: 330 },
  { name: "Bilaspur", state: "Chhattisgarh", lat: 22.0797, lon: 82.1409, tz: 330 },
  { name: "Panaji", state: "Goa", lat: 15.4909, lon: 73.8278, tz: 330 },
  { name: "Margao", state: "Goa", lat: 15.2993, lon: 74.124, tz: 330 },
  { name: "Port Blair", state: "Andaman & Nicobar", lat: 11.6234, lon: 92.7265, tz: 330 },
];

function norm(s: string) {
  return s.toLowerCase().normalize("NFKD").replace(/[\u0300-\u036f]/g, "").trim();
}

export function searchOfflinePlaces(query: string, limit = 8): OfflinePlace[] {
  const q = norm(query);
  if (q.length < 2) return [];
  const starts: OfflinePlace[] = [];
  const contains: OfflinePlace[] = [];
  const taMatch: OfflinePlace[] = [];
  for (const p of OFFLINE_PLACES) {
    const n = norm(p.name);
    if (n === q || n.startsWith(q)) starts.push(p);
    else if (n.includes(q)) contains.push(p);
    else if (p.ta && p.ta.includes(query.trim())) taMatch.push(p);
  }
  return [...starts, ...taMatch, ...contains].slice(0, limit);
}

export function formatOfflinePlace(p: OfflinePlace): string {
  return `${p.name}${p.ta ? " (" + p.ta + ")" : ""}, ${p.state}, India`;
}
