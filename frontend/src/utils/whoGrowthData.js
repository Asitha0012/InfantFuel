// WHO growth standard data and helpers
// This is a minimal implementation. You can expand the WHO data as needed.

// Example WHO data (replace with real data for production)
const WHO_WEIGHT_STANDARDS = {
  boys: [
    // { age: months, P3: kg, P15: kg, P50: kg, P85: kg, P97: kg }
    { age: 0, P3: 2.5, P15: 2.8, P50: 3.3, P85: 3.9, P97: 4.4 },
    { age: 1, P3: 3.4, P15: 3.8, P50: 4.5, P85: 5.3, P97: 6.0 },
    { age: 2, P3: 4.4, P15: 4.9, P50: 5.6, P85: 6.5, P97: 7.3 },
    { age: 3, P3: 5.1, P15: 5.7, P50: 6.4, P85: 7.4, P97: 8.2 },
    { age: 4, P3: 5.6, P15: 6.3, P50: 7.0, P85: 8.0, P97: 8.9 },
    { age: 5, P3: 6.0, P15: 6.7, P50: 7.5, P85: 8.6, P97: 9.5 },
    { age: 6, P3: 6.4, P15: 7.1, P50: 7.9, P85: 9.1, P97: 10.1 },
    // ... add more months as needed ...
  ],
  girls: [
    { age: 0, P3: 2.4, P15: 2.7, P50: 3.2, P85: 3.7, P97: 4.2 },
    { age: 1, P3: 3.2, P15: 3.6, P50: 4.2, P85: 4.9, P97: 5.5 },
    { age: 2, P3: 4.0, P15: 4.5, P50: 5.1, P85: 5.9, P97: 6.6 },
    { age: 3, P3: 4.6, P15: 5.2, P50: 5.8, P85: 6.7, P97: 7.4 },
    { age: 4, P3: 5.1, P15: 5.7, P50: 6.4, P85: 7.3, P97: 8.0 },
    { age: 5, P3: 5.5, P15: 6.2, P50: 6.9, P85: 7.8, P97: 8.6 },
    { age: 6, P3: 5.8, P15: 6.5, P50: 7.3, P85: 8.2, P97: 9.0 },
    // ... add more months as needed ...
  ],
};

// Linear interpolation for WHO data
export function interpolateWHOData(ageInMonths, gender = "boys") {
  const data = WHO_WEIGHT_STANDARDS[gender] || WHO_WEIGHT_STANDARDS.boys;
  if (!data || data.length === 0) return null;
  // Find two points to interpolate between
  let lower = data[0];
  let upper = data[data.length - 1];
  for (let i = 0; i < data.length - 1; i++) {
    if (ageInMonths >= data[i].age && ageInMonths <= data[i + 1].age) {
      lower = data[i];
      upper = data[i + 1];
      break;
    }
  }
  if (lower.age === upper.age) return lower;
  const t = (ageInMonths - lower.age) / (upper.age - lower.age);
  const interp = {};
  ["P3", "P15", "P50", "P85", "P97"].forEach((key) => {
    interp[key] = lower[key] + t * (upper[key] - lower[key]);
  });
  return interp;
}

// Calculate age in months between two dates
export function calculateAgeInMonths(dob, date) {
  const birth = new Date(dob);
  const d = new Date(date);
  let months = (d.getFullYear() - birth.getFullYear()) * 12 + (d.getMonth() - birth.getMonth());
  const dayDiff = d.getDate() - birth.getDate();
  if (dayDiff < 0) months -= 1;
  // Add fractional month
  const daysInMonth = new Date(d.getFullYear(), d.getMonth() + 1, 0).getDate();
  const fraction = (d.getDate() - birth.getDate() + daysInMonth) % daysInMonth / daysInMonth;
  return +(months + fraction).toFixed(2);
}
