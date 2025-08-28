import { useState } from 'react'
import { useNavigate } from 'react-router-dom';
import Navbar from '../Components/Navbar'
import Footer from '../Components/Footer'
import 'react-calendar/dist/Calendar.css';
import FullCalendar from '@fullcalendar/react';
import dayGridPlugin from '@fullcalendar/daygrid';
import timeGridPlugin from '@fullcalendar/timegrid';
import interactionPlugin from '@fullcalendar/interaction';

import { 
  Scale,
  Ruler,
  CircleDot,
  Baby,
  Droplet,
  Grape,
  Syringe,
  Pill,
  CalendarDays,
  Activity,
  X,
} from 'lucide-react';

import {
  useGetEventsQuery,
  useCreateEventMutation,
  useUpdateEventMutation,
  useDeleteEventMutation,
} from '../redux/api/events';
import { useGetConnectedBabyProfilesQuery, useGetWeightHistoryQuery } from '../redux/api/weights';
import { useGetHeightHistoryQuery } from '../redux/api/heights';
import { useGetVaccinationsQuery } from '../redux/api/vaccinations';
import { useGetmedicationsQuery } from '../redux/api/medications';
import { useSelector } from "react-redux";
import Modal from "../Components/Modal";
import PropTypes from "prop-types";

const Section = ({ title, icon: Icon, theme = 'indigo', children, onClick }) => {
  const themes = {
    indigo: {
      header: 'bg-indigo-50',
      iconWrap: 'bg-indigo-100 text-indigo-700',
      title: 'text-indigo-900',
      hoverRing: 'hover:ring-indigo-200',
    },
    emerald: {
      header: 'bg-emerald-50',
      iconWrap: 'bg-emerald-100 text-emerald-700',
      title: 'text-emerald-900',
      hoverRing: 'hover:ring-emerald-200',
    },
    rose: {
      header: 'bg-rose-50',
      iconWrap: 'bg-rose-100 text-rose-700',
      title: 'text-rose-900',
      hoverRing: 'hover:ring-rose-200',
    },
    amber: {
      header: 'bg-amber-50',
      iconWrap: 'bg-amber-100 text-amber-700',
      title: 'text-amber-900',
      hoverRing: 'hover:ring-amber-200',
    },
    violet: {
      header: 'bg-violet-50',
      iconWrap: 'bg-violet-100 text-violet-700',
      title: 'text-violet-900',
      hoverRing: 'hover:ring-violet-200',
    },
  };
  const t = themes[theme] || themes.indigo;
  return (
    <div
      className={`bg-white p-6 rounded-xl cursor-pointer transition-all shadow-sm ring-1 ring-gray-100 ${t.hoverRing} hover:shadow-md`}
      onClick={onClick}
    >
      <div className={`flex items-center gap-3 mb-4 px-3 py-2 rounded-lg ${t.header}`}>
        {Icon ? (
          <div className={`p-2 rounded-md ${t.iconWrap}`}>
            <Icon className="w-5 h-5" />
          </div>
        ) : null}
        <h2 className={`text-lg font-semibold ${t.title}`}>{title}</h2>
      </div>
      {children}
    </div>
  );
};
Section.propTypes = {
  title: PropTypes.string.isRequired,
  icon: PropTypes.elementType,
  theme: PropTypes.string,
  children: PropTypes.node,
  onClick: PropTypes.func,
};

const TrackingCard = ({ icon: Icon, label }) => (
  <div className="bg-white p-4 rounded-lg flex flex-col items-center gap-3 border border-gray-100 hover:border-indigo-200 hover:shadow-sm transition-transform hover:-translate-y-0.5">
    <div className="p-3 rounded-full bg-indigo-50 text-indigo-600">
      <Icon className="w-6 h-6" />
    </div>
    <span className="text-sm text-gray-800 text-center font-medium">{label}</span>
  </div>
);

TrackingCard.propTypes = {
  icon: PropTypes.elementType.isRequired,
  label: PropTypes.string.isRequired,
};

function renderEventContent(eventInfo) {
  return (
    <span>
      <span style={{
        display: "inline-block",
        width: 8,
        height: 8,
        borderRadius: "50%",
  background: "#4f46e5",
        marginRight: 6,
        verticalAlign: "middle"
      }}></span>
      {eventInfo.event.title}
    </span>
  );
}

