import React,{useState, useEffect} from 'react'
import './AdminSchedule.css'
import Menu from "../Menu/AdminMenu"
import Header from '../../../common/Header/Header'
import { Icon } from '@iconify/react';
import Axios from "axios";
import { Alert, DatePicker } from 'antd';
import moment from 'moment';
import Barcode from '../../../common/Barcode/Barcode';

function AdminSchedule(props) {
  let [nhanviens, setNhanVien] = useState([])
  const getNV = async () => {
      try {
          const res = await Axios.get('http://localhost:8000/v1/nhanvien/getnhanvien')
          setNhanVien(res.data);
      }
      catch (error) {
          console.log(error.message)
      }
  }
  let [thoigianlamviec, setThoiGianLamViec] = useState()
  const getTGLV = async () => {
    try {
      const res = await Axios.get('http://localhost:8000/v1/thoigianlamviec/getThoiGianLamViecbyTG/'+ moment().format('MM-YYYY'))
      setThoiGianLamViec(res.data[0].LAMVIEC);
    } catch (error) {
      const newData = [];
      for (let i = 0; i < dayInMonth; i++) {
        const arr = tableData.map((item) => {
            return {
              gio: item.gio[i]||0, // Lấy giá trị thứ i trong mảng gio
              sdt: item.sdt,
            };
        });
        newData.push(arr);
      }
      console.log('a',newData)
      Axios.post('http://localhost:8000/v1/thoigianlamviec/themThoiGianLamViec/', {
        THOIGIAN: thang,
        LAMVIEC: newData
      });
      window.location.reload()
    }
  }
  const [thang, setThang] = useState(moment().format('MM-YYYY'))
  const [dayInMonth, setDayInMonth] = useState(moment(thang, 'MM-YYYY').daysInMonth());
  const [tdItems, settdItems] = useState(Array(dayInMonth).fill(''));
  useEffect(() => {
    getNV();
    settdItems(Array(dayInMonth).fill('').map((_, index) => index + 1));
    if (thoigianlamviec) {
      createTableData(thoigianlamviec);
    } else {
      getTGLV();
    }
  }, [thoigianlamviec, dayInMonth])

  const [tableData, setTableData] = useState([]);

  // Lấy danh sách tất cả các số điện thoại từ mảng thoigianlamviec
  const getSDTList = () => {
    const sdtSet = new Set();
    for(let i=0; i< nhanviens.length; i++) {
      sdtSet.add(nhanviens[i].SDT);
    }
    return Array.from(sdtSet);
  };
  const sdtList = getSDTList();

  // Lấy tất cả các giá trị thời gian làm việc của một ngày
  const getGioLamViec = (sdt, index) => {
    const data = tableData.find((item) => item.sdt === sdt);
    if (!data) {
      return 0;
    }
    return data.gio[index] || 0;
  };
  const gettglamviec = (sdt) => {
    const data = tableData.find((item) => item.sdt === sdt);
    if (!data) {
      return 0;
    }
    let s=0;
    for(let i = 0; i < tableData.length; i++) {
      s += Number(data.gio[i]) || 0;
    }
    return s;
  };
 //tạo làm việc khi có thay đổi
  const setGioLamViec = (sdt, index, gioLamViec, setTableData) => {
    // Lấy ra object dữ liệu tương ứng với số điện thoại sdt
    const data = tableData.find((item) => item.sdt === sdt);
    if (!data) {
      return;
    }
    // Sao chép mảng gio và cập nhật giá trị ở vị trí index
    const newGio = [...data.gio];
    newGio[index] = gioLamViec;

    // Sao chép mảng tableData và cập nhật dữ liệu ở vị trí tương ứng với số điện thoại sdt
    const newTableData = [...tableData];
    const dataIndex = newTableData.findIndex((item) => item.sdt === sdt);
    if (dataIndex !== -1) {
      newTableData[dataIndex] = { ...data, gio: newGio };
      setTableData(newTableData);
    }
  };

  const handleInputChange = (event ,sdt,index) => {
    const newValue = event.target.value;
    setGioLamViec(newValue);

    // Gọi hàm setGioLamViec để cập nhật dữ liệu
    setGioLamViec(sdt, index, newValue, setTableData);
  };

  const handleSave = async() => {
    const newData = [];
    for (let i = 0; i < dayInMonth; i++) {
      const arr = tableData.map((item) => {
          return {
            gio: item.gio[i]||0, // Lấy giá trị thứ i trong mảng gio
            sdt: item.sdt,
          };
      });
      newData.push(arr);
    }
    console.log('a',newData)
    console.log('a',thang)
    await Axios.patch('http://localhost:8000/v1/thoigianlamviec/updateThoiGianLamViec/' + thang , {
      LAMVIEC: newData
    });
    alert('Lưu thay đổi thành công')
  };
  // Tạo mảng dữ liệu cho bảng
  const createTableData = (thoigianlamviec) => {
    if(thoigianlamviec!== null)
    {
      const sdtList = getSDTList();
      const newData = [];
      sdtList.forEach((sdt) => {
        const rowData = { sdt, gio: [] };
        thoigianlamviec.forEach((row, index) => {
          const item = row.find((item) => item.sdt === sdt);
          if (item) {
            rowData.gio[index] = item.gio;
          } else {
            rowData.gio[index] = 0;
          }
        });
        newData.push(rowData);
      });
      setTableData(newData);
    }
    else console.log(null)
  };

  const handleDateChange = async (date, dateString) => {
    if (dateString!=='') {
      const numOfDays = moment(dateString, 'MM-YYYY').daysInMonth();
      setDayInMonth(numOfDays);
      settdItems(Array(numOfDays).fill('').map((_, index) => index + 1));
      try {
      const res = await Axios.get('http://localhost:8000/v1/thoigianlamviec/getThoiGianLamViecbyTG/'+ dateString)
      setThoiGianLamViec(res.data[0].LAMVIEC);
    }catch (error) {
      if (error.response && error.response.status === 404) {
        setThoiGianLamViec([]);
      }
    }
    }
    setThang(dateString);
  };

  return (
    <div className='AdminSchedule'>
      <Menu/>
      <Header title="LỊCH LÀM VIỆC" avt='http://surl.li/ggptd' name={localStorage.getItem('user')}/>
      <div className='AdminSchedule_main'>
        <div className='AdminSchedule_searchbar'>
          <label>Chọn thời gian:</label>
          <DatePicker
            style={{ width: '20vw', height: '4vh', marginLeft:'1vw', paddingLeft: '7vw' }}
            format="MM-YYYY"
            picker='month'
            allowClear={true}
            defaultValue={moment()}
            value={thang ? moment(thang, 'MM-YYYY') : null}
            onChange={handleDateChange}
          />
          <button style={{width:'7vw', height:'4vh', marginLeft:'8vw', backgroundColor:'orange', border:'0', color:'white'}} onClick={handleSave}>Lưu bảng</button>
        </div>
          <div className="AdminSchedule-information">
            <table className="AdminSchedule-information-table">
                <tr className='AdminSchedule-information-detail' >
                    <div className='AdminSchedule-information-detail-wrapper'>
                        <td style={{maxWidth:'15vw', minWidth:'15vw', border: 'solid #000', borderWidth:'0 1px 1px 0'}}>Nhân viên\Ngày</td>
                        {tdItems.map((item, index) => (
                          <td style={{minWidth:'10vw', border: 'solid #000', borderWidth:'0 1px 1px 0'}}>{index+1}</td>
                        ))}
                        <td style={{maxWidth:'15vw', minWidth:'15vw', border: 'solid #000', borderWidth:'0 1px 1px 0'}}>Tổng số giờ</td>
                    </div>
                </tr>
                <div className='AdminSchedule_detail_infor'>
                  {sdtList.map((sdt) => (
                    <tr className='AdminSchedule-information-detail-wrapper'>
                      <td style={{maxWidth:'15vw', minWidth:'15vw', border: 'solid #000', borderWidth:'0 1px 1px 0'}}>{sdt}</td>
                        {tdItems.map((item, index) => (
                            <td style={{minWidth:'10vw', border: 'solid #000', borderWidth:'0 1px 1px 0'}}>
                              <input style={{width:'4vw'}} value={getGioLamViec(sdt,index)} onChange={(event)=> handleInputChange(event,sdt,index)}/>
                            </td>
                        ))}
                      <td style={{maxWidth:'15vw', minWidth:'15vw', border: 'solid #000', borderWidth:'0 1px 1px 0'}}>{gettglamviec(sdt)}</td>
                    </tr>
                  ))}
                </div>
            </table>
            {/* <Barcode value="cmxcaamnczzc1321" /> */}
          </div>
      </div>
    </div>
  )
}

export default AdminSchedule