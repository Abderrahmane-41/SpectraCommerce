import { motion } from 'framer-motion';
import React, { useState } from 'react';
import { MapPin, Plus, Edit2, Trash2, Save, X } from 'lucide-react';
import { useShippingData } from '../../hooks/useShippingData';
import { toast } from 'sonner';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '../ui/table';
import { Dialog, DialogContent, DialogTitle } from '../ui/dialog';

// --- HELPER COMPONENTS (Defined at the top level) ---

interface EditFormProps {
  editingWilaya: string | null;
  editingPrice: string;
  editingHomePrice: string;
  editingCommunes: string;
  setEditingPrice: (value: string) => void;
  setEditingHomePrice: (value: string) => void;
  setEditingCommunes: (value: string) => void;
  handleSave: () => void;
  handleCancel: () => void;
}

const EditForm = React.memo(({
  editingWilaya,
  editingPrice,
  editingHomePrice,
  editingCommunes,
  setEditingPrice,
  setEditingHomePrice,
  setEditingCommunes,
  handleSave,
  handleCancel
}: EditFormProps) => (
  <div className="p-6 space-y-6">
    <DialogTitle className="text-xl font-bold text-foreground placeholder:text-muted-foreground">
      تعديل معلومات الشحن: {editingWilaya}
    </DialogTitle>
    
    <div className="space-y-4">
      <div>
        <label className="block text-sm font-medium mb-2 text-foreground">سعر الشحن للمكتب (DA)</label>
        <input
          type="number"
          value={editingPrice}
          onChange={(e) => setEditingPrice(e.target.value)}
          className="w-full h-12 bg-background border border-border rounded-lg px-4 py-3 text-base focus:ring-2 focus:ring-primary/50 outline-none text-foreground placeholder:text-muted-foreground"
          min="0"
          step="0.01"
        />
      </div>
      
      <div>
        <label className="block text-sm font-medium mb-2 text-foreground">سعر الشحن للمنزل (DA)</label>
        <input
          type="number"
          value={editingHomePrice}
          onChange={(e) => setEditingHomePrice(e.target.value)}
          className="w-full h-12 bg-background border border-border rounded-lg px-4 py-3 text-base focus:ring-2 focus:ring-primary/50 outline-none text-foreground placeholder:text-muted-foreground"
          min="0"
          step="0.01"
          placeholder="سعر التوصيل للمنزل"
        />
      </div>

      <div>
        <label className="block text-sm font-medium mb-2 text-foreground">البلديات (مفصولة بفواصل)</label>
        <textarea
          value={editingCommunes}
          onChange={(e) => setEditingCommunes(e.target.value)}
          className="w-full min-h-[120px] bg-background border border-border rounded-lg px-4 py-3 text-base focus:ring-2 focus:ring-primary/50 outline-none text-foreground placeholder:text-muted-foreground"
          placeholder="بلدية1، بلدية2، ..."
        />
      </div>
    </div>
    
    <div className="flex space-x-3 pt-4">
      <motion.button
        onClick={handleSave}
        className="flex-1 btn-gradient flex items-center justify-center space-x-2 py-3 rounded-lg"
        whileHover={{ scale: 1.02 }}
        whileTap={{ scale: 0.98 }}
        type="button"
      >
        <Save className="w-4 h-4" />
        <span>حفظ التغييرات</span>
      </motion.button>
      <motion.button
        onClick={handleCancel}
        className="flex-1 bg-muted/20 hover:bg-muted/40 flex items-center justify-center space-x-2 py-3 rounded-lg transition-colors"
        whileHover={{ scale: 1.02 }}
        whileTap={{ scale: 0.98 }}
        type="button"
      >
        <X className="w-4 h-4 text-foreground placeholder:text-muted-foreground" />
        <span className='text-foreground placeholder:text-muted-foreground'>إلغاء</span>
      </motion.button>
    </div>
  </div>
));

interface EditModalProps extends EditFormProps {
  showEditModal: boolean;
}

