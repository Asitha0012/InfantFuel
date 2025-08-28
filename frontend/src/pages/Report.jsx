import { useState, useRef, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useSelector } from 'react-redux';
import { useReactToPrint } from 'react-to-print';
import PropTypes from 'prop-types';
import { 
  FileText, 
  Calendar, 
  Download, 
  ArrowLeft,
  User,
  Baby,
  Scale,
  Ruler,
  Syringe,
  Pill,
  Activity
} from 'lucide-react';
import { Search } from 'lucide-react';

import Navbar from '../Components/Navbar';
import Footer from '../Components/Footer';
import { useGetConnectedBabyProfilesQuery } from '../redux/api/weights';
import { useGetConnectionsQuery } from '../redux/api/connections';
import { useGetWeightHistoryQuery } from '../redux/api/weights';
import { useGetHeightHistoryQuery } from '../redux/api/heights';
import { useGetVaccinationsQuery } from '../redux/api/vaccinations';
import { useGetmedicationsQuery } from '../redux/api/medications';
import { useGetProfileQuery } from '../redux/api/users';

const Report = () => {
  const navigate = useNavigate();
  const { userInfo } = useSelector((state) => state.auth);
  const contentRef = useRef(null);
  
  // Form state
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [selectedBaby, setSelectedBaby] = useState('');
  const [errorMessage, setErrorMessage] = useState('');
  const [showPreview, setShowPreview] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [showDropdown, setShowDropdown] = useState(false);
  
  // Determine if user is healthcare provider
  const isProvider = userInfo?.isAdmin === true;
  
  // Fetch connected babies for healthcare providers
  const { data: connectedProfiles = [], isLoading: loadingProfiles } = useGetConnectedBabyProfilesQuery(
    undefined, 
    { skip: !isProvider }
  );
  
  // Fetch full profile data for parents (to get babyDetails, contactNumber, address)
  const { data: fullProfileData } = useGetProfileQuery(undefined, { 
    skip: isProvider || !userInfo?._id 
  });
  
  // Set default selected baby for providers
  const [hasSetDefault, setHasSetDefault] = useState(false);
  
  // Auto-select first baby for healthcare providers
  useEffect(() => {
    if (isProvider && connectedProfiles.length > 0 && !selectedBaby && !hasSetDefault) {
      setSelectedBaby(connectedProfiles[0]._id);
      setHasSetDefault(true);
    }
  }, [isProvider, connectedProfiles, selectedBaby, hasSetDefault]);

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      // Close dropdown if clicking outside
      if (showDropdown && !event.target.closest('.relative')) {
        setShowDropdown(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [showDropdown]);
  
  // Fetch connections (used to list connected providers and enrich parent info)
  const { data: connectionsData } = useGetConnectionsQuery();
  
  // Get the target user ID (baby's parent ID)
  const targetUserId = isProvider 
    ? selectedBaby || connectedProfiles[0]?._id 
    : userInfo?._id;
  
  // Fetch all data
  const { data: weightData } = useGetWeightHistoryQuery(targetUserId, { 
    skip: !targetUserId 
  });
  const { data: heightData } = useGetHeightHistoryQuery(targetUserId, { 
    skip: !targetUserId 
  });
  const { data: vaccinations = [] } = useGetVaccinationsQuery();
  const { data: medications = [] } = useGetmedicationsQuery();
  
  // Get selected profile data (for provider); connectedProfiles items are parent users with babyDetails
  const selectedProfile = isProvider && selectedBaby
    ? connectedProfiles.find(profile => profile._id === selectedBaby)
    : isProvider && connectedProfiles.length > 0
    ? connectedProfiles[0]
    : null;

  // Get filtered profiles for search
  const filteredProfiles = connectedProfiles.filter(profile => {
    const parentName = profile.fullName?.toLowerCase() || "";
    const babyName = profile.babyDetails?.fullName?.toLowerCase() || "";
    return (
      parentName.includes(searchTerm.toLowerCase()) ||
      babyName.includes(searchTerm.toLowerCase())
    );
  });

  // Profile selection handler
  const handleProfileSelect = (profileId) => {
    setSelectedBaby(profileId);
    setShowDropdown(false);
    setSearchTerm("");
  };

  // For providers, selectedProfile is already the parent user from connectedProfiles

  // Build connected healthcare providers list for the report
  const connectedProviders = (() => {
    // Parent view: list all connected providers for the logged-in parent
    if (!isProvider) {
      const conns = [
        ...(connectionsData?.asFrom || []),
        ...(connectionsData?.asTo || []),
      ];
      const providers = conns
        .map((c) => (c?.from?._id === userInfo?._id ? c.to : c.from))
        .filter((u) => u?.isAdmin);
      const uniq = [];
      const seen = new Set();
      for (const p of providers) {
        if (p?._id && !seen.has(p._id)) {
          seen.add(p._id);
          uniq.push(p);
        }
      }
      return uniq;
    }
    // Provider view: show the provider (this user) details from the specific connection with selected parent to include contact number
    if (!connectionsData || !selectedProfile) return userInfo?.isAdmin ? [userInfo] : [];
    const all = [
      ...(connectionsData?.asFrom || []),
      ...(connectionsData?.asTo || []),
    ];
    const conn = all.find(
      (c) =>
        (c?.from?._id === userInfo?._id && c?.to?._id === selectedProfile?._id) ||
        (c?.to?._id === userInfo?._id && c?.from?._id === selectedProfile?._id)
    );
    if (!conn) return userInfo?.isAdmin ? [userInfo] : [];
    const providerUser = conn?.from?.isAdmin ? conn.from : conn.to;
    return providerUser ? [providerUser] : userInfo?.isAdmin ? [userInfo] : [];
  })();
  
  // Filter data by date range
  const filterByDateRange = (items, dateField = 'dateRecorded') => {
    if (!startDate || !endDate || !items) return items;
    
    const start = new Date(startDate);
    const end = new Date(endDate);
    end.setHours(23, 59, 59, 999); // Include the entire end date
    
    return items.filter(item => {
      const itemDate = new Date(item[dateField] || item.date || item.dateAdministered || item.startDate || item.createdAt);
      return itemDate >= start && itemDate <= end;
    });
  };
  
  // Prepare filtered data
  const filteredWeightEntries = filterByDateRange(weightData?.entries || [], 'dateRecorded');
  const filteredHeightEntries = filterByDateRange(heightData?.entries || [], 'dateRecorded');
  const filteredVaccinations = filterByDateRange(vaccinations, 'date');
  const filteredMedications = filterByDateRange(medications, 'date');
  
  // Get baby and parent information
  const babyInfo = isProvider 
    ? selectedProfile?.babyDetails 
    : (fullProfileData?.babyDetails || userInfo?.babyDetails);
    
  // For providers, get enhanced parent info from connections API (which has contact details)
  const getEnhancedParentFromConnections = () => {
    if (!isProvider || !selectedProfile || !connectionsData) return selectedProfile;
    
    const all = [
      ...(connectionsData?.asFrom || []),
      ...(connectionsData?.asTo || []),
    ];
    
    // Find the connection between the logged-in provider and the selected parent
    for (const conn of all) {
      const parentFromConn = conn?.from?._id === selectedProfile?._id ? conn.from : 
                            conn?.to?._id === selectedProfile?._id ? conn.to : null;
      
      if (parentFromConn && parentFromConn._id === selectedProfile._id) {
        // This should have full contact details populated by the connections controller
        return parentFromConn;
      }
    }
    
    return selectedProfile; // fallback
  };

  // For provider: ensure we get the parent info correctly
  // For parent: use full profile data if available, otherwise userInfo
  const parentInfo = isProvider 
    ? getEnhancedParentFromConnections() // Use connections data for complete contact info
    : (fullProfileData || userInfo); // Use full profile data for parents
  
  // Handle preview
  const handlePreview = () => {
    if (validateForm()) {
      setShowPreview(true);
    }
  };
  
  // Handle form validation
  const validateForm = () => {
    setErrorMessage('');
    
    if (!startDate || !endDate) {
      setErrorMessage('Please select both start and end dates.');
      return false;
    }
    
    if (new Date(startDate) > new Date(endDate)) {
      setErrorMessage('Start date cannot be after end date.');
      return false;
    }
    
    if (isProvider && !selectedBaby && connectedProfiles.length === 0) {
      setErrorMessage('No connected babies found. Please connect with parents first.');
      return false;
    }
    
    if (isProvider && connectedProfiles.length > 0 && !selectedBaby) {
      setErrorMessage('Please select a baby to generate the report.');
      return false;
    }
    
    return true;
  };
  
  // Handle PDF generation
  const handlePrint = useReactToPrint({
    contentRef,
    documentTitle: (() => {
      const babyName = babyInfo?.fullName || 'Baby';
      const parentName = parentInfo?.fullName || 'Parent';
      return `Health_Report_${babyName}_${parentName}_${startDate}_to_${endDate}`;
    })(),
    onBeforeGetContent: () => {
      return new Promise((resolve) => {
        if (!validateForm()) {
          resolve();
          return;
        }
        resolve();
      });
    },
    onAfterPrint: () => {
      console.log('PDF generated successfully');
    },
  });
  
  const handleDownload = () => {
    if (validateForm()) {
      handlePrint();
    }
  };

  return (
    <>
      <Navbar />
      <div className="max-w-6xl mx-auto p-6 space-y-8 mt-20">
        {/* Page Header */}
        <div className="bg-white rounded-2xl shadow-sm ring-1 ring-gray-100 overflow-hidden">
          <div className="bg-gradient-to-r from-blue-600 to-indigo-600 px-6 py-5">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <FileText className="w-6 h-6 text-white" />
                <h1 className="text-white text-xl md:text-2xl font-semibold">Health Report Generator</h1>
              </div>
              <button
                onClick={() => navigate('/tracker')}
                className="flex items-center gap-2 px-4 py-2 bg-white/10 hover:bg-white/20 text-white rounded-lg transition-colors"
              >
                <ArrowLeft className="w-4 h-4" />
                Back to Tracker
              </button>
            </div>
          </div>
          <div className="px-6 py-4 text-sm text-gray-600">
            Generate comprehensive health reports with growth tracking, vaccination records, and medication history.
          </div>
        </div>

        {/* Report Configuration */}
        <div className="bg-white rounded-xl shadow-sm ring-1 ring-gray-100 p-6">
          <h2 className="text-lg font-semibold text-gray-800 mb-4 flex items-center gap-2">
            <Calendar className="w-5 h-5" />
            Report Configuration
          </h2>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Start Date
              </label>
              <input
                type="date"
                value={startDate}
                onChange={(e) => setStartDate(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                End Date
              </label>
              <input
                type="date"
                value={endDate}
                onChange={(e) => setEndDate(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              />
            </div>
            
            {isProvider && (
              <div>
                <label className="flex items-center gap-2 text-sm font-medium text-gray-700 mb-2">
                  <Baby className="w-4 h-4 text-blue-600" />
                  Select Baby Profile
                </label>
                <div className="relative">
                  <div 
                    className="w-full bg-white border border-gray-300 rounded-lg px-4 py-3 cursor-pointer flex items-center justify-between hover:border-blue-400 transition-colors"
                    onClick={() => setShowDropdown(!showDropdown)}
                  >
                    <div className="flex items-center gap-3">
                      {selectedProfile ? (
                        <>
                          <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center">
                            <span className="text-blue-600 font-medium text-sm">
                              {selectedProfile.babyDetails?.fullName?.charAt(0) || selectedProfile.fullName?.charAt(0)}
                            </span>
                          </div>
                          <div>
                            <div className="font-medium text-gray-900">{selectedProfile.fullName}</div>
                            <div className="text-sm text-gray-500">
                              Baby: {selectedProfile.babyDetails?.fullName || 'Not set'} • 
                              {selectedProfile.babyDetails?.gender || 'Unknown'}
                            </div>
                          </div>
                        </>
                      ) : (
                        <span className="text-gray-500">
                          {loadingProfiles ? "Loading profiles..." : "Select a profile"}
                        </span>
                      )}
                    </div>
                    <Search className="w-5 h-5 text-gray-400" />
                  </div>

                  {/* Dropdown */}
                  {showDropdown && (
                    <div className="absolute top-full left-0 right-0 mt-1 bg-white border border-gray-300 rounded-lg shadow-lg z-10 max-h-60 overflow-hidden">
                      <div className="p-3 border-b">
                        <input
                          type="text"
                          placeholder="Search by parent or baby name..."
                          className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 text-gray-900 placeholder-gray-500 bg-white"
                          value={searchTerm}
                          onChange={(e) => setSearchTerm(e.target.value)}
                          autoFocus
                        />
                      </div>
                      <div className="max-h-48 overflow-y-auto">
                        {filteredProfiles.length === 0 ? (
                          <div className="p-4 text-gray-500 text-center">
                            {searchTerm ? "No profiles match your search" : "No connected profiles found"}
                          </div>
                        ) : (
                          filteredProfiles.map((profile) => (
                            <div
                              key={profile._id}
                              className="p-3 hover:bg-gray-50 cursor-pointer border-b last:border-b-0"
                              onClick={() => handleProfileSelect(profile._id)}
                            >
                              <div className="flex items-center gap-3">
                                <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center">
                                  <span className="text-blue-600 font-medium text-xs">
                                    {profile.babyDetails?.fullName?.charAt(0) || profile.fullName?.charAt(0)}
                                  </span>
                                </div>
                                <div>
                                  <div className="font-medium text-gray-900">{profile.fullName}</div>
                                  <div className="text-sm text-gray-500">
                                    Baby: {profile.babyDetails?.fullName || 'Not set'}
                                  </div>
                                </div>
                              </div>
                            </div>
                          ))
                        )}
                      </div>
                    </div>
                  )}
                </div>
              </div>
            )}
          </div>
          
          {errorMessage && (
            <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg">
              <div className="flex items-center gap-2 text-red-700 text-sm">
                <span className="font-medium">Error:</span>
                {errorMessage}
              </div>
            </div>
          )}
          
          <div className="flex gap-3">
            <button
              onClick={handlePreview}
              className="flex items-center gap-2 px-6 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg transition-colors"
            >
              <FileText className="w-4 h-4" />
              Preview Report
            </button>
            <button
              onClick={handleDownload}
              disabled={!showPreview}
              className={`flex items-center gap-2 px-6 py-2 rounded-lg transition-colors ${
                showPreview 
                  ? 'bg-blue-600 hover:bg-blue-700 text-white' 
                  : 'bg-gray-300 text-gray-500 cursor-not-allowed'
              }`}
            >
              <Download className="w-4 h-4" />
              Download PDF
            </button>
          </div>
        </div>

        {/* Report Preview */}
        {showPreview && (
          <div className="bg-white rounded-xl shadow-sm ring-1 ring-gray-100 overflow-hidden">
            <div className="px-6 py-4 border-b border-gray-200 bg-gradient-to-r from-green-50 to-blue-50">
              <h2 className="text-lg font-semibold text-gray-800 flex items-center gap-2">
                <FileText className="w-5 h-5 text-green-600" />
                Report Preview
              </h2>
              <p className="text-sm text-gray-600 mt-1">
                Review the report before downloading. All data is filtered by your selected date range.
              </p>
            </div>
            
            <div ref={contentRef} className="p-8 bg-gray-50">
              <div className="bg-white rounded-lg shadow-sm p-8">
                <ReportContent
                  babyInfo={babyInfo}
                  parentInfo={parentInfo}
                  startDate={startDate}
                  endDate={endDate}
                  weightEntries={filteredWeightEntries}
                  heightEntries={filteredHeightEntries}
                  vaccinations={filteredVaccinations}
                  medications={filteredMedications}
                  connectedProviders={connectedProviders}
                />
              </div>
            </div>
          </div>
        )}

        {!showPreview && (
          <div className="bg-white rounded-xl shadow-sm ring-1 ring-gray-100 overflow-hidden">
            <div className="px-6 py-4 border-b border-gray-200">
              <h2 className="text-lg font-semibold text-gray-800">Report Preview</h2>
              <p className="text-sm text-gray-600 mt-1">
                Select date range and click &quot;Preview Report&quot; to see the report content.
              </p>
            </div>
            
            <div className="p-8 text-center">
              <div className="flex flex-col items-center justify-center py-12">
                <FileText className="w-16 h-16 text-gray-300 mb-4" />
                <h3 className="text-lg font-medium text-gray-700 mb-2">No Preview Available</h3>
                <p className="text-gray-500 mb-4">
                  Configure your report settings and click &quot;Preview Report&quot; to see the content.
                </p>
              </div>
            </div>
          </div>
        )}
      </div>
      <Footer />
    </>
  );
};

// Report Content Component for PDF
const ReportContent = ({ 
  babyInfo, 
  parentInfo, 
  startDate, 
  endDate, 
  weightEntries, 
  heightEntries, 
  vaccinations, 
  medications,
  connectedProviders
}) => {
  const formatDate = (date) => {
    return new Date(date).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  const formatTime = (date) => {
    return new Date(date).toLocaleTimeString('en-US', {
      hour: '2-digit',
      minute: '2-digit',
      hour12: true
    });
  };

  // Growth delta helpers (within selected range)
  const sortByDate = (arr, field) => [...arr].sort((a, b) => new Date(a[field]) - new Date(b[field]));
  const getDeltaSummary = (entries, field, dateField) => {
    if (!entries || entries.length < 2) return null;
    const sorted = sortByDate(entries, dateField);
    const first = sorted[0];
    const last = sorted[sorted.length - 1];
    const startVal = Number(first[field]);
    const endVal = Number(last[field]);
    if (Number.isNaN(startVal) || Number.isNaN(endVal)) return null;
    const delta = +(endVal - startVal).toFixed(2);
    return { startVal, endVal, delta, startDate: first[dateField], endDate: last[dateField] };
  };
  const weightDelta = getDeltaSummary(weightEntries, 'weight', 'dateRecorded');
  const heightDelta = getDeltaSummary(heightEntries, 'height', 'dateRecorded');

  return (
    <div className="max-w-4xl mx-auto space-y-8 text-gray-900">
      {/* Report Header */}
      <div className="text-center border-b-2 border-blue-600 pb-6 mb-8">
        <div className="mb-4">
          <h1 className="text-4xl font-bold text-blue-800 mb-2">InfantFuel</h1>
          <h2 className="text-2xl font-semibold text-gray-700">Comprehensive Health Report</h2>
        </div>
        <div className="bg-blue-50 rounded-lg p-4 inline-block">
          <p className="text-lg font-medium text-blue-800">
            Report Period: {startDate ? formatDate(startDate) : 'Not specified'} to {endDate ? formatDate(endDate) : 'Not specified'}
          </p>
          <p className="text-sm text-gray-600 mt-1">
            Generated on {formatDate(new Date())} at {formatTime(new Date())}
          </p>
        </div>
      </div>

      {/* Baby & Parent Information */}
      <div className="bg-white border border-gray-300 rounded-lg">
        <div className="border-b border-gray-300 bg-gray-50 px-6 py-4">
          <h2 className="text-xl font-bold text-gray-800 flex items-center gap-3">
            <User className="w-5 h-5 text-gray-700" />
            Baby & Parent Information
          </h2>
        </div>
        
        <div className="p-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            {/* Baby Information */}
            <div>
              <div className="flex items-center gap-2 mb-4 pb-2 border-b border-gray-200">
                <Baby className="w-5 h-5 text-blue-600" />
                <h3 className="text-lg font-semibold text-gray-800">Baby Information</h3>
              </div>
              <div className="space-y-3">
                <div className="flex justify-between py-2 border-b border-gray-100">
                  <span className="font-medium text-gray-600">Full Name:</span>
                  <span className="text-gray-800 font-medium">{babyInfo?.fullName || 'Not provided'}</span>
                </div>
                <div className="flex justify-between py-2 border-b border-gray-100">
                  <span className="font-medium text-gray-600">Date of Birth:</span>
                  <span className="text-gray-800">{babyInfo?.dateOfBirth ? formatDate(babyInfo.dateOfBirth) : 'Not provided'}</span>
                </div>
                <div className="flex justify-between py-2 border-b border-gray-100">
                  <span className="font-medium text-gray-600">Gender:</span>
                  <span className="text-gray-800">{babyInfo?.gender || 'Not provided'}</span>
                </div>
                <div className="flex justify-between py-2 border-b border-gray-100">
                  <span className="font-medium text-gray-600">Birth Weight:</span>
                  <span className="text-gray-800">{babyInfo?.birthWeight ? `${babyInfo.birthWeight}` : 'Not provided'}</span>
                </div>
                {babyInfo?.birthHeight && (
                  <div className="flex justify-between py-2 border-b border-gray-100">
                    <span className="font-medium text-gray-600">Birth Height:</span>
                    <span className="text-gray-800">{babyInfo.birthHeight} cm</span>
                  </div>
                )}
                {babyInfo?.bloodGroup && (
                  <div className="flex justify-between py-2 border-b border-gray-100">
                    <span className="font-medium text-gray-600">Blood Group:</span>
                    <span className="text-gray-800">{babyInfo.bloodGroup}</span>
                  </div>
                )}
              </div>
            </div>

            {/* Parent Information */}
            <div>
              <div className="flex items-center gap-2 mb-4 pb-2 border-b border-gray-200">
                <User className="w-5 h-5 text-green-600" />
                <h3 className="text-lg font-semibold text-gray-800">Parent Information</h3>
              </div>
              <div className="space-y-3">
                <div className="flex justify-between py-2 border-b border-gray-100">
                  <span className="font-medium text-gray-600">Full Name:</span>
                  <span className="text-gray-800 font-medium">{parentInfo?.fullName || 'Not provided'}</span>
                </div>
                <div className="flex justify-between py-2 border-b border-gray-100">
                  <span className="font-medium text-gray-600">Contact Number:</span>
                  <span className="text-gray-800">{parentInfo?.contactNumber || 'Not provided'}</span>
                </div>
                <div className="flex justify-between py-2 border-b border-gray-100">
                  <span className="font-medium text-gray-600">Address:</span>
                  <span className="text-gray-800">{parentInfo?.address || 'Not provided'}</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Connected Healthcare Providers */}
      {connectedProviders && connectedProviders.length > 0 && (
        <div className="bg-white border border-gray-300 rounded-lg">
          <div className="border-b border-gray-300 bg-gray-50 px-6 py-4">
            <h2 className="text-xl font-bold text-gray-800 flex items-center gap-3">
              <User className="w-5 h-5 text-gray-700" />
              Connected Healthcare Providers
            </h2>
          </div>
          <div className="p-6">
            <div className="space-y-4">
              {connectedProviders.map((prov) => (
                <div key={prov._id} className="flex items-center justify-between py-3 px-4 bg-gray-50 rounded-lg border border-gray-200">
                  <div className="flex items-center gap-3">
                    <User className="w-4 h-4 text-blue-600" />
                    <span className="font-medium text-gray-800">{prov.fullName || 'Healthcare Provider'}</span>
                  </div>
                  <div className="text-sm text-gray-600">
                    <span>{prov.contactNumber || 'No contact number'}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Growth & Development Tracking */}
      <div className="space-y-6">
        <div className="flex items-center gap-3 border-b border-gray-200 pb-3">
          <Activity className="w-6 h-6 text-purple-600" />
          <h2 className="text-2xl font-bold text-purple-800">Growth & Development Tracking</h2>
        </div>

        {/* Growth Summary (Weight & Height changes over the selected period) */}
        {(weightDelta || heightDelta) && (
          <div className="bg-white border border-gray-300 rounded-lg">
            <div className="border-b border-gray-300 bg-gray-50 px-6 py-4">
              <h3 className="text-lg font-semibold text-gray-800 flex items-center gap-2">
                <Activity className="w-5 h-5 text-purple-600" />
                Growth Summary
              </h3>
            </div>
            <div className="p-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {weightDelta && (
                  <div className="border border-gray-200 rounded-lg p-4">
                    <div className="flex items-center gap-2 mb-3">
                      <Scale className="w-4 h-4 text-blue-600" />
                      <span className="font-medium text-gray-700">Weight Change</span>
                    </div>
                    <div className="text-gray-800">
                      <div className="flex justify-between mb-2">
                        <span className="text-sm text-gray-600">{formatDate(weightDelta.startDate)}:</span>
                        <span className="font-medium">{weightDelta.startVal} kg</span>
                      </div>
                      <div className="flex justify-between mb-2">
                        <span className="text-sm text-gray-600">{formatDate(weightDelta.endDate)}:</span>
                        <span className="font-medium">{weightDelta.endVal} kg</span>
                      </div>
                      <div className="border-t pt-2 mt-2">
                        <div className="flex justify-between">
                          <span className="font-medium text-gray-700">Change:</span>
                          <span className={`font-bold ${weightDelta.delta >= 0 ? 'text-green-700' : 'text-red-700'}`}>
                            {weightDelta.delta >= 0 ? '+' : ''}{weightDelta.delta} kg
                          </span>
                        </div>
                      </div>
                    </div>
                  </div>
                )}
                {heightDelta && (
                  <div className="border border-gray-200 rounded-lg p-4">
                    <div className="flex items-center gap-2 mb-3">
                      <Ruler className="w-4 h-4 text-green-600" />
                      <span className="font-medium text-gray-700">Height Change</span>
                    </div>
                    <div className="text-gray-800">
                      <div className="flex justify-between mb-2">
                        <span className="text-sm text-gray-600">{formatDate(heightDelta.startDate)}:</span>
                        <span className="font-medium">{heightDelta.startVal} cm</span>
                      </div>
                      <div className="flex justify-between mb-2">
                        <span className="text-sm text-gray-600">{formatDate(heightDelta.endDate)}:</span>
                        <span className="font-medium">{heightDelta.endVal} cm</span>
                      </div>
                      <div className="border-t pt-2 mt-2">
                        <div className="flex justify-between">
                          <span className="font-medium text-gray-700">Change:</span>
                          <span className={`font-bold ${heightDelta.delta >= 0 ? 'text-green-700' : 'text-red-700'}`}>
                            {heightDelta.delta >= 0 ? '+' : ''}{heightDelta.delta} cm
                          </span>
                        </div>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        )}

        {/* Weight Records */}
        <div className="bg-white rounded-lg border border-gray-200 overflow-hidden">
          <div className="bg-blue-50 px-4 py-3 border-b border-blue-200">
            <div className="flex items-center gap-2">
              <Scale className="w-5 h-5 text-blue-600" />
              <h3 className="font-semibold text-blue-800">Weight Records</h3>
              <span className="ml-auto bg-blue-100 text-blue-800 text-xs px-2 py-1 rounded-full">
                {weightEntries?.length || 0} entries
              </span>
            </div>
          </div>
          {weightEntries && weightEntries.length > 0 ? (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="text-left py-3 px-4 font-medium text-gray-700">Date Recorded</th>
                    <th className="text-left py-3 px-4 font-medium text-gray-700">Weight (kg)</th>
                    <th className="text-left py-3 px-4 font-medium text-gray-700">Recorded By</th>
                    <th className="text-left py-3 px-4 font-medium text-gray-700">Notes</th>
                  </tr>
                </thead>
                <tbody>
                  {weightEntries.map((entry, index) => (
                    <tr key={index} className={index % 2 === 0 ? 'bg-white' : 'bg-gray-50'}>
                      <td className="py-3 px-4 text-gray-800">{formatDate(entry.dateRecorded)}</td>
                      <td className="py-3 px-4 text-gray-800 font-medium">{entry.weight}</td>
                      <td className="py-3 px-4 text-gray-600">{entry.recordedBy?.fullName || 'Not specified'}</td>
                      <td className="py-3 px-4 text-gray-600">{entry.notes || 'No notes'}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ) : (
            <div className="p-8 text-center">
              <Scale className="w-12 h-12 text-gray-300 mx-auto mb-3" />
              <p className="text-gray-500">No weight records found for the selected period.</p>
            </div>
          )}
        </div>

        {/* Height Records */}
        <div className="bg-white rounded-lg border border-gray-200 overflow-hidden">
          <div className="bg-green-50 px-4 py-3 border-b border-green-200">
            <div className="flex items-center gap-2">
              <Ruler className="w-5 h-5 text-green-600" />
              <h3 className="font-semibold text-green-800">Height Records</h3>
              <span className="ml-auto bg-green-100 text-green-800 text-xs px-2 py-1 rounded-full">
                {heightEntries?.length || 0} entries
              </span>
            </div>
          </div>
          {heightEntries && heightEntries.length > 0 ? (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="text-left py-3 px-4 font-medium text-gray-700">Date Recorded</th>
                    <th className="text-left py-3 px-4 font-medium text-gray-700">Height (cm)</th>
                    <th className="text-left py-3 px-4 font-medium text-gray-700">Recorded By</th>
                    <th className="text-left py-3 px-4 font-medium text-gray-700">Notes</th>
                  </tr>
                </thead>
                <tbody>
                  {heightEntries.map((entry, index) => (
                    <tr key={index} className={index % 2 === 0 ? 'bg-white' : 'bg-gray-50'}>
                      <td className="py-3 px-4 text-gray-800">{formatDate(entry.dateRecorded)}</td>
                      <td className="py-3 px-4 text-gray-800 font-medium">{entry.height}</td>
                      <td className="py-3 px-4 text-gray-600">{entry.recordedBy?.fullName || 'Not specified'}</td>
                      <td className="py-3 px-4 text-gray-600">{entry.notes || 'No notes'}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ) : (
            <div className="p-8 text-center">
              <Ruler className="w-12 h-12 text-gray-300 mx-auto mb-3" />
              <p className="text-gray-500">No height records found for the selected period.</p>
            </div>
          )}
        </div>
      </div>

      {/* Health & Medical Records */}
      <div className="space-y-6">
        <div className="flex items-center gap-3 border-b border-gray-200 pb-3">
          <Syringe className="w-6 h-6 text-red-600" />
          <h2 className="text-2xl font-bold text-red-800">Health & Medical Records</h2>
        </div>

        {/* Vaccination Records */}
        <div className="bg-white rounded-lg border border-gray-200 overflow-hidden">
          <div className="bg-red-50 px-4 py-3 border-b border-red-200">
            <div className="flex items-center gap-2">
              <Syringe className="w-5 h-5 text-red-600" />
              <h3 className="font-semibold text-red-800">Vaccination Records</h3>
              <span className="ml-auto bg-red-100 text-red-800 text-xs px-2 py-1 rounded-full">
                {vaccinations?.length || 0} entries
              </span>
            </div>
          </div>
          {vaccinations && vaccinations.length > 0 ? (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="text-left py-3 px-4 font-medium text-gray-700">Date Administered</th>
                    <th className="text-left py-3 px-4 font-medium text-gray-700">Vaccine Name</th>
                    <th className="text-left py-3 px-4 font-medium text-gray-700">Administered By</th>
                    <th className="text-left py-3 px-4 font-medium text-gray-700">Notes</th>
                  </tr>
                </thead>
                <tbody>
                  {vaccinations.map((vaccination, index) => (
                    <tr key={index} className={index % 2 === 0 ? 'bg-white' : 'bg-gray-50'}>
                      <td className="py-3 px-4 text-gray-800">{formatDate(vaccination.date || vaccination.dateAdministered || vaccination.createdAt)}</td>
                      <td className="py-3 px-4 text-gray-800 font-medium">{vaccination.vaccineName}</td>
                      <td className="py-3 px-4 text-gray-600">{vaccination.createdBy?.name || vaccination.administeredBy || 'Healthcare Provider'}</td>
                      <td className="py-3 px-4 text-gray-600">{vaccination.notes || 'No notes'}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ) : (
            <div className="p-8 text-center">
              <Syringe className="w-12 h-12 text-gray-300 mx-auto mb-3" />
              <p className="text-gray-500">No vaccination records found for the selected period.</p>
            </div>
          )}
        </div>

        {/* Medication Records */}
        <div className="bg-white rounded-lg border border-gray-200 overflow-hidden">
          <div className="bg-orange-50 px-4 py-3 border-b border-orange-200">
            <div className="flex items-center gap-2">
              <Pill className="w-5 h-5 text-orange-600" />
              <h3 className="font-semibold text-orange-800">Medication Records</h3>
              <span className="ml-auto bg-orange-100 text-orange-800 text-xs px-2 py-1 rounded-full">
                {medications?.length || 0} entries
              </span>
            </div>
          </div>
          {medications && medications.length > 0 ? (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="text-left py-3 px-4 font-medium text-gray-700">Start Date</th>
                    <th className="text-left py-3 px-4 font-medium text-gray-700">Medication Name</th>
                    <th className="text-left py-3 px-4 font-medium text-gray-700">Dosage</th>
                    <th className="text-left py-3 px-4 font-medium text-gray-700">Prescribed By</th>
                    <th className="text-left py-3 px-4 font-medium text-gray-700">Notes</th>
                  </tr>
                </thead>
                <tbody>
                  {medications.map((medication, index) => (
                    <tr key={index} className={index % 2 === 0 ? 'bg-white' : 'bg-gray-50'}>
                      <td className="py-3 px-4 text-gray-800">{formatDate(medication.date || medication.startDate || medication.createdAt)}</td>
                      <td className="py-3 px-4 text-gray-800 font-medium">{medication.medicationName}</td>
                      <td className="py-3 px-4 text-gray-600">{medication.dosage || 'Not specified'}</td>
                      <td className="py-3 px-4 text-gray-600">{medication.createdBy?.name || medication.prescribedBy || 'Healthcare Provider'}</td>
                      <td className="py-3 px-4 text-gray-600">{medication.notes || 'No notes'}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ) : (
            <div className="p-8 text-center">
              <Pill className="w-12 h-12 text-gray-300 mx-auto mb-3" />
              <p className="text-gray-500">No medication records found for the selected period.</p>
            </div>
          )}
        </div>
      </div>

      {/* Report Summary */}
      <div className="border-t-2 border-blue-600 pt-6 text-center bg-blue-50 rounded-lg p-6">
        <div className="mb-4">
          <h3 className="text-lg font-semibold text-blue-800 mb-2">InfantFuel Healthcare Platform</h3>
          <p className="text-gray-700 mb-2">Comprehensive Healthcare and Nutrition Tracking for Infants</p>
        </div>
        <div className="text-sm text-gray-600 space-y-1">
          <p><strong>Important:</strong> This report is for informational purposes only and should not replace professional medical advice.</p>
          <p>For questions or concerns about your child&apos;s health, please consult with your healthcare provider.</p>
          <p className="mt-3 text-xs">Generated by InfantFuel • University of Ruhuna • Department of Electrical and Information Engineering</p>
        </div>
      </div>
    </div>
  );
};

// PropTypes for ReportContent component
ReportContent.propTypes = {
  babyInfo: PropTypes.shape({
    fullName: PropTypes.string,
    dateOfBirth: PropTypes.string,
    gender: PropTypes.string,
    birthWeight: PropTypes.string,
    birthHeight: PropTypes.string,
    bloodGroup: PropTypes.string,
  }),
  parentInfo: PropTypes.shape({
    fullName: PropTypes.string,
    contactNumber: PropTypes.string,
    address: PropTypes.string,
  }),
  isProvider: PropTypes.bool.isRequired,
  startDate: PropTypes.string.isRequired,
  endDate: PropTypes.string.isRequired,
  weightEntries: PropTypes.arrayOf(PropTypes.object),
  heightEntries: PropTypes.arrayOf(PropTypes.object),
  vaccinations: PropTypes.arrayOf(PropTypes.object),
  medications: PropTypes.arrayOf(PropTypes.object),
  connectedProviders: PropTypes.arrayOf(PropTypes.object),
};

export default Report;
