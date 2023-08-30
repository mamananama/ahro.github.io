const $chat = document.querySelector(".chat");
const $featureMessage = document.querySelector(".feature-message");
const $inputForm = document.querySelector(".input-form");

const storage = window.localStorage;

// openAI API
let url = `https://estsoft-openai-api.jejucodingcamp.workers.dev/`;

// 사용자의 질문
let question;

let today = new Date();

let year = today.getFullYear(); // 년도
let month = today.getMonth() + 1; // 월
let date = today.getDate(); // 날짜
let day; // 요일
switch (today.getDay()) {
	case 0:
		day = "일";
		break;
	case 1:
		day = "월";
		break;
	case 2:
		day = "화";
		break;
	case 3:
		day = "수";
		break;
	case 4:
		day = "목";
		break;
	case 5:
		day = "금";
		break;
	case 6:
		day = "토";
		break;
}
let hour = today.getHours();
let minutes = today.getMinutes();
let seconds = today.getSeconds();

let stringToday =
	year +
	"년 " +
	month +
	"월 " +
	date +
	"일 " +
	day +
	"요일 " +
	hour +
	"시 " +
	minutes +
	"분 " +
	seconds +
	"초 ";

// 질문과 답변 저장
let data = [
	{
		role: "system",
		content: "assistant의 이름은 'AHRO'다. 한글로 말하면 '아로'다.",
	},
	{
		role: "system",
		content: "assistant는 철저한 일정 관리 도우미다.",
	},
	{
		role: "system",
		content:
			"오늘의 날짜는<" + stringToday + ">이고, assistant는 오늘의 날짜에 맞춰서 대답해야한다.",
	},
	{
		role: "system",
		content:
			"assistant는 user의 일정 언급에 대해 확인한다는 대답과 함께 해당 양식으로 답해야 한다.먼저, user로부터 전달받은 일정을 확인하는 대답을 한다. 다음으로는 일정에 대한 JSON 양식을 토대로 일정을 정리한다.",
	},
	{
		role: "system",
		content:
			"assistant는 user의 일정 언급에 대해 '<<기억할 일정을 받았다는 대답> <JSON 양식>>'으로 대답해야한다.",
	},
	{
		role: "system",
		content:
			"assistant는 일정에 대한 JSON 양식을 정확히 따른다. JSON 양식은 다음과 같다. {title: <여기에는 일정의 이름이 들어간다>, start:<여기에는 일정의 시작되는 시간이 들어간다. yyyy-mm-dd hh:mm:ss의 양식으로 저장한다.>, end:<여기에는 일정이 종료되는 시간이 들어간다 yyyy-mm-dd hh:mm:ss의 양식으로 저장한다> note:<여기에는 일정에 대한 내용 또는 메모가 들어간다>. JSON의 키 값은 따옴표로 감싸지 않는다.",
	},
	{
		role: "system",
		content:
			"assistant는 user로부터 일정에 대한 요청을 받았을 때 JSON 양식을 무조건 user에게 답해야 한다.",
	},
	{
		role: "system",
		content:
			"assistant는 답변에 'JSON양식을 생성했다', '일정을 JSON으로 정리했다'와 같은 표현을 하면 안된다.",
	},
];

function returnJSON(text) {
	const jsonStartIndex = text.indexOf("{");
	const jsonEndIndex = text.indexOf("}");
	const jsonString = text.slice(jsonStartIndex, jsonEndIndex + 1);
	return jsonString;
}

function returnMessage(text) {
	const jsonStartIndex = text.indexOf("{");
	const message = text.slice(0, jsonStartIndex);
	return message;
}

function createList(json) {
	const title = json.title;
	const start = json.start;
	const end = json.end;
	const note = json.note;

	const $contentsList = document.querySelector(".contents-list");
	const $content = document.createElement("div");
	$content.classList.add("content", "transparent-bg");
	$contentsList.appendChild($content);

	const $title = document.createElement("h3");
	const $start = document.createElement("span");
	const $end = document.createElement("span");
	const $note = document.createElement("p");

	$content.appendChild($title);
	$content.appendChild($start);
	$content.appendChild($end);
	$content.appendChild($note);

	$start.classList.add("time");
	$end.classList.add("time");

	$title.innerHTML = title;
	$start.innerHTML = "시작 시간: " + start;
	$end.innerHTML = "종료 시간: " + end;
	$note.innerHTML = note;
}

// 화면에 뿌려줄 데이터, 질문들
let questionData = [];

// input에 입력된 질문 받아오는 함수
$chat.addEventListener("input", (e) => {
	question = e.target.value;
	console.log(question);
});

// 사용자의 질문을 객체를 만들어서 push
const sendQuestion = (question) => {
	if (question) {
		data.push({
			role: "user",
			content: question,
		});
		questionData.push({
			role: "user",
			content: question,
		});
	}
};

// 화면에 질문 그려주는 함수
// const printQuestion = async () => {
// 	if (question) {
// 		let li = document.createElement("li");
// 		li.classList.add("question");
// 		questionData.map((el) => {
// 			li.innerText = el.content;
// 		});
// 		$chatList.appendChild(li);
// 		questionData = [];
// 		question = false;
// 	}
// };

// 화면에 답변 그려주는 함수
const printAnswer = (answer) => {
	let p = document.createElement("p");
	p.innerText = answer;
	$featureMessage.appendChild(p);
};

// api 요청보내는 함수
let count = 0;
const apiPost = async () => {
	const result = await fetch(url, {
		method: "POST",
		headers: {
			"Content-Type": "application/json",
		},
		body: JSON.stringify(data),
		redirect: "follow",
	})
		.then((res) => res.json())
		.then((res) => {
			const content = res.choices[0].message.content;

			let storageData = JSON.stringify({
				message: returnMessage(content),
				json: returnJSON(content),
			});

			count = storage.getItem("key") ? storage.getItem("key") : count;
			storage.setItem(count, storageData);

			console.log(storage.getItem(count));
			printAnswer(JSON.parse(storage.getItem(count)).message);

			createList(JSON.parse(JSON.parse(storage.getItem(count)).json));

			count++;
			storage.setItem("key", count);
		})
		.catch((err) => {
			console.log(err);
		});
};

// submit
$inputForm.addEventListener("submit", (e) => {
	e.preventDefault();
	$chat.value = null;
	sendQuestion(question);
	apiPost();
	// printQuestion();
});
