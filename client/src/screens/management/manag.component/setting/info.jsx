import React, { useState, useEffect, useContext } from 'react';
import axios from 'axios';
import { detacontext } from '../../../../App';
import { toast } from 'react-toastify';

const Info = () => {
  const apiUrl = process.env.REACT_APP_API_URL;
  const token = localStorage.getItem('token_e');
  const config = {
    headers: {
      'Authorization': `Bearer ${token}`,
    },
  };

  const { restaurantData, permissionsList, setStartDate, setEndDate, filterByDateRange, filterByTime,
    employeeLoginInfo, usertitle, formatDate, formatDateTime, setisLoadiog,
    EditPagination, startpagination, endpagination, setstartpagination, setendpagination } = useContext(detacontext)


  const [shifts, setShifts] = useState([]);

  const getAllShifts = async () => {
    if (!token) {
      // Handle case where token is not available
      toast.error('رجاء تسجيل الدخول مره اخري');
      return
    }
    try {
      const response = await axios.get(`${apiUrl}/api/shift`, config)
      const data = await response.data
      console.log({ data })
      if (data) {
        setShifts(data)
      } else {
        toast.error('لا يوجد بيانات للورديات ! اضف بيانات الورديات ')
      }
    } catch (error) {
      toast.error('حدث خطأ اثناء جلب بيانات الورديات! اعد تحميل الصفحة')
    }
  }

  // إضافة وردية جديدة
  const addShift = () => {
    setShifts([...shifts, { shiftType: '', startTime: '', endTime: '' }]);
    console.log({ shifts });
  };

  // حذف وردية
  const removeShift = async (index, id) => {
    const updatedShifts = shifts.filter((_, i) => i !== index);
    if (id) {
      const response = await axios.delete(`${apiUrl}/api/shift/${id}`, config);
      console.log({ response })
      if (response.status === 200) {
        toast.success('تمت حذف الوردية بنجاح');
      } else {
        toast.error('حدث خطأ أثناء حذف الوردية');
      }

    }
    setShifts(updatedShifts);
  };

  // تحديث حقل اسم الوردية
  const handleShiftTypeChange = (index, event) => {
    const updatedShifts = [...shifts];
    updatedShifts[index].shiftType = event.target.value;
    setShifts(updatedShifts);
  };

  // تحديث حقل ميعاد بداية الوردية
  const handleStartTimeChange = (index, event) => {
    const updatedShifts = [...shifts];
    updatedShifts[index].startTime = event.target.value;
    setShifts(updatedShifts);
  };

  // تحديث حقل ميعاد نهاية الوردية
  const handleEndTimeChange = (index, event) => {
    const updatedShifts = [...shifts];
    updatedShifts[index].endTime = event.target.value;
    setShifts(updatedShifts);
  };



  const handleCreateShifts = async (e) => {
    e.preventDefault();
    if (!token) {
      // Handle case where token is not available
      toast.error('رجاء تسجيل الدخول مره اخري');
      return
    }
    try {
      shifts.map(async (shift) => {
        const id = shift._id ? shift._id : null;
        const shiftType = shift.shiftType
        const startTime = shift.startTime
        const endTime = shift.endTime
        if (id && shiftType && startTime && endTime) {
          const response = await axios.put(`${apiUrl}/api/shift/${id}`, { startTime, endTime, shiftType }, config);
          console.log({ response })
          if (response.status === 200) {
            toast.success('تمت تعديل بيانات الوردية بنجاح');
          } else {
            toast.error('حدث خطأ أثناء تعديل بيانات الوردية');
          }
        } else if (shiftType && startTime && endTime) {
          const response = await axios.post(`${apiUrl}/api/shift`, { startTime, endTime, shiftType }, config);
          console.log({ response })
          if (response.status === 201) {
            toast.success('تمت إضافة الوردية بنجاح');
          } else {
            toast.error('حدث خطأ أثناء إضافة الوردية');
          }

        }
      })
      getAllShifts()
    } catch (error) {
      toast.error('حدث خطأ أثناء إضافة الوردية');
      console.error('Error:', error);
    }
  };



  const [areas, setAreas] = useState([]);


  const getAllDeliveryAreas = async () => {
    if (!token) {
      // Handle case where token is not available
      toast.error('رجاء تسجيل الدخول مره اخري');
      return
    }
    try {
      const response = await axios.get(`${apiUrl}/api/deliveryarea`, config)
      const data = await response.data
      console.log({ data })
      if (data) {
        setAreas(data)
      } else {
        toast.error('لا يوجد بيانات لمنطقه التوصيل ! اضف بيانات منطقه التوصيل ')
      }
    } catch (error) {
      toast.error('حدث خطأ اثناء جلب بيانات منطقه التوصيل! اعد تحميل الصفحة')
    }
  }

  const addArea = () => {
    setAreas([...areas, { name: '', delivery_fee: 0 }]);
    console.log({ areas })
  };


  const removeArea = async (index, id) => {
    const updatedAreas = areas.filter((area, i) => i !== index);
    if (id) {
      const response = await axios.delete(`${apiUrl}/api/deliveryarea/${id}`, config);
      console.log({ response })
      if (response.status === 200) {
        toast.success('تمت حذف منطقه التوصيل بنجاح');
      } else {
        toast.error('حدث خطأ أثناء حذف منطقه التوصيل');
      }

    }
    setAreas(updatedAreas);
  };

  const handleAreasNameChange = (index, event) => {
    const updatedAreas = [...areas];
    updatedAreas[index].name = event.target.value;
    setAreas(updatedAreas);
  };

  // تحديث حقل تكلفة التوصيل
  const handleDeliveryCostChange = (index, event) => {
    const updatedAreas = [...areas];
    updatedAreas[index].delivery_fee = Number(event.target.value);
    setAreas(updatedAreas);
  };


  const handleDeliveryArea = async (e) => {
    e.preventDefault();
    if (!token) {
      // Handle case where token is not available
      toast.error('رجاء تسجيل الدخول مره اخري');
      return
    }
    try {
      areas.map(async (area, i) => {
        console.log({ area })
        const id = area._id ? area._id : null;
        const name = area.name
        const delivery_fee = area.delivery_fee
        if (id && name && delivery_fee) {
          const response = await axios.put(`${apiUrl}/api/deliveryarea/${id}`, { name, delivery_fee }, config);
          console.log({ response })
          if (response.status === 200) {
            toast.success('تمت تعديل بيانات منطقه التوصيل بنجاح');
          } else {
            toast.error('حدث خطأ أثناء تعديل بيانات منطقه التوصيل');
          }
        } else if (name && delivery_fee) {
          const response = await axios.post(`${apiUrl}/api/deliveryarea`, { name, delivery_fee }, config);
          console.log({ response })
          if (response.status === 201) {
            toast.success('تمت إضافة منطقه التوصيل بنجاح');
          } else {
            toast.error('حدث خطأ أثناء إضافة منطقه التوصيل');
          }

        }
      })
      getAllDeliveryAreas()
    } catch (error) {
      toast.error('حدث خطأ أثناء إضافة منطقه التوصيل');
      console.error('Error:', error);
    }
  }






  const [restaurantId, setrestaurantId] = useState('')

  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [logo, setLogo] = useState('');
  const [aboutText, setaboutText] = useState('');
  const [website, setwebsite] = useState('');
  const [locationUrl, setlocationUrl] = useState('');
  const [dineIn, setdineIn] = useState('');
  const [takeAway, settakeAway] = useState('');
  const [deliveryService, setdeliveryService] = useState('');
  const [usesReservationSystem, setusesReservationSystem] = useState('');
  const [salesTaxRate, setsalesTaxRate] = useState(0);
  const [serviceTaxRate, setserviceTaxRate] = useState(0);

  const [country, setCountry] = useState('');
  const [state, setState] = useState('');
  const [city, setCity] = useState('');
  const [street, setStreet] = useState('');
  const [postalCode, setPostalCode] = useState('');


  const listFeatures = ['WiFi', 'Parking', 'Outdoor Seating', 'Wheelchair Accessible', 'Live Music', 'Pet Friendly', 'Kids Friendly']
  const listFeaturesAr = ['WiFi', 'موقف سيارات', 'أماكن جلوس خارجية', 'مناسب للكراسي المتحركة', 'موسيقى حية', 'صديق للحيوانات الأليفة', 'ركن للاطفال'];

  const [features, setfeatures] = useState([]);
  const handleFeaturesCheckboxChange = (feature) => {
    console.log({ feature })
    if (features.includes(feature)) {
      setfeatures(features.filter((item) => item !== feature));
    } else {
      setfeatures([...features, feature]);
    }
  };

  const handleFeatures = async (e) => {
    e.preventDefault();
    if (!token) {
      // Handle case where token is not available
      toast.error('رجاء تسجيل الدخول مره اخري');
      return
    }
    try {
      console.log({ features })
      const response = await axios.put(`${apiUrl}/api/restaurant/${restaurantId}`, { features }, config);
      if (response.status === 200) {
        toast.success('تمت إضافة الخدمات الاضافية بنجاح');
        getRestaurant();
      } else {
        toast.error('حدث خطأ أثناء إضافة الخدمات الاضافية! حاول مرة أخرى.');
      }
    } catch (error) {
      toast.error('فشل إضافة الخدمات الاضافية! حاول مرة أخرى');
    }
  };


  const listAcceptedPayments = ['Cash', 'Credit Card', 'Debit Card', 'Vodafone Cash', 'Etisalat Cash', 'Orange Cash', 'Fawry', 'Meeza', 'PayPal', 'Aman']
  const listAcceptedPaymentsAr = ['نقداً', 'بطاقة ائتمان', 'بطاقة خصم مباشر', 'فودافون كاش', 'اتصالات كاش', 'أورنج كاش', 'فوري', 'ميزة', 'باي بال', 'أمان'];

  const [acceptedPayments, setacceptedPayments] = useState([]);
  const handleacceptedPaymentsCheckboxChange = (acceptedPayment) => {
    console.log({ acceptedPayment })
    if (acceptedPayments.includes(acceptedPayment)) {
      setacceptedPayments(acceptedPayments.filter((item) => item !== acceptedPayment));
    } else {
      setacceptedPayments([...acceptedPayments, acceptedPayment]);
    }
  };

  const handleAcceptedPayments = async (e) => {
    e.preventDefault();
    if (!token) {
      // Handle case where token is not available
      toast.error('رجاء تسجيل الدخول مره اخري');
      return
    }
    try {
      console.log({ acceptedPayments })
      const response = await axios.put(`${apiUrl}/api/restaurant/${restaurantId}`, { acceptedPayments }, config);
      if (response.status === 200) {
        toast.success('تمت إضافة الخدمات الاضافية بنجاح');
        getRestaurant();
      } else {
        toast.error('حدث خطأ أثناء إضافة الخدمات الاضافية! حاول مرة أخرى.');
      }
    } catch (error) {
      toast.error('فشل إضافة الخدمات الاضافية! حاول مرة أخرى');
    }
  };

  const handleFileUpload = (e) => {
    const file = e.target.files[0];
    const maxSize = 1024 * 1024;
    const allowedTypes = ["image/jpeg", "image/jpg", "image/png", "image/gif"];

    if (file && file.size <= maxSize && allowedTypes.includes(file.type)) {
      console.log({ file })
      setLogo(file);
      toast.success('تم رفع الصوره بنجاح');
    } else {
      let errorMessage = "Invalid file.";

      if (file && !allowedTypes.includes(file.type)) {
        errorMessage = "Invalid file type. Only JPEG, PNG, and GIF are allowed.";
      } else if (file && file.size > maxSize) {

        errorMessage = "Maximum file size exceeded (1 MB). Please select a smaller file.";
      }
    }
  };

  const handleCreateRestaurant = async (e) => {
    e.preventDefault();
    if (!token) {
      // Handle case where token is not available
      toast.error('رجاء تسجيل الدخول مره اخري');
      return
    }
    try {
      const address = {
        country: country ? country : null,
        city: city ? city : null,
        state: state ? state : null,
        street: street ? street : null,
        website: website ? website : null,
        postal_code: postalCode ? postalCode : null
      };
      if (restaurantId) {
        const response = await axios.put(`${apiUrl}/api/restaurant/${restaurantId}`, { name, description, address, website, image: logo, locationUrl, aboutText, dineIn, takeAway, deliveryService, usesReservationSystem, salesTaxRate, serviceTaxRate }, config);
        console.log({ response })
      } else {
        // إرسال البيانات إلى الخادم باستخدام axios
        const response = await axios.post(`${apiUrl}/api/restaurant/`, { name, description, address, website, image: logo, locationUrl, aboutText, dineIn, takeAway, deliveryService, usesReservationSystem, salesTaxRate, serviceTaxRate }, config);
        console.log({ response })
        if (response.status === 201) {
          toast.success('تمت إضافة المطعم بنجاح');
          getRestaurant()
        } else {
          toast.error('حدث خطأ أثناء إضافة المطعم');
        }

      }
    } catch (error) {
      toast.error('حدث خطأ أثناء إضافة المطعم');
      console.error('Error:', error);
    }
  };



  const [phone, setPhone] = useState([]);
  const [whatsapp, setWhatsapp] = useState('');
  const [email, setEmail] = useState('');
  const [facebook, setFacebook] = useState('');
  const [twitter, setTwitter] = useState('');
  const [instagram, setInstagram] = useState('');
  const [linkedin, setLinkedin] = useState('');
  const [youtube, setYoutube] = useState('');
  // const [social_media, setsocial_media] = useState([{platform:'', url:''}]);
  // const [listSocial_media, setlistSocial_media] = useState(['facebook', 'twitter', 'instagram', 'linkedin', 'youtube']);

  const handleContactSocialmedia = async (e) => {
    e.preventDefault();
    if (!token) {
      // Handle case where token is not available
      toast.error('رجاء تسجيل الدخول مره اخري');
      return
    }
    try {
      const contact = {
        phone: [...phone],
        whatsapp: whatsapp ? whatsapp : null,
        email: email ? email : null

      };
      const social_media = [
        facebook ? { platform: 'facebook', url: facebook } : '',
        twitter ? { platform: 'twitter', url: twitter } : '',
        instagram ? { platform: 'instagram', url: instagram } : '',
        linkedin ? { platform: 'linkedin', url: linkedin } : '',
        youtube ? { platform: 'youtube', url: youtube } : '',

      ]

      console.log({ contact, social_media })

      // إرسال البيانات إلى الخادم باستخدام axios
      const response = await axios.put(`${apiUrl}/api/restaurant/${restaurantId}`, { contact, social_media }, config);
      console.log({ response })

      if (response.status === 200) {
        toast.success('تمت إضافة بيانات التواصل بنجاح');
        getRestaurant()

      } else {
        toast.error('فشل إضافة بيانات التواصل');
      }
    } catch (error) {
      toast.error('حدث خطأ أثناء إضافة بيانات التواصل');
      console.error('Error:', error);
    }
  };


  const daysOfWeek = ['السبت', 'الأحد', 'الاثنين', 'الثلاثاء', 'الأربعاء', 'الخميس', 'الجمعة'];
  const daysOfWeekEn = ['Saturday', 'Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday'];

  const initialOpeningHours = daysOfWeekEn.map(day => ({
    day,
    from: '',
    to: '',
    closed: false
  }));

  const [opening_hours, setOpening_hours] = useState([]);

  const handleSetFrom = (index, value) => {
    console.log({ opening_hours })
    const updatedHours = [...opening_hours];
    updatedHours[index].from = value;
    setOpening_hours(updatedHours);
  };

  const handleSetTo = (index, value) => {
    const updatedHours = [...opening_hours];
    updatedHours[index].to = value;
    setOpening_hours(updatedHours);
  };

  const handleCheckboxChange = (index) => {
    const updatedHours = [...opening_hours];
    updatedHours[index].closed = !updatedHours[index].closed;
    setOpening_hours(updatedHours);
  };

  const handleOpeningHours = async (e) => {
    e.preventDefault();
    if (!token) {
      // Handle case where token is not available
      toast.error('رجاء تسجيل الدخول مره اخري');
      return
    }
    try {
      const response = await axios.put(`${apiUrl}/api/restaurant/${restaurantId}`, { opening_hours }, config);
      if (response.status === 200) {
        toast.success('تمت إضافة مواعيد العمل بنجاح');
        getRestaurant();
      } else {
        toast.error('حدث خطأ أثناء إضافة مواعيد العمل! حاول مرة أخرى.');
      }
    } catch (error) {
      toast.error('فشل إضافة مواعيد العمل! حاول مرة أخرى');
    }
  };



  const getRestaurant = async () => {
    if (!token) {
      // Handle case where token is not available
      toast.error('رجاء تسجيل الدخول مره اخري');
      return
    }
    try {
      const response = await axios.get(`${apiUrl}/api/restaurant/`, config);
      const restaurantData = response.data[0];

      if (restaurantData) {
        setrestaurantId(restaurantData._id);
        setName(restaurantData.name);
        setSubscriptionStart(restaurantData.subscriptionStart)
        setSubscriptionEnd(restaurantData.subscriptionEnd)
        setLogo(restaurantData.logo);
        setwebsite(restaurantData.website);
        setlocationUrl(restaurantData.locationUrl);
        setaboutText(restaurantData.aboutText);
        setDescription(restaurantData.description);
        setsalesTaxRate(restaurantData.salesTaxRate);
        setserviceTaxRate(restaurantData.serviceTaxRate);

        setCountry(restaurantData.address.country);
        setState(restaurantData.address.state);
        setCity(restaurantData.address.city);
        setStreet(restaurantData.address.street);
        setPostalCode(restaurantData.address.postal_code);

        setfeatures(restaurantData.features);
        setacceptedPayments(restaurantData.acceptedPayments);

        setPhone(restaurantData.contact.phone);
        setWhatsapp(restaurantData.contact.whatsapp);
        setEmail(restaurantData.contact.email);

        setdineIn(restaurantData.dineIn);
        setdeliveryService(restaurantData.deliveryService);
        settakeAway(restaurantData.takeAway);
        setusesReservationSystem(restaurantData.usesReservationSystem);

        restaurantData.social_media.forEach((item) => {
          switch (item.platform) {
            case 'facebook':
              setFacebook(item.url);
              break;
            case 'twitter':
              setTwitter(item.url);
              break;
            case 'instagram':
              setInstagram(item.url);
              break;
            case 'linkedin':
              setLinkedin(item.url);
              break;
            case 'youtube':
              setYoutube(item.url);
              break;
            default:
              break;
          }
        });

        setOpening_hours(
          restaurantData.opening_hours.length > 0 ? restaurantData.opening_hours : initialOpeningHours
        );
      } else {
        toast.warning('لم يتم اضافه بيانات المطعم');
      }
    } catch (error) {
      console.error('Error fetching restaurant data:', error);
      toast.error('خطأ في جلب بيانات المطعم');
    }
  };



  const [subscriptionStart, setSubscriptionStart] = useState('');
  const [subscriptionEnd, setSubscriptionEnd] = useState('');
  
  const updateSubscriptionDates = async (e) => {
    e.preventDefault();
    if (!token) {
      toast.error('رجاء تسجيل الدخول مره اخري');
      return;
    }
    if (employeeLoginInfo.role !== 'programer') {
      toast.error('ليس لك صلاحية لتعديل بيانات الاشتراك');
      return;
    }
    try {
      const config = { headers: { Authorization: `Bearer ${token}` } };
      const response = await axios.put(`${apiUrl}/api/restaurant/update-subscription/${restaurantId}`,
        { subscriptionStart, subscriptionEnd }, config);
      if (response.status === 200) {
        toast.success('تمت تعديل بيانات الاشتراك بنجاح');
        getRestaurant();
      } else {
        toast.error('حدث خطأ أثناء تعديل بيانات الاشتراك! حاول مرة أخرى.');
      }
    } catch (error) {
      console.log({ updateSubscriptionDateserr: error.response ? error.response.data : error.message });
      toast.error('فشل تعديل بيانات الاشتراك! حاول مرة أخرى');
    }
  };
  

  const [remainingTime, setRemainingTime] = useState({ months: 0, days: 0 });

  useEffect(() => {
    subscriptionStart && subscriptionEnd && setRemainingTime(calculateRemainingTime(subscriptionStart, subscriptionEnd));
  }, [subscriptionStart, subscriptionEnd]);


  const calculateRemainingTime = (startDate, endDate) => {
    console.log({ startDate, endDate })
    const start = new Date(startDate);
    const end = new Date(endDate);
    const today = new Date();

    if (today > end) {
      return { months: 0, days: 0 };
    }

    let months = (end.getFullYear() - today.getFullYear()) * 12 + (end.getMonth() - today.getMonth());
    let days = end.getDate() - today.getDate();

    if (days < 0) {
      months -= 1;
      days += new Date(today.getFullYear(), today.getMonth() + 1, 0).getDate(); // days in the current month
    }

    if (months < 0) {
      months = 0;
      days = 0;
    }

    return { months, days };
  }


  useEffect(() => {
    getRestaurant()
    getAllShifts()
    getAllDeliveryAreas()
  }, [])


  return (

    <div className="container" dir='rtl'>
      <div className="content-wrapper">
        <div className="d-flex flex-wrap align-items-center justify-content-between" style={{ color: 'darkblue', fontWeight: '900', textAlign: 'center' }}>


          <div className="col-12 grid-margin">
            <div className="card">
              <div className="card-body">
                <h4 className="card-title">بيانات الاشتراك</h4>
                <form className="form-sample row d-flex flex-wrap" onSubmit={updateSubscriptionDates}>

                  <div className="form-group  h-auto px-3 d-flex align-items-center justify-content-start col-12 col-md-6 row">
                    <label className="form-label col-form-label p-0 m-0">تاريخ بداية الاشتراك</label>
                    <div className="col-8">
                      <input type="date" className="form-control border-primary col-12" value={formatDate(subscriptionStart)}
                        onChange={(e) => setSubscriptionStart(e.target.value)} required
                        readOnly={employeeLoginInfo.role !== 'programer'}
                      />
                    </div>
                  </div>

                  <div className="form-group  h-auto px-3 d-flex align-items-center justify-content-start col-12 col-md-6 row">
                    <label className="form-label col-form-label p-0 m-0">تاريخ نهاية الاشتراك</label>
                    <div className="col-8">
                      <input type="date" className="form-control border-primary col-12" value={formatDate(subscriptionEnd)}
                        onChange={(e) => { setSubscriptionEnd(e.target.value) }} required
                        readOnly={employeeLoginInfo.role !== 'programer'}
                      />
                    </div>
                  </div>

                  <div className="form-group  h-auto px-3 d-flex align-items-center justify-content-start col-12 col-md-6 row">
                    <label className="col-3 col-form-label p-0 m-0">باقي من الوقت</label>
                    <div className="col-9">
                      <input type="text" className="form-control border-primary col-12" value={`${remainingTime.months} شهر و ${remainingTime.days} يوم`} readOnly />
                    </div>
                  </div>
                  {employeeLoginInfo.role === 'programer' &&
                    <div className="col-12 d-flex flex-nowrap align-items-center justify-content-between " style={{ height: '50px' }}>
                      <button type="submit" className="btn btn-success col-6 h-100 p-0">تأكيد</button>
                      <button type="button" className="btn btn-danger col-6 h-100 p-0">إلغاء</button>
                    </div>
                  }
                </form>
              </div>
            </div>
          </div>

          <div className="col-12 grid-margin">
            <div className="card">
              <div className="card-body">
                <h4 className="card-title">بيانات المطعم</h4>
                <form className="form-sample row d-flex flex-wrap" onSubmit={handleCreateRestaurant}>
                  <div className="form-group h-auto px-3 d-flex flex-nowrap align-items-center justify-content-start col-12 col-md-6 ">
                    <label className="col-3 col-form-label p-0 m-0">الاسم</label>
                    <div className="col-9">
                      <input type="text" className="form-control border-primary col-12" defaultValue={name} required onChange={(e) => setName(e.target.value)} />
                    </div>
                  </div>

                  <div className="form-group h-auto px-3 d-flex flex-nowrap align-items-center justify-content-start col-12 col-md-6 ">
                    <label className="col-3 col-form-label p-0 m-0">الوصف</label>
                    <div className="col-9">
                      <textarea type="text" className="form-control border-primary col-12" defaultValue={description} required onChange={(e) => setDescription(e.target.value)} />
                    </div>
                  </div>


                  <p className="card-description col-12"> العنوان </p>
                  <div className="form-group h-auto px-3 d-flex flex-nowrap align-items-center justify-content-start col-12 col-md-6 ">
                    <label className="col-3 col-form-label p-0 m-0">الدولة</label>
                    <div className="col-9">
                      <input type="text" className="form-control border-primary col-12" defaultValue={country} onChange={(e) => setCountry(e.target.value)} />
                    </div>
                  </div>

                  <div className="form-group h-auto px-3 d-flex flex-nowrap align-items-center justify-content-start col-12 col-md-6 ">
                    <label className="col-3 col-form-label p-0 m-0">المحافظة</label>
                    <div className="col-9">
                      <input type="text" className="form-control border-primary col-12" defaultValue={state} required onChange={(e) => setState(e.target.value)} />
                    </div>
                  </div>

                  <div className="form-group h-auto px-3 d-flex flex-nowrap align-items-center justify-content-start col-12 col-md-6 ">
                    <label className="col-3 col-form-label p-0 m-0">المدينة</label>
                    <div className="col-9">
                      <input type="text" className="form-control border-primary col-12" defaultValue={city} required onChange={(e) => setCity(e.target.value)} />
                    </div>
                  </div>

                  <div className="form-group h-auto px-3 d-flex flex-nowrap align-items-center justify-content-start col-12 col-md-6 ">
                    <label className="col-3 col-form-label p-0 m-0">العنوان</label>
                    <div className="col-9">
                      <input type="text" className="form-control border-primary col-12" defaultValue={street} required onChange={(e) => setStreet(e.target.value)} />
                    </div>
                  </div>

                  <div className="form-group h-auto px-3 d-flex flex-nowrap align-items-center justify-content-start col-12 col-md-6 ">
                    <label className="col-3 col-form-label p-0 m-0">رابط المنيو</label>
                    <div className="col-9">
                      <input type="text" className="form-control border-primary col-12" defaultValue={website} required onChange={(e) => setwebsite(e.target.value)} />
                    </div>
                  </div>

                  <div className="form-group h-auto px-3 d-flex flex-nowrap align-items-center justify-content-start col-12 col-md-6 ">
                    <label className="col-3 col-form-label p-0 m-0">كود البريد</label>
                    <div className="col-9">
                      <input type="text" className="form-control border-primary col-12" defaultValue={postalCode} onChange={(e) => setPostalCode(e.target.value)} />
                    </div>
                  </div>



                  <div className="form-group h-auto px-3 d-flex flex-nowrap align-items-center justify-content-start col-12 col-md-6 ">
                    <label className="col-3 col-form-label p-0 m-0">رابط خريطه جوجل</label>
                    <div className="col-9">
                      <input type="text" className="form-control border-primary col-12" defaultValue={locationUrl} required onChange={(e) => setlocationUrl(e.target.value)} />
                    </div>
                  </div>
                  <div className="form-group h-auto px-3 d-flex flex-nowrap align-items-center justify-content-start col-12 col-md-6 ">
                    <label className="col-3 col-form-label p-0 m-0">about us</label>
                    <div className="col-9">
                      <textarea className="form-control border-primary col-12" defaultValue={aboutText} required onChange={(e) => setaboutText(e.target.value)} />
                    </div>
                  </div>

                  <div className="form-group h-auto px-3 d-flex flex-nowrap align-items-center justify-content-start col-12 col-md-6 ">
                    <label className="col-3 col-form-label p-0 m-0">نسبة الضريبة (%)</label>
                    <div className="col-9">
                      <input type="number" className="form-control border-primary col-12" value={salesTaxRate} onChange={(e) => setsalesTaxRate(e.target.value)} required
                      />
                    </div>
                  </div>

                  <div className="form-group h-auto px-3 d-flex flex-nowrap align-items-center justify-content-start col-12 col-md-6 ">
                    <label className="col-3 col-form-label p-0 m-0">نسبة الخدمة (%)</label>
                    <div className="col-9">
                      <input type="number" className="form-control border-primary col-12" value={serviceTaxRate} onChange={(e) => setserviceTaxRate(e.target.value)} required
                      />
                    </div>
                  </div>



                  <div className="form-group h-auto px-3 d-flex flex-nowrap align-items-center justify-content-start col-12 col-md-6 ">
                    <label className="col-3 col-form-label p-0 m-0">اللوجو</label>
                    <div className="d-flex align-items-center col-9">
                      <input type="file" className="form-control me-3" onChange={(e) => handleFileUpload(e)} />
                      {logo ?
                        <div className="d-flex align-items-center justify-content-center" style={{ width: '150px', height: '120px', backgroundColor: 'gray' }}>
                        </div>
                        : <div className="d-flex align-items-center justify-content-center" style={{ width: '150px', height: '120px', backgroundColor: 'gray' }}>
                          <img src={`${apiUrl}/images/${logo}`} alt="logo" className="img-fluid" style={{ maxWidth: '100%', maxHeight: '100%' }} />
                        </div>
                      }
                    </div>
                  </div>

                  <div className="col-12 col-md-6 d-flex flex-wrap">
                    <div className="form-check form-check-flat mb-2 mr-4 d-flex align-items-center w-50">
                      <input
                        type="checkbox"
                        className="form-check-input"
                        checked={dineIn}
                        onChange={() => setdineIn(!dineIn)}
                      />
                      <label className="form-check-label mr-4">الصالة</label>
                    </div>
                    <div className="form-check form-check-flat mb-2 mr-4 d-flex align-items-center w-50">
                      <input
                        type="checkbox"
                        className="form-check-input"
                        checked={takeAway}
                        onChange={() => settakeAway(!takeAway)}
                      />
                      <label className="form-check-label mr-4">التيك اوي</label>
                    </div>
                    <div className="form-check form-check-flat mb-2 mr-4 d-flex align-items-center w-50">
                      <input
                        type="checkbox"
                        className="form-check-input"
                        checked={deliveryService}
                        onChange={() => setdeliveryService(!deliveryService)}
                      />
                      <label className="form-check-label mr-4">خدمة التوصيل</label>
                    </div>
                    <div className="form-check form-check-flat mb-2 mr-4 d-flex align-items-center w-50">
                      <input
                        type="checkbox"
                        className="form-check-input"
                        checked={usesReservationSystem}
                        onChange={() => setusesReservationSystem(!usesReservationSystem)}
                      />
                      <label className="form-check-label mr-4">حجز الطاولة</label>
                    </div>
                  </div>

                  <div className="col-12 d-flex flex-nowrap align-items-center justify-consten-between " style={{ height: '50px' }}>
                    <button type="submit" className="btn btn-success col-6 h-100 p-0">تأكيد</button>
                    <button type="button" className="btn btn-danger col-6 h-100 p-0">إلغاء</button>
                  </div>
                </form>
              </div>
            </div>
          </div>


          <div className="container mt-5">
            <div className="d-flex flex-wrap align-items-center justify-content-between">
              <div className="col-md-6 mb-4">
                <div className="card">
                  <div className="card-body">
                    <h4 className="card-title">وسائل الدفع المقبوله</h4>
                    <p className="card-description">اختر وسائل الدفع المقبوله لدفع فواتير المطعم</p>
                    <form className="forms-sample" onSubmit={handleAcceptedPayments}>
                      <div className="d-flex flex-wrap align-items-center justify-content-between">
                        <div className="col-lg-12">
                          <div className="form-group d-flex flex-wrap">
                            {listAcceptedPayments.map((AcceptedPayment, i) => (
                              <div className="form-check form-check-flat mb-2 mr-4 d-flex align-items-center" key={i} style={{ minWidth: "200px" }}>
                                <input
                                  type="checkbox"
                                  className="form-check-input"
                                  value={AcceptedPayment}
                                  checked={acceptedPayments.includes(AcceptedPayment)}
                                  onChange={() => handleacceptedPaymentsCheckboxChange(AcceptedPayment)}
                                />
                                <label className="form-check-label mr-4">{listAcceptedPaymentsAr[i]}</label>
                              </div>
                            ))}
                          </div>
                        </div>
                      </div>
                      <div className="col-12 d-flex flex-nowrap align-items-center justify-consten-between " style={{ height: '50px' }}>
                        <button type="submit" className="btn btn-success col-6 h-100 p-0">تأكيد</button>
                        <button type="button" className="btn btn-danger col-6 h-100 p-0">إلغاء</button>
                      </div>
                    </form>
                  </div>
                </div>
              </div>

              <div className="col-md-6 mb-4">
                <div className="card">
                  <div className="card-body">
                    <h4 className="card-title">خدمات اضافيه</h4>
                    <p className="card-description">اختر الخدمات المتاحة التي يقدمها المطعم</p>
                    <form className="forms-sample" onSubmit={handleFeatures}>
                      <div className="d-flex flex-wrap align-items-center justify-content-between">
                        <div className="col-lg-12">
                          <div className="form-group d-flex flex-wrap">
                            {listFeatures.map((feature, i) => (
                              <div className="form-check form-check-flat mb-2 mr-4 d-flex align-items-center" key={i} style={{ minWidth: "200px" }}>
                                <input
                                  type="checkbox"
                                  className="form-check-input"
                                  value={feature}
                                  checked={features.includes(feature)}
                                  onChange={() => handleFeaturesCheckboxChange(feature)}
                                />
                                <label className="form-check-label mr-4">{listFeaturesAr[i]}</label>
                              </div>
                            ))}
                          </div>
                        </div>
                      </div>
                      <div className="col-12 d-flex flex-nowrap align-items-center justify-consten-between " style={{ height: '50px' }}>
                        <button type="submit" className="btn btn-success col-6 h-100 p-0">تأكيد</button>
                        <button type="button" className="btn btn-danger col-6 h-100 p-0">إلغاء</button>
                      </div>
                    </form>
                  </div>
                </div>
              </div>
            </div>
          </div>


          {/* contact  */}
          <div className="col-md-6 d-flex align-items-stretch grid-margin">
            <div className="row flex-grow">
              <div className="col-12 stretch-card">
                <div className="card">
                  <div className="card-body">
                    <h4 className="card-title">بيانات التواصل</h4>
                    <p className="card-description"> ادخل بيانات التواصل المتاحة لديك </p>
                    <form className="forms-sample" onSubmit={(e) => handleContactSocialmedia(e)}>
                      <div className="form-group  h-auto px-3 d-flex align-items-center justify-content-start col-12 " style={{ width: '100%' }}>
                        <label className='col-4 text-dark fs-5' htmlFor="phone">رقم الهاتف:</label>
                        <input type="text" className="form-control border-primary" id="phone" placeholder="ادخل رقم الهاتف" required defaultValue={phone} onChange={(e) => setPhone([e.target.value])} />
                      </div>
                      <div className="form-group  h-auto px-3 d-flex align-items-center justify-content-start col-12 " style={{ width: '100%' }}>
                        <label className='col-4 text-dark fs-5' htmlFor="whatsapp">واتساب:</label>
                        <input type="text" className="form-control border-primary" id="whatsapp" placeholder="ادخل رقم واتساب" required defaultValue={whatsapp} onChange={(e) => setWhatsapp(e.target.value)} />
                      </div>
                      <div className="form-group  h-auto px-3 d-flex align-items-center justify-content-start col-12 " style={{ width: '100%' }}>
                        <label className='col-4 text-dark fs-5' htmlFor="email">البريد الإلكتروني:</label>
                        <input type="email" className="form-control border-primary" id="email" placeholder="ادخل البريد الإلكتروني" defaultValue={email} onChange={(e) => setEmail(e.target.value)} />
                      </div>
                      <div className="form-group  h-auto px-3 d-flex align-items-center justify-content-start col-12 " style={{ width: '100%' }}>
                        <label className='col-4 text-dark fs-5' htmlFor="facebook">فيسبوك:</label>
                        <input type="text" className="form-control border-primary" id="facebook" placeholder="ادخل رابط فيسبوك" defaultValue={facebook} required onChange={(e) => setFacebook(e.target.value)} />
                      </div>
                      <div className="form-group  h-auto px-3 d-flex align-items-center justify-content-start col-12 " >
                        <label className='col-4 text-dark fs-5' htmlFor="twitter">تويتر:</label>
                        <input type="text" className="form-control border-primary" id="twitter" placeholder="ادخل رابط تويتر" defaultValue={twitter} onChange={(e) => setTwitter(e.target.value)} />
                      </div>
                      <div className="form-group  h-auto px-3 d-flex align-items-center justify-content-start col-12 " >
                        <label className='col-4 text-dark fs-5' htmlFor="instagram">انستجرام:</label>
                        <input type="text" className="form-control border-primary" id="instagram" placeholder="ادخل رابط انستجرام" defaultValue={instagram} onChange={(e) => setInstagram(e.target.value)} />
                      </div>
                      <div className="form-group  h-auto px-3 d-flex align-items-center justify-content-start col-12 " >
                        <label className='col-4 text-dark fs-5' htmlFor="linkedin">لينكدإن:</label>
                        <input type="text" className="form-control border-primary" id="linkedin" placeholder="ادخل رابط لينكدإن" defaultValue={linkedin} onChange={(e) => setLinkedin(e.target.value)} />
                      </div>
                      <div className="form-group  h-auto px-3 d-flex align-items-center justify-content-start col-12 " >
                        <label className='col-4 text-dark fs-5' htmlFor="youtube">يوتيوب:</label>
                        <input type="text" className="form-control border-primary" id="youtube" placeholder="ادخل رابط يوتيوب" defaultValue={youtube} onChange={(e) => setYoutube(e.target.value)} />
                      </div>
                      <div className="col-12 d-flex flex-nowrap align-items-center justify-consten-between " style={{ height: '50px' }}>
                        <button type="submit" className="btn btn-success col-6 h-100 p-0">تأكيد</button>
                        <button type="button" className="btn btn-danger col-6 h-100 p-0">إلغاء</button>
                      </div>
                    </form>
                  </div>
                </div>
              </div>
              <div className="col-12 stretch-card">
                <div className="card">
                  <div className="card-body">
                    <h4 className="card-title">إضافة بيانات مناطق التوصيل</h4>
                    <p className="card-description">أضف المناطق وتكلفة التوصيل</p>
                    <div className="form-row mb-3">
                      <div className="col">
                        <button type="button" className=" btn btn-success col-12 h-100 p-0 m-0 col-md-6 col-12 h-100 p-0 m-0 btn btn-block" onClick={addArea} style={{ width: '50%', height: '50px' }}>إضافة منطقة توصيل</button>
                      </div>
                    </div>
                    <form className="forms-sample" onSubmit={(e) => handleDeliveryArea(e)}>
                      {areas.map((area, index) => (
                        <div key={index} className="form-row mb-3 align-items-center">
                          <div className="col-md-4 col-5 mb-2 mb-md-0">
                            <input type="text" className="form-control border-primary col-12" placeholder="اسم المنطقة" defaultValue={area.name} onChange={(e) => handleAreasNameChange(index, e)} />
                          </div>
                          <div className="col-md-4 col-4 mb-2 mb-md-0">
                            <input type="number" className="form-control border-primary col-12" placeholder="تكلفة التوصيل" defaultValue={Number(area.delivery_fee)} onChange={(e) => handleDeliveryCostChange(index, e)} />
                          </div>
                          <div className="col-3 mb-2 mb-md-0">
                            <button type="button" className=" btn btn-danger col-12 h-100 p-0 m-0" onClick={() => removeArea(index, area._id)} style={{ height: '50px' }}>
                              <i className="mdi mdi-delete" />
                            </button>
                          </div>
                        </div>
                      ))}
                      <div className="col-12 d-flex flex-nowrap align-items-center justify-consten-between " style={{ height: '50px' }}>
                        <button type="submit" className="btn btn-success col-6 h-100 p-0">تأكيد</button>
                        <button type="button" className="btn btn-danger col-6 h-100 p-0">إلغاء</button>
                      </div>
                    </form>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <div className="col-md-6 d-flex align-items-stretch grid-margin">
            <div className="row flex-grow">
              <div className="col-12 stretch-card">
                <div className="card">
                  <div className="card-body">
                    <h4 className="card-title">مواعيد العمل </h4>
                    <p className="card-description">ادخل مواعيد العمل اليومية </p>
                    <form className="forms-sample" onSubmit={(e) => handleOpeningHours(e)}>
                      <table className="table table-striped">
                        <thead>
                          <tr>
                            <th>اليوم</th>
                            <th>وقت الافتتاح</th>
                            <th>وقت الإغلاق</th>
                            <th>مغلق</th>
                          </tr>
                        </thead>
                        <tbody>
                          {daysOfWeek.map((day, index) => (
                            <tr key={index}>
                              <td>{day}</td>
                              <td><input type="time" className="form-control" name={`openingTime${day}`} disabled={opening_hours && opening_hours[index]?.closed}
                                value={opening_hours && opening_hours[index]?.from}
                                onChange={(e) => handleSetFrom(index, e.target.value)} /></td>

                              <td><input type="time" className="form-control" name={`closingTime${day}`} disabled={opening_hours && opening_hours[index]?.closed}
                                value={opening_hours && opening_hours[index]?.to}
                                onChange={(e) => handleSetTo(index, e.target.value)} /></td>

                              <td><input type="checkbox" className="form-check-input" name={`closed${day}`}
                                checked={opening_hours[index]?.closed} onChange={(e) => handleCheckboxChange(index)} /></td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                      <div className="col-12 d-flex flex-nowrap align-items-center justify-consten-between " style={{ height: '50px' }}>
                        <button type="submit" className="btn btn-success col-6 h-100 p-0">تأكيد</button>
                        <button type="button" className="btn btn-danger col-6 h-100 p-0">إلغاء</button>
                      </div>
                    </form>
                  </div>
                </div>

              </div>
              <div className="col-12 stretch-card">
                <div className="card">
                  <div className="card-body">
                    <h4 className="card-title">إضافة بيانات الورديات</h4>
                    <p className="card-description">أضف الورديات و وقت الحضور و الانصراف</p>
                    <div className="form-row mb-3">
                      <div className="col">
                        <button type="button" className="btn btn-success  h-100 p-0" onClick={addShift} style={{ height: '50px' }}>إضافة وردية</button>
                      </div>
                    </div>
                    <form className="forms-sample" onSubmit={(e) => handleCreateShifts(e)}>
                      {shifts.map((shift, index) => (
                        <div key={index} className="form-row mb-3 align-items-center">
                          <div className="col-md-3 col-12 mb-2 mb-md-0">
                            <input type="text" className="form-control border-primary col-12" placeholder="اسم الوردية" defaultValue={shift.shiftType} onChange={(e) => handleShiftTypeChange(index, e)} />
                          </div>
                          <div className="col-md-3 col-6 mb-2 mb-md-0">
                            <input type="time" className="form-control border-primary col-12" placeholder="ميعاد البدء" defaultValue={shift.startTime} onChange={(e) => handleStartTimeChange(index, e)} />
                          </div>
                          <div className="col-md-3 col-6 mb-2 mb-md-0">
                            <input type="time" className="form-control border-primary col-12" placeholder="ميعاد الانتهاء" defaultValue={shift.endTime} onChange={(e) => handleEndTimeChange(index, e)} />
                          </div>
                          <div className="col-md-2 col-6 mb-2 mb-md-0">
                            <p className="form-control-plaintext">{`${shift.hours} ساعات`}</p>
                          </div>
                          <div className="col-md-1 col-6">
                            <button type="button" className="btn btn-danger text-center  h-100  p-0 m-0" onClick={() => removeShift(index, shift._id)}>
                              <i className="mdi mdi-delete" />
                            </button>
                          </div>
                        </div>
                      ))}
                      <div className="col-12 d-flex flex-nowrap align-items-center justify-consten-between " style={{ height: '50px' }}>
                        <button type="submit" className="btn btn-success col-6 h-100 p-0">تأكيد</button>
                        <button type="button" className="btn btn-danger col-6 h-100 p-0">إلغاء</button>
                      </div>
                    </form>
                  </div>
                </div>
              </div>

            </div>
          </div>

        </div>
      </div>
    </div>
  )

}

export default Info

