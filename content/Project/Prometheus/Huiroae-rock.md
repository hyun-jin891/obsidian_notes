---
publish: true
---

[Github](https://github.com/hyun-jin891/Huiroae-rock)


[![rock](https://github.com/hyun-jin891/Huiroae-rock/raw/main/asset/logo.png "rock")](https://github.com/hyun-jin891/Huiroae-rock/blob/main/asset/logo.png)

# 🎸 희로애 rock (Huiroae-rock)

[](https://github.com/hyun-jin891/Huiroae-rock#-%ED%9D%AC%EB%A1%9C%EC%95%A0-rock-huiroae-rock)

**음악에 맞는 앨범 커버 생성 서비스**

> "사람들은 음악을 들을 때, 소리만을 소비하지 않습니다. 노래는 개인의 기억, 감정, 상황과 결합되며 하나의 이미지로 각인됩니다."

[Source Code](https://github.com/song-album-generation)

  
[![](https://camo.githubusercontent.com/86a379ed22a57959b93da8078fd479f5f3a70bbcb351e84d1d3c960bb16bd5cb/68747470733a2f2f696d672e736869656c64732e696f2f62616467652f507974686f6e2d3337373641423f7374796c653d666c61742d737175617265266c6f676f3d507974686f6e266c6f676f436f6c6f723d7768697465)](https://camo.githubusercontent.com/86a379ed22a57959b93da8078fd479f5f3a70bbcb351e84d1d3c960bb16bd5cb/68747470733a2f2f696d672e736869656c64732e696f2f62616467652f507974686f6e2d3337373641423f7374796c653d666c61742d737175617265266c6f676f3d507974686f6e266c6f676f436f6c6f723d7768697465) [![](https://camo.githubusercontent.com/98bd608ee9384ef6218c538e78f6f0d509c8a4af86ac94a94faf77fed0089f4c/68747470733a2f2f696d672e736869656c64732e696f2f62616467652f5079546f7263682d4545344332433f7374796c653d666c61742d737175617265266c6f676f3d5079546f726368266c6f676f436f6c6f723d7768697465)](https://camo.githubusercontent.com/98bd608ee9384ef6218c538e78f6f0d509c8a4af86ac94a94faf77fed0089f4c/68747470733a2f2f696d672e736869656c64732e696f2f62616467652f5079546f7263682d4545344332433f7374796c653d666c61742d737175617265266c6f676f3d5079546f726368266c6f676f436f6c6f723d7768697465) [![](https://camo.githubusercontent.com/3246562e6b226088d05ddfed98d7e09916e724f8b3e22101931a50682dd4f196/68747470733a2f2f696d672e736869656c64732e696f2f62616467652f466173744150492d3030393638383f7374796c653d666c61742d737175617265266c6f676f3d66617374617069266c6f676f436f6c6f723d7768697465)](https://camo.githubusercontent.com/3246562e6b226088d05ddfed98d7e09916e724f8b3e22101931a50682dd4f196/68747470733a2f2f696d672e736869656c64732e696f2f62616467652f466173744150492d3030393638383f7374796c653d666c61742d737175617265266c6f676f3d66617374617069266c6f676f436f6c6f723d7768697465) [![](https://camo.githubusercontent.com/6436c1991da8b4d7ec4eb014a0bda08126579d28e9bf9c6e04e0807b77584b6c/68747470733a2f2f696d672e736869656c64732e696f2f62616467652f52656163742d3631444146423f7374796c653d666c61742d737175617265266c6f676f3d5265616374266c6f676f436f6c6f723d626c61636b)](https://camo.githubusercontent.com/6436c1991da8b4d7ec4eb014a0bda08126579d28e9bf9c6e04e0807b77584b6c/68747470733a2f2f696d672e736869656c64732e696f2f62616467652f52656163742d3631444146423f7374796c653d666c61742d737175617265266c6f676f3d5265616374266c6f676f436f6c6f723d626c61636b) [![](https://camo.githubusercontent.com/477f66fcbce6e12b2144d394462637a4f4b21bd479354ded258bca005f6738a2/68747470733a2f2f696d672e736869656c64732e696f2f62616467652f53756e6f5f41492d3030303030303f7374796c653d666c61742d737175617265266c6f676f3d617564696f266c6f676f436f6c6f723d7768697465)](https://camo.githubusercontent.com/477f66fcbce6e12b2144d394462637a4f4b21bd479354ded258bca005f6738a2/68747470733a2f2f696d672e736869656c64732e696f2f62616467652f53756e6f5f41492d3030303030303f7374796c653d666c61742d737175617265266c6f676f3d617564696f266c6f676f436f6c6f723d7768697465)

## 📅 Project Duration
**2025.09 ~ 2026.02.07**

<br/>

## 📝 Introduction
**희로애 rock**은 AI가 생성한 음악을 해석하여, 그 곡의 분위기와 가사에 딱 맞는 앨범 커버를 사용자와 함께 만들어가는 서비스입니다.
청각적인 경험을 시각적으로 집약하여, 청자가 노래를 떠올릴 수 있도록 돕습니다.

<br/>

## 🚀 Key Features & Pipeline

전체 파이프라인은 **음악 생성 (Suno)** -> **음악/가사 분석** -> **이미지 생성 (SDXL)** 과정으로 이루어집니다.

### 1️⃣ Music Analysis: Music2emo
AI가 생성한 음악의 오디오 신호를 분석하여 곡의 감정(Mood), 긍정/부정(Valence), 흥분도(Arousal)를 추출합니다.
* **Multi-Task Learning**: MERT 임베딩을 활용하여 Categorical Label(Mood)과 Dimensional Label(VA)을 동시에 학습.

### 2️⃣ Lyrics Understanding: Customized SliSum
LLM을 활용하여 노래 가사의 핵심 주제를 요약하고, 프롬프트에 최적화된 형태로 변환합니다.
* **4가지 해석 모드**: 사실적 / 상징적 / 균형적 / 정서적 해석 모드를 제공하여 사용자가 원하는 느낌으로 가사를 재해석합니다.
* **Sliding Generation & Self-Consistency**: 긴 가사도 문맥을 잃지 않고 정확하게 요약하는 기법 적용.

### 3️⃣ Image Generation: SDXL (Fine-tuned)
분석된 음악의 감정 데이터와 요약된 가사 정보를 결합하여 고해상도 앨범 커버를 생성합니다.
* **Fine-tuning**: 앨범 커버 데이터셋을 구축하여 LoRA 기법으로 학습, 앨범 커버 특유의 스타일을 반영.

<br/>

## 🎨 Design System
창의적인 느낌의 **Vivid Color**와 유기적이고 볼드한 **Font**를 사용하여, 영감을 불러일으키는 서비스를 지향합니다.

<br/>

## 👥 Contributors

<table align="center">
  <tr>
    <td align="center" width="150px">
      <a href="https://github.com/hyun-jin891">
        <img src="https://github.com/user-attachments/assets/020634e2-dacc-42e1-9872-9abf83413c4d" width="100px" style="border-radius:50%"/>
      </a>
      <br />
      <b>조현진(팀장)</b>
    </td>
    <td align="center" width="150px">
      <a href="https://github.com/HYU-KDK">
        <img src="https://github.com/user-attachments/assets/adc42753-09de-4202-8cff-3fba401761be" width="100px" style="border-radius:50%"/>
      </a>
      <br />
      <b>김동기(개발)</b>
    </td>
    <td align="center" width="150px">
      <a href="https://github.com/lee-yeonseo">
        <img src="https://github.com/user-attachments/assets/985a02c7-760c-465a-b466-91defb02d5b4" width="100px" style="border-radius:50%"/>
      </a>
      <br />
      <b>이연서(개발)</b>
    </td>
    <td align="center" width="150px">
      <img src="https://github.com/user-attachments/assets/b07f5a8d-9982-4269-8a98-1911cf756c78" width="100px" style="border-radius:50%"/>
      <br />
      <b>정수현(디자이너)</b>
    </td>
</table>

<br/>
<div align="center">
  © 2026 Huiroae-rock. All Rights Reserved.
</div>
