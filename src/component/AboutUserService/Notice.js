import React, { useEffect } from 'react';
import styles from './Notice.module.css';
import NoticeDetail from './NoticeDetail';
import { NoticePostObj } from '../Data/NoticePostObj';
import { useListActions, useModalActions, useModalState, useNoticePostList } from '../../store/DataStore';
import { TopBanner } from '../TemplateLayout/AboutHeader/TopBanner';
import { Footer } from '../TemplateLayout/AboutFooter/Footer';
import { MenuData } from '../TemplateLayout/AboutMenuData/MenuData';
import axios from 'axios';

export function Notice() {
  const { isModal} = useModalState();
  const { setIsModal, setSelectedIndex } = useModalActions();
  const { setNoticePostList } = useListActions();
  const noticePostList = useNoticePostList();

  useEffect(() => {
    setNoticePostList(NoticePostObj);
  }, [setNoticePostList])

  //공지 데이터 fetch
  const fetchData = async() => {
    try{
      const response = await axios.get("/post", 
        {
          headers : {
            "Content-Type" : "application/json",
          }
        }
      )
      return response.data;
    } catch(error) {
      throw new Error('공지사항을 불러오던 중 오류가 발생했습니다.');
    }
  }
  //const { isLoading, isError, error, data:postData } = useQuery({queryKey:['post'], queryFn: ()=> fetchData();});


  return (
    <div>
      <TopBanner />
      <div className={styles.flexBox}>
        <MenuData />
        <div className={styles.noticeContainer}>
          {/* --------------header-------------- */}
          <div className={styles.header}>
            <h1 className={styles.title}>공지사항</h1>
            <div className={styles.searchContainer}>
              <label className={styles.search_label} htmlFor="search">검색:</label>
              <input
                className={styles.search_input}
                type="text"
                id="search"
                placeholder="검색어를 입력하세요"
              />
            </div>
          </div>
          {/* --------------listContainer-------------- */}
          <div className={styles.listContainer}>
            <table className={styles.listTable}>
              <thead>
                <tr>
                  <th className={styles.th}>구분</th>
                  <th className={styles.th}>제목</th>
                  <th className={styles.th}>작성자</th>
                  <th className={styles.th}>작성일</th>
                </tr>
              </thead>
              <tbody>
                {noticePostList.map((item, index) => (
                  <tr key={index}
                    className={styles.row}
                    onClick={() => { setIsModal(true); setSelectedIndex(index) }}
                    tabIndex={0} // 이렇게 하면 포커스를 받을 수 있게 됩니다
                  >
                    <td>{index + 1}</td>
                    <td>{item.title}</td>
                    <td>{item.writer}</td>
                    <td>{item.date}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          {/* --------------Detail-Modal-------------- */}
          {isModal ?
            <div className={styles.modalOverlay}>
              <NoticeDetail />
            </div>
            : null}
        </div>
      </div>
      <Footer />
    </div>
  );
}
