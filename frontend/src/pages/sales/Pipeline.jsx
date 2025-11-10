import { useState, useEffect } from 'react';
import Card from '../../components/ui/Card';
import { DollarSign, Users, Calendar, ArrowRight, CheckCircle, XCircle, Clock, AlertCircle, BarChart2, Info, Edit, Trash2, X } from 'lucide-react';
import { useUser } from '../../context/UserContext';
import axios from 'axios';
import toast from 'react-hot-toast';
import { Link } from 'react-router-dom';
import { DocumentIcon } from '@heroicons/react/24/outline';
import { ChevronUpIcon, ChevronDownIcon } from '@heroicons/react/24/outline'; 
import axiosInstance from '../../api/axios';

const Pipeline = () => {
    const [pipelineDeals, setPipelineDeals] = useState([]);
    const [isLoading, setIsLoading] = useState(true);
    const { userData, BASE_URL } = useUser();
    const [showDeleteModal, setShowDeleteModal] = useState(false);
    const [showEditModal, setShowEditModal] = useState(false);
    const [selectedPipeline, setSelectedPipeline] = useState(null);
    const [editForm, setEditForm] = useState(null);
    const [isProcessing, setIsProcessing] = useState(false);

    // Define pipeline stages with more granular options
    const stages = [
        { id: "Qualified", title: "Qualified", color: "bg-blue-50", description: "Lead has been qualified" },
        { id: "Proposal", title: "Proposal", color: "bg-indigo-50", description: "Proposal sent to client" },
        { id: "Negotiation", title: "Negotiation", color: "bg-purple-50", description: "In negotiation phase" },
        { id: "Contract", title: "Contract", color: "bg-pink-50", description: "Contract sent for signing" },
        { id: "Closed Won", title: "Closed Won", color: "bg-green-50", description: "Deal successfully closed" },
        { id: "Closed Lost", title: "Closed Lost", color: "bg-red-50", description: "Deal lost to competition" }
    ];

    useEffect(() => {
        console.log("Pipeline component mounted");
        fetchPipelineDeals();
    }, []);

    const fetchPipelineDeals = async () => {
        try {
            setIsLoading(true);
            console.log("Fetching pipeline deals for org:", userData.organization_id);
            
            const response = await axiosInstance.post(`${BASE_URL}/pipeline/get-pipeline`, {
                organization_id: userData.organization_id,
                user_id: userData.user_id
            });

            if (response.data.success) {
                console.log("Pipeline deals data:", response.data.data);
                
                // Ensure all deals have a valid pipeline_id as a string
                const validDeals = response.data.data.map(deal => ({
                    ...deal,
                    pipeline_id: String(deal.pipeline_id) // Ensure ID is a string
                }));
                
                console.log("Validated deals:", validDeals);
                setPipelineDeals(validDeals || []);
            } else {
                console.error("Failed to fetch pipeline deals:", response.data.message);
                toast.error(response.data.message || "Failed to fetch pipeline deals");
            }
        } catch (error) {
            console.error("Error fetching pipeline deals:", error);
            toast.error("Failed to fetch pipeline deals. Please try again later.");
        } finally {
            setIsLoading(false);
        }
    };

    // Group deals by stage
    const dealsByStage = stages.reduce((acc, stage) => {
        acc[stage.id] = pipelineDeals.filter(deal => deal.stage === stage.id);
        return acc;
    }, {});

    // Function to update deal stage
    const updateDealStage = async (dealId, newStage) => {
        try {
            console.log("Updating deal stage:", dealId, newStage);
            
            const response = await axiosInstance.post(`${BASE_URL}/pipeline/update-pipeline`, {
                organization_id: userData.organization_id,
                user_id: userData.user_id,
                pipeline_id: dealId,
                stage: newStage
            });

            if (response.data.success) {
                console.log("Pipeline deal updated successfully:", response.data);
                toast.success("Pipeline deal updated successfully");
                
                // Show notification for quote creation
                if (newStage === 'Closed Won' || newStage === 'Closed Lost') {
                    toast.success(`Pipeline marked as ${newStage}. A quote has been automatically created.`, {
                        duration: 5000,
                        icon: '📄'
                    });
                } else {
                    toast.success('Pipeline stage updated successfully');
                }
                
                // Optimistically update the UI
                setPipelineDeals(prevDeals => 
                    prevDeals.map(deal => 
                        deal.pipeline_id === dealId 
                            ? { ...deal, stage: newStage } 
                            : deal
                    )
                );
            } else {
                console.error("Failed to update pipeline deal:", response.data.message);
                toast.error(response.data.message || "Failed to update pipeline deal");
                // Refresh the deals to ensure UI is in sync with backend
                fetchPipelineDeals();
            }
        } catch (error) {
            console.error("Error updating pipeline deal:", error);
            toast.error("Failed to update pipeline deal. Please try again.");
            // Refresh the deals to ensure UI is in sync with backend
            fetchPipelineDeals();
        }
    };

    // Function to move a deal to the next stage
    const moveToNextStage = (deal) => {
        const currentStageIndex = stages.findIndex(stage => stage.id === deal.stage);
        if (currentStageIndex < stages.length - 1) {
            const nextStage = stages[currentStageIndex + 1].id;
            updateDealStage(deal.pipeline_id, nextStage);
        }
    };

    // Function to move a deal to a specific stage
    const moveToStage = (deal, targetStage) => {
        updateDealStage(deal.pipeline_id, targetStage);
    };

    // Function to mark a deal as closed won
    const markAsClosedWon = (deal) => {
        updateDealStage(deal.pipeline_id, "Closed Won");
    };

    // Function to mark a deal as closed lost
    const markAsClosedLost = (deal) => {
        updateDealStage(deal.pipeline_id, "Closed Lost");
    };

    // Calculate days until expected close date
    const getDaysUntilClose = (expectedCloseDate) => {
        if (!expectedCloseDate) return null;
        
        const today = new Date();
        const closeDate = new Date(expectedCloseDate);
        const diffTime = closeDate - today;
        const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
        
        return diffDays;
    };

    // Get status indicator based on days until close
    const getStatusIndicator = (daysUntilClose) => {
        if (daysUntilClose === null) return null;
        
        if (daysUntilClose < 0) {
            return { icon: <AlertCircle size={14} className="text-red-500" />, text: "Overdue", color: "text-red-500" };
        } else if (daysUntilClose <= 7) {
            return { icon: <Clock size={14} className="text-orange-500" />, text: "Due Soon", color: "text-orange-500" };
        } else {
            return { icon: <BarChart2 size={14} className="text-green-500" />, text: "On Track", color: "text-green-500" };
        }
    };

    // Delete pipeline handler
    const handleDeletePipeline = async () => {
        if (!selectedPipeline) return;
        setIsProcessing(true);
        try {
            await axiosInstance.post(`${BASE_URL}/pipeline/delete-pipeline`, {
                organization_id: userData.organization_id,
                user_id: userData.user_id,
                pipeline_id: selectedPipeline.pipeline_id
            });
            setPipelineDeals(prev => prev.filter(d => d.pipeline_id !== selectedPipeline.pipeline_id));
            toast.success('Pipeline deleted successfully');
        } catch (error) {
            toast.error('Failed to delete pipeline');
        } finally {
            setIsProcessing(false);
            setShowDeleteModal(false);
            setSelectedPipeline(null);
        }
    };

    // Edit pipeline handler
    const handleEditPipeline = (deal) => {
        setSelectedPipeline(deal);
        setEditForm({
            ...deal,
            client: deal.client,
            client_id: deal.client_id
        });
        setShowEditModal(true);
    };

    const handleEditFormChange = (e) => {
        const { name, value } = e.target;
        setEditForm(prev => ({ ...prev, [name]: value }));
    };

    const isEditFormValid = editForm && editForm.title && editForm.amount && editForm.stage && editForm.expectedCloseDate && editForm.probability !== '' && editForm.notes !== undefined;

    const handleEditFormSubmit = async (e) => {
        e.preventDefault();
        if (!isEditFormValid) return;
        setIsProcessing(true);
        try {
            await axiosInstance.post(`${BASE_URL}/pipeline/update-pipeline`, {
                organization_id: userData.organization_id,
                user_id: userData.user_id,
                pipeline_id: editForm.pipeline_id,
                title: editForm.title,
                amount: editForm.amount,
                stage: editForm.stage,
                expectedCloseDate: editForm.expectedCloseDate,
                notes: editForm.notes,
                probability: editForm.probability,
                client_id: editForm.client_id
            });
            setPipelineDeals(prev => prev.map(d => d.pipeline_id === editForm.pipeline_id ? { ...d, ...editForm } : d));
            toast.success('Pipeline updated successfully');
            setShowEditModal(false);
            setEditForm(null);
            setSelectedPipeline(null);
        } catch (error) {
            console.error('Error updating pipeline:', error);
            toast.error(error.response?.data?.message || 'Failed to update pipeline');
        } finally {
            setIsProcessing(false);
        }
    };

    return (
        <div className="w-full h-screen max-w-[1600px] bg-white p-6">
            <h1 className="text-2xl font-bold mb-6">Sales Pipeline</h1>
            
            {isLoading ? (
                <div className="flex justify-center items-center h-64">
                    <div className="animate-spin rounded-full h-10 w-10 border-t-2 border-b-2 border-blue-400"></div>
                </div>
            ) : (
                <div className="max-w-[1600px] mx-auto px-4">
                    <div className="w-full overflow-hidden rounded-lg shadow-sm">
                        <div className="flex bg-gray-100 overflow-x-auto pb-4 gap-4 scrollbar-thin scrollbar-thumb-gray-300 scrollbar-track-transparent">
                            {stages.map((stage) => (
                                <div key={stage.id} className="w-[350px] flex-shrink-0 flex flex-col">
                                    <div className={`${stage.color} p-3 rounded-t-lg flex justify-between items-start transition-all duration-300 hover:shadow-md`}>
                                        <div>
                                            <h3 className="font-semibold text-gray-700">{stage.title}</h3>
                                            <p className="text-xs text-gray-500">{stage.description}</p>
                                        </div>
                                        <div className="flex items-center">
                                            <span className="text-sm bg-white px-2 py-1 rounded-full text-gray-600">
                                                {dealsByStage[stage.id]?.length || 0}
                                            </span>
                                            <div className="ml-2 group relative">
                                                <Info size={16} className="text-gray-400 cursor-help" />
                                                <div className="absolute right-0 top-0 w-48 p-2 bg-white rounded-lg shadow-lg text-xs text-gray-600 opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-300 z-10">
                                                    {stage.description}
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                    
                                    <div className="bg-gray-100 rounded-b-lg p-2 min-h-[200px] max-h-[calc(100vh-250px)] overflow-y-auto flex flex-col gap-3 scrollbar-thin scrollbar-thumb-gray-300 scrollbar-track-transparent">
                                        {dealsByStage[stage.id]?.length > 0 ? (
                                            dealsByStage[stage.id].map((deal) => {
                                                const daysUntilClose = getDaysUntilClose(deal.expectedCloseDate);
                                                const statusIndicator = getStatusIndicator(daysUntilClose);
                                                
                                                return (
                                                    <Card key={deal.pipeline_id} className="p-4 transition-all duration-300 hover:translate-y-[-2px] hover:scale-[1.02] hover:shadow-md h-[280px] w-full flex flex-col">
                                                        <div className="flex justify-between items-start mb-2">
                                                            <h4 className="font-medium truncate max-w-[120px]">{deal.title}</h4>
                                                            <div className="flex gap-2">
                                                                <button onClick={() => {
                                                                    setSelectedPipeline(deal);
                                                                    setEditForm({ ...deal });
                                                                    setShowEditModal(true);
                                                                }} className="text-blue-500 hover:text-blue-700"><Edit size={18} /></button>
                                                                <button onClick={() => { setSelectedPipeline(deal); setShowDeleteModal(true); }} className="text-red-500 hover:text-red-700"><Trash2 size={18} /></button>
                                                            </div>
                                                        </div>
                                                        
                                                        <div className="space-y-2 flex-grow overflow-y-auto">
                                                            <div className="flex items-center text-sm text-gray-600">
                                                                <DollarSign size={16} className="mr-2" />
                                                                ${deal.amount.toLocaleString()}
                                                            </div>
                                                            
                                                            {deal.lead && (
                                                                <div className="flex items-center text-sm text-gray-600">
                                                                    <Users size={16} className="mr-2" />
                                                                    {deal.lead.company || deal.lead.name}
                                                                </div>
                                                            )}
                                                            
                                                            {deal.expectedCloseDate && (
                                                                <div className="flex items-center text-sm text-gray-600">
                                                                    <Calendar size={16} className="mr-2" />
                                                                    {new Date(deal.expectedCloseDate).toLocaleDateString()}
                                                                    {daysUntilClose !== null && (
                                                                        <span className={`ml-2 text-xs ${daysUntilClose < 0 ? 'text-red-500' : daysUntilClose <= 7 ? 'text-orange-500' : 'text-green-500'}`}>
                                                                            ({daysUntilClose < 0 ? `${Math.abs(daysUntilClose)} days overdue` : `${daysUntilClose} days left`})
                                                                        </span>
                                                                    )}
                                                                </div>
                                                            )}
                                                            
                                                            {deal.probability && (
                                                                <div className="mt-2">
                                                                    <div className="flex justify-between text-xs text-gray-500 mb-1">
                                                                        <span>Probability</span>
                                                                        <span>{deal.probability}%</span>
                                                                    </div>
                                                                    <div className="w-full bg-gray-200 rounded-full h-1.5">
                                                                        <div 
                                                                            className={`h-1.5 rounded-full ${
                                                                                deal.probability >= 80 ? 'bg-green-500' : 
                                                                                deal.probability >= 50 ? 'bg-blue-500' : 
                                                                                deal.probability >= 30 ? 'bg-yellow-500' : 
                                                                                'bg-red-500'
                                                                            }`}
                                                                            style={{ width: `${deal.probability}%` }}
                                                                        ></div>
                                                                    </div>
                                                                </div>
                                                            )}
                                                            
                                                            <div className="flex items-center justify-between mt-3 pt-2 border-t border-gray-100">
                                                                <span className="text-xs text-gray-500">
                                                                    {deal.assignedTo || 'Unassigned'}
                                                                    {deal.assignedToId && (
                                                                        <span className="ml-1 text-gray-400">
                                                                            (ID: {deal.assignedToId})
                                                                        </span>
                                                                    )}
                                                                </span>
                                                            </div>
                                                            
                                                            {/* Action buttons */}
                                                            <div className="flex justify-between mt-3 pt-2 border-t border-gray-100">
                                                                {stage.id !== "Closed Won" && stage.id !== "Closed Lost" && (
                                                                    <button
                                                                        onClick={() => moveToNextStage(deal)}
                                                                        className="flex items-center text-xs text-blue-600 hover:text-blue-800 transition-colors duration-200"
                                                                        title="Move to next stage"
                                                                    >
                                                                        <ArrowRight size={14} className="mr-1" />
                                                                        Next Stage
                                                                    </button>
                                                                )}
                                                                
                                                                {stage.id !== "Closed Won" && stage.id !== "Closed Lost" && (
                                                                    <div className="flex space-x-2">
                                                                        <button
                                                                            onClick={() => markAsClosedWon(deal)}
                                                                            className="flex items-center text-xs text-green-600 hover:text-green-800 transition-colors duration-200"
                                                                            title="Mark as Closed Won"
                                                                        >
                                                                            <CheckCircle size={14} />
                                                                        </button>
                                                                        <button
                                                                            onClick={() => markAsClosedLost(deal)}
                                                                            className="flex items-center text-xs text-red-600 hover:text-red-800 transition-colors duration-200"
                                                                            title="Mark as Closed Lost"
                                                                        >
                                                                            <XCircle size={14} />
                                                                        </button>
                                                                    </div>
                                                                )}
                                                            </div>
                                                            
                                                            {/* Stage selection dropdown */}
                                                            {stage.id !== "Closed Won" && stage.id !== "Closed Lost" && (
                                                                <div className="mt-2">
                                                                    <select 
                                                                        className="w-full text-xs p-1 border border-gray-300 rounded transition-all duration-200 focus:ring-2 focus:ring-blue-100 focus:border-blue-300"
                                                                        onChange={(e) => moveToStage(deal, e.target.value)}
                                                                        value={deal.stage}
                                                                        title="Select a stage to move this deal"
                                                                    >
                                                                        {stages.map(s => (
                                                                            <option key={s.id} value={s.id}>{s.title}</option>
                                                                        ))}
                                                                    </select>
                                                                </div>
                                                            )}
                                                        </div>
                                                    </Card>
                                                );
                                            })
                                        ) : (
                                            <div className="text-center py-8 text-gray-400 bg-white rounded-lg border border-dashed border-gray-200 transition-all duration-300 hover:border-gray-300">
                                                <p>No deals in this stage</p>
                                            </div>
                                        )}
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>
            )}
            {/* Delete Confirmation Modal */}
            {showDeleteModal && selectedPipeline && (
                <div className="fixed inset-0 bg-black bg-opacity-30 flex items-center justify-center z-50">
                    <div className="bg-white rounded-xl w-[350px] shadow-lg p-6">
                        <div className="flex justify-between items-center mb-4">
                            <h2 className="text-lg font-semibold">Delete Pipeline</h2>
                            <button onClick={() => setShowDeleteModal(false)} className="text-gray-400 hover:text-gray-600"><X size={20} /></button>
                        </div>
                        <p className="mb-6 text-gray-700">Are you sure you want to delete <span className="font-semibold">{selectedPipeline.title}</span>? This action cannot be undone.</p>
                        <div className="flex justify-end gap-2">
                            <button onClick={() => setShowDeleteModal(false)} className="px-4 py-2 border border-gray-200 rounded-md text-gray-600 hover:bg-gray-50" disabled={isProcessing}>Cancel</button>
                            <button onClick={handleDeletePipeline} className="px-4 py-2 bg-red-500 text-white rounded-md hover:bg-red-600" disabled={isProcessing}>{isProcessing ? 'Deleting...' : 'Confirm'}</button>
                        </div>
                    </div>
                </div>
            )}
            {/* Edit Modal */}
            {showEditModal && editForm && (
                <div className="fixed inset-0 bg-black bg-opacity-30 flex items-center justify-center z-50">
                    <div className="bg-white rounded-xl w-[420px] shadow-lg p-6">
                        <div className="flex justify-between items-center mb-4">
                            <h2 className="text-xl font-semibold text-gray-800">Edit Pipeline</h2>
                            <button onClick={() => { setShowEditModal(false); setEditForm(null); setSelectedPipeline(null); }} className="text-gray-400 hover:text-gray-600"><X size={20} /></button>
                        </div>
                        <form onSubmit={handleEditFormSubmit} className="space-y-4">
                            <div>
                                <label className="block text-sm font-medium text-gray-600 mb-1">Title</label>
                                <input name="title" value={editForm.title} onChange={handleEditFormChange} className="w-full p-2 border border-gray-200 rounded-md" required />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-600 mb-1">Amount</label>
                                <input name="amount" type="number" min="1" value={editForm.amount} onChange={handleEditFormChange} className="w-full p-2 border border-gray-200 rounded-md" required />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-600 mb-1">Stage</label>
                                <select name="stage" value={editForm.stage} onChange={handleEditFormChange} className="w-full p-2 border border-gray-200 rounded-md" required>
                                    {stages.map(s => <option key={s.id} value={s.id}>{s.title}</option>)}
                                </select>
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-600 mb-1">Expected Close Date</label>
                                <input name="expectedCloseDate" type="date" value={editForm.expectedCloseDate ? editForm.expectedCloseDate.slice(0,10) : ''} onChange={handleEditFormChange} className="w-full p-2 border border-gray-200 rounded-md" required />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-600 mb-1">Probability (%)</label>
                                <input name="probability" type="number" min="0" max="100" value={editForm.probability} onChange={handleEditFormChange} className="w-full p-2 border border-gray-200 rounded-md" required />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-600 mb-1">Notes</label>
                                <textarea name="notes" value={editForm.notes} onChange={handleEditFormChange} className="w-full p-2 border border-gray-200 rounded-md" rows={2} required />
                            </div>
                            <div className="flex justify-end gap-2 pt-2">
                                <button type="button" onClick={() => { setShowEditModal(false); setEditForm(null); setSelectedPipeline(null); }} className="w-[100px] px-4 py-2 border border-gray-200 rounded-md text-gray-600 hover:bg-gray-50" disabled={isProcessing}>Cancel</button>
                                <button type="submit" className="w-[100px] px-4 py-2 bg-blue-500 text-white rounded-md hover:bg-blue-600 disabled:opacity-50" disabled={isProcessing || !isEditFormValid}>{isProcessing ? 'Saving...' : 'Save'}</button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
};

export default Pipeline; 