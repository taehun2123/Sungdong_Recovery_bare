import { Tab } from './Tab'
import styles from './Detail.module.css'
import { useNavigate, useParams } from 'react-router-dom'
import { useState } from 'react'
import { TopBanner } from '../AboutHeader/TopBanner'
import { TabInfo } from './TabInfo'

export function Detail(props) {
  // Usenavigate
  const navigate = useNavigate();

 //수량 개수 state
  const [count, setCount] = useState("1");

  //옵션 선택 state
  const [optionSelected, setOptionSelected] = useState(null);

  //로그인 정보 불러오기
  const inLogin = JSON.parse(sessionStorage.getItem('saveLoginData'))

  //주소창 입력된 id값 받아오기
  let {id} = useParams();
  const loadData = ()=> {
    if(props.data){
      //입력된 id과 data내부의 id값 일치하는 값 찾아 변수 선언
      const data = props.data.find((item)=>item.id==id);
      return data;
    } else {
      return <div>데이터를 불러오는 중이거나 상품을 찾을 수 없습니다.</div>;
    }
  }


  //로딩된 데이터 불러오기
  const detailData = loadData();




  //수량 최대입력 글자(제한 길이 변수)
  const maxLengthCheck = (e) => { 
    const lengthTarget = e.target.value; 
    //target.value.length = input에서 받은 value의 길이 
    //target.maxLength = 제한 길이

    if ( lengthTarget >= 0 && lengthTarget.length <= 3) { 
        setCount(lengthTarget); 
    } 
}


// 즉시구매 함수
function buyThis(product, count){
    console.log(product)
    if(!props.login){
      alert("로그인 후 이용가능한 서비스입니다.")
      navigate("/login");
      return;
    }
    if(count <= 0){
      alert("수량은 0보다 커야합니다.")
      return;
    }
  
    if (product.option && !optionSelected) {
      alert("필수 옵션을 선택해주세요!");
      return;
    }

    if(product.supply <= 0){
      alert("해당상품의 재고가 없습니다.")
      return;
    } 
  
    const newBuyProduct = () => {
      if(product.option && optionSelected){
        return {
          productId : product.id,
          userId: inLogin.id, 
          image : {
            mini : product.image.mini,
            original : product.image.original,
          },
          productName : product.title,
          cnt : Number(count), 
          supply: product.supply,
          price: product.price,
          finprice : (product.price * count), //총 계산액
          discount : product.discount ? product.discount : 0,
          optionSelected : optionSelected,
        }
      } return {
        productId : product.id,
        userId: inLogin.id,
        image : {
          mini : product.image.mini,
          original : product.image.original,
        },
        productName : product.title,
        cnt : Number(count), 
        supply: product.supply,
        price: product.price,
        finprice : (product.price * count), //총 계산액
        // 이후 discount 값 수정 필요 (등급에 따라)
        discount : product.discount ? product.discount : 0,
      }
    }
      // localStorage에 저장
      localStorage.setItem('orderData', JSON.stringify([newBuyProduct()]));
      props.setOrderList([newBuyProduct()]);
      navigate("/basket/receipt");
      props.setActiveTab(2);
    }

// 장바구니 담기 함수
function basketThis(product, count){
  // login 캐쉬값이 저장되어 있는 것이 확인이 되면 허용
  if(!props.login){
    alert("로그인 후 이용가능한 서비스입니다.")
    navigate("/login");
    return;
  }
  // 수량 0개 저장방지
  if(count <= 0){
    alert("수량은 0보다 커야합니다.")
    return;
  }
  // 필수옵션 선택 조건
  if (product.option && !optionSelected) {
    alert("필수 옵션을 선택해주세요!");
    return;
  }

  //중복 확인 (.some 함수 : basketList item.id 중 product.id와 같은 중복인 아이템이 있으면 true 반환)
  const isDuplicate = props.basketList.some((basketItem) =>
  basketItem.id === product.id &&
  (
    (basketItem.option === null && product.option === null) || // 둘 다 옵션이 없는 경우
    (basketItem.optionSelected === optionSelected) // 옵션값이 같은 경우
  )
);
  

  const newBasketProduct = () => { 
    if(product.option && optionSelected){
      return {
        ...product,
        userId: inLogin.id,
        cnt : count,
        finprice : (product.price * count), //총 계산액
        optionSelected : optionSelected,
      }
    } return {
      ...product,
      userId: inLogin.id,
      cnt : count,
      finprice : (product.price * count)
    }
  }

  if (isDuplicate) {
    alert("이미 장바구니에 추가된 상품입니다.");
  } else {
    // 중복 상품이 아닌 경우에만 추가
    props.setBasketList([...props.basketList, newBasketProduct()]);
    alert("해당 상품이 장바구니에 추가되었습니다.");
  }
}


  // 찜하기
  function likethis(product){
    //중복 확인 (.some 함수 : wishlist의 item.id 중 product.id와 같은 중복인 아이템이 있으면 true 반환 | !some이니 false면..== 중복이 아니면..)
    if (!props.wishlist.some((item) => item.id === product.id)){
      const likelist = [...props.wishlist, product]; //props.wishlist 배열들과 배열 product를 합쳐서 새로운 배열 likelist를 생성
      props.setWishlist(likelist); //State에 새로운 배열 삽입
      localStorage.setItem('likelist', JSON.stringify(likelist)); //새로고침해도 찜 목록 유지
      alert("해당 상품이 관심 상품 목록에 추가되었습니다.")
    } else {
      //wishlist 아이템들 중에서 item.id와 product.id와 같지 않은 것들로 필터링하여 unlikelist에 저장
      const unlikelist = props.wishlist.filter((item)=> item.id !== product.id);
      props.setWishlist(unlikelist); // state에 새로운 list 삽입
      localStorage.setItem('likelist', JSON.stringify(unlikelist)); //새로고침하면 필터링 된 목록 표시
    }
  }

  return(
    <div>
      <TopBanner menuOnClick={props.menuOnClick} menu_dynamicStyle={props.menu_dynamicStyle} data={props.data} setData={props.setData} categoryData={props.categoryData} setCategoryData={props.setCategoryData} login={props.login} setLogin={props.setLogin} iconHovered={props.iconHovered} iconMouseEnter={props.iconMouseEnter} iconMouseLeave={props.iconMouseLeave} icon_dynamicStyle={props.icon_dynamicStyle} text_dynamicStyle={props.text_dynamicStyle} category_dynamicStyle={props.category_dynamicStyle} iconOnClick={props.iconOnClick} />
      <main className={styles.main}>
        <section className={styles.head}>
          <div className={styles.headTop}>


            {/* 상품 이미지 부분 */}
            <div className={styles.headLeft}>
              <img src={detailData.image.original} alt="이미지" 
              className={styles.thumnail}/>
            </div>



            {/* 상품 정보(상품 이름, 가격) 부분 (삼항연산자 : 스켈레톤 처리) */}
            <div className={styles.headRight}>
              <div className={styles.textBox}>
                {props.data 
                ? detailData.title
                : <div className={styles.skeleton}>&nbsp;</div>}
              </div>
              <h4 className={styles.h4}>
                {props.data 
                ? detailData.discount !== 0
                ? 
                <div className={styles.priceTag}>
                  <div>
                    <h3>{detailData.discount}%</h3>
                  </div>
                  <div style={{display: 'flex', alignItems: 'center', gap: '0.5em'}}>
                    <p style={{textDecoration: "line-through", color: "gray"}}>
                      {detailData.price}원
                    </p>
                      {detailData.price-((detailData.price/100)*detailData.discount)}원
                  </div>
                </div>
                : `${detailData.price} 원`
                : <div className={styles.skeleton}>&nbsp;</div>}
              </h4>




              <div className={styles.textBox}>
                {/* 상품 수량 및 옵션, 최종 결제금액 */}
              {props.data ? 
              <>
                <label>
                수량 : <input value={count} className={styles.input} onChange={maxLengthCheck} type='number' placeholder='숫자만 입력'/> 개
                </label>
                <br/>
                  {detailData.option &&
                  <div style={{display: 'flex', alignItems:'center', gap:'0.5em'}}>
                    옵션 :
                    <select 
                    value={optionSelected || ""}
                    onChange={(e)=>{setOptionSelected(e.target.value)}}
                    className={styles.selectSize}
                    >
                      <option value="" disabled>옵션 선택</option>
                      {detailData.option.map((item, index) =>
                      <option key={index} value={item.value}>{item.value}</option>
                      )}
                    </select>
                  </div>
                  }
                  </>
              : <div className={styles.skeleton}>&nbsp;</div>
              }
              </div>
              {props.data ?
                <>
                총 수량 {count ? count : 1}개 |
                <h4 className={styles.finalprice}>
                최종 결제 금액 : 
                {detailData.discount 
                ? `${(detailData.price-((detailData.price/100)*detailData.discount))*count}원` 
                : `${detailData.price * count}원`}
                </h4>
                </>
                : <div className={styles.skeleton}>&nbsp;</div>
              }


              {/* 버튼 부분들 (결제하기, 장바구니, 찜하기) */}
              <div className={styles.textButton}>
                <button 
                className={styles.mainButton}
                onClick={()=> {detailData.supply <= 0 ? alert("해당 상품은 품절 상품입니다.") : buyThis(detailData, count)}}
                >{detailData.supply <= 0 ? '품절' : detailData.supply < 5 ? `결제하기 (재고 ${detailData.supply}개 남음)` : '결제하기'}</button>
                <div className={styles.sideTextButton}>
                  <button 
                  onClick={()=>{basketThis(detailData, count)}}
                  className={styles.sideButton}>장바구니</button>
                  <button 
                  onClick={()=>{likethis(detailData)}} 
                  className={styles.sideButton}>
                  {props.wishlist.some((item) => item.id === detailData.id)
                  ? <i className="fa-solid fa-heart"/> //꽉 찬 하트와 빈 하트 아이콘
                  : <i className="fa-regular fa-heart"/>} 
                  &nbsp;찜하기
                  </button>
                </div>
              </div>
            </div>
          </div>
        </section>



        {/* 탭 부분 */}
        <div className={styles.sticky} >
          <Tab navigate={props.navigate}/>
        </div>
        <TabInfo login={props.login} setLogin={props.setLogin} basketList={props.basketList} setBasketList={props.setBasketList} setData={props.setData} data={props.data} qnAData={props.qnAData} setQnAData={props.setQnAData} detailData={detailData}/>       
      </main>
    </div>
  )
}