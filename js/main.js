const $chat = document.querySelector(".chat");
const $featureMessage = document.querySelector(".feature-message");
const $inputForm = document.querySelector(".input-form");

const storage = window.localStorage;

// openAI API
let url = `https://estsoft-openai-api.jejucodingcamp.workers.dev/`;

// 사용자의 질문
let question;

// 오늘날자를 string으로 return
function setToday() {
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

	return stringToday;
}

let preprocessQueryData = [
	{
		role: "system",
		content: "assistant는 일정 관리 프로그램에 필요한 자연어 전처리기이다.",
	},
	{
		role: "system",
		content: "assistant의 역할은 user의 질문에 header를 덧붙여 return하여 자연어를 전처리한다.",
	},
	{
		role: "system",
		content:
			"assistant의 대답 양식은 {키워드}+{user의 질문}으로만 답하며, {키워드} 부분에 들어갈 수 있는 값은 '!일반', '!생성', '!수정', '!삭제', '!탐색' 총 5가지 뿐이다. {user의 질문} 부분에는 전달된 user의 질문 텍스트를 그대로 넣어서 답한다. 즉, user의 질문 텍스트가 '너는 누구야?'인 경우, assistant는 규칙에 따라 '!일반 너는 누구야?'로 대답해야한다.",
	},
	{
		role: "system",
		content:
			"assistant는 user의 대화를 분석하여, user의 대화가 '새로운 일정을 생성'하는 요청인 경우 '!생성' 키워드를, user의 대화가 일정을 '수정' 또는 '변경'하는 하는 요청인 경우 '!수정' 키워드를, user의 대화가 일정을 '삭제' 또는 '취소'하는 요청인 경우 '!삭제' 키워드를, user의 대화가 저장된 일정을 탐색하라는 요청인 경우 '!탐색' 키워드를, 그리고 이외 일정과 관련없는 일반적인 대화는 '!일반' 키워드를 사용한다.",
	},
	{
		role: "system",
		content: "assistant는 해당 규칙을 모든 대화에서 따라야한다.",
	},
];

let answeringGPT = [
	{
		role: "system",
		content: "assistant의 이름은 'AHRO'다. 한글로 말하면 '아로'다. 일정 관리 도우미다",
	},
	{
		role: "system",
		content: "오늘의 날짜는 " + setToday() + " 이고, assistant는 오늘의 날짜에 맞춰서 대답한다.",
	},
	{
		role: "system",
		content: "assistant는 user의 질문에 단순한 대답만 한다.",
	},
	{
		role: "system",
		content:
			"assistant는 user의 대화의 '!일반', '!생성', '!수정', '!삭제', '!탐색' 키워드를 보고 적절한 대답을 한다.",
	},
	{
		role: "system",
		content:
			"user의 대화가 '!생성'키워드로 시작하는 경우, assistant는 user의 일정 질문 내용을 통해 일정을 생성했다는 말을 return하면 된다.",
	},
];

// processJsonQueryData
/*
	preprocessQueryData를 GPT에 보낸 return 문자열을 통해 JSON data를 return 하도록 유도하는 JSON data processing용 data
	GPT가 '!키워드 user의 질문'의 형태로 대답을 return하도록 유도
	GPT가 
	{
		title : "",
		start : "",
		end : "",
		note : ""
	}
	의 json object 형태로 return 하도록 유도
*/
let processJsonQueryData = [
	{
		role: "system",
		content:
			"assistant는 user의 일정관련 질문에 분석하여 일정을 json 데이터로 가공하는 처리기이다.",
	},
	{
		role: "system",
		content: "오늘의 날짜는 " + setToday() + " 이고, assistant는 오늘의 날짜에 맞춰서 대답한다.",
	},
	{
		role: "system",
		content:
			"json 데이터 양식은 다음과 같다. {title: <여기에는 일정의 이름이 들어간다>, start:<여기에는 일정의 시작되는 시간이 들어간다. yyyy-mm-dd hh:mm:ss의 양식으로 저장한다.>, end:<여기에는 일정이 종료되는 시간이 들어간다 yyyy-mm-dd hh:mm:ss의 양식으로 저장한다> note:<여기에는 일정에 대한 내용 또는 메모가 들어간다>.}",
	},
	{
		role: "system",
		content:
			"assistant는 user의 질문에 대해 json 양식을 참고하여 json data 만 user에게 return한다.",
	},
	{
		role: "system",
		content:
			"만약 system으로 부터 json data를 받는다면 assistant는 이를 기억한다. JSON data를 분석하면, 일정의 제목은 'title',  일정의 시작 시간은 'start', 종료 그리고 추가사항, 노트 또는 메모는 'note'에 값이 있다. 이후 user의 요청을 받으면 해당 json key의 value를 통해 json data를 생성한다.",
	},
];

