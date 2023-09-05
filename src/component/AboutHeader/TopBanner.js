import { useEffect, useState } from 'react';
import logo from '../../image/logo.jpeg'
import { useLocation, useNavigate } from 'react-router-dom'
import styles from './TopBanner.module.css';
import { SearchBar } from './SearchBar';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faBars } from '@fortawesome/free-solid-svg-icons';
import { CategoryBar } from './CategoryBar';

//상단 메뉴 리스트 
export function TopBanner(props) {
  const navigate = useNavigate();
  const location = useLocation();
  const [topTab, setTopTab] = useState(null); // 현재 활성화된 탭을 추적

  useEffect(() => {

    // 경로에 따른 상태 초기화
    if (location.pathname === '/' || location.pathname === '/login') {
      localStorage.removeItem('tabState');
      setTopTab(null);
    }
  }, [location]); // 두 번째 매개변수를 빈 배열로 설정하여 최초 렌더링 시에만 실행

  const menuData = [
    {
      id: 1,
      title: {
        item: '성동물산 소개',
        link: '/introduceCompany'
      },
      subMenuItems: [{
        item: '기업 소개',
        link: '/introduceCompany'
      },
      {
        item: '오시는 길',
        link: '/comeway',
      },
      {
        item: '오늘의 뉴스',
        link: '/todaytopic/1',
      },
      {
        item: '진행 중인 이벤트',
        link: '/event',
      }],
    },
    {
      id: 2,
      title: {
        item: '고객센터',
        link: '/userservice/notice'
      },
      subMenuItems: [
        {
          item: '공지사항',
          link: '/userservice/notice',
        },
        {
          item: '문의하기',
          link: '/userservice/ask',
          require : !props.login
        }
      ],
    },
    {
      id: 3,
      title: {
        item: '마이페이지',
        link: '/mypages'
      },
      subMenuItems: [{
        item: '내 정보 관리',
        link: '/mypages',
        require : !props.login
      },
      {
        item: '장바구니 목록',
        link: '/basket',
        require : !props.login
      },
      {
        item: '내가 찜한 목록',
        link: '/likeitem',
      },
      {
        item: '주문 / 배송 게시판',
        link: '/delivery',
        require : !props.login
      }],
    },
  ];
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
    localStorage.setItem('tabState', JSON.stringify(id));
  }

  return (
    <div className={styles.body}>
      <div className={styles.top_container}>
        <div className={styles.top_nav}>
          {/* 카테고리 박스 */}
          <div
            className={styles.categoryBox}
            onClick={props.iconOnClick}
            onMouseEnter={props.iconMouseEnter}
            onMouseLeave={props.iconMouseLeave}
            style={{...props.border_dynamicStyle}}
          >
            {/* 카테고리 아이콘 */}
            <FontAwesomeIcon
              icon={faBars} // 사용할 FontAwesome 아이콘 선택
              style={{ ...props.icon_dynamicStyle }}
              className={styles.categoryIcon}
            />
            {/* 카데고리 텍스트 */}
            <div style={{...props.text_dynamicStyle}}>
              카테<br/>
              고리
            </div>
          </div>
          {/* 로고 */}
          <img className={styles.image} onClick={() => navigate("/")} src={logo} alt="로고" height='70px' />
          {/* 서치바 */}
          <SearchBar />
          {/* 메뉴 loop */}
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
                    return;
                  } 
                    navigate(`${item.title.link}`) }}>
                {item.title.item}
              </span>
              {subMenuStates[index] && (
                <ul
                  className="sub-menu">
                  {item.subMenuItems.map((subMenuItem, subMenuItemindex) => (
                    <li
                      onClick={() => {
                        if(subMenuItem.require){
                          alert("로그인이 필요한 서비스입니다.");
                          navigate("/login");
                          return;
                        } 
                        navigate(`${subMenuItem.link}`)
                      }}
                      className={styles.sub_item}
                      key={subMenuItemindex}>
                      {subMenuItem.item}
                    </li>
                  ))}
                </ul>
              )}
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
      <CategoryBar category_dynamicStyle={props.category_dynamicStyle}/>
    </div>
  );
}