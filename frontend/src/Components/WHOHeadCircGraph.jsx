import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer
} from "recharts";
import PropTypes from "prop-types";
import { calculateAgeInMonths } from "../utils/whoGrowthData";

const WHOHeadCircGraph = ({ entries = [], babyProfile = {} }) => {
  if (!babyProfile?.babyDetails || !babyProfile.babyDetails.gender || !babyProfile.babyDetails.dateOfBirth) {
    return <EmptyHeadCircGraph />;
  }
  // Gender not needed when WHO percentile bands are removed
  const dob = babyProfile.babyDetails.dateOfBirth;

  const fixedTimeline = Array.from({ length: 61 }, (_, month) => ({ month, hc: null }));

  const combinedData = [...fixedTimeline];
  entries
    .filter(entry => entry && entry.dateRecorded && typeof entry.headCircumference === "number" && entry.headCircumference >= 20 && entry.headCircumference <= 80)
    .forEach(entry => {
      const entryDate = new Date(entry.dateRecorded);
      const ageInMonths = calculateAgeInMonths(dob, entryDate);
      // Place data points at full rounded months from birth (0..60)
      const roundedMonth = Math.max(0, Math.min(60, Math.round(ageInMonths)));
      if (roundedMonth >= 0 && roundedMonth <= 60) {
        combinedData.push({
          month: roundedMonth,
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
            <p className="font-semibold">Age: {label === 0 ? 'Birth' : `${label} months`}</p>
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
          <YAxis label={{ value: "Head Circumference (cm)", angle: -90, position: "insideLeft" }} domain={[30, 80]} type="number" allowDataOverflow={false} padding={{ top: 0, bottom: 0 }} ticks={Array.from({ length: Math.floor((80 - 30) / 2) + 1 }, (_, i) => 30 + i * 2)} tick={{ fontSize: 9 }} axisLine={{ stroke: '#e5e7eb' }} />
          <Tooltip content={<CustomTooltip />} />
          {/* Removed WHO percentile lines and legend as requested */}
          <Line type="monotone" dataKey="hc" stroke="#2563eb" strokeWidth={3} dot={{ fill: "#2563eb", strokeWidth: 2, r: 5 }} name="Actual Head Circ." connectNulls={true} />
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
};

const EmptyHeadCircGraph = () => {
  const emptyTimeline = Array.from({ length: 61 }, (_, month) => ({
    month,
    hc: null,
  }));
  return (
    <div className="h-[700px] w-full">
      <ResponsiveContainer width="100%" height="100%">
        <LineChart data={emptyTimeline} margin={{ top: 0, right: 30, left: 20, bottom: 60 }}>
          <CartesianGrid strokeDasharray="1 0" stroke="#e5e7eb" vertical={false} horizontal={true} />
          <XAxis dataKey="month" type="number" domain={[0, 60]} ticks={[...Array(61).keys()]} tickFormatter={(v) => (v === 0 ? "Birth" : `${v}m`)} tick={{ fontSize: 9 }} height={80} />
          <YAxis label={{ value: "Head Circumference (cm)", angle: -90, position: "insideLeft" }} domain={[30, 80]} type="number" allowDataOverflow={false} padding={{ top: 0, bottom: 0 }} ticks={Array.from({ length: Math.floor((80 - 30) / 2) + 1 }, (_, i) => 30 + i * 2)} tick={{ fontSize: 9 }} axisLine={{ stroke: '#e5e7eb' }} />
          {/* Percentile lines and legend removed */}
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
};

WHOHeadCircGraph.propTypes = { entries: PropTypes.array, babyProfile: PropTypes.object };
EmptyHeadCircGraph.propTypes = {};

export default WHOHeadCircGraph;


