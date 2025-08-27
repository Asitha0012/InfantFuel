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
} from 'lucide-react';

import {
  useGetEventsQuery,
  useCreateEventMutation,
  useUpdateEventMutation,
  useDeleteEventMutation,
} from '../redux/api/events';
import { useSelector } from "react-redux";
import Modal from "../Components/Modal";
import PropTypes from "prop-types";

const Section = ({ title, children, onClick }) => (
  <div 
    className="bg-purple-50 p-6 rounded-xl cursor-pointer hover:bg-purple-100 transition-colors"
    onClick={onClick}
  >
    <h2 className="text-xl font-semibold mb-4 text-indigo-700">{title}</h2>
    {children}
  </div>
);
Section.propTypes = {
  title: PropTypes.string.isRequired,
  children: PropTypes.node,
  onClick: PropTypes.func,
};

const TrackingCard = ({ icon: Icon, label }) => (
  <div className="bg-white p-4 rounded-lg flex flex-col items-center gap-2">
    <Icon className="w-8 h-8 text-purple-500" />
    <span className="text-sm text-center">{label}</span>
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
        background: "red",
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

  const recentActivities = [
    { activity: 'Weight', date: '09/12/2024 at 10.30am', updatedBy: 'Midwife' },
    { activity: 'Height', date: '09/12/2024 at 10:00am', updatedBy: 'Midwife' },
    { activity: 'Vaccination', date: '08/12/2024 at 9:00am', updatedBy: 'Midwife' },
    { activity: 'Breastfeed', date: '08/12/2024 at 10:00am', updatedBy: 'Parent' },
  ];

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

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Growth Tracking Section */}
          <Section title="Growth Tracking">
            <div className="grid grid-cols-3 gap-4">
            <section title="vaccine" onClick={() => navigate('/growth-tracking')} className="bg-white rounded-lg p-6 flex flex-col items-center justify-center hover:shadow-md transition cursor-pointer">
                <TrackingCard icon={Scale} label="Weight" />
            </section>
            <section title="height" onClick={() => navigate('/height-tracking')} className="bg-white rounded-lg p-6 flex flex-col items-center justify-center hover:shadow-md transition cursor-pointer">
                <TrackingCard icon={Ruler} label="Height" />
            </section>
            <section title="vaccine" onClick={() => navigate('/growth-tracking')} className="bg-white rounded-lg p-6 flex flex-col items-center justify-center hover:shadow-md transition cursor-pointer">
                <TrackingCard icon={CircleDot} label="Head circumference" />
            </section>
            </div>
          </Section>

          {/* Nutrition Tracking Section */}
          <Section title="Nutrition Tracking">
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
          <Section title="Health">
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
          <Section title="Recent Activities" onClick={() => navigate('/recent-activities')}>
            <div className="bg-white rounded-lg p-4">
              <table className="w-full text-sm">
                <thead>
                  <tr className="text-left">
                    <th className="pb-2">Activity</th>
                    <th className="pb-2">Date and Time</th>
                    <th className="pb-2">Updated by</th>
                  </tr>
                </thead>
                <tbody>
                  {recentActivities.map((item, index) => (
                    <tr key={index} className="border-t">
                      <td className="py-2">{item.activity}</td>
                      <td className="py-2">{item.date}</td>
                      <td className="py-2">{item.updatedBy}</td>
                    </tr>
                  ))}
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
    </>
  );
};

export default Tracker;