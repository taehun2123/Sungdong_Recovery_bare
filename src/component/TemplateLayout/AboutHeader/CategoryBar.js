import { useLocation, useNavigate } from 'react-router-dom';
import styles from './CategoryBar.module.css'
import { useEffect, useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { useModalActions } from '../../../Store/DataStore';

export function CategoryBar(props) {
  const { isLoading, isError, error, data: categoryData } = useQuery({ queryKey: ['category'] });
  const { selectedModalClose } = useModalActions();

  // 선택된 카테고리 변경 핸들러 (우선순위 : 1. 소 카테고리 2. 대 카테고리)
  const handleCategoryChange = (category) => {
    // 큰 카테고리에 해당하는 탭만을 찾기위해 subCategory는 삭제
    sessionStorage.removeItem('subCategory');
    sessionStorage.removeItem('filterSearch');
    sessionStorage.setItem('category', JSON.stringify(category));
    navigate("/category");
  };
  const location = useLocation();
  const [activeTab, setActiveTab] = useState(null); // 현재 활성화된 탭을 추적

  useEffect(() => {
    if (sessionStorage.getItem('filterSearch')) {
      sessionStorage.removeItem('tabState');
      setActiveTab(null);
    } else {
      const tabstate = JSON.parse(sessionStorage.getItem('categoryTabState'));
      setActiveTab(tabstate);
    }

    if (location.pathname !== '/category') {
      sessionStorage.removeItem('tabState');
      setActiveTab(null);
    }
  }, [location])

  const navigate = useNavigate();
  //서브메뉴 열림창 변수 초기화
  const [subMenuStates, setSubMenuStates] = useState(categoryData?.length > 0 ? categoryData.map(() => false) : []);

  // 방법 1 - for문
  // const handleSubMenuOnOff = (index) => {
  //   // 해당 인덱스의 메뉴를 열기 위해 true로 설정
  //   const newSubMenuStates = [...subMenuStates];
  //   // 열려있는 다른 서브메뉴를 닫기
  //   for (let i = 0; i < newSubMenuStates.length; i++) {
  //     if (i !== index) {
  //       newSubMenuStates[i] = false;
  //     }
  //   }
  //   // 클릭한 인덱스의 서브메뉴를 열거나 닫기
  //   newSubMenuStates[index] = !subMenuStates[index];

  //   setSubMenuStates(newSubMenuStates);
  // };
  // 방법 2 - mapping
  function toggleSubMenu(index) {
    setSubMenuStates(prevStates => {
      const newSubMenuStates = prevStates.map((state, idx) => idx === index ? !state : false);
      return newSubMenuStates;
    });
  }


  // esc키를 누르면 모달창 닫기.
  useEffect(() => {
    const exit_esc = (event) => {
      if (event.key === 'Escape') {
        selectedModalClose(); // "Esc" 키 누를 때 모달 닫기 함수 호출
      }
    };

    window.addEventListener('keydown', exit_esc);

    return () => {
      window.removeEventListener('keydown', exit_esc);
    };
  }, [selectedModalClose]);

  if (isLoading) {
    return <p>Loading..</p>;
  }
  if (isError) {
    return <p>에러 : {error.message}</p>;
  }
  return (
    <div className={styles.customModalOverlay}>
      <div className={styles.customModalContainer}>
        <div className={styles.categoryBarContainer}
          style={{ ...props.category_dynamicStyle }}>
          {/* 아이콘 hovered */}
          {
            categoryData.length > 0
              ? categoryData.map((item, index) =>
                item.parentsCategory_id === null &&
                (
                  <li
                    key={index}
                    className={`categorymenu-item ${subMenuStates[index] && 'open'} + categorytab-item ${activeTab === item.category_id ? 'active' : ''}`}
                    onClick={() => { toggleSubMenu(index) }}
                  >
                    <span>
                      {item.name}
                    </span>
                    {/* 서브메뉴 loop */}
                    {subMenuStates[index] && (
                      <ul className="sub-menu">
                        <div style={{display:'flex'}}>
                          {categoryData && categoryData
                            .filter((category) => category.parentsCategory_id === item.category_id)
                            .map((category, subIndex) => (
                              <li
                                className={styles.category}
                                key={subIndex} // 수정: index 대신 subIndex를 사용
                              >
                                {category.name}
                              </li>
                            ))}
                        </div>
                      </ul>
                    )}
                  </li>
                ))
              : '로딩중'}
        </div>
      </div>
    </div>
  )
}