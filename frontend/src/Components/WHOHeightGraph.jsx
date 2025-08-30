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

const WHOHeightGraph = ({ entries = [], babyProfile = {}, showWHO = true }) => {
  if (!babyProfile?.babyDetails || !babyProfile.babyDetails.gender || !babyProfile.babyDetails.dateOfBirth) {
    return <EmptyHeightGraph showWHO={showWHO} />;
  }
  // Gender not needed when WHO percentile bands are removed
  const dob = babyProfile.babyDetails.dateOfBirth;

  const fixedTimeline = Array.from({ length: 61 }, (_, month) => ({ month, height: null }));

  const combinedData = [...fixedTimeline];
  entries
    .filter(entry => entry && entry.dateRecorded && typeof entry.height === "number" && entry.height > 0 && entry.height <= 150)
    .forEach(entry => {
      const entryDate = new Date(entry.dateRecorded);
      const ageInMonths = calculateAgeInMonths(dob, entryDate);
      // Place data points at full rounded months from birth (0..60)
      const roundedMonth = Math.max(0, Math.min(60, Math.round(ageInMonths)));
      if (roundedMonth >= 0 && roundedMonth <= 60) {
        combinedData.push({
          month: roundedMonth,
          height: entry.height,
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
  if (data.height) {
        return (
          <div className="bg-white p-3 border border-gray-200 rounded-lg shadow-lg">
    <p className="font-semibold">Age: {label === 0 ? 'Birth' : `${label} months`}</p>
            <p className="text-blue-600">Height: {data.height} cm</p>
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
    payload: PropTypes.array,
  label: PropTypes.oneOfType([PropTypes.string, PropTypes.number])
  };

  return (
    <div className="h-[700px] w-full">
      <ResponsiveContainer width="100%" height="100%">
        <LineChart data={combinedData} margin={{ top: 0, right: 30, left: 20, bottom: 60 }}>
          <CartesianGrid strokeDasharray="1 0" stroke="#e5e7eb" vertical={false} horizontal={true} />
          <XAxis
            dataKey="month"
            type="number"
            domain={[0, 60]}
            ticks={[...Array(61).keys()]}
            tickFormatter={(v) => (v === 0 ? "Birth" : `${v}m`)}
            tick={{ fontSize: 9 }}
            height={80}
          />
          <YAxis
            label={{ value: "Height (cm)", angle: -90, position: "insideLeft" }}
            domain={[20, 150]}
            type="number"
            allowDataOverflow={false}
            padding={{ top: 0, bottom: 0 }}
            ticks={Array.from({ length: Math.floor((150 - 20) / 5) + 1 }, (_, i) => 20 + i * 5)}
            tick={{ fontSize: 10 }}
            axisLine={{ stroke: '#e5e7eb' }}
          />
          <Tooltip content={<CustomTooltip />} />
          {/* Removed WHO percentile lines and legend as requested */}

          <Line type="monotone" dataKey="height" stroke="#2563eb" strokeWidth={3} dot={{ fill: "#2563eb", strokeWidth: 2, r: 5 }} name="Actual Height" connectNulls={true} />
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
};

const EmptyHeightGraph = () => {
  const emptyTimeline = Array.from({ length: 61 }, (_, month) => ({
    month,
    monthLabel: month === 0 ? "Birth" : `${month}m`,
    height: null,
  }));
  return (
    <div className="h-[700px] w-full">
      <ResponsiveContainer width="100%" height="100%">
        <LineChart data={emptyTimeline} margin={{ top: 5, right: 30, left: 20, bottom: 60 }}>
          <CartesianGrid strokeDasharray="1 0" stroke="#e5e7eb" vertical={false} horizontal={true} />
          <XAxis dataKey="monthLabel" tick={{ fontSize: 10 }} angle={-45} textAnchor="end" height={80} interval={2} />
          <YAxis label={{ value: "Height (cm)", angle: -90, position: "insideLeft" }} domain={[20, 150]} type="number" allowDataOverflow={false} tick={{ fontSize: 12 }} axisLine={{ stroke: '#e5e7eb' }} />
          {/* Percentile lines and legend removed */}
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
};

WHOHeightGraph.propTypes = {
  entries: PropTypes.array,
  babyProfile: PropTypes.object,
  showWHO: PropTypes.bool
};

EmptyHeightGraph.propTypes = {};

export default WHOHeightGraph;


