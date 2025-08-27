import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer
} from "recharts";
import PropTypes from "prop-types";
import { interpolateWHOData, calculateAgeInMonths } from "../utils/whoGrowthData";

/**
 * WHOGraph - A comprehensive weight tracking graph for baby profiles.
 * Shows actual weight entries, best fit line, and WHO standard percentiles.
 * Healthcare providers can add, update, delete entries (handled in parent component).
 * Parents can only view.
 *
 * Props:
 *   entries: [{ weight, dateRecorded, notes, _id, recordedBy }]
 *   babyProfile: { babyDetails: { dateOfBirth, gender } }
 *   showWHO: boolean (show/hide WHO overlay)
 */
const WHOGraph = ({
  entries = [],
  babyProfile = {},
  showWHO = true
}) => {
  if (!babyProfile?.babyDetails || !babyProfile.babyDetails.gender || !babyProfile.babyDetails.dateOfBirth) {
    // Show empty graph with fixed scale even without baby profile
    return <EmptyGraph showWHO={showWHO} />;
  }
  
  const genderRaw = babyProfile.babyDetails.gender;
  const gender = typeof genderRaw === "string" ? genderRaw.toLowerCase() : "";
  const dob = babyProfile.babyDetails.dateOfBirth;

  // Create fixed 60-month timeline (5 years)
  const fixedTimeline = [];
  for (let month = 0; month <= 60; month++) {
    const monthLabel = month === 0 ? "Birth" : `${month}m`;
    const whoData = interpolateWHOData(month, gender === "female" ? "girls" : "boys") || {};
    
    fixedTimeline.push({
      month,
      monthLabel,
      whoP3: showWHO && whoData.P3 != null ? whoData.P3 : null,
      whoP15: showWHO && whoData.P15 != null ? whoData.P15 : null,
      whoP50: showWHO && whoData.P50 != null ? whoData.P50 : null,
      whoP85: showWHO && whoData.P85 != null ? whoData.P85 : null,
      whoP97: showWHO && whoData.P97 != null ? whoData.P97 : null,
      weight: null // Default null for all months
    });
  }

  // Map actual entries to the timeline (one per month, latest by date)
  const monthToEntry = {};
  entries
    .filter(entry => entry && entry.dateRecorded && typeof entry.weight === "number" && entry.weight > 0 && entry.weight <= 25)
    .forEach(entry => {
      const entryDate = new Date(entry.dateRecorded);
      const ageInMonths = Math.round(calculateAgeInMonths(dob, entryDate));
      // Only add entries within the 5-year span
      if (ageInMonths >= 0 && ageInMonths <= 60) {
        // Keep the latest entry for each month
        if (!monthToEntry[ageInMonths] || new Date(entry.dateRecorded) > new Date(monthToEntry[ageInMonths].dateRecorded)) {
          monthToEntry[ageInMonths] = entry;
        }
      }
    });
  Object.entries(monthToEntry).forEach(([ageInMonths, entry]) => {
    const timelineEntry = fixedTimeline[ageInMonths];
    if (timelineEntry) {
      timelineEntry.weight = entry.weight;
      timelineEntry.notes = entry.notes;
      timelineEntry.entryId = entry._id;
      timelineEntry.recordedBy = entry.recordedBy;
      timelineEntry.dateRecorded = entry.dateRecorded;
    }
  });

  // Insert a synthetic birth entry if not present
  if (babyProfile?.babyDetails?.birthWeight && fixedTimeline[0].weight === null) {
    fixedTimeline[0].weight = parseFloat(babyProfile.babyDetails.birthWeight);
    fixedTimeline[0].notes = "Birth weight";
    fixedTimeline[0].entryId = "birth-weight";
    fixedTimeline[0].recordedBy = null;
    fixedTimeline[0].dateRecorded = babyProfile.babyDetails.dateOfBirth;
  }

  // Debug: Log data for troubleshooting
  console.log('WHO Graph Debug:', {
    totalEntries: entries.length,
    validEntries: entries.filter(entry => entry && entry.dateRecorded && typeof entry.weight === "number" && entry.weight > 0 && entry.weight <= 25).length,
    timelineWithData: fixedTimeline.filter(t => t.weight !== null).length,
    babyProfile: babyProfile?.fullName || 'No profile'
  });

  // Custom tooltip
  const CustomTooltip = ({ active, payload, label }) => {
    if (active && payload && payload.length) {
      const data = payload[0].payload;
      if (data.weight) {
        return (
          <div className="bg-white p-3 border border-gray-200 rounded-lg shadow-lg">
            <p className="font-semibold">Age: {label}</p>
            <p className="text-blue-600">Weight: {data.weight} kg</p>
            {data.dateRecorded && <p className="text-gray-600">Date: {new Date(data.dateRecorded).toLocaleDateString()}</p>}
            {data.notes && <p className="text-gray-500 text-sm">Notes: {data.notes}</p>}
          </div>
        );
      }
    }
    return null;
  };

  CustomTooltip.propTypes = {
    active: PropTypes.bool,
    payload: PropTypes.arrayOf(
      PropTypes.shape({
        payload: PropTypes.shape({
          weight: PropTypes.number,
          month: PropTypes.number,
          notes: PropTypes.string,
          dateRecorded: PropTypes.string
        })
      })
    ),
    label: PropTypes.string
  };

  return (
    <div className="h-[700px] w-full"> {/* Increased height from 500px to 700px */}
      <ResponsiveContainer width="100%" height="100%">
        <LineChart 
          data={fixedTimeline} 
          margin={{ top: 5, right: 30, left: 20, bottom: 60 }}
          key={`graph-${entries.length}-${showWHO}-${gender}-${entries.map(e => `${e._id}-${e.weight}`).join(',')}`} // Force re-render when data changes
        >
          <CartesianGrid strokeDasharray="1 0" stroke="#e5e7eb" vertical={false} horizontal={true} />
          <XAxis
            dataKey="monthLabel"
            tick={{ fontSize: 10 }}
            angle={-45}
            textAnchor="end"
            height={80}
            interval={2} // Show every 3rd month label to avoid crowding
          />
          <YAxis
            label={{ value: "Weight (kg)", angle: -90, position: "insideLeft" }}
            domain={[0, 25]} // Fixed scale from 0 to 25kg
            type="number"
            allowDataOverflow={false}
            ticks={[...Array(26).keys()]} // 0, 1, 2, ..., 25
            tick={{ fontSize: 12 }}
            tickCount={26}
            interval={0}
            axisLine={{ stroke: '#e5e7eb' }}
            minTickGap={0}
            allowDecimals={false}
            includeHidden={true}
            allowDuplicatedCategory={false}
          />
          <Tooltip content={<CustomTooltip />} />
          <Legend />

          {/* WHO Percentile Lines: always render, but hide with opacity if showWHO is false */}
          <Line type="linear" dataKey="whoP3" stroke="#ef4444" strokeWidth={1} strokeDasharray="5 5" dot={false} name="WHO 3rd Percentile" connectNulls={false} opacity={showWHO ? 1 : 0} isAnimationActive={false} />
          <Line type="linear" dataKey="whoP15" stroke="#f97316" strokeWidth={1} strokeDasharray="5 5" dot={false} name="WHO 15th Percentile" connectNulls={false} opacity={showWHO ? 1 : 0} isAnimationActive={false} />
          <Line type="linear" dataKey="whoP50" stroke="#10b981" strokeWidth={2} strokeDasharray="3 3" dot={false} name="WHO 50th Percentile (Median)" connectNulls={false} opacity={showWHO ? 1 : 0} isAnimationActive={false} />
          <Line type="linear" dataKey="whoP85" stroke="#f97316" strokeWidth={1} strokeDasharray="5 5" dot={false} name="WHO 85th Percentile" connectNulls={false} opacity={showWHO ? 1 : 0} isAnimationActive={false} />
          <Line type="linear" dataKey="whoP97" stroke="#ef4444" strokeWidth={1} strokeDasharray="5 5" dot={false} name="WHO 97th Percentile" connectNulls={false} opacity={showWHO ? 1 : 0} isAnimationActive={false} />

          {/* Actual weight - straight lines, no curve */}
          <Line
            type="monotone"
            dataKey="weight"
            stroke="#2563eb"
            strokeWidth={3}
            dot={{ fill: "#2563eb", strokeWidth: 2, r: 5 }}
            name="Actual Weight"
            connectNulls={true}
          />
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
};

// EmptyGraph component for when no baby profile is available
const EmptyGraph = ({ showWHO }) => {
  // Create empty 60-month timeline for boys (default)
  const emptyTimeline = [];
  for (let month = 0; month <= 60; month++) {
    const whoData = interpolateWHOData(month, "boys") || {};
    
    emptyTimeline.push({
      month,
      whoP3: showWHO && whoData.P3 != null ? whoData.P3 : null,
      whoP15: showWHO && whoData.P15 != null ? whoData.P15 : null,
      whoP50: showWHO && whoData.P50 != null ? whoData.P50 : null,
      whoP85: showWHO && whoData.P85 != null ? whoData.P85 : null,
      whoP97: showWHO && whoData.P97 != null ? whoData.P97 : null,
      weight: null
    });
  }

  return (
    <div className="h-[700px] w-full"> {/* Increased height from 500px to 700px */}
      <ResponsiveContainer width="100%" height="100%">
        <LineChart 
          data={emptyTimeline} 
          margin={{ top: 5, right: 30, left: 20, bottom: 60 }}
          key={`empty-${showWHO}`} // Force re-render when showWHO changes
        >
          <CartesianGrid strokeDasharray="1 0" stroke="#e5e7eb" vertical={false} horizontal={true} />
          <XAxis dataKey="month" type="number" domain={[0, 60]} tickFormatter={(v) => (v === 0 ? "Birth" : `${Math.round(v)}m`)} tick={{ fontSize: 10 }} height={80} interval={2} />
          <YAxis
            label={{ value: "Weight (kg)", angle: -90, position: "insideLeft" }}
            domain={[0, 25]}
            type="number"
            allowDataOverflow={false}
            ticks={[...Array(26).keys()]}
            tick={{ fontSize: 12 }}
            tickCount={26}
            interval={0}
            axisLine={{ stroke: '#e5e7eb' }}
            minTickGap={0}
            allowDecimals={false}
            includeHidden={true}
            allowDuplicatedCategory={false}
          />
          <Legend />

          {/* WHO Percentile Lines: always render, but hide with opacity if showWHO is false */}
          <Line type="linear" dataKey="whoP3" stroke="#ef4444" strokeWidth={1} strokeDasharray="5 5" dot={false} name="WHO 3rd Percentile" connectNulls={false} opacity={showWHO ? 1 : 0} isAnimationActive={false} />
          <Line type="linear" dataKey="whoP15" stroke="#f97316" strokeWidth={1} strokeDasharray="5 5" dot={false} name="WHO 15th Percentile" connectNulls={false} opacity={showWHO ? 1 : 0} isAnimationActive={false} />
          <Line type="linear" dataKey="whoP50" stroke="#10b981" strokeWidth={2} strokeDasharray="3 3" dot={false} name="WHO 50th Percentile (Median)" connectNulls={false} opacity={showWHO ? 1 : 0} isAnimationActive={false} />
          <Line type="linear" dataKey="whoP85" stroke="#f97316" strokeWidth={1} strokeDasharray="5 5" dot={false} name="WHO 85th Percentile" connectNulls={false} opacity={showWHO ? 1 : 0} isAnimationActive={false} />
          <Line type="linear" dataKey="whoP97" stroke="#ef4444" strokeWidth={1} strokeDasharray="5 5" dot={false} name="WHO 97th Percentile" connectNulls={false} opacity={showWHO ? 1 : 0} isAnimationActive={false} />
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
};

EmptyGraph.propTypes = {
  showWHO: PropTypes.bool
};

WHOGraph.propTypes = {
  entries: PropTypes.array,
  babyProfile: PropTypes.object,
  showWHO: PropTypes.bool
};

export default WHOGraph;
