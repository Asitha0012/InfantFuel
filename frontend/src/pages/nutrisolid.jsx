import { useState, useEffect } from "react";
import { useSelector } from "react-redux";
import { useNavigate } from "react-router-dom";
import { toast } from "react-toastify";
import Navbar from "../Components/Navbar";
import Footer from "../Components/Footer";
import Loader from "../Components/Loader";
import {
  UtensilsCrossed,
  Plus,
  Clock,
  Baby,
  ChefHat,
  Scale,
  StickyNote,
  Smile,
  Meh,
  Frown,
  AlertTriangle,
  Edit3,
  Trash2,
  BarChart3,
  Search,
  TrendingUp,
  Apple,
  Carrot,
  Wheat,
  Beef,
  Milk,
  MoreHorizontal,
  ArrowLeft
} from "lucide-react";
import {
  useCreateSolidFoodIntakeMutation,
  useGetSolidFoodRecordsQuery,
  useUpdateSolidFoodIntakeMutation,
  useDeleteSolidFoodIntakeMutation,
  useGetSolidFoodStatsQuery,
} from "../redux/api/nutritionSolid";
import { useGetConnectedBabyProfilesForHeightQuery } from "../redux/api/heights";

const foodTypeIcons = {
  fruits: Apple,
  vegetables: Carrot,
  grains: Wheat,
  protein: Beef,
  dairy: Milk,
  other: MoreHorizontal,
};

const foodTypeColors = {
  fruits: "bg-red-100 text-red-600 border-red-200",
  vegetables: "bg-green-100 text-green-600 border-green-200",
  grains: "bg-yellow-100 text-yellow-600 border-yellow-200",
  protein: "bg-purple-100 text-purple-600 border-purple-200",
  dairy: "bg-blue-100 text-blue-600 border-blue-200",
  other: "bg-gray-100 text-gray-600 border-gray-200",
};

const reactionIcons = {
  good: { icon: Smile, color: "text-green-500", bg: "bg-green-50" },
  neutral: { icon: Meh, color: "text-yellow-500", bg: "bg-yellow-50" },
  dislike: { icon: Frown, color: "text-orange-500", bg: "bg-orange-50" },
  allergic: { icon: AlertTriangle, color: "text-red-500", bg: "bg-red-50" },
};

const predefinedFoods = {
  fruits: ["Mashed Banana", "Apple Sauce", "Pureed Pear", "Mashed Avocado", "Strawberry Puree"],
  vegetables: ["Boiled Carrot", "Pumpkin Puree", "Sweet Potato Mash", "Broccoli Puree", "Pea Puree"],
  grains: ["Rice Porridge", "Oatmeal", "Baby Cereal", "Quinoa Porridge", "Millet Porridge"],
  protein: ["Boiled Egg Yolk", "Chicken Puree", "Fish Puree", "Lentil Puree", "Tofu Mash"],
  dairy: ["Yogurt", "Cheese Cubes", "Milk Porridge"],
  other: ["Mixed Vegetable Puree", "Fruit Mix", "Custom Food"]
};

