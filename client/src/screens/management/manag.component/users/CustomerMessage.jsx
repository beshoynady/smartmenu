import React, { useState, useEffect, useContext } from 'react'
import axios from 'axios'
import { detacontext } from '../../../../App';
import { toast } from 'react-toastify';
import '../orders/Orders.css'


const CustomerMessage = () => {

  const apiUrl = process.env.REACT_APP_API_URL;
  const token = localStorage.getItem('token_e');

  const config = {
    headers: {
      'Authorization': `Bearer ${token}`,
    },
  };

  const { setStartDate, setEndDate, filterByDateRange, filterByTime, restaurantData, formatDateTime, permissionsList,setisLoadiog, formatDate, formatTime,
    EditPagination, startpagination, endpagination, setstartpagination, setendpagination } = useContext(detacontext);


  const permissionUserMassage = permissionsList?.filter(permission => permission.resource === 'Messages')[0]

  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [message, setMessage] = useState('');
  const [messageId, setmessageId] = useState('');
  const [allCustomerMessage, setallCustomerMessage] = useState([])

  const getAllCustomerMessage = async () => {
    if (permissionUserMassage&&!permissionUserMassage.read) {
      toast.warn('ليس لك صلاحية لعرض رسائل المستخدمين')
      return
    }
    try{
      if (!token) {
        // Handle case where token is not available
        toast.error('رجاء تسجيل الدخول مره اخري');
        return
      }
      const response = await axios.get(`${apiUrl}/api/message`, config);
      setallCustomerMessage(response.data)
    } catch (error) {
      console.log(error)
    }
  };
  const deleteCustomerMessage = async (e) => {
    e.preventDefault();
    if (permissionUserMassage&&!permissionUserMassage.delete) {
      toast.warn('ليس لك صلاحية لحذف رسائل المستخدمين')
      return
    }
    try{
      if (!token) {
        // Handle case where token is not available
        toast.error('رجاء تسجيل الدخول مره اخري');
        return
      }
      const response = await axios.delete(`${apiUrl}/api/message/${messageId}`, config);
      if (response) {
        toast.success('تم حذف الرسالة بنجاح')
      }
      getAllCustomerMessage()
    } catch (error) {
      console.log(error)
    }
  };


  const getCustomerMessageByPhone = async (phone) => {
    if (!phone) {
      getAllCustomerMessage()
      return
    }
    const message = allCustomerMessage.filter(message => message.phone.startsWith(phone));
    setallCustomerMessage(message)
  }



  const [selectedIds, setSelectedIds] = useState([]);
  const handleCheckboxChange = (e) => {
    const Id = e.target.value;
    const isChecked = e.target.checked;

    if (isChecked) {
      setSelectedIds([...selectedIds, Id]);
    } else {
      const updatedSelectedIds = selectedIds.filter((id) => id !== Id);
      setSelectedIds(updatedSelectedIds);
    }
  };

  const deleteSelectedIds = async (e) => {
    e.preventDefault();
     if (permissionUserMassage&&!permissionUserMassage.delete) {
      toast.warn('ليس لك صلاحية لحذف رسائل المستخدمين')
      return
    }
    console.log(selectedIds)
    try{
      if (!token) {
        // Handle case where token is not available
        toast.error('رجاء تسجيل الدخول مره اخري');
        return
      }

      for (const Id of selectedIds) {
        await axios.delete(`${apiUrl}/api/message/${Id}`, config);
      }
      getAllCustomerMessage()
      toast.success('تم حذف الرسائل المحدده');
      setSelectedIds([]);
    } catch (error) {
      console.log(error);
      toast.error('فشل حذف الرسائل المحددة ! حاول مره اخري');
    }
  };


  useEffect(() => {
    getAllCustomerMessage()
  }, [])

  return (
    <div className="w-100 px-3 d-flex align-itmes-center justify-content-start">
      <div className="table-responsive">
        <div className="table-wrapper">
          <div className="table-title">
            <div className="w-100 d-flex flex-wrap align-items-center justify-content-between">
              <div className="text-right">
                <h2>ادارة <b>رسائل العملاء</b></h2>
              </div>
              <div className="col-12 col-md-6 p-0 m-0 d-flex flex-wrap aliegn-items-center justify-content-end print-hide">
                {/* <a href="#addmessageModal" className="d-flex align-items-center justify-content-center  h-100  m-0 btn btn-success" data-toggle="modal"> <span>اضافة موظف جديد</span></a> */}
                <a href="#deleteAllmessageModal" className="btn d-flex align-items-center justify-content-between w-25 btn-danger" data-toggle="modal"> <span>حذف الكل</span></a>
              </div>
            </div>
          </div>
          <div class="table-filter print-hide">
            <div className="w-100 d-flex flex-row flex-wrap align-items-center justify-content-start text-dark">
              <div class="filter-group d-flex flex-wrap align-items-center justify-content-between col-3 p-0 mb-1">
                <label className="form-label text-wrap text-right fw-bolder p-0 m-0">عرض</label>
                <select className="form-select border-primary col-6 px-1 py-2 m-0" onChange={(e) => { setstartpagination(0); setendpagination(e.target.value) }}>
                  <option value={5}>5</option>
                  <option value={10}>10</option>
                  <option value={15}>15</option>
                  <option value={20}>20</option>
                  <option value={25}>25</option>
                  <option value={30}>30</option>
                </select>
                
              </div>
              <div class="filter-group d-flex flex-wrap align-items-center justify-content-between col-3 p-0 mb-1">
                <label className="form-label text-wrap text-right fw-bolder p-0 m-0">الموبايل</label>
                <input type="text" class="form-control border-primary m-0 p-2 h-auto" onChange={(e) => getCustomerMessageByPhone(e.target.value)} />

              </div>
              <div className='col-12 d-flex align-items-center justify-content-between'>
                <div className="filter-group d-flex flex-wrap align-items-center justify-content-between col-3 p-0 mb-1">
                  <label className="form-label text-wrap text-right fw-bolder p-0 m-0">فلتر حسب الوقت</label>
                  <select className="form-control border-primary m-0 p-2 h-auto"  onChange={(e) => setallCustomerMessage(filterByTime(e.target.value, allCustomerMessage))}>
                    <option value="">اختر</option>
                    <option value="today">اليوم</option>
                    <option value="week">هذا الأسبوع</option>
                    <option value="month">هذا الشهر</option>
                    <option value="month">هذه السنه</option>
                  </select>
                </div>

                <div className="d-flex align-items-center justify-content-between flex-nowrap col-9 p-0 m-0 px-1">
                  <label className="form-label text-nowrap"><strong>مدة محددة:</strong></label>

                  <div className="filter-group d-flex flex-wrap align-items-center justify-content-between col-3 p-0 mb-1">
                    <label className="form-label text-wrap text-right fw-bolder p-0 m-0">من</label>
                    <input type="date" className="form-control border-primary m-0 p-2 h-auto" onChange={(e) => setStartDate(e.target.value)} placeholder="اختر التاريخ" />
                  </div>

                  <div className="filter-group d-flex flex-wrap align-items-center justify-content-between col-3 p-0 mb-1">
                    <label className="form-label text-wrap text-right fw-bolder p-0 m-0">إلى</label>
                    <input type="date" className="form-control border-primary m-0 p-2 h-auto" onChange={(e) => setEndDate(e.target.value)} placeholder="اختر التاريخ" />
                  </div>

                  <div className="d-flex flex-nowrap justify-content-between col-3 p-0 m-0">
                    <button type="button" className="btn btn-primary w-50 h-100 p-2 " onClick={() => setallCustomerMessage(filterByDateRange(allCustomerMessage))}>
                      <i className="fa fa-search"></i>
                    </button>
                    <button type="button" className="btn btn-warning w-50 h-100 p-2" onClick={getAllCustomerMessage}>
                      استعادة
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>
          <table className="table table-striped table-hover">
            <thead>
              <tr>
                <th>
                  <span className="custom-checkbox">
                    <input type="checkbox" className="form-check-input form-check-input-lg" id="selectAll" />
                    <label htmlFor="selectAll"></label>
                  </span>
                </th>
                <th>م</th>
                <th>الاسم</th>
                <th>الموبايل</th>
                <th>الايميل</th>
                <th>الرساله</th>
                <th>التاريخ</th>
                <th>اجراءات</th>
              </tr>
            </thead>
            <tbody>
              {allCustomerMessage.map((message, i) => {
                if (i >= startpagination & i < endpagination) {
                  return (
                    <tr key={i}>
                      <td>
                        <span className="custom-checkbox">
                          <input type="checkbox" className="form-check-input form-check-input-lg" id="checkbox1" name="options[]" value={message._id} onChange={handleCheckboxChange} />
                          <label htmlFor="checkbox1"></label>
                        </span>
                      </td>
                      <td>{i + 1}</td>
                      <td>{message.name}</td>
                      <td>{message.phone}</td>
                      <td>{message.email}</td>
                      <td>{message.message}</td>
                      <td>{formatDateTime(message.createdAt)}</td>
                      <td>
                        <a href="#editmessageModal" className="edit" data-toggle="modal" onClick={() => {
                          setName(message.name); setPhone(message.phone); setMessage(message.message); setEmail(message.email); setmessageId(message._id);
                        }}><i className="material-icons" data-toggle="tooltip" title="Edit"
                        >&#xE254;</i></a>
                        <a href="#deletemessageModal" className="delete" data-toggle="modal" onClick={() => setmessageId(message._id)}><i className="material-icons" data-toggle="tooltip" title="Delete"
                        >&#xE872;</i></a>
                      </td>
                    </tr>
                  )
                }
              })
              }
            </tbody>
          </table>
          <div className="clearfix">
            <div className="hint-text text-dark">عرض <b>{allCustomerMessage.length > endpagination ? endpagination : allCustomerMessage.length}</b> من <b>{allCustomerMessage.length}</b> عنصر</div>
            <ul className="pagination">
              <li onClick={EditPagination} className="page-item disabled"><a href="#">السابق</a></li>
              <li onClick={EditPagination} className={`page-item ${endpagination === 5 ? 'active' : ''}`}><a href="#" className="page-link">1</a></li>
              <li onClick={EditPagination} className={`page-item ${endpagination === 10 ? 'active' : ''}`}><a href="#" className="page-link">2</a></li>
              <li onClick={EditPagination} className={`page-item ${endpagination === 15 ? 'active' : ''}`}><a href="#" className="page-link">3</a></li>
              <li onClick={EditPagination} className={`page-item ${endpagination === 20 ? 'active' : ''}`}><a href="#" className="page-link">4</a></li>
              <li onClick={EditPagination} className={`page-item ${endpagination === 25 ? 'active' : ''}`}><a href="#" className="page-link">5</a></li>
              <li onClick={EditPagination} className={`page-item ${endpagination === 30 ? 'active' : ''}`}><a href="#" className="page-link">التالي</a></li>

            </ul>
          </div>
        </div>
      </div>

      <div id="editmessageModal" className="modal fade">
        <div className="modal-dialog modal-lg">
          <div className="modal-content shadow-lg border-0 rounded ">
            <form>
              <div className="modal-header d-flex flex-wrap align-items-center text-light bg-primary">
                <h4 className="modal-title">رساله عميل</h4>
                <button type="button" className="close m-0" data-dismiss="modal" aria-hidden="true">&times;</button>
              </div>
              <div className="modal-body d-flex flex-wrap align-items-center p-4 text-right">
                <div className="form-group col-12 col-md-6" >
                  <label className="form-label text-wrap text-right fw-bolder p-0 m-0">الاسم</label>
                  <input type="text" className="form-control border-primary m-0 p-2 h-auto" defaultValue={name} required readOnly />
                </div>

                <div className="form-group col-12 col-md-6" >
                  <label className="form-label text-wrap text-right fw-bolder p-0 m-0">الموبايل</label>
                  <input type="text" className="form-control border-primary m-0 p-2 h-auto" defaultValue={phone} required readOnly />
                </div>
                <div className="form-group col-12 col-md-6" >
                  <label className="form-label text-wrap text-right fw-bolder p-0 m-0">الايميل</label>
                  <input type="email" className="form-control border-primary m-0 p-2 h-auto" defaultValue={email} required readOnly />
                </div>
                <div className="form-group col-12 col-md-6" >
                  <label className="form-label text-wrap text-right fw-bolder p-0 m-0">الرسالة</label>
                  <textarea className="form-control border-primary m-0 p-2 h-auto" defaultValue={message} required readOnly></textarea>
                </div>
              </div>
              <div className="modal-footer d-flex flex-nowrap align-items-center justify-content-between m-0 p-1">
                <input type="button" className="btn btn-danger col-6 h-100 px-2 py-3 m-0" data-dismiss="modal" value="اغلاق" />
                <input type="submit" className="btn btn-success col-6 h-100 px-2 py-3 m-0" value="تم" />
              </div>
            </form>
          </div>
        </div>
      </div>

      <div id="deletemessageModal" className="modal fade">
        <div className="modal-dialog modal-lg">
          <div className="modal-content shadow-lg border-0 rounded ">
            <form onSubmit={deleteCustomerMessage}>
              <div className="modal-header d-flex flex-wrap align-items-center text-light bg-primary">
                <h4 className="modal-title">حذف رساله</h4>
                <button type="button" className="close m-0" data-dismiss="modal" aria-hidden="true">&times;</button>
              </div>
              <div className="modal-body text-center">
          <p className="mb-2">هل أنت متأكد من حذف هذا السجل؟</p>
          <p className="text-warning"><small>لا يمكن الرجوع في هذا الإجراء.</small></p>
        </div>
              <div className="modal-footer d-flex flex-nowrap align-items-center justify-content-between m-0 p-1">
                <input type="submit" className="btn btn-warningcol-6 h-100 px-2 py-3 m-0" value="حذف" />
                <input type="button" className="btn btn-danger col-6 h-100 px-2 py-3 m-0" data-dismiss="modal" value="اغلاق" />
              </div>
            </form>
          </div>
        </div>
      </div>

      <div id="deleteAllmessageModal" className="modal fade">
        <div className="modal-dialog modal-lg">
          <div className="modal-content shadow-lg border-0 rounded ">
            <form onSubmit={deleteSelectedIds}>
              <div className="modal-header d-flex flex-wrap align-items-center text-light bg-primary">
                <h4 className="modal-title">حذف الرسائل المحدده</h4>
                <button type="button" className="close m-0" data-dismiss="modal" aria-hidden="true">&times;</button>
              </div>
              <div className="modal-body text-center">
          <p className="mb-2">هل أنت متأكد من حذف هذا السجل؟</p>
          <p className="text-warning"><small>لا يمكن الرجوع في هذا الإجراء.</small></p>
        </div>
              <div className="modal-footer d-flex flex-nowrap align-items-center justify-content-between m-0 p-1">
                <input type="submit" className="btn btn-warningcol-6 h-100 px-2 py-3 m-0" value="حذف" />
                <input type="button" className="btn btn-danger col-6 h-100 px-2 py-3 m-0" data-dismiss="modal" value="اغلاق" />
              </div>
            </form>
          </div>
        </div>
      </div>
    </div>
  )
}

export default CustomerMessage