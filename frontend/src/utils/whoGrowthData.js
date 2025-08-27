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

// Minimal WHO Height-for-age standards (cm) — placeholder values; extend for production
const WHO_HEIGHT_STANDARDS = {
  boys: [
    // { age: months, P3: cm, P15: cm, P50: cm, P85: cm, P97: cm }
    { age: 0, P3: 46.3, P15: 48.0, P50: 49.9, P85: 51.8, P97: 53.4 },
    { age: 1, P3: 51.1, P15: 52.8, P50: 54.7, P85: 56.6, P97: 58.3 },
    { age: 2, P3: 54.6, P15: 56.4, P50: 58.4, P85: 60.4, P97: 62.1 },
    { age: 3, P3: 57.3, P15: 59.2, P50: 61.4, P85: 63.5, P97: 65.3 },
    { age: 4, P3: 59.7, P15: 61.7, P50: 63.9, P85: 66.1, P97: 68.0 },
    { age: 5, P3: 61.7, P15: 63.8, P50: 66.0, P85: 68.4, P97: 70.4 },
    { age: 6, P3: 63.3, P15: 65.5, P50: 67.6, P85: 70.1, P97: 72.2 },
  ],
  girls: [
    { age: 0, P3: 45.6, P15: 47.3, P50: 49.1, P85: 51.1, P97: 52.7 },
    { age: 1, P3: 50.0, P15: 51.7, P50: 53.7, P85: 55.7, P97: 57.4 },
    { age: 2, P3: 53.2, P15: 55.0, P50: 57.1, P85: 59.2, P97: 60.9 },
    { age: 3, P3: 55.8, P15: 57.7, P50: 59.8, P85: 61.9, P97: 63.7 },
    { age: 4, P3: 58.0, P15: 60.0, P50: 62.1, P85: 64.3, P97: 66.1 },
    { age: 5, P3: 60.0, P15: 62.0, P50: 64.0, P85: 66.3, P97: 68.1 },
    { age: 6, P3: 61.6, P15: 63.7, P50: 65.6, P85: 68.0, P97: 69.8 },
  ],
};

export function interpolateWHOHeightData(ageInMonths, gender = "boys") {
  const data = WHO_HEIGHT_STANDARDS[gender] || WHO_HEIGHT_STANDARDS.boys;
  if (!data || data.length === 0) return null;
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

// Minimal WHO Head circumference-for-age standards (cm) — placeholder values
const WHO_HEAD_CIRC_STANDARDS = {
  boys: [
    // { age: months, P3: cm, P15: cm, P50: cm, P85: cm, P97: cm }
    { age: 0, P3: 31.9, P15: 33.0, P50: 34.5, P85: 36.0, P97: 37.0 },
    { age: 1, P3: 34.1, P15: 35.2, P50: 36.5, P85: 38.1, P97: 39.2 },
    { age: 2, P3: 35.6, P15: 36.7, P50: 38.0, P85: 39.6, P97: 40.8 },
    { age: 3, P3: 36.6, P15: 37.7, P50: 39.0, P85: 40.6, P97: 41.8 },
    { age: 4, P3: 37.3, P15: 38.4, P50: 39.7, P85: 41.3, P97: 42.5 },
    { age: 5, P3: 37.9, P15: 39.0, P50: 40.3, P85: 41.8, P97: 43.0 },
    { age: 6, P3: 38.3, P15: 39.4, P50: 40.7, P85: 42.2, P97: 43.4 },
  ],
  girls: [
    { age: 0, P3: 31.5, P15: 32.6, P50: 34.0, P85: 35.5, P97: 36.5 },
    { age: 1, P3: 33.6, P15: 34.6, P50: 35.9, P85: 37.4, P97: 38.4 },
    { age: 2, P3: 35.0, P15: 36.0, P50: 37.2, P85: 38.7, P97: 39.7 },
    { age: 3, P3: 36.0, P15: 37.0, P50: 38.1, P85: 39.6, P97: 40.6 },
    { age: 4, P3: 36.7, P15: 37.7, P50: 38.8, P85: 40.3, P97: 41.3 },
    { age: 5, P3: 37.2, P15: 38.2, P50: 39.3, P85: 40.8, P97: 41.8 },
    { age: 6, P3: 37.6, P15: 38.6, P50: 39.7, P85: 41.2, P97: 42.1 },
  ],
};

export function interpolateWHOHeadCircData(ageInMonths, gender = "boys") {
  const data = WHO_HEAD_CIRC_STANDARDS[gender] || WHO_HEAD_CIRC_STANDARDS.boys;
  if (!data || data.length === 0) return null;
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