// storageGPT
/*
	LocalStorage에 저장되어 있는 일정을 키 값과 함께 기억하도록 유도하는 GPT data
	최초 유저의 질문이 기존 일정의 수정과 삭제 요소에 관한 것이면, 
	해당 일정의 key 값을 return 하도록 유도한다.
*/
let storageGPT = [
	{
		role: "system",
		content: "assistant는 system이 주는 일정과 키 쌍을 기억한다.",
	},
	{
		role: "system",
		content:
			"오늘의 날짜는 " +
			setToday() +
			" 이다. assistant는 user의 질문이 '오늘'에 해당하는 것이라면 이 날짜에 맞춰 대답한다. user의 질문이 '오늘'에 해당하는 것이 아니라면, 이 날짜에 맞춰서 대답하지 않는다.",
	},
	{
		role: "system",
		content:
			"assistant는 기억한 일정을 기반으로 user의 질문을 분석하여 json 데이터를 user에게 return한다.",
	},
	{
		role: "system",
		content:
			"assistant가 user에게 return하는 json data의 양식은 다음과 같다. {delimiter: 'key 값'} delimiter 부분은 item이 추가됨에 따라 0부터 1씩 증가 시키면서 붙인다.",
	},
	{
		role: "system",
		content:
			'예를들어, user가 \'내일 모든 일정을 취소하려고 해\'라는 요청에, assistant는\'{ "item_0": "<찾은 일정 키 값>", "item_1": "<찾은 일정 키 값>"}\'와 으로 대답해야한다. 이는 예시이며, value 값은 실제로 기억하고 있는 값 중에서 가져와야한다.',
	},
];

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

