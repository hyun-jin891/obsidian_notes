---
publish: true
---

[Github](https://github.com/hyun-jin891/Food_recommendation)

# 🔥2025_1 음식 추천 서비스 프로젝트
현재 먹을 음식의 사진을 찍으면, 영양소 및 사용자 선호도를 반영해 다음으로 먹을 음식을 추천

## 💻Pipeline
* Step 1: YOLOv8이 사진으로부터 현재 먹을 음식의 이름을 분류
* Step 2: 사용자의 선호도를 input으로 받은 다음 RAG를 통해 영양소 DB를 참고하여 LLM이 탄수화물, 단백질, 지방 기반 최적의 음식을 추천해줄 수 있도록 유도
* Step 3: 탄수화물, 단백질, 지방 외의 여러 영양소와 이에 대한 good effect, side effect, lack effect 등을 Neo4j Graph DB를 통해 구축하고 LLM이 이를 참고해(GraphRAG) 해당 음식들을 과식했을 경우 나타날 수 있는 부작용 및 해당 음식으로도 충분하지 않은 영양소에 대한 전반적인 진단을 할 수 있도록 유도  

## 📑Training Dataset
* 음식 영양소 DB
  * 다양한 한식 및 가공식품 중심의 표준화된 음식명과 영양 정보를 담고 있는 자료로, 100g 기준 여러 영양소의 양을 포함
  * 각 음식에 대한 1회 제공량 정보를 포함하고 있어, 실제 섭취 시 어느  정도의 영양소를 섭취하는지 정량적으로 파악할 수 있습니다.
* YOLOv8 학습 데이터
  * 음식 영양소 데이터베이스에서 수집한 10,000장의 GT 데이터를 활용해 YOLOv8 기반의 자동 탐지 및 대량 라벨링 파이프라인을 구축
  * 90,000장의 미라벨 이미지를 완전히 자동으로 라벨링하며, 데이터셋을 약 9배까지 획기적으로 확장

## Service
<img width="1920" height="1080" alt="1" src="https://github.com/user-attachments/assets/1bc6fa67-f100-415c-9d4b-a0be03c3197a" />
<img width="1920" height="1080" alt="2" src="https://github.com/user-attachments/assets/4f76d4e5-11ee-43f6-9cc6-a63efc7ffaf6" />
<img width="1920" height="1080" alt="3" src="https://github.com/user-attachments/assets/f5f5003c-688d-4fd0-bd2e-3a400eed5da6" />
<img width="1920" height="1080" alt="4" src="https://github.com/user-attachments/assets/218606b7-e29f-44ce-acd7-0268c669917c" />
<img width="1920" height="1080" alt="5" src="https://github.com/user-attachments/assets/b63527c6-25b0-48aa-abb7-49ecadb9561c" />
<img width="1920" height="1080" alt="6" src="https://github.com/user-attachments/assets/59bffddf-1a56-4055-b34a-b7aa93363555" />
<img width="7680" height="4320" alt="7" src="https://github.com/user-attachments/assets/d4ebf6bf-fc3e-48ce-a213-6efa47c934e9" />
<img width="7680" height="4320" alt="8" src="https://github.com/user-attachments/assets/445e2e88-264b-456f-ae19-1a68ca6a00fc" />
<img width="7680" height="4320" alt="9" src="https://github.com/user-attachments/assets/547b39fe-71e7-47c5-a9b9-938a06bb46d4" />


## ⭐Demo Day
* 2025/08/02 프로메테우스 데모 데이 부스 운영

## 😎Members
| 김현아 (디자이너)      | 박성영 (개발)     | 송재헌 (개발)     | 이채원 (개발)  | 조현진 (팀장, 개발) |
|:-----------------:|:----------------:|:-----------------:|:--------------------:|:------------:|
| 7기      | 7기 | 7기 | 7기 | 6기 |
|         |  [Sung-young](https://github.com/Sung-young)  |  [Songjaeheon0923](https://github.com/Songjaeheon0923)    | [chaechae618](https://github.com/chaechae618)|  [hyun-jin891](https://github.com/hyun-jin891)|
