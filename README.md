# AHRO
A Happy Routine Orgnaier : [AHRO](https://mamananama.github.io/ahro.github.io/)
![image](https://github.com/mamananama/ahro.github.io/assets/114140050/d5e7f19e-45f1-427e-b8a5-212b817176b3)
<br/>
<br/>
<br/>


## 개요  
>AHRO는 일정을 대화 형식으로 관리할 수 있는 서비스입니다.
>
>GPT를 사용하여 사용자의 일정 질문을 분석하여, 일정 생성, 수정, 삭제, 탐색의 기능을 가지고 있습니다.


<br/>


## 프로젝트 기간  
>2023.8.29. ~ 2023.9.6.


<br/>
<br/>


---
### 1. 프로젝트 동기 및 기획  
- GPT는 사용자가 입력한 질문을 마치 "사람과 대화하는"듯한 말을 출력하여 대답하는 LLM이며,<br/> 특히 작년 11월에 대중에게 공개된 버전은 사회에 큰 이슈를 불러왔습니다.<br/><br/>  
- GPT가 사람의 말을 이해하고 질문에 적절한 답을 찾아낸다는 것 자체도 중요하지만,<br/> 바꿔서 말하면 누구나 쉽게 사용할 수 있는 <strong>'자연어 처리 프로그램'</strong>이 공개된 것으로 볼 수 있습니다.<br/><br/>  
- 이번 프로젝트는 이 부분에 초점을 맞춰, GPT를 사용자의 일정 관련 질문을 분석하여,<br/> 일정 테이블에 내용을 추가하거나, 수정, 삭제, 탐색하는 기능을 처리하는 '자연어 처리기'로 사용해 보았습니다.<br/><br/>  
- 기존의 스케쥴러 어플리케이션은 필요한 항목을 사용자가 스스로 입력하는 불편함이 있지만,<br/> GPT의 자연어처리 능력을 사용하면 사용자가 원하는 일정을 '말'로 처리할 수 있게 됩니다.<br/><br/>  
- 결과적으로, <strong>사용자가 일정을 쉽게 관리 할 수 있는 어플리케이션</strong>을 목표로 이 프로젝트를 기획하였습니다.<br/><br/>  


<br/>
<br/>


### 2. 구현기능  
* 대화형 처리(GPT 사용)
  * 생성
  * 수정
  * 삭제
  * 탐색
  * 일반
* 입력형 처리
  * 생성
  * 수정
  * 삭제
* 위젯
  * 시계
  * 스티키 노트
<br/>


#### 파일 트리  
```
└─ahro
    │  index.html
    │
    ├─css
    │      common.css
    │      main.css
    │
    ├─img
    │  │  smile-5865208_640.png
    │  │
    │  └─icon
    │          chatlog.png
    │          close.png
    │          create.png
    │          delete.png
    │          edit.png
    │          editanddelete.png
    │          notify.png
    │
    └─js
            main.js

```


#### GPT 순서도
![ahro diagram](https://github.com/mamananama/ahro.github.io/assets/114140050/a411f57a-14c1-46e3-a8f8-1ece7c223eab)







<br/>
<br/>



### 3. 구현 동작
---
#### 대화형 처리
##### 대화형 처리 - 일정 생성


https://github.com/mamananama/ahro.github.io/assets/114140050/70a06744-85d6-4294-a539-25e8adc6fa6e



##### 대화형 처리 - 일정 수정


https://github.com/mamananama/ahro.github.io/assets/114140050/179b7cfe-4f0d-406d-9b2b-71f54dcba338



##### 대화형 처리 - 일정 삭제


https://github.com/mamananama/ahro.github.io/assets/114140050/4a5f25cf-f981-4991-a94e-6a2ac0fc64eb


##### 대화형 처리 - 일정 탐색


https://github.com/mamananama/ahro.github.io/assets/114140050/222eee04-5b61-4e8b-b27e-a2792d0a0a52


##### 대화형 처리 - 일반 대화


https://github.com/mamananama/ahro.github.io/assets/114140050/b285bb9e-13a2-47ec-a204-458b969ebbcd


---
#### 입력형 처리
##### 입력형 처리 - 일정 생성


https://github.com/mamananama/ahro.github.io/assets/114140050/e516ec3e-f9d6-45e1-b671-84e935ad948b



##### 입력형 처리 - 일정 수정


https://github.com/mamananama/ahro.github.io/assets/114140050/09f3e91b-1217-4c2c-8d13-555f4fd30c38



##### 입력형 처리 - 일정 삭제


https://github.com/mamananama/ahro.github.io/assets/114140050/dfb418f1-394b-4cbf-bcb9-2281fee059c7


---
### 부가기능
#### 시계 및 스티키 노트


https://github.com/mamananama/ahro.github.io/assets/114140050/bb165e37-acd0-4344-a1cc-09b3c135183c
