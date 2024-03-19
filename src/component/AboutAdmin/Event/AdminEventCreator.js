import { useEffect, useState } from "react";
import styles from "./AdminEventCreator.module.css";
import {
  useEvent,
  useEventActions
} from "../../../store/DataStore";
import axios from "../../../axios";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useFetch } from "../../../customFn/useFetch";
import { useNavigate } from "react-router-dom";

export function AdminEventCreator() {
  const event = useEvent();
  const { setEvent, resetEvent } = useEventActions();
  const {fetchServer} = useFetch();
  const queryClient = useQueryClient();
  const navigate = useNavigate();

  useEffect(() => {
    return () => {
      resetEvent();
      // 컴포넌트가 언마운트될 때 리셋
    };
  }, []);

  const [selectedFile, setSelectedFile] = useState(null);
  const [imageUrl, setImageUrl] = useState("");

  const handleFileChange = (event) => {
    setSelectedFile(event.target.files[0]);
  };

  const uploadImage = async () => {
    if (selectedFile) {
      try {
        const formData = new FormData();
        formData.append("image", selectedFile);

        const response = await axios.post("/event/upload", formData, {
          withCredentials: false,
          headers: {
            "Content-Type": "multipart/form-data",
          },
        });

        // 성공 시 추가된 상품 정보를 반환합니다.
        setImageUrl(response.data.imageUrl);
        setEvent("event_image", response.data.imageUrl);
      } catch (error) {
        // 실패 시 예외를 throw합니다.
        console.error("이미지 업로드 에러:", error);
      }
    } else {
      console.error("이미지를 선택하세요.");
    }
  };


  //등록 fetch 함수
  const fetchAddData = async (newData) => {
    return fetchServer(newData, `post`, `/event/create`, 1); 
  };

  //상품 등록 함수
  const { mutate:addProductMutate } = useMutation({mutationFn: fetchAddData})

  function handleAddedEvent(data){
    addProductMutate(data,{
    onSuccess: (data) => {
      // 메세지 표시
      alert(data.message);
      console.log('이벤트가 추가/변경 되었습니다.', data);
      // 상태를 다시 불러와 갱신합니다.
      queryClient.invalidateQueries(['event']);
      navigate("/sadkljf$ewulihfw_mcnjcbvjaskanshcbjancasuhbj/event");
    },
    onError: (error) => {
      // 상품 추가 실패 시, 에러 처리를 수행합니다.
      console.error('이벤트를 추가/변경 하는 중 오류가 발생했습니다.', error);
    },
  })
  }

  return (
    <div className={styles.main}>
      <main className={styles.container}>
        <div className="LargeHeader">이벤트 등록</div>
        <section className={styles.head}>
          <div className={styles.headTop}>
            {/* 상품 이미지 부분 */}
            <div className={styles.headLeft}>
              <img
                id="eventImage"
                src={imageUrl}
                alt="이벤트 이미지"
                className={styles.thumnail}
              />
              <div>
                <input
                  type="file"
                  id="eventImage"
                  accept="image/*"
                  onChange={handleFileChange}
                />
                <button onClick={uploadImage}>이미지 업로드</button>
              </div>
            </div>

            {/* 상품 정보(상품 이름, 가격) 부분 (삼항연산자 : 스켈레톤 처리) */}
            <div className={styles.headRight}>
              <div className={styles.textBox}>
                <input
                  style={{ width: "20em" }}
                  className={styles.input}
                  onChange={(e) => setEvent("event_title", e.target.value)}
                  type="text"
                  placeholder="이벤트 제목을 입력해주세요"
                />
              </div>
              <div className={styles.stateBox}>
                <div
                  style={{
                    display: "flex",
                    gap: "1em",
                    flexDirection: "column",
                  }}
                >
                  <div>
                    <select
                      className={styles.input}
                      value={event.eventState || ""}
                      onChange={(e) => setEvent("eventState", e.target.value)}
                    >
                      <option value="">이벤트 상태 선택</option>
                      <option value={1}>준비</option>
                      <option value={2}>진행 중</option>
                      <option value={3}>중단</option>
                      <option value={4}>종료</option>
                    </select>
                  </div>
                  <div
                    style={{
                      display: "flex",
                      justifyContent: "center",
                      alignItems: "center",
                      gap: "0.5em",
                    }}
                  >
                    <label style={{ display: "flex", justifyContent: 'center', alignItems: 'center' }}>
                      <p
                        style={{
                          fontSize: "0.9em",
                          width: "130px",
                          display: "flex",
                          marginRight: "0.5em",
                        }}
                      >
                        이벤트 시작일
                      </p>
                      <input
                        className={styles.input}
                        type="date"
                        value={event.event_startDate}
                        onChange={(e) =>
                          setEvent("event_startDate", e.target.value)
                        }
                      />
                    </label>
                  </div>
                  <div
                    style={{
                      display: "flex",
                      justifyContent: "center",
                      alignItems: "center",
                      gap: "0.5em",
                    }}
                  >
                    <label style={{ display: "flex", justifyContent: 'center', alignItems: 'center'  }}>
                      <p
                        style={{
                          fontSize: "0.9em",
                          width: "130px",
                          display: "flex",
                          marginRight: "0.5em",
                        }}
                      >
                        이벤트 종료일
                      </p>
                      <input
                        className={styles.input}
                        type="date"
                        value={event.event_endDate}
                        onChange={(e) =>
                          setEvent("event_endDate", e.target.value)
                        }
                      />
                    </label>
                  </div>
                </div>
              </div>
              <div className={styles.textBox}>
                {/* 내용 */}
                <label style={{ display: "flex" }}>
                  <p
                    style={{
                      fontSize: "0.9em",
                      width: "50px",
                      display: "flex",
                      fontWeight: "650",
                      marginRight: "0.5em",
                    }}
                  >
                    내용
                  </p>
                  <textArea
                    className={styles.input}
                    placeholder="이벤트 내용을 입력해주세요"
                    value={event.event_content}
                    onChange={(e) => {
                      setEvent("event_content", e.target.value);
                    }}
                  />
                </label>
              </div>
            </div>
          </div>
        </section>
        {/* 버튼 부분들 (등록하기, 초기화, 임시저장) */}
        <div className={styles.textButton}>
          <button className={styles.mainButton} onClick={()=>handleAddedEvent(event)}>등록하기</button>
          <button
            className={styles.sideButton}
            onClick={() => {
              resetEvent();
            }}
          >
            초기화
          </button>
        </div>
      </main>
    </div>
  );
}