import { useLocation, useNavigate } from 'react-router-dom';
import styles from './CategoryBar.module.css'
import { useEffect, useState } from 'react';

export function CategoryBar(props) {
  // 선택된 카테고리 변경 핸들러 (우선순위 : 1. 소 카테고리 2. 대 카테고리)
  const handleCategoryChange = (category) => {
    // 큰 카테고리에 해당하는 탭만을 찾기위해 subCategory는 삭제
    sessionStorage.removeItem('subCategory');
    sessionStorage.setItem('category', JSON.stringify(category));
    navigate("/category");
    window.location.reload();
  };
  const handleSubCategoryChange = (category) => {
    sessionStorage.setItem('subCategory', JSON.stringify(category));
    navigate("/category");
    window.location.reload();
  };
  const location = useLocation();
  const [activeTab, setActiveTab] = useState(null); // 현재 활성화된 탭을 추적

  useEffect(() => {
    const tabstate = JSON.parse(localStorage.getItem('categoryTabState'));
    setActiveTab(tabstate);

    if (location.pathname !== '/category') {
      localStorage.removeItem('tabState');
      setActiveTab(null);
    }
  },[location])

  const navigate = useNavigate();
  //서브메뉴 열림창 변수 초기화
  const [subMenuStates, setSubMenuStates] = useState(props.categoryData && props.categoryData.map(()=>false));

  const handleTabClick = (tabItem) => {
    localStorage.setItem('categoryTabState', JSON.stringify(tabItem.id));
  };

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

  return (
    // 좌에서 우로 밀려오는 애니메이션 스타일 지정
    <div className={styles.categoryBarContainer} 
    style={{...props.category_dynamicStyle}}>
      {/* 아이콘 hovered */}
      {
        props.categoryData
        ? props.categoryData.map((item, index) => (
          <li
            key={index}
            onMouseEnter={() => handleMouseEnter(index)}
            onMouseLeave={() => handleMouseLeave(index)}
            className={`categorymenu-item ${subMenuStates[index] && 'open'} + categorytab-item ${activeTab === item.id ? 'active' : ''}`}
            onClick={() => { handleTabClick(item) }}
          >
            <span onClick={() => handleCategoryChange(item.title)}>{item.title}</span>
            {/* 서브메뉴 loop */}
            {subMenuStates[index] && (
              <ul onMouseLeave={() => handleMouseLeave(index)} className="sub-menu">
                {item.subMenuItems.map((item, index) => (
                  <li onClick={() => handleSubCategoryChange(item.item)} className={styles.category} key={index}>
                    {item.item}
                  </li>
                ))}
              </ul>
            )}
          </li>
        ))
      : '로딩중'}
    </div>
  )
}