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


* Keyword Parser GPT
  * 최초로 들어온 사용자의 메시지를 분석하여, 메시지의 기능별로 '!생성', '!수정', '!삭제', '!탐색', '!일반'의 키워드를 메시지에 붙이는 역할을 합니다.
  * 사용자의 메시지를 '{키워드} {사용자의 메시지}'문자열로 변경합니다.
* Process JSON GPT
  * 다른 GPT 요청으로부터 생성되어 전달된 메시지가 '!생성' 또는 '!수정' 키워드가 붙었을 경우 동작하는 GPT 요청입니다.
  * '!생성' 키워드를 전달 받았을 경우, 사용자의 메시지에 따라 일정의 제목, 시작시간, 종료시간, 추가사항을 분석하여 JSON data를 생성하여 대답합니다.
  * '!수정' 키워드를 전달 받았을 경우, 사용자의 메시지와 Storage GPT로부터 받은 수정 대상의 일정 data를 분석하여 JSON data를 생성하여 대답합니다.
  * 생성되는 JSON data 양식은 다음과 같습니다
    ```JSON
    {
      "title" : "일정의 제목",
      "start" : "일정의 시작시간",
      "end" : "일정의 종료시간",
      "note" : "일정의 추가사항(메모/노트)",
    }
    ```
 * Storage GPT
   * Keyword Parser GPT를 통해 생성된 메시지가 '!수정', '!삭제', '!탐색'인 경우 동작하는 GPT 요청입니다.
   * Storage GPT가 동작하면, local storage에 있는 모든 데이터를 assistant로 입력받습니다.
   * 이후 입력 받은 메시지에 해당하는 일정을 찾아, 찾은 일정에 해당하는 local storage의 key들을 JSON data 형태로 대답합니다.
   * 생성되는 JSON data의 예시는 다음과 같습니다. 
     ```JSON
     {
       "item_0" : "찾은 일정의 key",
       "item_1" : "찾은 일정의 key",
       "item_2" : "찾은 일정의 key",
       "item_3" : "찾은 일정의 key",
        ...
     }
     ```
  * Answer GPT
    * 사용자에게 대화 피드백을 주는 역할을 하여, 사용자의 대화 내용을 처리했다는 것을 사용자가 인지할 수 있도록 하는 역할을 가지고 있습니다.
    * 원하는 대답의 정확도를 올리기위해, 키워드와 메시지를 함께 받아 각 키워드별로 알맞은 대답을 할 수 있도록 prompt를 주었습니다.
---
* <strong>Q. 왜 GPT DATA를 하나로 처리하지 않았나요?  </strong>
  * 하나의 GPT DATA로 처리했을 때, 위의 순서도 상의 4개의 GPT DATA로 분산되어 들어갔던 assistant로 주었던 prompt가 하나의 DATA로 들어가, 입력 순서가 오래된 assistant의 prompt의 weight가 낮아져 설정한 prompt대로 답변을 주지않는 문제가 발생했습니다.
  * 이를 해결하기 위해, 각 기능별로 GPT DATA를 분산해서 prompt를 보냈고, 이후 담당별로 기능 수행의 정확도가 높아졌습니다.



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
