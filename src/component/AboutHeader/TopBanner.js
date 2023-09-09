import { useEffect, useState } from 'react';
import logo from '../../image/logo.jpeg'
import { useLocation, useNavigate } from 'react-router-dom'
import styles from './TopBanner.module.css';
import { SearchBar } from './SearchBar';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faBars } from '@fortawesome/free-solid-svg-icons';
import { CategoryBar } from './CategoryBar';
import { MenuData } from './MenuData';
//상단 메뉴 리스트 
export function TopBanner(props) {
  const navigate = useNavigate();
  const location = useLocation();
  const [topTab, setTopTab] = useState(null); // 현재 활성화된 탭을 추적

  useEffect(() => {
    const tabstate = JSON.parse(localStorage.getItem('menuTab'));
    setTopTab(tabstate);
    
    // 경로에 따른 상태 초기화
    if (location.pathname === '/' || location.pathname === '/login' || location.pathname === '/category') {
      localStorage.removeItem('tabState');
      setTopTab(null);
    }
  }, [location]); // 두 번째 매개변수를 빈 배열로 설정하여 최초 렌더링 시에만 실행
  const menuData = [
    {
      id: 1,
      title: '주문/배송 현황',
      link: '/delivery',
      require : !props.login
    },
    {
      id: 2,
      title: '찜 목록',
      link: '/likeitem',
    },
    {
      id: 3,
      title: '장바구니 목록',
      link: '/basket',
      require : !props.login
    }];

  const handleMouseEnter = (index) => {
    // 해당 인덱스의 메뉴를 열기 위해 true로 설정
    const newSubMenuStates = [...subMenuStates];
    newSubMenuStates[index] = true;
    setSubMenuStates(newSubMenuStates);
  };

  const handleMouseLeave = (index) => {
    // 해당 인덱스의 메뉴를 닫기 위해 false로 설정
    const newSubMenuStates = [...subMenuStates];
    newSubMenuStates[index] = false;
    setSubMenuStates(newSubMenuStates);
  };

  //서브메뉴 열림창 변수 초기화
  const [subMenuStates, setSubMenuStates] = useState(menuData.map(() => false));

  function saveTab(id) {
    localStorage.setItem('menuTab', JSON.stringify(id));
  }
  return (
    <div className={styles.body}>
      <div className={styles.top_container}>
        <div className={styles.top_nav}>
          {/* 카테고리 박스 */}
          <div
            className={styles.categoryBox}
            onMouseEnter={props.iconMouseEnter}
            onMouseLeave={props.iconMouseLeave}
            onClick={props.menuOnClick}
          >
            {/* 카테고리 아이콘 */}
            <FontAwesomeIcon
              icon={faBars} // 사용할 FontAwesome 아이콘 선택
              style={{ ...props.icon_dynamicStyle }}
              className={styles.categoryIcon}
            />
          </div>
          {/* 로고 */}
          <img className={styles.image} onClick={() => navigate("/")} src={logo} alt="로고" height='70px' />
          {/* 서치바 */}
          <SearchBar data={props.data} setData={props.setData}/>
          <li
            className='menu-item'
            onClick={props.iconOnClick}
            style={{...props.text_dynamicStyle}}
            onMouseEnter={props.iconMouseEnter}
            onMouseLeave={props.iconMouseLeave}
          >
            카테고리
          </li>
          {menuData.map((item, index) => (
          <li
          key={index}
          id={item.id}  // data-id 속성을 사용하여 탭의 id를 저장
          onMouseEnter={() => handleMouseEnter(index)}
          onMouseLeave={() => handleMouseLeave(index)}
          className={`menu-item ${subMenuStates[index] && 'open'}
          menutab-item ${topTab === item.id ? 'active' : ''}`}
          onClick={() => { saveTab(item.id) }}
          >
            <span
            className={styles.link}
            onClick={() => { 
              if(item.require){
                alert("로그인이 필요한 서비스입니다.");
                navigate("/login");
                return;
              } 
                navigate(`${item.link}`) }}>
            {item.title}
            </span>
          </li>
          ))}
          {/* 로그인/로그아웃 */}
          <button className={styles.link_signIn} onClick={() => {
            if(props.login){
              sessionStorage.removeItem('saveLoginData');
              props.setLogin(false);
              window.location.reload();
            } else {
              navigate("/login");
            }}}>{props.login ? '로그아웃' : '로그인'}
          </button>
        </div>
      </div>
      
      {/* 클릭하면 나오는 카테고리바 */}
      <div style={{display: 'flex', justifyContent: 'flex-start', width: '100%'}}>
        <div className={styles.menuBar}>
          <MenuData menu_dynamicStyle={props.menu_dynamicStyle}/>
        </div>
        <div className={styles.categoryBar}>
          <CategoryBar selectedCategory={props.selectedCategory} setSelectedCategory={props.setSelectedCategory} selectedSubCategory={props.selectedSubCategory} setSelectedSubCategory={props.setSelectedSubCategory} data={props.data} setData={props.setData} categoryData={props.categoryData} setCategoryData={props.setCategoryData} category_dynamicStyle={props.category_dynamicStyle}/>
        </div>
      </div>
    </div>
  );
}