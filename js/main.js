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
let answeringGPT = [
	{
		role: "system",
		content: "assistant의 이름은 'AHRO'다. 한글로 말하면 '아로'다. 일정 관리 도우미다",
	},
	{
		role: "system",
		content: "오늘의 날짜는 " + stringToday + " 이고, assistant는 오늘의 날짜에 맞춰서 대답한다.",
	},
	{
		role: "system",
		content:
			"assistant의 모든 대답은 반드시 양식에 따라서만 대답해야한다. 양식 2가지 변수의 조합으로 이루어져있다. 첫번째 변수는 '키워드', 두번째 변수는 '메시지' 문자열로 대답해야한다.",
	},
	{
		role: "system",
		content:
			"assistant가 대화 양식 중 '키워드' 변수에 사용할 수 있는 값은 '!일반', '!생성', '!수정', '!삭제' 총 4가지 뿐이다.",
	},
	{
		role: "system",
		content:
			"assistant는 user의 요청을 분석하여, 새로운 일정 생성 요청에 대한 assistant의 대답으로 '!생성' 값을 '키워드' 변수에 넣는다.",
	},
	{
		role: "system",
		content:
			"assistant는 user의 요청을 분석하여, 이미 존재하는 일정에 대해 수정하거나 추가로 내용을 덧붙이는 요청에 대한 assistant의 대답으로 '!수정' 값을 '키워드' 변수에 넣는다.",
	},
	{
		role: "system",
		content:
			"assistant는 user의 요청을 분석하여, 기존의 일정을 삭제하는 요청에 대한 assistant의 대답으로 '!삭제' 값을 '키워드' 변수에 넣는다.",
	},
	{
		role: "system",
		content:
			"assistant는 user의 요청을 분석하여, 앞선 규칙에 해당하지 않는 모든 user의 요청에 대해서 assistant는 '!일반' 값을 '키워드' 변수에 넣는다.",
	},
	// {
	// 	role: "system",
	// 	content:
	// 		"assistant는 user의 요청이 첫 일정 생성 요청과 기존 일정 수정 및 추가인 경우, 'JSON'변수에 다음과 같은 json data를 반드시 넣어야 한다. {title: <여기에는 일정의 이름이 들어간다>, start:<여기에는 일정의 시작되는 시간이 들어간다. yyyy-mm-dd hh:mm:ss의 양식으로 저장한다.>, end:<여기에는 일정이 종료되는 시간이 들어간다 yyyy-mm-dd hh:mm:ss의 양식으로 저장한다> note:<여기에는 일정에 대한 내용 또는 메모가 들어간다>.",
	// },
	// {
	// 	role: "system",
	// 	content:
	// 		"assistant는 user의 요청이 일정의 생성 요청인 경우에 json data 양식 중, 'title', 'start'에 해당하는 정보를 '필수 정보'로 설정한다. '필수 정보'는 user에게 받아야하며, 'end', 'note'는 필수로 받지 않아도 되며, 정보를 받지 못했다면 해당 양식에는 빈 문자열을 입력한다. 필수로 받아야하는 정보를 받지 못한 경우, JSON 양식을 생성하지 말고, user에게 다시 물어 필수 정보을 받도록 다시 질문 해야한다. 추가 질문으로 필수 정보가 갖추어진 경우에만 json data를 생성한다.",
	// },
	// {
	// 	role: "system",
	// 	content:
	// 		"assistant는 user가 일정을 만드는데 필요한 일정 양식 질문에 대해 JSON이 아닌, 문자열로 표현하여 대답한다.",
	// },
];
let preprocessingGPT = [];
let storageGPT = [];

function returnJSON(text) {
	const jsonStartIndex = text.indexOf("{");
	const jsonEndIndex = text.indexOf("}");
	const jsonString = text.slice(jsonStartIndex, jsonEndIndex + 1);
	return JSON.parse(jsonString);
}

function returnMessage(text) {
	const jsonStartIndex = text.indexOf("{");
	const message = text.slice(0, jsonStartIndex);
	return message;
}

function createContent(json) {
	console.log(json);
	const parseJason = JSON.parse(json);
	const title = parseJason.title;
	const start = parseJason.start;
	const end = parseJason.end;
	const note = parseJason.note;

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

function createList() {
	const $contentsArea = document.getElementsByClassName("contents-area").item(0);
	$contentsArea.removeChild(document.getElementsByClassName("contents-list").item(0));
	const $contentsList = document.createElement("div");
	$contentsArea.appendChild($contentsList);
	$contentsList.classList.add("contents-list", "list");

	for (key in storage) {
		if (key.toString().match("json") != null) {
			console.log(storage[key]);
			const jsonText = storage[key];
			createContent(jsonText);
		}
	}
}
createList();
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
		answeringGPT.push({
			role: "user",
			content: question,
		});
		questionData.push({
			role: "user",
			content: question,
		});
	}
};

function keywordParser(text) {
	const keyword = text.match(/^![가-힣a-zA-Z0-9]+/);

	if (keyword == null) {
		return "";
	} else {
		return keyword[0];
	}
}

function makeAssistantRememberScheduel() {
	for (key in storage) {
		if (key.match("json") !== null) {
			const json = JSON.parse(storage.getItem(key));

			const title = json.title;
			const start = json.start;
			const end = json.end;
			const note = json.note;

			let schedule = title + " 일정은 " + start + "에 시작";
			if (end !== "") {
				schedule = schedule + "하고, " + end + "에 끝나는 일정이다.";
			} else {
				schedule = schedule + "하는 일정이다.";
			}

			if (note !== "") {
				schedule = schedule + "추가로, '" + note + "'의 추가사항이 있다.";
			}

			storageGPT.push({
				role: "system",
				content:
					schedule +
					"이 일정에 해당하는 key값은 '" +
					key +
					"'이다. assistant는 일정과 이 일정에 해당하는 key를 동시에 기억해야한다. 해당 key값은 수정, 삭제 요청 때 user에게 전달해야한다.",
			});
			console.log(schedule);
		}
	}
}

const printAnswer = (answer) => {
	let p = document.createElement("p");
	p.innerText = answer;
	$featureMessage.appendChild(p);
};

// api 요청보내는 함수
const apiPost = async () => {
	// makeAssistantRememberScheduel();
	const result = await fetch(url, {
		method: "POST",
		headers: {
			"Content-Type": "application/json",
		},
		body: JSON.stringify(answeringGPT),
		redirect: "follow",
	})
		.then((res) => res.json())
		.then((res) => {
			let content = res.choices[0].message.content;
			console.log(content);
			const key = Date.now();

			const keyword = keywordParser(content);
			if (keyword !== null) {
				content = content.slice(3);
				content = content.trim();
			}

			const msg = returnMessage(content);

			printAnswer(msg);
			console.log(keyword);
			switch (keyword) {
				case "!수정": {
					const delKey = 0;
					storage.setItem("d_" + delKey, storage.getItem(delKey));
					storage.removeItem(delKey);
				}
				case "!생성": {
					const json = JSON.stringify(returnJSON(content));
					storage.setItem("msg_" + key, msg);
					if (json) {
						storage.setItem("json_" + key, json);
						createList();
					}
					break;
				}
				case "!삭제": {
					const delKey = 0;
					storage.removeItem(delKey);
					break;
				}
				default: {
				}
			}
			// makeAssistantRememberScheduel();
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
