import { useState, useEffect } from 'react';
import { inventoryService, academicService } from '../../../services/api';
import { toast } from 'sonner';
import { Plus, Search, Pencil, Trash, Package, CheckCircle, Share2, X } from 'lucide-react';

export const ManageInventory = ({ onNavigate }: any) => {
  const [inventory, setInventory] = useState<any[]>([]);
  const [allocations, setAllocations] = useState<any[]>([]);
  const [classes, setClasses] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isAllocateModalOpen, setIsAllocateModalOpen] = useState(false);
  const [editingItem, setEditingItem] = useState<any>(null);
  const [selectedInventoryForAllocation, setSelectedInventoryForAllocation] = useState<any>(null);
  const [showAllocations, setShowAllocations] = useState(false);
  const [activeFilter, setActiveFilter] = useState<'all' | 'available' | 'out_of_stock' | 'allocated'>('all');

  // Auto-calculate status from quantity
  const getStatusFromQuantity = (qty: number) => {
    if (qty <= 0) return 'out_of_stock';
    return 'available';
  };

  const getStatusLabel = (qty: number) => {
    if (qty <= 0) return { label: 'Out of Stock', cls: 'bg-red-100 text-red-700' };
    return { label: 'In Stock', cls: 'bg-emerald-100 text-emerald-700' };
  };

  // Form State
  const [formData, setFormData] = useState({
    item_name: '',
    category: 'Stationery',
    quantity: 0,
    description: ''
  });

  const [allocationData, setAllocationData] = useState({
    class_id: '',
    quantity: 1,
    reason: ''
  });

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      setLoading(true);
      const [inv, classesData, allocs] = await Promise.all([
        inventoryService.getAll(),
        academicService.getAllClasses(),
        inventoryService.getAllocations()
      ]);
      setInventory(inv);
      setClasses(classesData);
      setAllocations(allocs);
    } catch (error) {
      toast.error('Failed to load data');
    } finally {
      setLoading(false);
    }
  };

  const handleOpenModal = (item: any = null) => {
    if (item) {
      setEditingItem(item);
      setFormData({
        item_name: item.item_name,
        category: item.category,
        quantity: item.quantity,
        description: item.description || ''
      });
    } else {
      setEditingItem(null);
      setFormData({
        item_name: '',
        category: 'Stationery',
        quantity: 0,
        description: ''
      });
    }
    setIsModalOpen(true);
  };

  const handleOpenAllocateModal = (item: any) => {
    setSelectedInventoryForAllocation(item);
    setAllocationData({
      class_id: '',
      quantity: 1,
      reason: ''
    });
    setIsAllocateModalOpen(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    // Auto-derive status before sending to backend
    const payload = { ...formData, status: getStatusFromQuantity(formData.quantity) };
    try {
      if (editingItem) {
        await inventoryService.update(editingItem.id, payload);
        toast.success('Inventory item updated');
      } else {
        await inventoryService.create(payload);
        toast.success('Inventory item added');
      }
      setIsModalOpen(false);
      fetchData();
    } catch (error) {
      toast.error('Operation failed');
    }
  };

  const handleAllocateSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!allocationData.class_id || allocationData.quantity <= 0) {
      toast.error('Please fill required fields');
      return;
    }
    if (allocationData.quantity > (selectedInventoryForAllocation?.quantity || 0)) {
      toast.error('Quantity exceeds available stock');
      return;
    }

    try {
      await inventoryService.allocate({
        inventory_id: selectedInventoryForAllocation.id,
        class_id: parseInt(allocationData.class_id),
        quantity: allocationData.quantity,
        reason: allocationData.reason
      });
      toast.success('Inventory allocated to class');
      setIsAllocateModalOpen(false);
      fetchData();
    } catch (error) {
      toast.error('Allocation failed');
    }
  };

  const handleDelete = async (id: number) => {
    if (window.confirm('Are you sure you want to delete this item?')) {
      try {
        await inventoryService.delete(id);
        toast.success('Item deleted');
        fetchData();
      } catch (error) {
        toast.error('Failed to delete item');
      }
    }
  };

  const categories = ['Stationery', 'Electronics', 'Sports', 'Furniture', 'Lab Equipment', 'Books', 'Other'];

  // Map DB status values to display labels + colors
  const statusDisplay = (status: string) => {
    if (status === 'available' || status === 'In Stock') return { label: 'In Stock', cls: 'bg-emerald-100 text-emerald-700' };
    if (status === 'out_of_stock' || status === 'Out of Stock') return { label: 'Out of Stock', cls: 'bg-red-100 text-red-700' };
    return { label: 'In Stock', cls: 'bg-emerald-100 text-emerald-700' };
  };

  const filteredInventory = inventory.filter(item => {
    const matchesSearch =
      item.item_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      item.category.toLowerCase().includes(searchTerm.toLowerCase());
    if (!matchesSearch) return false;
    if (activeFilter === 'all') return true;
    const normalizedStatus = item.status === 'In Stock' ? 'available'
      : item.status === 'Out of Stock' ? 'out_of_stock'
      : item.status === 'Low Stock' ? 'available'  // legacy low_stock treated as available
      : item.status === 'low_stock' ? 'available'
      : item.status;
    return normalizedStatus === activeFilter;
  });

  return (
    <div className="space-y-8 animate-in fade-in duration-500 max-w-[1600px] mx-auto pb-20">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 pb-6 border-b border-gray-100">
        <div>
          <h1 className="text-4xl font-black text-gray-900 tracking-tight mb-2">Inventory Management</h1>
          <p className="text-gray-500 font-medium">Manage school assets and allocate resources to classes.</p>
        </div>
        <div className="flex gap-4">
          <button
            onClick={() => setShowAllocations(!showAllocations)}
            className={`flex items-center gap-2 px-6 py-3 rounded-2xl transition hover:shadow-lg active:scale-95 font-black uppercase tracking-widest text-xs border-2 ${showAllocations ? 'bg-emerald-50 border-emerald-500 text-emerald-600' : 'bg-white border-gray-200 text-gray-600'}`}
          >
            <Share2 size={18} />
            {showAllocations ? 'View Inventory' : 'View Allocations'}
          </button>
          <button
            onClick={() => handleOpenModal()}
            className="flex items-center gap-2 px-8 py-4 bg-gray-900 text-white rounded-[1.5rem] hover:bg-blue-600 transition shadow-xl shadow-gray-200 active:scale-95 font-black uppercase tracking-widest text-xs"
          >
            <Plus size={20} />
            Add New Item
          </button>
        </div>
      </div>

      {loading ? (
        <div className="flex justify-center items-center h-64">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
        </div>
      ) : !showAllocations ? (
        <>
          {/* Stats Section — Clickable Filter Cards */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {/* Total Assets — all items registered by admin */}
            <button
              onClick={() => { setActiveFilter('all'); setShowAllocations(false); }}
              className={`p-6 rounded-[2rem] shadow-xl border flex items-center gap-6 text-left transition-all hover:scale-[1.02] active:scale-95 ${
                activeFilter === 'all' && !showAllocations
                  ? 'bg-blue-600 border-blue-600 shadow-blue-200'
                  : 'bg-white border-gray-50 shadow-gray-100 hover:border-blue-300'
              }`}
            >
              <div className={`p-4 rounded-2xl ${activeFilter === 'all' && !showAllocations ? 'bg-white/20 text-white' : 'bg-blue-50 text-blue-600'}`}><Package size={32} /></div>
              <div>
                <p className={`text-xs font-black uppercase tracking-widest ${activeFilter === 'all' && !showAllocations ? 'text-blue-100' : 'text-gray-400'}`}>Total Assets</p>
                <p className={`text-2xl font-black ${activeFilter === 'all' && !showAllocations ? 'text-white' : 'text-gray-900'}`}>{inventory.length}</p>
              </div>
            </button>

            {/* In Stock — available items */}
            <button
              onClick={() => { setActiveFilter('available'); setShowAllocations(false); }}
              className={`p-6 rounded-[2rem] shadow-xl border flex items-center gap-6 text-left transition-all hover:scale-[1.02] active:scale-95 ${
                activeFilter === 'available' && !showAllocations
                  ? 'bg-emerald-600 border-emerald-600 shadow-emerald-200'
                  : 'bg-white border-gray-50 shadow-gray-100 hover:border-emerald-300'
              }`}
            >
              <div className={`p-4 rounded-2xl ${activeFilter === 'available' && !showAllocations ? 'bg-white/20 text-white' : 'bg-emerald-50 text-emerald-600'}`}><CheckCircle size={32} /></div>
              <div>
                <p className={`text-xs font-black uppercase tracking-widest ${activeFilter === 'available' && !showAllocations ? 'text-emerald-100' : 'text-gray-400'}`}>In Stock</p>
                <p className={`text-2xl font-black ${activeFilter === 'available' && !showAllocations ? 'text-white' : 'text-gray-900'}`}>
                  {inventory.filter(i => i.status === 'available' || i.status === 'In Stock' || i.status === 'Low Stock' || i.status === 'low_stock').length}
                </p>
              </div>
            </button>

            {/* Allocated */}
            <button
              onClick={() => { setActiveFilter('allocated'); setShowAllocations(true); }}
              className={`p-6 rounded-[2rem] shadow-xl border flex items-center gap-6 text-left transition-all hover:scale-[1.02] active:scale-95 ${
                showAllocations
                  ? 'bg-red-500 border-red-500 shadow-red-200'
                  : 'bg-white border-gray-50 shadow-gray-100 hover:border-red-300'
              }`}
            >
              <div className={`p-4 rounded-2xl ${showAllocations ? 'bg-white/20 text-white' : 'bg-red-50 text-red-600'}`}><Share2 size={32} /></div>
              <div>
                <p className={`text-xs font-black uppercase tracking-widest ${showAllocations ? 'text-red-100' : 'text-gray-400'}`}>Allocated</p>
                <p className={`text-2xl font-black ${showAllocations ? 'text-white' : 'text-gray-900'}`}>{allocations.length}</p>
              </div>
            </button>
          </div>

          <div className="bg-white rounded-[2.5rem] shadow-2xl shadow-gray-200/50 border border-gray-100 overflow-hidden">
            <div className="p-8 border-b border-gray-100 flex flex-col md:flex-row md:items-center justify-between gap-6">
              <div className="relative flex-1 max-w-md">
                <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" size={20} />
                <input
                  type="text"
                  placeholder="Search assets by name or category..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full pl-12 pr-6 py-4 bg-gray-50 border-none rounded-2xl focus:ring-4 focus:ring-blue-50 transition-all outline-none font-bold"
                />
              </div>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left">
                <thead>
                  <tr className="text-xs font-black uppercase tracking-[0.2em] text-gray-400 border-b border-gray-50">
                    <th className="px-8 py-5">Asset Detail</th>
                    <th className="px-8 py-5">Category</th>
                    <th className="px-8 py-5 text-center">Quantity</th>
                    <th className="px-8 py-5">Status</th>
                    <th className="px-8 py-5 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-50">
                  {filteredInventory.map((item) => (
                    <tr key={item.id} className="hover:bg-blue-50/50 transition-colors group">
                      <td className="px-8 py-6">
                        <div className="font-black text-gray-900 uppercase tracking-tight group-hover:text-blue-600 transition-colors">{item.item_name}</div>
                        <div className="text-xs font-bold text-gray-400 truncate max-w-xs">{item.description || 'No description'}</div>
                      </td>
                      <td className="px-8 py-6 text-sm font-bold text-gray-600">{item.category}</td>
                      <td className="px-8 py-6 text-center">
                        <span className={`px-4 py-1 rounded-full text-xs font-black ${item.quantity < 10 ? 'bg-red-50 text-red-600' : 'bg-blue-50 text-blue-600'}`}>
                          {item.quantity}
                        </span>
                      </td>
                      <td className="px-8 py-6">
                        <span className={`px-4 py-1 rounded-full text-[10px] font-black uppercase tracking-widest ${statusDisplay(item.status).cls}`}>
                          {statusDisplay(item.status).label}
                        </span>
                      </td>
                      <td className="px-8 py-6 text-right">
                        <div className="flex justify-end gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                          <button
                            onClick={() => handleOpenAllocateModal(item)}
                            className="p-3 bg-white text-emerald-600 border border-emerald-100 rounded-xl hover:bg-emerald-600 hover:text-white transition shadow-sm"
                            title="Allocate to Class"
                          >
                            <Share2 size={18} />
                          </button>
                          <button
                            onClick={() => handleOpenModal(item)}
                            className="p-3 bg-white text-blue-600 border border-blue-100 rounded-xl hover:bg-blue-600 hover:text-white transition shadow-sm"
                            title="Edit Item"
                          >
                            <Pencil size={18} />
                          </button>
                          <button
                            onClick={() => handleDelete(item.id)}
                            className="p-3 bg-white text-red-600 border border-red-100 rounded-xl hover:bg-red-600 hover:text-white transition shadow-sm"
                            title="Delete Item"
                          >
                            <Trash size={18} />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </>
      ) : (
        /* Allocations Multi-View */
        <div className="bg-white rounded-[2.5rem] shadow-2xl shadow-gray-200/50 border border-gray-100 overflow-hidden animate-in slide-in-from-right-4">
          <div className="p-8 bg-emerald-50/50 border-b border-gray-100 flex justify-between items-center">
            <h2 className="text-2xl font-black text-gray-900 tracking-tight">Class Resource Allocations</h2>
            <span className="px-4 py-1.5 bg-emerald-100 rounded-full text-[10px] font-black text-emerald-600 uppercase tracking-widest">Tracking Active Allocations</span>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-left">
              <thead>
                <tr className="text-xs font-black uppercase tracking-[0.2em] text-gray-400 border-b border-gray-50">
                  <th className="px-8 py-5">Resource</th>
                  <th className="px-8 py-5">Target Class</th>
                  <th className="px-8 py-5 text-center">Qty</th>
                  <th className="px-8 py-5">Allocation Reason</th>
                  <th className="px-8 py-5 text-right">Date</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-50">
                {allocations.map((a: any) => (
                  <tr key={a.id} className="hover:bg-emerald-50/30 transition-colors">
                    <td className="px-8 py-5 font-black text-gray-900 uppercase tracking-tight">{a.item_name}</td>
                    <td className="px-8 py-5 font-black text-blue-600 uppercase tracking-tight">{a.class_name}</td>
                    <td className="px-8 py-5 text-center font-bold text-gray-900">{a.quantity}</td>
                    <td className="px-8 py-5 text-xs text-gray-500 font-medium italic">{a.reason || 'Standard Issue'}</td>
                    <td className="px-8 py-5 text-right text-[10px] font-bold text-gray-400">
                      {a.allocated_at && !isNaN(new Date(a.allocated_at).getTime()) 
                        ? new Date(a.allocated_at).toLocaleDateString() 
                        : 'N/A'
                      }
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
            {allocations.length === 0 && (
              <div className="p-20 text-center text-gray-400 font-bold italic">No active allocations found.</div>
            )}
          </div>
        </div>
      )}

      {/* Item Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-black/40 backdrop-blur-md flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-[2.5rem] w-full max-w-lg shadow-2xl animate-in fade-in zoom-in duration-200">
            <div className="p-8 border-b border-gray-100 flex justify-between items-center">
              <div>
                <h2 className="text-2xl font-black text-gray-900 tracking-tight">{editingItem ? 'Edit Asset' : 'Add New Asset'}</h2>
                <p className="text-sm text-gray-500 font-bold uppercase tracking-widest">Inventory Management</p>
              </div>
              <button
                onClick={() => setIsModalOpen(false)}
                className="p-3 hover:bg-gray-100 rounded-2xl text-gray-400 transition"
              >
                <X size={24} />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="p-8 space-y-6">
              <div className="grid grid-cols-2 gap-4">
                <div className="col-span-2">
                  <label className="block text-xs font-black text-gray-400 uppercase tracking-[0.2em] mb-2 px-1">Asset Name</label>
                  <input
                    type="text"
                    required
                    value={formData.item_name}
                    onChange={(e) => setFormData({ ...formData, item_name: e.target.value })}
                    className="w-full px-5 py-4 rounded-2xl bg-gray-50 border border-transparent focus:bg-white focus:border-blue-400 focus:ring-4 focus:ring-blue-50 outline-none transition-all font-bold"
                  />
                </div>
                <div>
                  <label className="block text-xs font-black text-gray-400 uppercase tracking-[0.2em] mb-2 px-1">Category</label>
                  <select
                    value={formData.category}
                    onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                    className="w-full px-5 py-4 rounded-2xl bg-gray-50 border border-transparent focus:bg-white focus:border-blue-400 focus:ring-4 focus:ring-blue-50 outline-none transition-all font-bold appearance-none"
                  >
                    {categories.map(c => <option key={c} value={c}>{c}</option>)}
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-black text-gray-400 uppercase tracking-[0.2em] mb-2 px-1">Quantity</label>
                  <input
                    type="number"
                    required
                    min={0}
                    value={formData.quantity}
                    onChange={(e) => setFormData({ ...formData, quantity: parseInt(e.target.value) || 0 })}
                    className="w-full px-5 py-4 rounded-2xl bg-gray-50 border border-transparent focus:bg-white focus:border-blue-400 focus:ring-4 focus:ring-blue-50 outline-none transition-all font-bold"
                  />
                </div>
              </div>
              {/* Live auto-status preview */}
              <div className="flex items-center gap-3 p-4 bg-gray-50 rounded-2xl">
                <span className="text-xs font-black text-gray-400 uppercase tracking-widest">Auto Status:</span>
                <span className={`px-4 py-1 rounded-full text-[10px] font-black uppercase tracking-widest ${getStatusLabel(formData.quantity).cls}`}>
                  {getStatusLabel(formData.quantity).label}
                </span>
                <span className="text-xs text-gray-400 font-medium">— updates automatically based on quantity</span>
              </div>

              <div>
                <label className="block text-xs font-black text-gray-400 uppercase tracking-[0.2em] mb-2 px-1">Description</label>
                <textarea
                  rows={3}
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  className="w-full px-5 py-4 rounded-2xl bg-gray-50 border border-transparent focus:bg-white focus:border-blue-400 focus:ring-4 focus:ring-blue-50 outline-none transition-all font-bold resize-none"
                />
              </div>

              <div className="flex gap-3 pt-4">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="flex-1 py-4 text-gray-500 font-black uppercase tracking-widest text-xs hover:bg-gray-100 rounded-2xl transition"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="flex-[2] py-4 bg-gray-900 text-white font-black uppercase tracking-widest text-xs rounded-2xl hover:bg-blue-600 transition-all active:scale-95"
                >
                  {editingItem ? 'Save Changes' : 'Add to Inventory'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Allocation Modal */}
      {isAllocateModalOpen && (
        <div className="fixed inset-0 bg-black/40 backdrop-blur-md flex items-center justify-center z-[60] p-4">
          <div className="bg-white rounded-[2.5rem] w-full max-w-lg shadow-2xl animate-in fade-in zoom-in duration-200">
            <div className="p-8 border-b border-gray-100 flex justify-between items-center bg-gray-50/30">
              <div>
                <h2 className="text-2xl font-black text-gray-900 tracking-tight">Allocate Resource</h2>
                <p className="text-sm text-blue-600 font-bold uppercase tracking-widest mt-1">{selectedInventoryForAllocation?.item_name}</p>
              </div>
              <button
                onClick={() => setIsAllocateModalOpen(false)}
                className="p-3 hover:bg-gray-200 rounded-2xl text-gray-400 transition"
              >
                <X size={24} />
              </button>
            </div>

            <form onSubmit={handleAllocateSubmit} className="p-8 space-y-6">
              <div>
                <label className="block text-xs font-black text-gray-400 uppercase tracking-[0.2em] mb-2 px-1">Target Class</label>
                <select
                  required
                  value={allocationData.class_id}
                  onChange={e => setAllocationData({ ...allocationData, class_id: e.target.value })}
                  className="w-full px-5 py-4 rounded-2xl bg-gray-50 border border-transparent focus:bg-white focus:border-blue-400 outline-none transition-all font-bold"
                >
                  <option value="">Select Class</option>
                  {classes.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
                </select>
              </div>

              <div>
                <label className="block text-xs font-black text-gray-400 uppercase tracking-[0.2em] mb-2 px-1">Quantity to Allocate (Max {selectedInventoryForAllocation?.quantity})</label>
                <input
                  type="number"
                  max={selectedInventoryForAllocation?.quantity}
                  min={1}
                  required
                  value={allocationData.quantity}
                  onChange={e => setAllocationData({ ...allocationData, quantity: parseInt(e.target.value) })}
                  className="w-full px-5 py-4 rounded-2xl bg-gray-50 border border-transparent focus:bg-white focus:border-blue-400 outline-none transition-all font-bold"
                />
              </div>

              <div>
                <label className="block text-xs font-black text-gray-400 uppercase tracking-[0.2em] mb-2 px-1">Reason / Purpose</label>
                <input
                  type="text"
                  value={allocationData.reason}
                  placeholder="e.g. New Student Intake"
                  onChange={e => setAllocationData({ ...allocationData, reason: e.target.value })}
                  className="w-full px-5 py-4 rounded-2xl bg-gray-50 border border-transparent focus:bg-white focus:border-blue-400 outline-none transition-all font-bold"
                />
              </div>

              <div className="pt-4">
                <button
                  type="submit"
                  className="w-full py-5 bg-emerald-600 text-white font-black uppercase tracking-widest text-xs rounded-2xl hover:bg-emerald-700 hover:shadow-2xl hover:shadow-emerald-200 transition-all active:scale-95 flex items-center justify-center gap-3"
                >
                  <Share2 size={18} />
                  Confirm Allocation
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