function createContent(key, json) {
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

	const $editMenu = document.createElement("div");
	$editMenu.id = "edit-menu-content";
	const $delete = document.createElement("div");
	const $edit = document.createElement("div");
	$delete.classList.add("menu-icon-content", "delete-content");
	$edit.classList.add("menu-icon-content", "edit-content");

	const $key = document.createElement("span");
	$key.innerText = key;
	$key.id = "key";
	$key.style.display = "none";
	$delete.appendChild($key);

	$content.appendChild($title);
	$content.appendChild($start);
	$content.appendChild($end);
	$content.appendChild($note);
	$content.appendChild($editMenu);
	$editMenu.appendChild($delete);
	$editMenu.appendChild($edit);

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
			const jsonText = storage[key];
			createContent(key, jsonText);
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
const sendQuestion = (dataArr, question) => {
	if (question) {
		dataArr.push({
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
	let jsonNumCtn = 0;
	for (key in storage) {
		if (key.match("json") !== null) {
			jsonNumCtn++;
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
				content: schedule + "이 일정에 해당하는 key값은 '" + key + "'이다.",
			});
			console.log(schedule);
		}
	}
	return jsonNumCtn;
}

const printAnswer = (answer) => {
	let p = document.createElement("p");
	p.innerText = answer;
	$featureMessage.appendChild(p);
};

// api 요청보내는 함수
// JSON 생성 GPT api 요청 보내는 함수
const processJsonPost = async () => {
	const result = await fetch(url, {
		method: "POST",
		headers: {
			"Content-Type": "application/json",
		},
		body: JSON.stringify(processJsonQueryData),
		redirect: "follow",
	})
		.then((res) => res.json())
		.then((res) => {
			console.log(res);
			let json = res.choices[0].message.content;
			console.log(json);
			saveScheduleInStorage(json);
			createList();
		})
		.catch((err) => {
			console.log(err);
		});
};

// storage 기억 GPT api 요청 보내는 함수
async function localStoragePost(keyword, message) {
	let jsonCtn = makeAssistantRememberScheduel(); // 현재 localStorage에 저장된 data 보내기, localStorage에 저장된 json 갯수 return
	message = message + " beam_width:0 temperature:0";
	console.log(message);
	jsonCtn++;
	console.log(jsonCtn);

	const query = keyword + " " + message;

	sendQuestion(storageGPT, query);
	console.log(storageGPT);
	const result = await fetch(url, {
		method: "POST",
		headers: {
			"Content-Type": "application/json",
		},
		body: JSON.stringify(storageGPT),
		redirect: "follow",
	})
		.then((res) => res.json())
		.then((res) => {
			const content = res.choices[0].message.content;
			const keyJson = JSON.parse(content);

			switch (keyword) {
				case "!수정": {
					console.log("수정 시작");
					for (key in keyJson) {
						let json = storage.getItem(key);
						processJsonQueryData.push({
							role: "system",
							content:
								"수정할 일정은, " +
								JSON.stringify(json) +
								" 이다. 이후, user로부터 일정 요청을 assistant가 받으면 이 일정을 수정하여 return한다.",
						});

						sendQuestion(processJsonQueryData, message);
						processJsonPost();
						processJsonQueryData.pop();
						storage.removeItem(keyJson[key]);
					}
					break;
				}
				case "!삭제": {
					console.log("삭제 시작");
					for (key in keyJson) {
						storage.removeItem(keyJson[key]);
						processJsonQueryData.pop();
					}
					break;
				}
				default: {
					console.log("!오류");
					break;
				}
			}
			createList();
		})
		.catch((err) => {
			console.log(err);
		});

	while (jsonCtn > 0) {
		storageGPT.pop();
		jsonCtn--;
	}
}

// user 메시지 입력받아 api 요청 보내는 함수
const messagePost = async () => {
	// makeAssistantRememberScheduel();
	const result = await fetch(url, {
		method: "POST",
		headers: {
			"Content-Type": "application/json",
		},
		body: JSON.stringify(preprocessQueryData),
		redirect: "follow",
	})
		.then((res) => res.json())
		.then((res) => {
			let content = res.choices[0].message.content;
			console.log(content);

			const keyword = keywordParser(content);
			let message = content.replaceAll(keyword, "");
			message = message.replaceAll(" beam_width:0 temperature:0", "").trim();
			console.log("메세지: " + message);
			// const msg = returnMessage(content);
			// printAnswer(msg);
			printAnswer(content);

			switch (keyword) {
				case "!수정": {
					localStoragePost(keyword, message);
					break;
				}
				case "!생성": {
					console.log("생성 시작");
					message =
						message +
						" system이 준 json data 양식에 따라 'title', 'start', 'end', 'note'의 key 값에 value를 추가한 json data만 return해.";
					sendQuestion(processJsonQueryData, message);

					processJsonPost();
					processJsonQueryData.pop();
					break;
				}
				case "!삭제": {
					localStoragePost(keyword, message);
					break;
				}

				default: {
				}
			}
		})
		.catch((err) => {
			console.log(err);
		});
	preprocessQueryData.pop();
	// makeAssistantRememberScheduel();
};

$inputForm.addEventListener("submit", (e) => {
	e.preventDefault();
	$chat.value = null;
	question = question + " beam_width:0 temperature:0";
	sendQuestion(preprocessQueryData, question);
	messagePost();
	// printQuestion();
});

// ====================================================
// 일정 수동 조작 부분

// 각 일정 수정 메뉴 visible toggle 버튼
let editMenuClosed = true;
const $editMenu = document.querySelector(".edit-menu");
$editMenu.addEventListener("click", () => {
	const $editMenuContents = document.querySelectorAll("#edit-menu-content");
	console.log($editMenuContents);
	editMenuClosed = openMenu($editMenuContents, editMenuClosed);
});

// 일정 생성 form popup
const $createMenu = document.querySelector(".create-menu");
$createMenu.addEventListener("click", () => {
	const $createFormContainer = document.getElementById("popup-container");
	$createFormContainer.style.visibility = "visible";
	$createFormContainer.style.justifyContent = "center";
	$createFormContainer.style.alignItems = "center";
});

// popup 닫힘 버튼
const $closeMenu = document.querySelector(".close-button");
$closeMenu.addEventListener("click", (e) => {
	console.log("여기 눌림: " + e);
	document.querySelector(".popup-container").style.visibility = "hidden";
});

// 일정 아이템 생성
const $createMenuConfirm = document.querySelector(".form-confirm");
$createMenuConfirm.addEventListener("click", (e) => {
	const title = document.getElementById("title").value;
	console.log(title);
	const start = datetimeParser(document.getElementById("start").value);
	console.log(start);
	const end = datetimeParser(document.getElementById("end").value);
	console.log(end);
	const note = document.getElementById("note").value;
	console.log(note);

	const scheduleJson = makeScheduleJSON(title, start, end, note);
	saveScheduleInStorage(scheduleJson);
	createList();

	document.getElementById("title").value = "";
	document.getElementById("start").value = "";
	document.getElementById("end").value = "";
	document.getElementById("note").value = "";
});

// 일정 아이템 삭제
const $contentsList = document.querySelector(".contents-view");
$contentsList.addEventListener("click", (e) => {
	const $editMenuContents = document.querySelectorAll("#edit-menu-content");

	console.log(e.target);

	const key = e.target.children.item(0).innerText;
	if (key.match("json_")) {
		console.log(key);
		storage.removeItem(key);
		createList();
		openMenu($editMenuContents, true);
	}
});

function openMenu($menu, menuClosed) {
	console.log("오픈");
	if (menuClosed) {
		Array.prototype.forEach.call($menu, (content) => {
			content.style.display = "flex";
		});
		menuClosed = !menuClosed;
		console.log(menuClosed);
		return menuClosed;
	} else {
		Array.prototype.forEach.call($menu, (content) => {
			content.style.display = "none";
		});
		menuClosed = !menuClosed;
		console.log(menuClosed);
		return menuClosed;
	}
}

function datetimeParser(dateTime) {
	// dateTime 형식: 2023-09-13T12:33
	let parsed = "";
	if (dateTime) {
		const dateTimeArr = dateTime.split("T");
		parsed = dateTimeArr[0] + " " + dateTimeArr[1] + ":00";
	}
	return parsed;
}

function makeScheduleJSON(title, start, end, note) {
	let scheduleJson = {
		title: title,
		start: start,
		end: end,
		note: note,
	};

	return JSON.stringify(scheduleJson);
}

function saveScheduleInStorage(json) {
	const key = "json_" + Date.now();
	storage.setItem(key, json);
}