const Tracker = () => {
  const navigate = useNavigate();
  const { userInfo } = useSelector((state) => state.auth);
  const { data: events = [], refetch } = useGetEventsQuery();
  const [createEvent] = useCreateEventMutation();
  const [updateEvent] = useUpdateEventMutation();
  const [deleteEvent] = useDeleteEventMutation();

  const [modalOpen, setModalOpen] = useState(false);
  const [modalData, setModalData] = useState(null);
  const [viewMode, setViewMode] = useState(false);
  const [activitiesModalOpen, setActivitiesModalOpen] = useState(false);

  // Fetch data for recent activities
  const isProvider = userInfo?.isAdmin === true;
  const { data: connectedProfiles = [] } = useGetConnectedBabyProfilesQuery(undefined, { skip: !isProvider });
  const { data: weightData } = useGetWeightHistoryQuery(isProvider ? connectedProfiles[0]?._id : userInfo?._id, { 
    skip: !userInfo?._id && !(isProvider && connectedProfiles.length > 0) 
  });
  const { data: heightData } = useGetHeightHistoryQuery(isProvider ? connectedProfiles[0]?._id : userInfo?._id, { 
    skip: !userInfo?._id && !(isProvider && connectedProfiles.length > 0) 
  });
  const { data: vaccinations = [] } = useGetVaccinationsQuery();
  const { data: medications = [] } = useGetmedicationsQuery();

  // Aggregate and sort recent activities
  const getRecentActivities = (limit = 5) => {
    const activities = [];
    const currentUserId = userInfo?._id;

    // Add weight entries
    if (weightData?.entries) {
      weightData.entries.forEach(entry => {
        if (!isProvider || entry.recordedBy?._id === currentUserId) {
          activities.push({
            type: 'Weight',
            date: new Date(entry.dateRecorded),
            updatedBy: entry.recordedBy?.fullName || 'Unknown',
            value: `${entry.weight} kg`,
            notes: entry.notes,
            id: entry._id
          });
        }
      });
    }

    // Add height entries
    if (heightData?.entries) {
      heightData.entries.forEach(entry => {
        if (!isProvider || entry.recordedBy?._id === currentUserId) {
          activities.push({
            type: 'Height',
            date: new Date(entry.dateRecorded),
            updatedBy: entry.recordedBy?.fullName || 'Unknown',
            value: `${entry.height} cm`,
            notes: entry.notes,
            id: entry._id
          });
        }
      });
    }

    // Add vaccination entries
    vaccinations.forEach(vaccination => {
      if (!isProvider || vaccination.createdBy === currentUserId) {
        activities.push({
          type: 'Vaccination',
          date: new Date(vaccination.dateAdministered || vaccination.createdAt),
          updatedBy: vaccination.administeredBy || 'Healthcare Provider',
          value: vaccination.vaccineName,
          notes: vaccination.notes,
          id: vaccination._id
        });
      }
    });

    // Add medication entries
    medications.forEach(medication => {
      if (!isProvider || medication.createdBy === currentUserId) {
        activities.push({
          type: 'Medication',
          date: new Date(medication.startDate || medication.createdAt),
          updatedBy: medication.prescribedBy || 'Healthcare Provider',
          value: medication.medicationName,
          notes: medication.notes,
          id: medication._id
        });
      }
    });

    // Sort by date (newest first) and return limited results
    return activities
      .sort((a, b) => b.date - a.date)
      .slice(0, limit);
  };

  const recentActivities = getRecentActivities(5);
  const allRecentActivities = getRecentActivities(10);

  // Group events by date for FullCalendar (multiple events per day)
  const calendarEvents = events.map((e) => ({
    id: e._id,
    title: e.title,
    date: e.date,
  }));

  // Handle event click (view or edit)
  const handleEventClick = (info) => {
    const event = events.find((e) => e._id === info.event.id);
    setModalData(event);
    setViewMode(
      !userInfo.isAdmin ||
      String(event.createdBy?.userId || event.createdBy) !== String(userInfo._id)
    );
    setModalOpen(true);
  };

  // Handle date click (add event) - only for admins
  const handleDateClick = (info) => {
    const today = new Date();
    today.setHours(0, 0, 0, 0); // Set to start of today
    const clickedDate = new Date(info.dateStr);
    clickedDate.setHours(0, 0, 0, 0);
    if (clickedDate < today) {
      window.alert("You can't set an event in the past. Please select today or a future date.");
      return;
    }
    setModalData({
      date: info.dateStr,
      title: "",
      place: "",
      details: "",
    });
    setViewMode(false);
    setModalOpen(true);
  };

  // Save (create or update)
  const handleSave = async (data) => {
    if (modalData._id) {
      await updateEvent({ id: modalData._id, ...data });
    } else {
      await createEvent(data);
    }
    setModalOpen(false);
    refetch();
  };

  // Delete event
  const handleDelete = async () => {
    if (modalData && modalData._id) {
      await deleteEvent(modalData._id);
      setModalOpen(false);
      refetch();
    }
  };

  return (
    <>
      <Navbar />
      <div className="max-w-6xl mx-auto p-6 space-y-10 mt-20">
        {/* Page Header */}
        <div className="bg-white rounded-2xl shadow-sm ring-1 ring-gray-100 overflow-hidden">
          <div className="bg-gradient-to-r from-indigo-600 to-purple-600 px-6 py-5">
            <div className="flex items-center gap-3">
              <CalendarDays className="w-6 h-6 text-white" />
              <h1 className="text-white text-xl md:text-2xl font-semibold">Tracking Dashboard</h1>
            </div>
          </div>
          <div className="px-6 py-4 text-sm text-gray-600">
            Manage growth, nutrition, health, and upcoming events in one place.
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Growth Tracking Section */}
          <Section title="Growth Tracking" icon={Ruler} theme="indigo">
            <div className="grid grid-cols-3 gap-4">
            <section title="vaccine" onClick={() => navigate('/growth-tracking')} className="bg-white rounded-lg p-6 flex flex-col items-center justify-center hover:shadow-md transition cursor-pointer">
                <TrackingCard icon={Scale} label="Weight" />
            </section>
            <section title="height" onClick={() => navigate('/height-tracking')} className="bg-white rounded-lg p-6 flex flex-col items-center justify-center hover:shadow-md transition cursor-pointer">
                <TrackingCard icon={Ruler} label="Height" />
            </section>
            <section title="head-circ" onClick={() => navigate('/head-circumference-tracking')} className="bg-white rounded-lg p-6 flex flex-col items-center justify-center hover:shadow-md transition cursor-pointer">
                <TrackingCard icon={CircleDot} label="Head circumference" />
            </section>
            </div>
          </Section>

          {/* Nutrition Tracking Section */}
          <Section title="Nutrition Tracking" icon={Baby} theme="emerald">
            <div className="grid grid-cols-3 gap-4">
            <section title="vaccine" onClick={() => navigate('/nutrition-tracking')} className="bg-white rounded-lg p-6 flex flex-col items-center justify-center hover:shadow-md transition cursor-pointer">
                <TrackingCard icon={Baby} label="Breastfeeding" />
            </section>
            <section title="vaccine" onClick={() => navigate('/nutrifluid-tracking')} className="bg-white rounded-lg p-6 flex flex-col items-center justify-center hover:shadow-md transition cursor-pointer">
                <TrackingCard icon={Droplet} label="Fluids" />
            </section>
            <section title="vaccine" onClick={() => navigate('/nutrisolid-tracking')} className="bg-white rounded-lg p-6 flex flex-col items-center justify-center hover:shadow-md transition cursor-pointer">
                <TrackingCard icon={Grape} label="Solids" />
            </section>
            </div>
          </Section>

          {/* Health Section */}
          <Section title="Health" icon={Syringe} theme="rose">
            <div className="grid grid-cols-2 gap-4">
            <section title="vaccine" onClick={() => navigate('/health-tracking')} className="bg-white rounded-lg p-6 flex flex-col items-center justify-center hover:shadow-md transition cursor-pointer">
                <TrackingCard icon={Syringe} label="Vaccination" />
            </section>
            <section title="medicine" onClick={() => navigate('/medication-tracking')} className="bg-white rounded-lg p-6 flex flex-col items-center justify-center hover:shadow-md transition cursor-pointer">
                <TrackingCard icon={Pill} label="Medication" />
            </section>
            </div>
          </Section>

          {/* Recent Activities Section */}
          <Section title="Recent Activities" icon={Activity} theme="amber" onClick={() => setActivitiesModalOpen(true)}>
            <div className="bg-white rounded-lg p-4">
              <table className="w-full text-sm">
                <thead>
                  <tr className="text-left text-gray-600">
                    <th className="pb-2">Activity</th>
                    <th className="pb-2">Date and Time</th>
                    <th className="pb-2">Updated by</th>
                  </tr>
                </thead>
                <tbody>
                  {recentActivities.length > 0 ? (
                    recentActivities.map((item, index) => {
                      const Icon =
                        item.type === 'Weight' ? Scale :
                        item.type === 'Height' ? Ruler :
                        item.type === 'Vaccination' ? Syringe :
                        item.type === 'Medication' ? Pill : Activity;
                      return (
                        <tr key={item.id || index} className="border-t">
                          <td className="py-2">
                            <span className="inline-flex items-center gap-2">
                              <span className="p-1.5 rounded-md bg-indigo-50 text-indigo-600">
                                <Icon className="w-4 h-4" />
                              </span>
                              <span className="font-medium text-gray-800">{item.type}</span>
                            </span>
                          </td>
                          <td className="py-2 text-gray-700">
                            {item.date.toLocaleDateString()} at {item.date.toLocaleTimeString([], { 
                              hour: '2-digit', 
                              minute: '2-digit' 
                            })}
                          </td>
                          <td className="py-2">
                            <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-green-50 text-green-700 ring-1 ring-green-200">
                              {item.updatedBy}
                            </span>
                          </td>
                        </tr>
                      );
                    })
                  ) : (
                    <tr>
                      <td colSpan="3" className="py-8 text-center text-gray-500">
                        <div className="flex flex-col items-center">
                          <Activity className="w-8 h-8 text-gray-300 mb-2" />
                          <p>No recent activities found</p>
                          <p className="text-sm">Start tracking to see activities here</p>
                        </div>
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </Section>
        </div>

        {/* Upcoming Section */}
    <Section
  title={
    userInfo.isAdmin
      ? "Upcoming (set events by clicking on dates and notify parents)"
      : "Upcoming"
  }
  icon={CalendarDays}
  theme="violet"
>
          <div className="bg-white rounded-lg p-4 flex justify-center">
            <div className="w-full max-w-4xl">
              <FullCalendar
                plugins={[dayGridPlugin, timeGridPlugin, interactionPlugin]}
                initialView="dayGridMonth"
                selectable={userInfo.isAdmin}
                editable={false}
                events={calendarEvents}
                dateClick={userInfo.isAdmin ? handleDateClick : undefined}
                eventClick={handleEventClick}
                eventContent={renderEventContent}
              />
            </div>
          </div>
        </Section>
      </div>
      <Footer />
      {/* Modal for add/edit/view event */}
      {modalOpen && (
        <Modal
          open={modalOpen}
          onClose={() => setModalOpen(false)}
          data={modalData}
          onSave={handleSave}
          onDelete={
            modalData && modalData._id && !viewMode
              ? handleDelete
              : undefined
          }
          viewMode={viewMode}
          userInfo={userInfo}
        />
      )}
      
      {/* Activities Modal for expanded view */}
      {activitiesModalOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg shadow-lg max-w-4xl w-full mx-4 max-h-[80vh] overflow-hidden">
            <div className="flex justify-between items-center p-6 border-b">
              <h2 className="text-xl font-semibold text-gray-800">
                Recent Activities {isProvider ? '(Your Records)' : ''}
              </h2>
              <button
                onClick={() => setActivitiesModalOpen(false)}
                className="text-gray-400 hover:text-gray-600"
              >
                <X className="w-6 h-6" />
              </button>
            </div>
            
            <div className="p-6 overflow-y-auto max-h-[60vh]">
              {allRecentActivities.length > 0 ? (
                <div className="space-y-4">
                  {allRecentActivities.map((activity, index) => (
                    <div key={activity.id || index} className="flex items-start space-x-4 p-4 bg-gray-50 rounded-lg">
                      <div className="flex-shrink-0">
                        {activity.type === 'Weight' && (
                          <div className="p-2 bg-blue-100 rounded-full">
                            <Scale className="h-6 w-6 text-blue-600" />
                          </div>
                        )}
                        {activity.type === 'Height' && (
                          <div className="p-2 bg-green-100 rounded-full">
                            <Ruler className="h-6 w-6 text-green-600" />
                          </div>
                        )}
                        {activity.type === 'Vaccination' && (
                          <div className="p-2 bg-purple-100 rounded-full">
                            <Syringe className="h-6 w-6 text-purple-600" />
                          </div>
                        )}
                        {activity.type === 'Medication' && (
                          <div className="p-2 bg-orange-100 rounded-full">
                            <Pill className="h-6 w-6 text-orange-600" />
                          </div>
                        )}
                      </div>
                      
                      <div className="flex-1">
                        <div className="flex justify-between items-start">
                          <div>
                            <h3 className="font-medium text-gray-900">{activity.type}</h3>
                            <p className="text-lg text-gray-700 font-semibold">{activity.value}</p>
                            {activity.notes && (
                              <p className="text-sm text-gray-600 mt-1">{activity.notes}</p>
                            )}
                          </div>
                          
                          <div className="text-right">
                            <p className="text-sm text-gray-500">
                              {activity.date.toLocaleDateString('en-US', { 
                                year: 'numeric', 
                                month: 'short', 
                                day: 'numeric' 
                              })}
                            </p>
                            <p className="text-sm text-gray-500">
                              {activity.date.toLocaleTimeString([], { 
                                hour: '2-digit', 
                                minute: '2-digit' 
                              })}
                            </p>
                            <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-green-50 text-green-700 ring-1 ring-green-200 mt-1">
                              {activity.updatedBy}
                            </span>
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-12">
                  <Activity className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                  <h3 className="text-lg font-medium text-gray-900 mb-2">No Activities Yet</h3>
                  <p className="text-gray-500">
                    Start tracking weight, height, vaccinations, and medications to see activities here.
                  </p>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default Tracker;