import { useEffect, useState } from 'react';
import styles from './Receipt.module.css'
import { useNavigate } from 'react-router-dom';

export function Receipt(props){
  const navigate = useNavigate();
  const [address, setAddress] = useState("");
  const [inputUser, setInputUser] = useState("사업자정보");
  const inLogin = JSON.parse(sessionStorage.getItem('saveLoginData'));
  // 유효성검사 State
  const [isFormValid, setIsFormValid] = useState(false);  

  // 주소창으로 접근 등 잘못된 접근 시 경고창 표시 후 홈으로 이동 
  useEffect(()=>{ 
    if (props.activeTab !== 2) {
      alert("잘못된 접근입니다.")
      props.setActiveTab(1);
      navigate("/");
    }
  }, [props, navigate])

  // 다음(카카오) 주소찾기 API 기능
  const openPopup = (setAddress) => {
      const script = document.createElement('script');
      script.src = 'https://t1.daumcdn.net/mapjsapi/bundle/postcode/prod/postcode.v2.js';
      script.onload = () => {
        new window.daum.Postcode({
          oncomplete: (data) => {
            setAddress(data);
            setDeliveryInformation(prevdata=>
              ({
                ...prevdata,
                address : {
                  ...prevdata.address,
                  address : data,
                }
              }))
          }
      }).open();
  }
  document.body.appendChild(script);
}

// 데이터 항목 저장
  const [orderInformation, setOrderInformation] = useState({
    name : "",
    tel : "",
    email : "",
    smtMessage: "",
    payRoute : "",
    moneyReceipt : "",
    transAction : "",
    fax : "",
    checked : false,
  })
  const [deliveryInformation, setDeliveryInformation] = useState({
    name : "",
    tel : "",
    address : {
      address : "",
      addressDetail : "",
    },
    deliveryType : "",
    deliveryMessage : "",
  })

  useEffect(() => {
    if(props.userData){
      const findUser = props.userData.find(userData => userData.id == inLogin.id);
      if (findUser) {
        if (inputUser === '사업자정보') {
          setAddress(findUser.address);
          setOrderInformation(prevData => ({
            ...prevData,
            name: findUser.corporationData.ceoName,
            tel: `${findUser.num1}-${findUser.num2}-${findUser.num3}`,
            email: findUser.email,
            fax: findUser.corporationData.FAX,
          }));
          setDeliveryInformation(prevData => ({
            ...prevData,
            name : findUser.corporationData.ceoName,
            tel: `${findUser.num1}-${findUser.num2}-${findUser.num3}`,
            address : {
              address : address,
              addressDetail : findUser.addressDetail,
            },
          }));
        } else if (inputUser === '직접입력') {
          setAddress("")
          setOrderInformation(prevData => ({
            ...prevData,
            name: findUser.corporationData.ceoName,
            tel: `${findUser.num1}-${findUser.num2}-${findUser.num3}`,
            email: findUser.email,
          }));
          setDeliveryInformation(prevData => ({
            ...prevData,
            name : "",
            tel: "",
            address : {
              address : "",
              addressDetail : "",
            },
          }));
        }
      }
    }
  }, [inputUser, props.userData, inLogin.id, address]);

  // Input란 유효성 검사
  const validateForm = () => {
    if (!orderInformation || !deliveryInformation) {
      alert("주문 정보 및 배송 정보가 정의되지 않았습니다.");
      return;
    }
    const isOrderInformationValid = () => {
      if(
      orderInformation.name !== "" &&
      orderInformation.tel !== "" &&
      orderInformation.email !== "" &&
      orderInformation.payRoute !== ""
      ){
        if(orderInformation.moneyReceipt === '명세서'){
          if(orderInformation.transAction === '명세서출력'){
            return (
              orderInformation.moneyReceipt !== "" &&
              orderInformation.transAction !== "" &&
              orderInformation.fax !== ""
            );
          } else {
            return (
            orderInformation.moneyReceipt !== "" &&
            orderInformation.transAction !== ""
            )
          }
        } else {
          return(
            orderInformation.moneyReceipt !== ""
          )
        }
      } else {
      return false;
      }
  }
      
      
      
    const isDeliveryInformationValid =
      deliveryInformation.name !== "" &&
      deliveryInformation.tel !== "" &&
      deliveryInformation.address.address !== "" &&
      deliveryInformation.address.addressDetail !== "" &&
      deliveryInformation.deliveryType !== "" &&
      deliveryInformation.deliveryMessage !== "";

  
    const isCheckboxChecked = orderInformation.checked === true;

    const isOrderValid = isOrderInformationValid();

    setIsFormValid(isOrderValid && isDeliveryInformationValid && isCheckboxChecked);

    if (!isOrderValid || !isDeliveryInformationValid || !isCheckboxChecked){
      alert("작성이 되지 않은 란이 있습니다. 다시 확인해주세요!");
    }
  };



  // submit 버튼
  function gotoLink(){
    validateForm();
    const isValidSupply = props.orderList.every((orderItem) => {
      const productMatchingId = props.data.find((item) => item.id === orderItem.productId);
      return productMatchingId && productMatchingId.supply > 0;
    });
    
    if (!isValidSupply) {
      alert("주문 요청한 상품 중에 재고가 없는 상품이 있습니다!");
      return;
    }
    if(props.activeTab===2 && isFormValid && isValidSupply) {
    // supply 수정
      const productData = props.data.map((item) => {
        const isProductInOrderList = props.orderList.some(
          (orderListItem) => orderListItem.productId === item.id
        );
      if (isProductInOrderList) {
        return {
          ...item,
          supply: item.supply - 1,
        };
      }
      return item;
    });
      props.setData(productData);
      // 현재 날짜와 시간을 가져오기
      const currentDate =  new Date();
      const formattedDate = currentDate.toLocaleString();
      const newOrderId = props.orderData.length + 1;
      const editedData = JSON.parse(localStorage.getItem('orderData'));
      const newOrderData = editedData.map((item) => ({
        ...item,
        orderId: newOrderId,
        order: orderInformation,
        delivery: deliveryInformation,
        date: formattedDate,
        orderState: orderInformation.payRoute === 'CMS' ? 2 : 0, //0 => 결제대기, 1 => 결제완료 2 => 배송준비중 3 => 배송중 4 => 배송완료 
      }));
        // 데이터 삽입
        //orderData (주문 진행 객체) 업데이트
        const copyData = [...props.orderData];
        copyData.push(...newOrderData);
        props.setOrderData(copyData);
        // localStorage 변경
        localStorage.removeItem('orderData');
        localStorage.setItem('newOrderData', JSON.stringify(newOrderData))
        props.setBasketList(props.basketList.filter((item)=>!props.orderList.some((orderItem) =>
        orderItem.optionSelected 
        ? 
        orderItem.optionSelected === item.optionSelected &&
        orderItem.userId === item.userId &&
        orderItem.productId === item.id
        :  
        orderItem.userId === item.userId &&
        orderItem.productId === item.id)))
        //결제 방식이 CMS일때
        if(orderInformation.payRoute === 'CMS'){
          props.setActiveTab(4);
          navigate("/basket/order");

          // 결제방식이 일반결제 일때
        } else if (orderInformation.payRoute === '일반결제') {
        props.setActiveTab(3);
        navigate("/basket/pay");
        }
    }
  }

  const deliveryMessageExample=[
  {value: '빠른배송 부탁드립니다.'},
  {value: '벨 누르지 말고 배송 전 연락바랍니다.'},
  {value: '배송 전 연락 바랍니다.'},
  {value: '문 앞에 두고 가주세요.'},
]

  const smtMessageExample=[
    {value: '빠른 출고 부탁드립니다.'},
    {value: '명세서 제외 바랍니다.'},
    {value: '발송자 표시 바랍니다.(고객 직송 건)'}
  ]

  return(
    <div>
      <div className={styles.container}>
        <h1 className={styles.headTag}>자동 정보 입력</h1>
        <div className={styles.form}>
          <div className={styles.formInner}>
            <div className={styles.label}>
              <label>구분</label>
            </div>
            <div className={styles.input}>
              <input 
              name='inputUser'
              onChange={()=>setInputUser("사업자정보")}
              value="사업자정보" 
              checked={inputUser === "사업자정보"} 
              type="radio"
              />
              사업자 정보로 입력
              <input 
              name='inputUser'
              onChange={()=>setInputUser("직접입력")} 
              value="직접입력" 
              checked={inputUser === "직접입력"} 
              type="radio"
              />
              직접입력
            </div>
          </div>
        </div>
        <h1 className={styles.headTag}>주문자 정보</h1>
        <form className={styles.form}>
          <div className={styles.formInner}>
            <div className={styles.label}>
              <label>성함</label>
            </div>
            <div className={styles.input}>
              <input 
              type="text" 
              className={styles.inputSize}
              placeholder="성함을 입력하세요"
              value={orderInformation.name}
              required 
              onChange={(e)=>{
                setOrderInformation(
                prevdata=> ({
                  ...prevdata,
                  name : e.target.value,
                })
              )
            }
            }
              />
            </div>
          </div>
          <div className={styles.formInner}>
            <div className={styles.label}>
              <label>전화번호</label>
            </div>
            <div className={styles.input}>
              <input 
              type="tel" 
              className={styles.inputSize} 
              placeholder="전화번호를 입력하세요"
              value={orderInformation.tel}
              required 
              onChange={(e)=>setOrderInformation(
                prevdata=> ({
                  ...prevdata,
                  tel : e.target.value,
                })
              )}
              />
            </div>
          </div>
          <div className={styles.formInner}>
            <div className={styles.label}>
              <label>이메일</label>
            </div>
            <div className={styles.input}>
              <input 
              type="email" 
              className={styles.inputSize} 
              placeholder="이메일을 입력하세요"
              value={orderInformation.email}
              required 
              onChange={(e)=>setOrderInformation(
                prevdata=> ({
                  ...prevdata,
                  email : e.target.value,
                })
              )}
              />
            </div>
          </div>
          <div className={styles.formInner}>
            <div className={styles.label}>
              <label>성동 메세지</label>
            </div>
            <div style={{flexDirection: 'row', width: '60%'}} className={styles.searchResult}>
              <input 
              style={{flexDirection: 'row', width: '50%'}}
              className={styles.inputSize} 
              value={orderInformation.smtMessage}
              type="text" 
              placeholder='성동물산에 남길 메세지를 적어주세요'
              onChange={(e)=>setOrderInformation(
                prevdata=> ({
                  ...prevdata,
                  smtMessage : e.target.value,
                })
              )}
              />
              <select
              className={styles.selectSize}
              name="orderMessage"
              value={orderInformation.smtMessage || ""}              
              onChange={(e)=>setOrderInformation(
                prevdata=> ({
                  ...prevdata,
                  smtMessage : e.target.value,
                })
              )}
              >
                <option value="" disabled>
                  /----메세지 선택----/
                </option>
                <option value="">
                  직접 입력
                </option>
                {smtMessageExample.map((item, index) => 
                <option key={index} value={item.value}>
                  {item.value}
                </option>
                )}
              </select>
            </div>
          </div>
        </form>

        <h1 className={styles.headTag}>배송지 정보</h1>
        <form className={styles.form}>
          <div className={styles.formInner}>
            <div className={styles.label}>
              <label>성함</label>
            </div>
            <div className={styles.input}>
              <input 
              type="text" 
              className={styles.inputSize} 
              placeholder="성함을 입력하세요"
              value={deliveryInformation.name}
              required 
              onChange={(e)=>setDeliveryInformation(
                prevdata=> ({
                  ...prevdata,
                  name : e.target.value,
                })
              )}
              />
            </div>
          </div>
          <div className={styles.formInner}>
            <div className={styles.label}>
              <label>전화번호</label>
            </div>
            <div className={styles.input}>
              <input 
              type="tel"
              className={styles.inputSize} 
              placeholder="전화번호를 입력하세요"
              value={deliveryInformation.tel}
              required 
              onChange={(e)=>setDeliveryInformation(
                prevdata=> ({
                  ...prevdata,
                  tel : e.target.value,
                })
              )}
              />
            </div>
          </div>
          <div className={styles.formInner}>
            <div className={styles.label}>
              <label>주소</label>
            </div>
            <div className={styles.searchResult}>
              <div className={styles.searchAddress}>
                <input 
                  className={styles.inputSize} 
                  type="text" value={address && address.zonecode} 
                  placeholder="우편번호"
                  required
                  readOnly
                />
                <input 
                  className={styles.button} 
                  type="button" 
                  onClick={()=>{
                    openPopup(setAddress);
                  }}
                  value="우편번호 찾기"
                />
              </div>
              <input 
                className={styles.inputSize} 
                type="text" 
                value={address && address.roadAddress}
                placeholder="도로명 주소"
                required
                readOnly
              />
              <input 
                className={styles.inputSize}
                type="text" 
                value={address && address.buildingName ? `(${address.bname}, ${address.buildingName})` : address && `(${address.bname}, ${address.jibunAddress})`}  
                placeholder="건물 이름 또는 지번 주소"
                required
                readOnly
              />
              <input 
              className={styles.inputSize} 
              type="text" 
              placeholder="상세주소를 입력해주세요."
              value={deliveryInformation.address.addressDetail} 
              required
              onChange={(e)=>setDeliveryInformation(
                prevdata=> ({
                  ...prevdata,
                  address : {
                    ...prevdata.address,
                    addressDetail : e.target.value,
                  },
                })
              )}
              />
            </div>
          </div>
          <div className={styles.formInner}>
            <div className={styles.label}>
              <label>배송 방식</label>
            </div>
            <div className={styles.input}>
              <input 
              name='delivery' 
              value="책임택배" 
              checked={deliveryInformation.deliveryType === '책임택배'} 
              type="radio"
              onChange={(e)=>
                setDeliveryInformation(prevdata=>
                  ({
                      ...prevdata,
                      deliveryType : e.target.value, 
                  })
                )
              }
              />
              책임 택배
              <input 
              name='delivery' 
              value="화물" 
              checked={deliveryInformation.deliveryType === '화물'} 
              type="radio"
              onChange={(e)=>
                setDeliveryInformation(prevdata=>
                  ({
                    ...prevdata,
                    deliveryType : e.target.value, 
                  })
                )
              }
              />
              화물
              <input 
              name='delivery' 
              value="일반택배" 
              checked={deliveryInformation.deliveryType === '일반택배'} 
              type="radio"
              onChange={(e)=>
                setDeliveryInformation(prevdata=>
                  ({
                    ...prevdata,
                    deliveryType : e.target.value, 
                  })
                )
              }
              />
              일반택배
              <input 
              name='delivery' 
              value="직접픽업" 
              checked={deliveryInformation.deliveryType === '직접픽업'} 
              type="radio"
              onChange={(e)=>
                setDeliveryInformation(prevdata=>
                  ({
                    ...prevdata,
                    deliveryType : e.target.value, 
                  })
                )
              }
              />
              직접 픽업
            </div>
          </div>
          <div className={styles.formInner}>
            <div className={styles.label}>
              <label>배송 메세지</label>
            </div>
            <div style={{flexDirection: 'row', width: '60%'}} className={styles.searchResult}>
              <input 
              style={{flexDirection: 'row', width: '50%'}}
              className={styles.inputSize} 
              value={deliveryInformation.deliveryMessage}
              type="text" 
              placeholder='택배 기사님께 남길 메세지를 적어주세요'
              onChange={(e)=>setDeliveryInformation(
                prevdata=> ({
                  ...prevdata,
                  deliveryMessage : e.target.value,
                })
              )}
              />
              <select
              className={styles.selectSize}
              name="deliveryMessage"
              value={deliveryInformation.deliveryMessage || ""}              
              onChange={(e)=>setDeliveryInformation(
                prevdata=> ({
                  ...prevdata,
                  deliveryMessage : e.target.value,
                })
              )}
              >
                <option value="" disabled>
                  /----배송 메세지 선택----/
                </option>
                <option value="">
                  직접 입력
                </option>
                {deliveryMessageExample.map((item, index) => 
                <option key={index} value={item.value}>
                  {item.value}
                </option>
                )}
              </select>
            </div>
          </div>
        </form>

        <h1 className={styles.headTag}>결제 수단</h1>
        <form className={styles.form}>
          <div className={styles.formInner}>
            <div className={styles.label}>
              <label>결제 방법</label>
            </div>
            <div className={styles.input}>
              <input 
              name='payroute' 
              type="radio"
              value="일반결제"
              checked={orderInformation.payRoute === '일반결제'} 
              onChange={(e)=>setOrderInformation(
                prevdata=> ({
                  ...prevdata,
                  payRoute : e.target.value,
                })
              )}
              />
              일반결제 (무통장 입금)
              <input 
              name='payroute' 
              type="radio"
              value="CMS"
              checked={orderInformation.payRoute === 'CMS'} 
              onChange={(e)=>setOrderInformation(
                prevdata=> ({
                  ...prevdata,
                  payRoute : e.target.value,
                })
              )}
              />
              CMS (매달 정기일 자동 결제)
            </div>
          </div>
          <div className={styles.formInner}>
            <div className={styles.label}>
              <label>증빙서류 발급</label>
            </div>
            <div className={styles.input}>
              <input 
              name='moneyreceipt' 
              type="radio"
              value="발행안함"
              checked={orderInformation.moneyReceipt === '발행안함'} 
              onChange={(e)=>setOrderInformation(
                prevdata=> ({
                  ...prevdata,
                  moneyReceipt : e.target.value,
                })
              )}
              /> 발행안함
              {/* <input 
              name='moneyreceipt' 
              type="radio"
              value="현금영수증"
              checked={orderInformation.moneyReceipt === '현금영수증'} 
              onChange={(e)=>setOrderInformation(
                prevdata=> ({
                  ...prevdata,
                  moneyReceipt : e.target.value,
                })
              )}
              /> 현금영수증
              <input 
              name='moneyreceipt' 
              type="radio"
              value="세금계산서"
              checked={orderInformation.moneyReceipt === '세금계산서'} 
              onChange={(e)=>setOrderInformation(
                prevdata=> ({
                  ...prevdata,
                  moneyReceipt : e.target.value,
                })
              )}
              /> 세금계산서 */}
              <input 
              name='moneyreceipt' 
              type="radio"
              value="명세서"
              checked={orderInformation.moneyReceipt === '명세서'} 
              onChange={(e)=>setOrderInformation(
                prevdata=> ({
                  ...prevdata,
                  moneyReceipt : e.target.value,
                })
              )}
              /> 명세서
            </div>
          </div>
          {orderInformation.moneyReceipt === '명세서' && 
          <div className={styles.formInner}>
            <div className={styles.label}>
              <label>명세서</label>
            </div>
            <div className={styles.input}>
              <input 
              name='transaction' 
              type="radio"
              value="명세서실물"
              checked={orderInformation.transAction === '명세서실물'} 
              onChange={(e)=>setOrderInformation(
                prevdata=> ({
                  ...prevdata,
                  transAction : e.target.value,
                })
              )}
              /> 명세서 실물 동봉
              <input 
              name='transaction' 
              type="radio"
              value="명세서출력"
              checked={orderInformation.transAction === '명세서출력'} 
              onChange={(e)=>setOrderInformation(
                prevdata=> ({
                  ...prevdata,
                  transAction : e.target.value,
                })
              )}
              /> 명세서 FAX 출력
            </div>
          </div>
          }
          {orderInformation.transAction === '명세서출력' &&
          <div className={styles.formInner}>
            <div className={styles.label}>
              <label>FAX 번호</label>
            </div>
            <div className={styles.input}>
              <input 
              type="text" 
              className={styles.inputSize} 
              placeholder="FAX 번호를 입력하세요"
              value={orderInformation.fax}
              required 
              onChange={(e)=>setOrderInformation(
                prevdata=> ({
                  ...prevdata,
                  fax : e.target.value,
                })
              )}
              />
            </div>
          </div>
          }
        </form>
        <div className={styles.formInner}>
          <input 
          checked={orderInformation.checked} 
          onChange={() => setOrderInformation(prevdata => ({
          ...prevdata,
          checked : !prevdata.checked
          }))} 
          type="checkbox"
          />
            구매동의 및 결제대행서비스 이용약관 등에 모두 동의합니다.
          <button className={styles.button}>약관보기</button>
        </div>
        <div>
          <button  
          onClick={()=> {
            gotoLink()
          }} 
          className={styles.submitButton}
          >
            결제하기
          </button>
        </div>
      </div>
    </div>
  )
}