export default function SolidNutrition() {
  const navigate = useNavigate();
  const { userInfo } = useSelector((state) => state.auth);
  const isProvider = userInfo?.isAdmin === true;
  
  // States
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingRecord, setEditingRecord] = useState(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [filterType, setFilterType] = useState("");
  const [filterMealTime, setFilterMealTime] = useState("");
  const [filterReaction, setFilterReaction] = useState("");
  const [selectedParentId, setSelectedParentId] = useState(null);
  const [showDropdown, setShowDropdown] = useState(false);
  const [confirmDeleteId, setConfirmDeleteId] = useState(null);
  const [formData, setFormData] = useState({
  // Parent side: childName inferred from profile; provider side: view only
  childName: userInfo?.babyDetails?.fullName || "",
    foodType: "",
    foodName: "",
    amount: "",
    unit: "grams",
    mealTime: "",
    time: new Date().toISOString().slice(0, 16),
    notes: "",
    reaction: ""
  });

  // API hooks
  const [createSolidFoodIntake, { isLoading: isCreating }] = useCreateSolidFoodIntakeMutation();
  const [updateSolidFoodIntake, { isLoading: isUpdating }] = useUpdateSolidFoodIntakeMutation();
  const [deleteSolidFoodIntake, { isLoading: isDeleting }] = useDeleteSolidFoodIntakeMutation();
  
  // Provider: fetch connected profiles via heights API (consistent pattern)
  const { data: connectedProfiles = [], isLoading: loadingProfiles } = useGetConnectedBabyProfilesForHeightQuery(undefined, { skip: !isProvider });

  // Initialize provider selection
  useEffect(() => {
    if (isProvider && connectedProfiles.length > 0 && !selectedParentId) {
      setSelectedParentId(connectedProfiles[0]._id);
    }
  }, [isProvider, connectedProfiles, selectedParentId]);

  const { data: records = [], isLoading } = useGetSolidFoodRecordsQuery({
    parentId: isProvider ? selectedParentId : undefined,
    foodType: filterType || undefined,
    mealTime: filterMealTime || undefined,
  }, { skip: isProvider && !selectedParentId });
  
  const { data: stats } = useGetSolidFoodStatsQuery({
    parentId: isProvider ? selectedParentId : undefined,
  }, { skip: isProvider && !selectedParentId });

  // Effects
  useEffect(() => {
    if (!userInfo) {
      navigate("/login");
    }
  }, [userInfo, navigate]);

  // Parent: ensure childName follows profile
  useEffect(() => {
    if (!isProvider && userInfo?.babyDetails?.fullName) {
      setFormData(prev => ({ ...prev, childName: userInfo.babyDetails.fullName }));
    }
  }, [userInfo, isProvider]);

  // Handlers
  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value,
      ...(name === "foodType" && { foodName: "" }) // Reset food name when type changes
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
  // Parent has single child; childName is prefilled
  if (!formData.foodType || !formData.foodName || !formData.amount || !formData.mealTime) {
      toast.error("Please fill in all required fields");
      return;
    }

    try {
      // Provider cannot create/edit; guard
      if (isProvider) {
        toast.error("Healthcare providers cannot add or edit solid food entries.");
        return;
      }

      if (editingRecord) {
        await updateSolidFoodIntake({ id: editingRecord._id, ...formData, amount: parseFloat(formData.amount) }).unwrap();
        toast.success("Record updated successfully!");
      } else {
        await createSolidFoodIntake({ ...formData, amount: parseFloat(formData.amount) }).unwrap();
        toast.success("Record added successfully!");
      }
      
      resetForm();
    } catch (error) {
      toast.error(error.data?.message || "Something went wrong");
    }
  };

  const resetForm = () => {
    setFormData({
  childName: userInfo?.babyDetails?.fullName || "",
      foodType: "",
      foodName: "",
      amount: "",
      unit: "grams",
      mealTime: "",
      time: new Date().toISOString().slice(0, 16),
      notes: "",
      reaction: ""
    });
    setEditingRecord(null);
    setIsFormOpen(false);
  };

  const handleEdit = (record) => {
  setConfirmDeleteId(null);
    setFormData({
      childName: record.childName,
      foodType: record.foodType,
      foodName: record.foodName,
      amount: record.amount.toString(),
      unit: record.unit,
      mealTime: record.mealTime,
      time: new Date(record.time).toISOString().slice(0, 16),
      notes: record.notes || "",
      reaction: record.reaction || ""
    });
    setEditingRecord(record);
    setIsFormOpen(true);
  };

  const handleDelete = async (id) => {
    try {
      await deleteSolidFoodIntake(id).unwrap();
      setConfirmDeleteId(null);
      toast.success("Record deleted successfully!");
    } catch (error) {
      toast.error(error.data?.message || "Failed to delete record");
    }
  };

  const filteredRecords = records.filter(record => {
    const matchesSearch = record.foodName.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesReaction = !filterReaction || record.reaction === filterReaction;
    return matchesSearch && matchesReaction;
  });

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  if (isLoading) return <Loader />;

  return (
    <>
      <Navbar />
      <div className="min-h-screen bg-gradient-to-br from-orange-50 via-red-50 to-pink-50">
        <div className="max-w-7xl mx-auto px-4 py-8">
          {/* Header */}
          <div className="bg-white rounded-2xl shadow-lg p-8 mb-8">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-4">
                <div className="p-3 bg-orange-100 rounded-xl">
                  <UtensilsCrossed className="h-8 w-8 text-orange-600" />
                </div>
                <div>
                  <h1 className="text-3xl font-bold text-gray-900">Solid Food Nutrition</h1>
                  <p className="text-gray-600">Track your baby’s solid food journey</p>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <button
                  onClick={() => navigate("/tracker")}
                  className="px-4 py-2 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-lg flex items-center gap-2"
                >
                  <ArrowLeft className="h-4 w-4" /> Back
                </button>
                {!isProvider && (
                  <button
                    onClick={() => setIsFormOpen(true)}
                    className="flex items-center space-x-2 px-6 py-3 bg-orange-600 text-white rounded-xl hover:bg-orange-700 transition-all duration-200 shadow-lg hover:shadow-xl"
                  >
                    <Plus className="h-5 w-5" />
                    <span>Add Entry</span>
                  </button>
                )}
              </div>
            </div>
          </div>

          {/* Provider profile selector */}
          {isProvider && (
            <div className="bg-white rounded-2xl shadow-lg p-6 mb-8">
              <div className="flex items-center gap-4 flex-wrap">
                <div className="flex-1 min-w-80">
                  <label className="block text-sm font-medium text-gray-700 mb-2">Select Baby Profile</label>
                  <div className="relative">
                    <div
                      className="w-full bg-white border border-gray-300 rounded-lg px-4 py-3 cursor-pointer flex items-center justify-between"
                      onClick={() => setShowDropdown(!showDropdown)}
                    >
                      <div className="text-gray-600">
                        {loadingProfiles
                          ? "Loading profiles..."
                          : connectedProfiles.find(p => p._id === selectedParentId)?.babyDetails?.fullName ||
                            connectedProfiles.find(p => p._id === selectedParentId)?.fullName ||
                            "Select a profile"}
                      </div>
                      <Search className="w-5 h-5 text-gray-400" />
                    </div>
                    {showDropdown && (
                      <div className="absolute top-full left-0 right-0 mt-1 bg-white border border-gray-300 rounded-lg shadow-lg z-10 max-h-60 overflow-hidden">
                        <div className="p-3 border-b">
                          <input
                            type="text"
                            placeholder="Search by parent or baby name..."
                            className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-orange-500 text-gray-900 placeholder-gray-500 bg-white"
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            autoFocus
                          />
                        </div>
                        <div className="max-h-48 overflow-y-auto">
                          {connectedProfiles
                            .filter(profile => {
                              const parentName = profile.fullName?.toLowerCase() || "";
                              const babyName = profile.babyDetails?.fullName?.toLowerCase() || "";
                              return parentName.includes(searchTerm.toLowerCase()) || babyName.includes(searchTerm.toLowerCase());
                            })
                            .map(profile => (
                              <div
                                key={profile._id}
                                className="p-3 hover:bg-gray-50 cursor-pointer border-b last:border-b-0"
                                onClick={() => { setSelectedParentId(profile._id); setShowDropdown(false); setSearchTerm(""); }}
                              >
                                <div className="font-medium text-gray-900">{profile.fullName}</div>
                                <div className="text-sm text-gray-500">Baby: {profile.babyDetails?.fullName || 'Not set'}</div>
                              </div>
                            ))}
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Statistics Cards */}
          {stats && (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
              <div className="bg-white rounded-xl p-6 shadow-lg">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-gray-600">Total Meals</p>
                    <p className="text-2xl font-bold text-gray-900">
                      {stats.byMealTime?.reduce((acc, item) => acc + item.totalMeals, 0) || 0}
                    </p>
                  </div>
                  <ChefHat className="h-8 w-8 text-blue-500" />
                </div>
              </div>
              
              <div className="bg-white rounded-xl p-6 shadow-lg">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-gray-600">Food Types</p>
                    <p className="text-2xl font-bold text-gray-900">
                      {stats.byFoodType?.length || 0}
                    </p>
                  </div>
                  <Apple className="h-8 w-8 text-red-500" />
                </div>
              </div>
              
              <div className="bg-white rounded-xl p-6 shadow-lg">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-gray-600">This Week</p>
                    <p className="text-2xl font-bold text-gray-900">
                      {records.filter(r => 
                        new Date(r.time) >= new Date(Date.now() - 7 * 24 * 60 * 60 * 1000)
                      ).length}
                    </p>
                  </div>
                  <TrendingUp className="h-8 w-8 text-green-500" />
                </div>
              </div>
              
              <div className="bg-white rounded-xl p-6 shadow-lg">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-gray-600">Positive Reactions</p>
                    <p className="text-2xl font-bold text-gray-900">
                      {records.filter(r => r.reaction === 'good').length}
                    </p>
                  </div>
                  <Smile className="h-8 w-8 text-yellow-500" />
                </div>
              </div>
            </div>
          )}

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Records List (view-only for providers) */}
            <div className="lg:col-span-2">
              <div className="bg-white rounded-2xl shadow-lg">
                {/* Filters */}
                <div className="p-6 border-b border-gray-200">
                  <div className="flex flex-wrap gap-4">
                    <div className="flex-1 min-w-64">
                      <div className="relative">
                        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                        <input
                          type="text"
                          placeholder="Search by food name..."
                          value={searchTerm}
                          onChange={(e) => setSearchTerm(e.target.value)}
                          className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                        />
                      </div>
                    </div>
                    <select
                      value={filterType}
                      onChange={(e) => setFilterType(e.target.value)}
                      className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                    >
                      <option value="">All Food Types</option>
                      <option value="fruits">Fruits</option>
                      <option value="vegetables">Vegetables</option>
                      <option value="grains">Grains</option>
                      <option value="protein">Protein</option>
                      <option value="dairy">Dairy</option>
                      <option value="other">Other</option>
                    </select>
                    <select
                      value={filterMealTime}
                      onChange={(e) => setFilterMealTime(e.target.value)}
                      className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                    >
                      <option value="">All Meals</option>
                      <option value="breakfast">Breakfast</option>
                      <option value="lunch">Lunch</option>
                      <option value="dinner">Dinner</option>
                      <option value="snack">Snack</option>
                    </select>
                    <select
                      value={filterReaction}
                      onChange={(e) => setFilterReaction(e.target.value)}
                      className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                    >
                      <option value="">All Reactions</option>
                      <option value="good">Good</option>
                      <option value="neutral">Neutral</option>
                      <option value="dislike">Dislike</option>
                      <option value="allergic">Allergic</option>
                    </select>
                  </div>
                </div>

                {/* Records */}
                <div className="p-6">
                  {filteredRecords.length === 0 ? (
                    <div className="text-center py-12">
                      <UtensilsCrossed className="h-16 w-16 text-gray-300 mx-auto mb-4" />
                      <h3 className="text-lg font-medium text-gray-900 mb-2">No records found</h3>
                      <p className="text-gray-600">Start tracking your baby’s solid food journey!</p>
                    </div>
                  ) : (
                    <div className="space-y-4">
                      {filteredRecords.map((record) => {
                        const FoodIcon = foodTypeIcons[record.foodType] || MoreHorizontal;
                        const reactionInfo = reactionIcons[record.reaction];
                        
                        return (
                          <div key={record._id} className="border border-gray-200 rounded-xl p-4 hover:shadow-md transition-shadow">
                            <div className="flex items-start justify-between">
                              <div className="flex items-start space-x-4 flex-1">
                                <div className={`p-2 rounded-lg border ${foodTypeColors[record.foodType]}`}>
                                  <FoodIcon className="h-5 w-5" />
                                </div>
                                <div className="flex-1">
                                  <div className="flex items-center space-x-2 mb-1">
                                    <h4 className="font-semibold text-gray-900">{record.foodName}</h4>
                                    <span className="text-xs px-2 py-1 bg-gray-100 text-gray-600 rounded-full capitalize">
                                      {record.mealTime}
                                    </span>
                                  </div>
                                  <div className="flex items-center space-x-4 text-sm text-gray-600 mb-2">
                                    <span className="flex items-center space-x-1">
                                      <Baby className="h-4 w-4" />
                                      <span>{record.childName}</span>
                                    </span>
                                    <span className="flex items-center space-x-1">
                                      <Scale className="h-4 w-4" />
                                      <span>{record.amount} {record.unit}</span>
                                    </span>
                                    <span className="flex items-center space-x-1">
                                      <Clock className="h-4 w-4" />
                                      <span>{formatDate(record.time)}</span>
                                    </span>
                                  </div>
                                  {record.notes && (
                                    <p className="text-sm text-gray-600 mb-2">{record.notes}</p>
                                  )}
                                  {reactionInfo && (
                                    <div className={`inline-flex items-center space-x-1 px-2 py-1 rounded-full text-xs ${reactionInfo.bg}`}>
                                      <reactionInfo.icon className={`h-3 w-3 ${reactionInfo.color}`} />
                                      <span className="capitalize">{record.reaction}</span>
                                    </div>
                                  )}
                                </div>
                              </div>
                              {!isProvider && (
                                <div className="flex items-center space-x-2">
                                  {confirmDeleteId === record._id ? (
                                    <div className="flex items-center gap-2">
                                      <span className="text-sm text-gray-600">Delete?</span>
                                      <button
                                        onClick={() => handleDelete(record._id)}
                                        disabled={isDeleting}
                                        className="px-2 py-1 text-white bg-red-600 rounded hover:bg-red-700 disabled:opacity-50"
                                      >
                                        {isDeleting ? "Deleting..." : "Yes"}
                                      </button>
                                      <button
                                        onClick={() => setConfirmDeleteId(null)}
                                        className="px-2 py-1 text-gray-700 bg-gray-100 rounded hover:bg-gray-200"
                                      >
                                        No
                                      </button>
                                    </div>
                                  ) : (
                                    <>
                                      <button
                                        onClick={() => handleEdit(record)}
                                        className="p-2 text-gray-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                                      >
                                        <Edit3 className="h-4 w-4" />
                                      </button>
                                      <button
                                        onClick={() => setConfirmDeleteId(record._id)}
                                        className="p-2 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                                      >
                                        <Trash2 className="h-4 w-4" />
                                      </button>
                                    </>
                                  )}
                                </div>
                              )}
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  )}
                </div>
              </div>
            </div>

            {/* Food Type Statistics */}
            <div className="space-y-6">
              {stats?.byFoodType && (
                <div className="bg-white rounded-2xl shadow-lg p-6">
                  <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center space-x-2">
                    <BarChart3 className="h-5 w-5" />
                    <span>Food Type Distribution</span>
                  </h3>
                  <div className="space-y-3">
                    {stats.byFoodType.map((item) => {
                      const FoodIcon = foodTypeIcons[item._id] || MoreHorizontal;
                      const total = stats.byFoodType.reduce((acc, food) => acc + food.mealCount, 0);
                      const percentage = total > 0 ? (item.mealCount / total * 100).toFixed(1) : 0;
                      
                      return (
                        <div key={item._id} className="flex items-center space-x-3">
                          <div className={`p-2 rounded-lg ${foodTypeColors[item._id]}`}>
                            <FoodIcon className="h-4 w-4" />
                          </div>
                          <div className="flex-1">
                            <div className="flex justify-between items-center mb-1">
                              <span className="text-sm font-medium capitalize">{item._id}</span>
                              <span className="text-xs text-gray-600">{percentage}%</span>
                            </div>
                            <div className="w-full bg-gray-200 rounded-full h-2">
                              <div 
                                className="h-2 rounded-full bg-gradient-to-r from-orange-400 to-red-500"
                                style={{ width: `${percentage}%` }}
                              ></div>
                            </div>
                            <p className="text-xs text-gray-600 mt-1">{item.mealCount} meals</p>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>

  {/* Form Modal (parent only) */}
  {isFormOpen && !isProvider && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
            <div className="bg-white rounded-2xl shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
              <div className="p-6 border-b border-gray-200">
                <h2 className="text-2xl font-bold text-gray-900">
                  {editingRecord ? "Edit Record" : "Add New Record"}
                </h2>
              </div>
              
              <form onSubmit={handleSubmit} className="p-6 space-y-6">

                {/* Food Type and Name */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      <ChefHat className="inline h-4 w-4 mr-1" />
                      Food Type *
                    </label>
                    <select
                      name="foodType"
                      value={formData.foodType}
                      onChange={handleInputChange}
                      className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                      required
                    >
                      <option value="">Select Food Type</option>
                      <option value="fruits">Fruits</option>
                      <option value="vegetables">Vegetables</option>
                      <option value="grains">Grains</option>
                      <option value="protein">Protein</option>
                      <option value="dairy">Dairy</option>
                      <option value="other">Other</option>
                    </select>
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Food Name *
                    </label>
                    {formData.foodType ? (
                      <select
                        name="foodName"
                        value={formData.foodName}
                        onChange={handleInputChange}
                        className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                        required
                      >
                        <option value="">Select Food</option>
                        {predefinedFoods[formData.foodType]?.map((food) => (
                          <option key={food} value={food}>{food}</option>
                        ))}
                      </select>
                    ) : (
                      <input
                        type="text"
                        name="foodName"
                        value={formData.foodName}
                        onChange={handleInputChange}
                        placeholder="Enter food name"
                        className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                        required
                      />
                    )}
                  </div>
                </div>

                {/* Amount and Unit */}
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      <Scale className="inline h-4 w-4 mr-1" />
                      Amount *
                    </label>
                    <input
                      type="number"
                      name="amount"
                      value={formData.amount}
                      onChange={handleInputChange}
                      min="0"
                      step="0.1"
                      className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                      required
                    />
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Unit *
                    </label>
                    <select
                      name="unit"
                      value={formData.unit}
                      onChange={handleInputChange}
                      className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                      required
                    >
                      <option value="grams">Grams</option>
                      <option value="tablespoons">Tablespoons</option>
                      <option value="pieces">Pieces</option>
                      <option value="servings">Servings</option>
                    </select>
                  </div>
                </div>

                {/* Meal Time and Time */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Meal Time *
                    </label>
                    <select
                      name="mealTime"
                      value={formData.mealTime}
                      onChange={handleInputChange}
                      className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                      required
                    >
                      <option value="">Select Meal Time</option>
                      <option value="breakfast">Breakfast</option>
                      <option value="lunch">Lunch</option>
                      <option value="dinner">Dinner</option>
                      <option value="snack">Snack</option>
                    </select>
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      <Clock className="inline h-4 w-4 mr-1" />
                      Date & Time *
                    </label>
                    <input
                      type="datetime-local"
                      name="time"
                      value={formData.time}
                      onChange={handleInputChange}
                      className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                      required
                    />
                  </div>
                </div>

                {/* Reaction */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Reaction
                  </label>
                  <select
                    name="reaction"
                    value={formData.reaction}
                    onChange={handleInputChange}
                    className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                  >
                    <option value="">No reaction recorded</option>
                    <option value="good">Good</option>
                    <option value="neutral">Neutral</option>
                    <option value="dislike">Dislike</option>
                    <option value="allergic">Allergic</option>
                  </select>
                </div>

                {/* Notes */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    <StickyNote className="inline h-4 w-4 mr-1" />
                    Notes
                  </label>
                  <textarea
                    name="notes"
                    value={formData.notes}
                    onChange={handleInputChange}
                    rows={3}
                    placeholder="Any observations, preparation notes, or reactions..."
                    className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                  />
                </div>

                {/* Buttons */}
                <div className="flex justify-end space-x-4 pt-4">
                  <button
                    type="button"
                    onClick={resetForm}
                    className="px-6 py-3 text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200 transition-colors"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={isCreating || isUpdating}
                    className="px-6 py-3 bg-orange-600 text-white rounded-lg hover:bg-orange-700 transition-colors disabled:opacity-50 flex items-center space-x-2"
                  >
                    {(isCreating || isUpdating) && <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>}
                    <span>{editingRecord ? "Update Record" : "Add Record"}</span>
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}
      </div>
      <Footer />
    </>
  );
}




