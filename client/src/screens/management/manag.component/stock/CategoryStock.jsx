import React, { useState, useEffect, useContext } from 'react';
import axios from 'axios';
import { detacontext } from '../../../../App';
import { toast } from 'react-toastify';
import '../orders/Orders.css';

const CategoryStock = () => {
  const apiUrl = process.env.REACT_APP_API_URL;
  const token = localStorage.getItem('token_e'); // Retrieve the token from localStorage
  const config = {
    headers: {
      'Authorization': `Bearer ${token}`,
    },
  };

  const { 
    restaurantData, 
    permissionsList, 
    setStartDate, 
    setEndDate, 
    filterByDateRange, 
    filterByTime,
    employeeLoginInfo,  
    formatDate, 
    formatDateTime, 
    setisLoading, 
    EditPagination, 
    startpagination, 
    endpagination, 
    setstartpagination, 
    setendpagination 
  } = useContext(detacontext);

  const stockCategoriesPermission = permissionsList && permissionsList.filter(permission => permission.resource === 'stock Categories')[0];

  const [categoryName, setCategoryName] = useState('');
  const [categoryCode, setCategoryCode] = useState('');
  const [notes, setNotes] = useState('');
  const [categoryStockId, setCategoryStockId] = useState('');
  const [allCategoryStock, setAllCategoryStock] = useState([]);
  const [allStockItems, setAllStockItems] = useState([]);

  const getAllCategoryStock = async () => {
    if (!token) {
      toast.error('رجاء تسجيل الدخول مره اخري');
      return;
    }

    try {
      if (stockCategoriesPermission && !stockCategoriesPermission.read) {
        toast.warn('ليس لك صلاحية لعرض تصنيفات المخزن');
        return;
      }
      const response = await axios.get(apiUrl + "/api/categoryStock/", config);
      setAllCategoryStock(response.data.reverse());
    } catch (error) {
      console.error('Error fetching category stock:', error);
      toast.error('حدث خطأ اثناء جلب بيانات التصنيفات ! اعد تحميل الصفحة');
    }
  };

  const getAllStockItem = async () => {
    try {
      if (!token) {
        toast.error('رجاء تسجيل الدخول مره اخري');
        return;
      }
      const response = await axios.get(apiUrl + '/api/stockitem/', config);
      if (response) {
        const stockItems = response.data.reverse();
        setAllStockItems(stockItems);
      } else {
        toast.warn('حدث خطا اثناء جلب بيانات اصناف المخزن ! اعد تحميل الصفحة');
      }
    } catch (error) {
      console.log(error);
    }
  };

  const createCategoryStock = async (e) => {
    e.preventDefault();
    if (!token) {
      toast.error('رجاء تسجيل الدخول مره اخري');
      return;
    }

    try {
      if (stockCategoriesPermission && !stockCategoriesPermission.create) {
        toast.warn('ليس لك صلاحية لاضافه تصنيفات المخزن');
        return;
      }
      // Validate fields
      if (!categoryName.trim() || !categoryCode.trim()) {
        toast.error("اسم التصنيف ورمز التصنيف مطلوبان");
        return;
      }

      const response = await axios.post(apiUrl + "/api/categoryStock/", 
        { name: categoryName, code: categoryCode, notes }, config);

      if (response.status === 201) {
        toast.success("تم إنشاء التصنيف بنجاح");
      } else {
        console.error({ error: response.data.message });
        toast.error("حدث خطأ أثناء إنشاء التصنيف. يرجى المحاولة مرة أخرى.");
      }
      getAllCategoryStock();
    } catch (error) {
      console.error("Error creating category stock:", error);
      if (error.response && error.response.data.error === 'Category name already exists') {
        toast.error('هذا التصنيف موجود بالفعل');
      } else {
        toast.error("حدث خطأ غير متوقع. يرجى المحاولة مرة أخرى.");
      }
    }
  };

  const editCategoryStock = async (e) => {
    e.preventDefault();
    if (!token) {
      toast.error('رجاء تسجيل الدخول مره اخري');
      return;
    }

    try {
      if (stockCategoriesPermission && !stockCategoriesPermission.update) {
        toast.warn('ليس لك صلاحية لتعديل تصنيفات المخزن');
        return;
      }
      const edit = await axios.put(apiUrl + "/api/categoryStock/" + categoryStockId, 
        { name: categoryName, code: categoryCode, notes }, config);

      if (edit.status === 200) {
        toast.success("تم تعديل التصنيف بنجاح");
      } else if (edit.data.error === 'Category name already exists') {
        toast.error('هذا التصنيف موجود بالفعل');
      }
      getAllCategoryStock(); // Fetch updated category stock data
      getAllStockItem(); // Fetch updated stock item data
    } catch (error) {
      console.log(error);
      toast.error("حدث خطأ أثناء تعديل التصنيف. يرجى المحاولة مرة أخرى.");
    }
  };

  const deleteCategoryStock = async (e) => {
    e.preventDefault();

    if (!token) {
      toast.error('رجاء تسجيل الدخول مره اخري');
      return;
    }

    try {
      if (stockCategoriesPermission && !stockCategoriesPermission.delete) {
        toast.warn('ليس لك صلاحية لحذف تصنيفات المخزن');
        return;
      }
      const deleted = await axios.delete(apiUrl + "/api/categoryStock/" + categoryStockId, config);

      if (deleted) {
        getAllCategoryStock(); // Fetch updated category stock data
        getAllStockItem(); // Fetch updated stock item data
        toast.success("تم حذف التصنيف بنجاح");
      }
    } catch (error) {
      console.log(error);
      toast.error("حدث خطأ أثناء حذف التصنيف. يرجى المحاولة مرة أخرى.");
    }
  };

  const searchByCategoryStock = (categoryStock) => {
    if (!categoryStock) {
      getAllCategoryStock();
      return;
    }
    const categories = allCategoryStock.filter((category) => category.name.startsWith(categoryStock) === true);
    setAllStockItems(categories);
  };

  useEffect(() => {
    getAllStockItem();
    getAllCategoryStock();
  }, []);

  return (
    <div className="w-100 px-3 d-flex align-items-center justify-content-start">
      <div className="table-responsive">
        <div className="table-wrapper p-3 mw-100">
          <div className="table-title">
            <div className="w-100 d-flex flex-wrap align-items-center justify-content-between">
              <div className="text-right">
                <h2>إدارة <b>اقسام المخزن</b></h2>
              </div>
              {stockCategoriesPermission.create &&
                <div className="col-12 col-md-6 p-0 m-0 d-flex flex-wrap align-items-center justify-content-end print-hide">
                  <a href="#addCategoryStockModal" className="d-flex align-items-center justify-content-center h-100 m-0 btn btn-success" data-toggle="modal">
                    <span>اضافه تصنيف</span>
                  </a>
                </div>
              }
            </div>
          </div>
          <div className="table-filter print-hide">
            <div className="col-12 text-dark d-flex flex-wrap align-items-center justify-content-start p-0 m-0">
              <div className="filter-group d-flex flex-wrap align-items-center justify-content-between p-0 mb-1">
                <label className="form-label text-wrap text-right fw-bolder p-0 m-0">عرض</label>
                <select className="form-control border-primary m-0 p-2 h-auto" onChange={(e) => { setstartpagination(0); setendpagination(e.target.value); }}>
                  {
                    (() => {
                      const options = [];
                      for (let i = 5; i < 100; i += 5) {
                        options.push(<option key={i} value={i}>{i}</option>);
                      }
                      return options;
                    })()
                  }
                </select>
              </div>
              <div className="filter-group d-flex flex-wrap align-items-center justify-content-between p-0 mb-1">
                <label className="form-label text-wrap text-right fw-bolder p-0 m-0">اسم التصنيف</label>
                <input type="text" className="form-control border-primary m-0 p-2 h-auto" onChange={(e) => searchByCategoryStock(e.target.value)} />
              </div>
            </div>
          </div>

          <table className="table table-striped table-hover">
            <thead>
              <tr>
                <th>م</th>
                <th>الاسم</th>
                <th>عدد المنتجات</th>
                <th>اضيف في</th>
                <th>اجراءات</th>
              </tr>
            </thead>
            <tbody>
              {allCategoryStock && allCategoryStock.map((categoryStock, i) => {
                if (i >= startpagination && i < endpagination) {
                  return (
                    <tr key={i}>
                      <td>{i + 1}</td>
                      <td>{categoryStock.name}</td>
                      <td>{categoryStock.items.length}</td>
                      <td>{formatDate(categoryStock.createdAt)}</td>
                      <td>
                        {stockCategoriesPermission && (stockCategoriesPermission.update || stockCategoriesPermission.delete) &&
                          <div className="d-flex flex-wrap align-items-center justify-content-around">
                            {stockCategoriesPermission.update &&
                              <a href="#editCategoryStockModal" onClick={() => {
                                setCategoryName(categoryStock.name);
                                setCategoryCode(categoryStock.code);
                                setNotes(categoryStock.notes || '');
                                setCategoryStockId(categoryStock._id);
                              }} className="edit" data-toggle="modal">
                                <i className="material-icons" data-toggle="tooltip" title="Edit"></i>
                              </a>
                            }
                            {stockCategoriesPermission.delete &&
                              <a href="#deleteCategoryStockModal" onClick={() => setCategoryStockId(categoryStock._id)} className="delete" data-toggle="modal">
                                <i className="material-icons" data-toggle="tooltip" title="Delete"></i>
                              </a>
                            }
                          </div>
                        }
                      </td>
                    </tr>
                  );
                } else {
                  return null;
                }
              })}
            </tbody>
          </table>
          <div className="d-flex flex-wrap align-items-center justify-content-between print-hide">
            <div className="text-right">
              <p className="text-dark">عرض من {startpagination + 1} إلى {endpagination} من {allCategoryStock.length} تصنيف</p>
            </div>
            <nav>
              <ul className="pagination">
                <li className="page-item">
                  <button onClick={() => { if (startpagination > 0) { setstartpagination(startpagination - endpagination); setendpagination(startpagination); } }} className="page-link">السابق</button>
                </li>
                <li className="page-item">
                  <button onClick={() => { if (endpagination < allCategoryStock.length) { setstartpagination(startpagination + endpagination); setendpagination(endpagination + endpagination); } }} className="page-link">التالي</button>
                </li>
              </ul>
            </nav>
          </div>
        </div>
      </div>

      <div id="addCategoryStockModal" className="modal fade" role="dialog">
        <div className="modal-dialog">
          <div className="modal-content">
            <div className="modal-header">
              <h4 className="modal-title">اضافه تصنيف</h4>
              <button type="button" className="close" data-dismiss="modal">&times;</button>
            </div>
            <div className="modal-body">
              <form onSubmit={createCategoryStock}>
                <div className="form-group">
                  <label>اسم التصنيف</label>
                  <input type="text" className="form-control" value={categoryName} onChange={(e) => setCategoryName(e.target.value)} required />
                </div>
                <div className="form-group">
                  <label>رمز التصنيف</label>
                  <input type="text" className="form-control" value={categoryCode} onChange={(e) => setCategoryCode(e.target.value)} required />
                </div>
                <div className="form-group">
                  <label>ملاحظات</label>
                  <textarea className="form-control" value={notes} onChange={(e) => setNotes(e.target.value)}></textarea>
                </div>
                <div className="form-group text-right">
                  <button type="submit" className="btn btn-success">حفظ</button>
                  <button type="button" className="btn btn-danger" data-dismiss="modal">إلغاء</button>
                </div>
              </form>
            </div>
          </div>
        </div>
      </div>

      <div id="editCategoryStockModal" className="modal fade" role="dialog">
        <div className="modal-dialog">
          <div className="modal-content">
            <div className="modal-header">
              <h4 className="modal-title">تعديل التصنيف</h4>
              <button type="button" className="close" data-dismiss="modal">&times;</button>
            </div>
            <div className="modal-body">
              <form onSubmit={editCategoryStock}>
                <div className="form-group">
                  <label>اسم التصنيف</label>
                  <input type="text" className="form-control" value={categoryName} onChange={(e) => setCategoryName(e.target.value)} required />
                </div>
                <div className="form-group">
                  <label>رمز التصنيف</label>
                  <input type="text" className="form-control" value={categoryCode} onChange={(e) => setCategoryCode(e.target.value)} required />
                </div>
                <div className="form-group">
                  <label>ملاحظات</label>
                  <textarea className="form-control" value={notes} onChange={(e) => setNotes(e.target.value)}></textarea>
                </div>
                <div className="form-group text-right">
                  <button type="submit" className="btn btn-success">تعديل</button>
                  <button type="button" className="btn btn-danger" data-dismiss="modal">إلغاء</button>
                </div>
              </form>
            </div>
          </div>
        </div>
      </div>

      <div id="deleteCategoryStockModal" className="modal fade" role="dialog">
        <div className="modal-dialog">
          <div className="modal-content">
            <div className="modal-header">
              <h4 className="modal-title">حذف التصنيف</h4>
              <button type="button" className="close" data-dismiss="modal">&times;</button>
            </div>
            <div className="modal-body">
              <p>هل أنت متأكد أنك تريد حذف هذا التصنيف؟</p>
            </div>
            <div className="modal-footer">
              <button type="button" className="btn btn-danger" onClick={deleteCategoryStock} data-dismiss="modal">حذف</button>
              <button type="button" className="btn btn-secondary" data-dismiss="modal">إلغاء</button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CategoryStock;
