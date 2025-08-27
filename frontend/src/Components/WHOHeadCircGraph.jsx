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
import { interpolateWHOHeadCircData, calculateAgeInMonths } from "../utils/whoGrowthData";

const WHOHeadCircGraph = ({ entries = [], babyProfile = {}, showWHO = true }) => {
  if (!babyProfile?.babyDetails || !babyProfile.babyDetails.gender || !babyProfile.babyDetails.dateOfBirth) {
    return <EmptyHeadCircGraph showWHO={showWHO} />;
  }
  const genderRaw = babyProfile.babyDetails.gender;
  const gender = typeof genderRaw === "string" ? genderRaw.toLowerCase() : "";
  const dob = babyProfile.babyDetails.dateOfBirth;

  const fixedTimeline = [];
  for (let month = 0; month <= 60; month++) {
    const whoData = interpolateWHOHeadCircData(month, gender === "female" ? "girls" : "boys") || {};
    fixedTimeline.push({
      month,
      whoP3: showWHO && whoData.P3 != null ? whoData.P3 : null,
      whoP15: showWHO && whoData.P15 != null ? whoData.P15 : null,
      whoP50: showWHO && whoData.P50 != null ? whoData.P50 : null,
      whoP85: showWHO && whoData.P85 != null ? whoData.P85 : null,
      whoP97: showWHO && whoData.P97 != null ? whoData.P97 : null,
      hc: null
    });
  }

  const combinedData = [...fixedTimeline];
  entries
    .filter(entry => entry && entry.dateRecorded && typeof entry.headCircumference === "number" && entry.headCircumference >= 20 && entry.headCircumference <= 60)
    .forEach(entry => {
      const entryDate = new Date(entry.dateRecorded);
      const ageInMonths = calculateAgeInMonths(dob, entryDate);
      if (ageInMonths >= 0 && ageInMonths <= 60) {
        combinedData.push({
          month: ageInMonths,
          hc: entry.headCircumference,
          notes: entry.notes,
          entryId: entry._id,
          recordedBy: entry.recordedBy,
          dateRecorded: entry.dateRecorded,
        });
      }
    });

  combinedData.sort((a, b) => a.month - b.month);

  const CustomTooltip = ({ active, payload, label }) => {
    if (active && payload && payload.length) {
      const data = payload[0].payload;
      if (data.hc) {
        return (
          <div className="bg-white p-3 border border-gray-200 rounded-lg shadow-lg">
            <p className="font-semibold">Age: {label}m</p>
            <p className="text-blue-600">Head Circ: {data.hc} cm</p>
            {data.dateRecorded && <p className="text-gray-600">Date: {new Date(data.dateRecorded).toLocaleDateString()}</p>}
            {data.notes && <p className="text-gray-500 text-sm">Notes: {data.notes}</p>}
          </div>
        );
      }
    }
    return null;
  };

  CustomTooltip.propTypes = { active: PropTypes.bool, payload: PropTypes.array, label: PropTypes.oneOfType([PropTypes.string, PropTypes.number]) };

  return (
    <div className="h-[700px] w-full">
      <ResponsiveContainer width="100%" height="100%">
        <LineChart data={combinedData} margin={{ top: 0, right: 30, left: 20, bottom: 60 }}>
          <CartesianGrid strokeDasharray="1 0" stroke="#e5e7eb" vertical={false} horizontal={true} />
          <XAxis dataKey="month" type="number" domain={[0, 60]} ticks={[...Array(61).keys()]} tickFormatter={(v) => (v === 0 ? "Birth" : `${v}m`)} tick={{ fontSize: 9 }} height={80} />
          <YAxis label={{ value: "Head Circumference (cm)", angle: -90, position: "insideLeft" }} domain={[30, 55]} type="number" allowDataOverflow={false} padding={{ top: 0, bottom: 0 }} ticks={Array.from({ length: Math.floor((55 - 30) / 0.5) + 1 }, (_, i) => 30 + i * 0.5)} tick={{ fontSize: 9 }} axisLine={{ stroke: '#e5e7eb' }} />
          <Tooltip content={<CustomTooltip />} />
          <Legend />
          <Line type="linear" dataKey="whoP3" stroke="#ef4444" strokeWidth={1} strokeDasharray="5 5" dot={false} name="WHO 3rd Percentile" opacity={showWHO ? 1 : 0} isAnimationActive={false} />
          <Line type="linear" dataKey="whoP15" stroke="#f97316" strokeWidth={1} strokeDasharray="5 5" dot={false} name="WHO 15th Percentile" opacity={showWHO ? 1 : 0} isAnimationActive={false} />
          <Line type="linear" dataKey="whoP50" stroke="#10b981" strokeWidth={2} strokeDasharray="3 3" dot={false} name="WHO 50th Percentile (Median)" opacity={showWHO ? 1 : 0} isAnimationActive={false} />
          <Line type="linear" dataKey="whoP85" stroke="#f97316" strokeWidth={1} strokeDasharray="5 5" dot={false} name="WHO 85th Percentile" opacity={showWHO ? 1 : 0} isAnimationActive={false} />
          <Line type="linear" dataKey="whoP97" stroke="#ef4444" strokeWidth={1} strokeDasharray="5 5" dot={false} name="WHO 97th Percentile" opacity={showWHO ? 1 : 0} isAnimationActive={false} />
          <Line type="monotone" dataKey="hc" stroke="#2563eb" strokeWidth={3} dot={{ fill: "#2563eb", strokeWidth: 2, r: 5 }} name="Actual Head Circ." connectNulls={true} />
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
};

const EmptyHeadCircGraph = ({ showWHO }) => {
  const emptyTimeline = [];
  for (let month = 0; month <= 60; month++) {
    const whoData = interpolateWHOHeadCircData(month, "boys") || {};
    emptyTimeline.push({ month, whoP3: showWHO && whoData.P3 != null ? whoData.P3 : null, whoP15: showWHO && whoData.P15 != null ? whoData.P15 : null, whoP50: showWHO && whoData.P50 != null ? whoData.P50 : null, whoP85: showWHO && whoData.P85 != null ? whoData.P85 : null, whoP97: showWHO && whoData.P97 != null ? whoData.P97 : null, hc: null });
  }
  return (
    <div className="h-[700px] w-full">
      <ResponsiveContainer width="100%" height="100%">
        <LineChart data={emptyTimeline} margin={{ top: 0, right: 30, left: 20, bottom: 60 }}>
          <CartesianGrid strokeDasharray="1 0" stroke="#e5e7eb" vertical={false} horizontal={true} />
          <XAxis dataKey="month" type="number" domain={[0, 60]} ticks={[...Array(61).keys()]} tickFormatter={(v) => (v === 0 ? "Birth" : `${v}m`)} tick={{ fontSize: 9 }} height={80} />
          <YAxis label={{ value: "Head Circumference (cm)", angle: -90, position: "insideLeft" }} domain={[30, 55]} type="number" allowDataOverflow={false} padding={{ top: 0, bottom: 0 }} ticks={Array.from({ length: Math.floor((55 - 30) / 0.5) + 1 }, (_, i) => 30 + i * 0.5)} tick={{ fontSize: 9 }} axisLine={{ stroke: '#e5e7eb' }} />
          <Legend />
          <Line type="linear" dataKey="whoP3" stroke="#ef4444" strokeWidth={1} strokeDasharray="5 5" dot={false} name="WHO 3rd Percentile" opacity={showWHO ? 1 : 0} isAnimationActive={false} />
          <Line type="linear" dataKey="whoP15" stroke="#f97316" strokeWidth={1} strokeDasharray="5 5" dot={false} name="WHO 15th Percentile" opacity={showWHO ? 1 : 0} isAnimationActive={false} />
          <Line type="linear" dataKey="whoP50" stroke="#10b981" strokeWidth={2} strokeDasharray="3 3" dot={false} name="WHO 50th Percentile (Median)" opacity={showWHO ? 1 : 0} isAnimationActive={false} />
          <Line type="linear" dataKey="whoP85" stroke="#f97316" strokeWidth={1} strokeDasharray="5 5" dot={false} name="WHO 85th Percentile" opacity={showWHO ? 1 : 0} isAnimationActive={false} />
          <Line type="linear" dataKey="whoP97" stroke="#ef4444" strokeWidth={1} strokeDasharray="5 5" dot={false} name="WHO 97th Percentile" opacity={showWHO ? 1 : 0} isAnimationActive={false} />
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
};

WHOHeadCircGraph.propTypes = { entries: PropTypes.array, babyProfile: PropTypes.object, showWHO: PropTypes.bool };
EmptyHeadCircGraph.propTypes = { showWHO: PropTypes.bool };

export default WHOHeadCircGraph;


