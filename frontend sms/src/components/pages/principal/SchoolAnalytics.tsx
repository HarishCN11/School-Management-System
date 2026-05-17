import { useState, useEffect } from 'react';
import { inventoryService } from '../../../services/api';
import { 
  Package, 
  ArrowLeft, 
  Loader2, 
  Archive,
  ArrowRightLeft
} from 'lucide-react';

export const SchoolAnalytics = ({ onNavigate }: any) => {
  const [inventory, setInventory] = useState<any[]>([]);
  const [allocations, setAllocations] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      const [invData, allocData] = await Promise.all([
        inventoryService.getAll(),
        inventoryService.getAllocations()
      ]);
      setInventory(invData);
      setAllocations(allocData);
    } catch (error) {
      console.error('Error fetching inventory details:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <Loader2 className="animate-spin text-blue-600" size={48} />
      </div>
    );
  }

  return (
    <div className="space-y-8 animate-in slide-in-from-right-4 duration-500">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <button onClick={() => onNavigate('principal-dashboard')} className="p-2 hover:bg-gray-100 rounded-full transition">
            <ArrowLeft size={24} />
          </button>
          <h1 className="text-2xl font-bold text-gray-900">Resource & Inventory Analytics</h1>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Main List */}
        <div className="lg:col-span-2 space-y-6">
          <div className="flex items-center justify-between">
            <h2 className="text-xl font-bold text-gray-900 flex items-center gap-2">
              <Archive size={20} className="text-blue-600" />
              Complete Inventory
            </h2>
          </div>
          
          <div className="bg-white rounded-3xl shadow-sm border border-gray-100 overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="bg-gray-50 border-b border-gray-100">
                    <th className="px-6 py-4 text-xs font-bold text-gray-400 uppercase tracking-wider">Item Name</th>
                    <th className="px-6 py-4 text-xs font-bold text-gray-400 uppercase tracking-wider">Total Stock</th>
                    <th className="px-6 py-4 text-xs font-bold text-gray-400 uppercase tracking-wider">Last Updated</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-50">
                  {inventory.map((item, idx) => (
                    <tr key={idx} className="hover:bg-blue-50/30 transition">
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-3">
                          <div className="p-2 bg-blue-50 rounded-lg text-blue-600">
                            <Package size={18} />
                          </div>
                          <span className="font-bold text-gray-900">{item.item_name}</span>
                        </div>
                      </td>
                      <td className="px-6 py-4 font-mono font-bold text-gray-700">{item.quantity}</td>

                      <td className="px-6 py-4 text-sm text-gray-500">
                         {(() => {
                           if (!item.last_updated) return 'N/A';
                           const d = new Date(item.last_updated);
                           return isNaN(d.getTime()) ? 'N/A' : d.toLocaleDateString();
                         })()}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>

        {/* Allocations Sidebar */}
        <div className="space-y-6">
          <h2 className="text-xl font-bold text-gray-900 flex items-center gap-2">
            <ArrowRightLeft size={20} className="text-indigo-600" />
            Recent Allocations
          </h2>
          <div className="space-y-4">
            {allocations.slice(0, 5).map((alloc, idx) => (
              <div key={idx} className="bg-white p-5 rounded-2xl shadow-sm border border-gray-100 space-y-3">
                <div className="flex justify-between items-start">
                  <span className="text-xs font-black text-indigo-600 uppercase tracking-tighter">Allocated to Room {alloc.room_number || 'N/A'}</span>
                  <span className="text-xs font-bold text-gray-400">{new Date(alloc.allocated_at).toLocaleDateString()}</span>
                </div>
                <h4 className="font-bold text-gray-900">{alloc.item_name}</h4>
                <div className="flex items-center justify-between pt-2 border-t border-gray-50">
                  <span className="text-sm text-gray-500">Quantity: <b className="text-gray-900 font-black">{alloc.quantity}</b></span>
                  <span className="text-[10px] bg-gray-100 text-gray-600 px-2 py-1 rounded-md font-bold truncate max-w-[100px]">{alloc.reason}</span>
                </div>
              </div>
            ))}
            <button className="w-full py-4 text-sm font-bold text-gray-500 hover:text-blue-600 hover:bg-white rounded-2xl transition border-2 border-dashed border-gray-100">
              View All History
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