const EditModal = React.memo(({ showEditModal, handleCancel, ...props }: EditModalProps) => (
  <Dialog
    open={showEditModal}
    onOpenChange={(open) => {
      if (!open) {
        handleCancel();
      }
    }}
  >
    <DialogContent
      className="sm:max-w-md p-0 overflow-hidden bg-background"
      onPointerDownOutside={(e) => e.preventDefault()}
      onEscapeKeyDown={(e) => e.preventDefault()}
      forceMount
    >
      <EditForm {...props} handleCancel={handleCancel} />
    </DialogContent>
  </Dialog>
));

// --- MAIN COMPONENT ---

const ShippingTab = () => {
  const { shippingData, loading, error, updateWilaya, addWilaya, removeWilaya } = useShippingData();
  const [editingWilaya, setEditingWilaya] = useState<string | null>(null);
  const [editingPrice, setEditingPrice] = useState<string>('');
  const [editingHomePrice, setEditingHomePrice] = useState<string>('');
  const [editingCommunes, setEditingCommunes] = useState<string>('');
  const [newWilayaName, setNewWilayaName] = useState('');
  const [newWilayaPrice, setNewWilayaPrice] = useState('');
  const [newWilayaHomePrice, setNewWilayaHomePrice] = useState('');
  const [newWilayaCommunes, setNewWilayaCommunes] = useState('');
  const [showAddForm, setShowAddForm] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
const [searchQuery, setSearchQuery] = useState('');

const shippingEntries = Object.entries(shippingData.shippingPrices);
const filteredShippingEntries = shippingEntries.filter(([wilaya]) => 
  wilaya.toLowerCase().includes(searchQuery.toLowerCase())
);


  const handleEditStart = (wilaya: string) => {
    setEditingWilaya(wilaya);
    setEditingPrice(shippingData.shippingPrices[wilaya]?.toString() || '');
    setEditingHomePrice(shippingData.shippingHomePrices[wilaya]?.toString() || '');
    setEditingCommunes(shippingData.communes[wilaya]?.join(', ') || '');
    setShowEditModal(true);
  };

  const handleModalSave = async () => {
    if (!editingWilaya) return;
    
    try {
      const price = parseFloat(editingPrice);
      if (isNaN(price) || price < 0) {
        toast.error('الرجاء إدخال سعر صحيح للشحن');
        return;
      }
      const homePrice = parseFloat(editingHomePrice);
      if (isNaN(homePrice) || homePrice < 0) {
        toast.error('الرجاء إدخال سعر صحيح للتوصيل المنزلي');
        return;
      }
      const communes = editingCommunes.split(',').map(c => c.trim()).filter(c => c.length > 0);
      
      await updateWilaya(editingWilaya, price, homePrice, communes);

      
      handleModalCancel();
      toast.success('تم تحديث معلومات الشحن بنجاح');
    } catch (error) {
      console.error('Error saving changes:', error);
      toast.error('فشل تحديث معلومات الشحن');
    }
  };

  const handleModalCancel = () => {
    setEditingWilaya(null);
    setEditingPrice('');
    setEditingHomePrice('');
    setEditingCommunes('');
    setShowEditModal(false);
  };

  const handleAddWilaya = async () => {
    if (!newWilayaName.trim()) {
      toast.error('الرجاء إدخال اسم الولاية');
      return;
    }

    const price = parseFloat(newWilayaPrice);
    if (isNaN(price) || price < 0) {
      toast.error('الرجاء إدخال سعر صحيح');
      return;
    }
    
    const homePrice = parseFloat(newWilayaHomePrice);
    if (isNaN(homePrice) || homePrice < 0) {
      toast.error('الرجاء إدخال سعر صحيح للتوصيل المنزلي');
      return;
    }

    if (shippingData.shippingPrices[newWilayaName]) {
      toast.error('هذه الولاية موجودة بالفعل');
      return;
    }

    try {
      const communes = newWilayaCommunes.split(',').map(c => c.trim()).filter(c => c.length > 0);
      
      await addWilaya(newWilayaName, price, communes, homePrice);

      setNewWilayaName('');
      setNewWilayaPrice('');
      setNewWilayaHomePrice('');
      setNewWilayaCommunes('');
      setShowAddForm(false);
      toast.success('تمت إضافة الولاية بنجاح');
    } catch (error) {
      console.error('Error adding wilaya:', error);
      toast.error('فشل إضافة الولاية');
    }
  };

  const handleRemoveWilaya = async (wilaya: string) => {
    if (window.confirm(`هل أنت متأكد أنك تريد إزالة ${wilaya}؟`)) {
      try {
        await removeWilaya(wilaya);
        toast.success('تمت إزالة الولاية بنجاح');
      } catch (error) {
        console.error('Error removing wilaya:', error);
        toast.error('فشل إزالة الولاية');
      }
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex flex-col items-center justify-center h-64 space-y-4">
        <p className="text-red-500">خطأ في تحميل بيانات الشحن: {error}</p>
        <button
          onClick={() => window.location.reload()}
          className="btn-gradient px-4 py-2 rounded-lg"
        >
          إعادة المحاولة
        </button>
      </div>
    );
  }
  return (
    <div className="space-y-6">
      <motion.div
        className="flex justify-between items-center"
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
      >
        <div>
          <h2 className="text-2xl font-bold gradient-text">إدارة أسعار الشحن</h2>
        </div>
        <motion.button
          onClick={() => setShowAddForm(!showAddForm)}
          className="btn-gradient flex items-center space-x-2 px-4 py-2 rounded-lg"
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
        >
          <Plus className="w-4 h-4" />
          <span>إضافة ولاية</span>
        </motion.button>
      </motion.div>

      {showAddForm && (
        <motion.div
          className="glass-effect p-6 rounded-xl"
          initial={{ opacity: 0, height: 0 }}
          animate={{ opacity: 1, height: 'auto' }}
          exit={{ opacity: 0, height: 0 }}
        >
          <h3 className="text-lg font-semibold mb-4 text-foreground">إضافة ولاية جديدة</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <div>
              <label className="block text-sm font-medium mb-2 text-foreground">اسم الولاية</label>
              <input
                type="text"
                value={newWilayaName}
                onChange={(e) => setNewWilayaName(e.target.value)}
                className="w-full bg-background border border-border rounded-lg px-4 py-2 focus:ring-2 focus:ring-primary/50 outline-none"
                placeholder="أدخل اسم الولاية"
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-2 text-foreground">سعر الشحن للمكتب (دج)</label>
              <input
                type="number"
                value={newWilayaPrice}
                onChange={(e) => setNewWilayaPrice(e.target.value)}
                className="w-full bg-background border border-border rounded-lg px-4 py-2 focus:ring-2 focus:ring-primary/50 outline-none"
                placeholder="أدخل السعر"
                min="0"
                step="0.01"
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-2 text-foreground">سعر التوصيل للمنزل (دج)</label>
              <input
                type="number"
                value={newWilayaHomePrice}
                onChange={(e) => setNewWilayaHomePrice(e.target.value)}
                className="w-full bg-background border border-border rounded-lg px-4 py-2 focus:ring-2 focus:ring-primary/50 outline-none"
                placeholder="أدخل سعر التوصيل للمنزل"
                min="0"
                step="0.01"
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-2 text-foreground">البلديات (مفصولة بفواصل)</label>
              <input
                type="text"
                value={newWilayaCommunes}
                onChange={(e) => setNewWilayaCommunes(e.target.value)}
                className="w-full bg-background border border-border rounded-lg px-4 py-2 focus:ring-2 focus:ring-primary/50 outline-none"
                placeholder="بلدية1، بلدية2، ..."
              />
            </div>
          </div>
          <div className="flex space-x-3 mt-4">
            <button
              onClick={handleAddWilaya}
              className="btn-gradient flex items-center space-x-2 px-4 py-2 rounded-lg"
            >
              <Save className="w-4 h-4" />
              <span>إضافة ولاية</span>
            </button>
            <button
              onClick={() => setShowAddForm(false)}
              className="px-4 py-2 bg-muted/20 hover:bg-muted/40 rounded-lg transition-colors"
            >
              إلغاء
            </button>
          </div>
        </motion.div>
      )}

      {shippingEntries.length > 0 ? (
        <motion.div
          className="glass-effect rounded-xl overflow-hidden"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
        >
          <div className="p-4 border-b border-border bg-muted/20">
  <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3">
    <h3 className="text-lg font-semibold flex items-center space-x-2">
      <MapPin className="w-5 h-5" />
      <span>قواعد الشحن ({filteredShippingEntries.length}/{shippingEntries.length})</span>
    </h3>
    
          <div className="relative w-full sm:w-64 md:w-72">
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="البحث عن ولاية..."
              className="w-full pr-10 pl-4 py-2 bg-background/70 border border-border rounded-lg focus:ring-2 focus:ring-primary/50 outline-none"
            />
            <div className="absolute inset-y-0 right-0 flex items-center pr-3 pointer-events-none">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 text-muted-foreground" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
              </svg>
            </div>
          </div>
        </div>
      </div>
          
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="w-[150px]">الولاية </TableHead>
                  <TableHead className="w-[150px]">للمكتب (DA)</TableHead>
                  <TableHead className="w-[150px]">للمنزل (DA)</TableHead>
                  <TableHead>البلديات</TableHead>
                  <TableHead className="w-[100px]">التغييرات</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredShippingEntries.map(([wilaya, price]) => (
                  <TableRow key={wilaya}>
                    <TableCell><span className="font-medium">{wilaya}</span></TableCell>
                    <TableCell><span className="font-semibold text-primary">{price} DA</span></TableCell>
                    <TableCell><span className="font-semibold text-blue-400">{shippingData.shippingHomePrices[wilaya]} DA</span></TableCell>
                    <TableCell>
                      {shippingData.communes[wilaya] && shippingData.communes[wilaya].length > 0 ? (
                        <div className="flex flex-wrap gap-1 max-w-xs">
                          {shippingData.communes[wilaya].slice(0, 3).map((commune) => (
                            <span key={commune} className="px-2 py-1 bg-muted/50 rounded-full text-xs">{commune}</span>
                          ))}
                          {shippingData.communes[wilaya].length > 3 && (
                            <span className="px-2 py-1 bg-muted/50 rounded-full text-xs">
                              +{shippingData.communes[wilaya].length - 3} المزيد
                            </span>
                          )}
                        </div>
                      ) : (
                        <span className="text-muted-foreground text-sm">لاتوجد بلديات</span>
                      )}
                    </TableCell>
                    <TableCell>
                      <div className="flex space-x-2">
                        <motion.button onClick={() => handleEditStart(wilaya)} className="p-1 hover:bg-blue-500/20 text-blue-600 rounded" title="تعديل"><Edit2 className="w-4 h-4" /></motion.button>
                        <motion.button onClick={() => handleRemoveWilaya(wilaya)} className="p-1 hover:bg-red-500/20 text-red-500 rounded" title="حذف"><Trash2 className="w-4 h-4" /></motion.button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
                              {/* Add this "no results" case */}
                {filteredShippingEntries.length === 0 && (
                  <TableRow>
                    <TableCell colSpan={5} className="h-24 text-center">
                      <div className="flex flex-col items-center justify-center text-muted-foreground">
                        <MapPin className="w-8 h-8 mb-2" />
                        <p>لا توجد نتائج للبحث</p>
                        {searchQuery && (
                          <button 
                            onClick={() => setSearchQuery('')}
                            className="mt-2 text-primary hover:underline"
                          >
                            مسح البحث
                          </button>
                        )}
                      </div>
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </div>
        </motion.div>
      ) : (
        <motion.div
          className="text-center py-12 glass-effect rounded-xl"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
        >
          <MapPin className="w-16 h-16 text-muted-foreground mx-auto mb-4" />
          <h3 className="text-lg font-semibold text-foreground mb-2">لا توجد مناطق شحن</h3>
          <p className="text-muted-foreground mb-4">أضف أول ولاية للبدء في إدارة أسعار ومواقع الشحن.</p>
          <button onClick={() => setShowAddForm(true)} className="btn-gradient px-4 py-2 rounded-lg">إضافة أول ولاية</button>
        </motion.div>
      )}

      {showEditModal && (
        <EditModal
          showEditModal={showEditModal}
          editingWilaya={editingWilaya}
          editingPrice={editingPrice}
          editingHomePrice={editingHomePrice}
          editingCommunes={editingCommunes}
          setEditingPrice={setEditingPrice}
          setEditingHomePrice={setEditingHomePrice}
          setEditingCommunes={setEditingCommunes}
          handleSave={handleModalSave}
          handleCancel={handleModalCancel}
        />
      )}
    </div>
  );
};

export default ShippingTab;