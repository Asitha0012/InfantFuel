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

// Configure Y-axis tick spacing (kg). Keep 1kg ticks; increase overall chart height to widen gaps.
const Y_TICK_STEP = 1; // 1kg per tick

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
 *   showLegend: boolean (show/hide legend labels)
 *   height: number (chart height in pixels; increases vertical gap between kg)
 */
const WHOGraph = ({
  entries = [],
  babyProfile = {},
  showWHO = true,
  showLegend = true,
  height = 900,
}) => {
  if (!babyProfile?.babyDetails || !babyProfile.babyDetails.gender || !babyProfile.babyDetails.dateOfBirth) {
    // Show empty graph with fixed scale even without baby profile
  return <EmptyGraph showWHO={showWHO} showLegend={showLegend} height={height} />;
  }
  
  const genderRaw = babyProfile.babyDetails.gender;
  const gender = typeof genderRaw === "string" ? genderRaw.toLowerCase() : "";
  const dob = babyProfile.babyDetails.dateOfBirth;
  // Precompute Y-axis ticks based on step
  const yTicks = Array.from({ length: Math.floor(30 / Y_TICK_STEP) + 1 }, (_, i) => i * Y_TICK_STEP);

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
    .filter(entry => entry && entry.dateRecorded && typeof entry.weight === "number" && entry.weight > 0 && entry.weight <= 30)
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
  validEntries: entries.filter(entry => entry && entry.dateRecorded && typeof entry.weight === "number" && entry.weight > 0 && entry.weight <= 30).length,
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
    <div className="w-full" style={{ height: `${height}px` }}>
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
            domain={[0, 26]} // Fixed scale from 0 to 26kg
            type="number"
            allowDataOverflow={false}
            ticks={yTicks} // 0, step, ..., 26
            tick={{ fontSize: 12 }}
            tickCount={yTicks.length}
            interval={0}
            axisLine={{ stroke: '#e5e7eb' }}
            minTickGap={0}
            allowDecimals={false}
            includeHidden={true}
            allowDuplicatedCategory={false}
          />
          <Tooltip content={<CustomTooltip />} />
          {showLegend && <Legend />}

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
const EmptyGraph = ({ showWHO, showLegend = true, height = 400 }) => {
  // Create empty 60-month timeline for boys (default)
  const emptyTimeline = [];
  // Precompute Y-axis ticks based on step
  const yTicks = Array.from({ length: Math.floor(26 / Y_TICK_STEP) + 1 }, (_, i) => i * Y_TICK_STEP);
  for (let month = 0; month <= 60; month++) {
    const monthLabel = month === 0 ? "Birth" : `${month}m`;
    const whoData = interpolateWHOData(month, "boys") || {};
    
    emptyTimeline.push({
      month,
      monthLabel,
      whoP3: showWHO && whoData.P3 != null ? whoData.P3 : null,
      whoP15: showWHO && whoData.P15 != null ? whoData.P15 : null,
      whoP50: showWHO && whoData.P50 != null ? whoData.P50 : null,
      whoP85: showWHO && whoData.P85 != null ? whoData.P85 : null,
      whoP97: showWHO && whoData.P97 != null ? whoData.P97 : null,
      weight: null
    });
  }

  return (
    <div className="w-full" style={{ height: `${height}px` }}>
      <ResponsiveContainer width="100%" height="100%">
        <LineChart 
          data={emptyTimeline} 
          margin={{ top: 5, right: 30, left: 20, bottom: 60 }}
          key={`empty-${showWHO}`} // Force re-render when showWHO changes
        >
          <CartesianGrid strokeDasharray="1 0" stroke="#e5e7eb" vertical={false} horizontal={true} />
          <XAxis
            dataKey="monthLabel"
            tick={{ fontSize: 10 }}
            angle={-45}
            textAnchor="end"
            height={80}
            interval={2}
          />
          <YAxis
            label={{ value: "Weight (kg)", angle: -90, position: "insideLeft" }}
            domain={[0, 30]}
            type="number"
            allowDataOverflow={false}
            ticks={yTicks}
            tick={{ fontSize: 12 }}
            tickCount={yTicks.length}
            interval={0}
            axisLine={{ stroke: '#e5e7eb' }}
            minTickGap={0}
            allowDecimals={false}
            includeHidden={true}
            allowDuplicatedCategory={false}
          />
          {showLegend && <Legend />}

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
  showWHO: PropTypes.bool,
  showLegend: PropTypes.bool,
  height: PropTypes.number,
};

WHOGraph.propTypes = {
  entries: PropTypes.array,
  babyProfile: PropTypes.object,
  showWHO: PropTypes.bool,
  showLegend: PropTypes.bool,
  height: PropTypes.number,
};

export default WHOGraph;
