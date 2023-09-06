const $chat = document.querySelector(".chat");
const $featureMessage = document.querySelector(".feature-message");
const $inputForm = document.querySelector(".input-form");

const storage = window.localStorage;

// openAI API
let url = `https://estsoft-openai-api.jejucodingcamp.workers.dev/`;

// 사용자의 질문
let question;

// 오늘날자를 string으로 return
function setToday(mode) {
	let d = new Date();

	let year = d.getFullYear(); // 년도
	let month = d.getMonth() + 1; // 월
	let date = d.getDate(); // 날짜
	let day; // 요일
	switch (d.getDay()) {
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
	let hour = d.getHours();
	let minutes = d.getMinutes();
	let seconds = d.getSeconds();

	let today = year + "년 " + month + "월 " + date + "일 " + day + "요일 ";
	let time = hour + "시 " + minutes + "분 " + seconds + "초 ";

	if (mode == "full") {
		stringToday = today + time;
	} else {
		stringToday = today;
	}

	return stringToday;
}

// preprocessQueryData
/*
	user의 질문을 가장 먼저 받아보는 GPT.
	user의 질문은 분석하여 !일반, !생성, !삭제, !수정, !탐색의 5개 키워드 중 하나를 user의 질문 가장 앞부분에 header로써 붙인다.
	모든 user의 대화는 망각한다.
*/
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
		content: "assistant의 대답의 규칙을 반드시 따라서 대답해야한다.",
	},
	{
		role: "system",
		content: `assistant의 대답의 규칙은 "<키워드> <user의 질문>"이다. <user의 질문> 부분엔 user로부터 받은 문자열을 그대로 넣는다. <키워드> 부분에 들어갈 수 있는 값은 '!일반', '!생성', '!수정', '!삭제', '!탐색' 총 5가지 뿐이다.\n예시를 들어 설명하면, user의 질문 문자열이 "너는 누구야?"인 경우, assistant는 규칙에 따라 "!일반 너는 누구야?"로 대답해야한다.\n또 다른 예시는, user가 "오늘 오후 3시에 조깅하는 일정을 추가해줘" 문자열을 전달하면, assistant는 "!생성 오늘 오후 3시에 조깅하는 일정을 추가해줘"로 대답해야한다.`,
	},
	{
		role: "system",
		content:
			"assistant는 user의 대화를 분석하여, user의 대화가 '새로운 일정을 생성'하는 요청인 경우 '!생성' 키워드를, user의 대화가 일정을 '수정' 또는 '변경'하는 하는 요청인 경우 '!수정' 키워드를, user의 대화가 일정을 '삭제' 또는 '취소'하는 요청인 경우 '!삭제' 키워드를, user의 대화가 저장된 일정을 탐색하라는 요청인 경우 '!탐색' 키워드를, 그리고 이외 일정과 관련없는 일반적인 대화는 '!일반' 키워드를 사용한다.",
	},
];

//  answeringGPT
/*
	실질적으로 user에게 feedback 대답을 하는 GPT.
	user의 질문에 응답하고, 각 GPT에서 얻은 결과를 user에게 전달한다.
*/
let answeringGPT = [
	{
		role: "system",
		content: "assistant의 이름은 'AHRO'다. 한글로 말하면 '아로'다. 일정 관리 도우미다",
	},
	{
		role: "system",
		content:
			"오늘의 날짜는 " + setToday("full") + " 이고, assistant는 오늘의 날짜에 맞춰서 대답한다.",
	},
	{
		role: "system",
		content:
			"user의 대화가 '!생성'키워드로 시작하는 경우, assistant는 user의 일정 질문 내용을 통해 일정을 생성했다는 대답을 return한다.",
	},
	{
		role: "system",
		content:
			"user의 대화가 '!수정'키워드로 시작하는 경우, assistant는 user의 일정 질문 내용을 통해 일정을 수정했다는 대답을 return한다.",
	},
	{
		role: "system",
		content:
			"user의 대화가 '!삭제'키워드로 시작하는 경우, assistant는 user의 일정을 삭제했다는 대답을 return한다.",
	},
	{
		role: "system",
		content:
			"user의 대화가 '!일반'키워드로 시작하는 경우, assistant는 user의 질문에 대해서 일반적인 대답을 return한다.",
	},
	{
		role: "system",
		content:
			"user의 대화가 '!탐색'키워드로 시작하는 경우, assistant는 user에게 기억하고 있는 일정에 대해 알려준다.",
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

	모든 user의 대화는 망각한다.
*/
let processJsonQueryData = [
	{
		role: "system",
		content:
			"assistant는 user의 일정관련 질문에 분석하여 일정을 json 데이터로 가공하는 처리기이다.",
	},
	{
		role: "system",
		content:
			"오늘의 날짜는 " + setToday("full") + " 이고, assistant는 오늘의 날짜에 맞춰서 대답한다.",
	},
	{
		role: "system",
		content:
			"json data 양식은 다음과 같다. {title: <여기에는 일정의 이름이 들어간다>, start:<여기에는 일정의 시작되는 시간이 들어간다. yyyy-mm-dd hh:mm:ss의 양식으로 저장한다.>, end:<여기에는 일정이 종료되는 시간이 들어간다 yyyy-mm-dd hh:mm:ss의 양식으로 저장한다> note:<여기에는 일정에 대한 내용 또는 메모가 들어간다>.}",
	},
	{
		role: "system",
		content:
			"assistant는 user의 질문에 대해 json data 양식을 참고하여 json data 만 user에게 return한다.",
	},
	{
		role: "system",
		content:
			"만약 system으로부터 json data를 받는다면 assistant는 이를 기억한다. JSON data를 분석하면, 일정의 제목은 'title', 일정의 시작 시간은 'start', 종료 그리고 추가사항, 노트 또는 메모는 'note'에 값이 있다. 이후 user의 요청을 받으면 해당 json data를 참고하여 json data 생성한다.",
	},
	{
		role: "system",
		content: "user가 변경을 말하지 않은 값은 system에서 받은 값을 그대로 사용한다.",
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
			"assistant는 user의 일정관련 질문에 분석하여 일정을 json 데이터로 가공하는 처리기이다.",
	},
	{
		role: "system",
		content:
			"오늘의 날짜는 " +
			setToday("full") +
			" 이다. assistant는 user의 질문이 '오늘'에 해당하는 것이라면 이 날짜에 맞춰 대답한다. user의 질문이 '오늘'에 해당하는 것이 아니라면, 이 날짜에 맞춰서 대답하지 않는다.",
	},
	{
		role: "system",
		content: `json data 양식은 다음과 같다. {"delimiter": "key 값"} delimiter 부분은 찾은 항목이 추가됨에 따라 0부터 1씩 증가 시키면서 붙인다.`,
	},
	{
		role: "system",
		content: `예를들어, user가 "내일 모든 일정을 취소하려고 해"라는 요청에, assistant는 기억하고 있는 일정 중, 내일 일정에 해당하는 일정을 찾아 "{ "item_0": "<찾은 일정 키 값>", "item_1": "<찾은 일정의 키 값>"}"의 json data 양식으로만 대답해야한다. 만약 'json_28737612872'와 'json_287371231232'라는 키 값을 찾았다면, 양식에 따른다면,  '{"item_0": "json_28737612872", "item_1": "json_287371231232"}'으로 답해야한다.`,
	},
	{
		role: "system",
		content: `assistant는 키 값을 return할 때 기억하고 있는 키 값만을 return해야한다. 없는 키 값을 return해서는 안된다.`,
	},
];

function returnJSON(text) {
	text = text.replaceAll('"', '"');
	const jsonStartIndex = text.indexOf("{");
	const jsonEndIndex = text.lastIndexOf("}");
	let jsonString = text.slice(jsonStartIndex, jsonEndIndex + 1);

	console.log("json을 찾아라: " + jsonString);

	return JSON.parse(jsonString);
}

function returnMessage(text) {
	const jsonStartIndex = text.indexOf("{");
	const message = text.slice(0, jsonStartIndex);
	return message;
}

function createContent(key, json) {
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
	$delete.classList.add("menu-icon-content", "delete-content", "delete");
	$delete.id = "delete";
	$edit.classList.add("menu-icon-content", "edit-content", "edit", "open-form");
	$edit.id = "edit";

	const $editKey = document.createElement("span");
	const $deleteKey = document.createElement("span");
	$editKey.innerText = key;
	$deleteKey.innerText = key;
	$editKey.id = "key";
	$deleteKey.id = "key";
	$editKey.style.display = "none";
	$deleteKey.style.display = "none";
	$edit.appendChild($editKey);
	$delete.appendChild($deleteKey);

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
	const $contentsArea = document.getElementsByClassName("contents-list-event-container").item(0);
	$contentsArea.removeChild(document.getElementsByClassName("contents-list").item(0));
	const $contentsList = document.createElement("div");
	$contentsArea.appendChild($contentsList);
	$contentsList.classList.add("contents-list", "list");

	for (jsonkey in storage) {
		if (jsonkey.toString().match("json")) {
			const jsonText = storage[jsonkey];
			createContent(jsonkey, jsonText);
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

// answeringGPT로부터 받은 answer 출력
const printAnswer = (answer) => {
	$featureMessage.removeChild(document.getElementById("bubble-wrap"));
	const $bubbleWrap = document.createElement("div");
	$bubbleWrap.id = "bubble-wrap";
	const $bubble = document.createElement("div");
	const $messageDiv = document.createElement("div");
	$messageDiv.innerText = answer;
	$bubble.classList.add("transparent-bg", "bubble");
	$bubble.id = "bubble";
	$bubble.appendChild($messageDiv);
	$bubbleWrap.appendChild($bubble);
	$featureMessage.appendChild($bubbleWrap);
};

// api 요청보내는 함수

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
			const keyword = keywordParser(content).trim();
			let message = content.replaceAll(keyword, "");
			console.log("메세지: " + message);
			console.log("키워드:" + keyword);
			switch (keyword) {
				case "!수정": {
					console.log("수정 시작");
					localStoragePost(keyword, message);
					answeringPost(message);
					break;
				}
				case "!생성": {
					console.log("생성 시작");
					const jsonCreateQuery =
						message +
						" system이 준 json data 양식에 따라 'title', 'start', 'end', 'note'의 key 값에 value를 추가한 json data만 return해.";
					sendQuestion(processJsonQueryData, jsonCreateQuery);
					processJsonPost();
					processJsonQueryData.pop();
					answeringPost(message);
					break;
				}
				case "!삭제": {
					localStoragePost(keyword, message);
					answeringPost(message);
					break;
				}
				case "!탐색": {
					localStoragePost(keyword, message);
					break;
				}
				default: {
					answeringPost(message);
				}
			}
		})
		.catch((err) => {
			console.log(err);
		});
	preprocessQueryData.pop();
	// makeAssistantRememberScheduel();
};

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
			let json = res.choices[0].message.content;
			console.log("json: " + json);
			json = returnJSON(json);
			json = JSON.stringify(json);
			console.log(json);
			saveScheduleInStorage("", json);
			createList();
		})
		.catch((err) => {
			console.log(err);
		});
};

const answeringPost = async (message) => {
	sendQuestion(answeringGPT, message);
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
			const answer = res.choices[0].message.content;
			printAnswer(answer);
			printChatlog(answer, false);
		})
		.catch((err) => {
			console.log(err);
		});
};

// storage 기억 GPT api 요청 보내는 함수
async function localStoragePost(keyword, message) {
	let jsonCtn = makeAssistantRememberScheduel(); // 현재 localStorage에 저장된 data 보내기, localStorage에 저장된 json 갯수 return
	let findCtn = 0;

	console.log(message);
	jsonCtn++;

	const query =
		keyword + " " + message + " 이를 system이 준 json data 양식에 따라, json data만 return해줘";

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
			console.log("키 찾기: " + content);
			const keyJson = returnJSON(content);
			console.log("찾은 키값: ");
			console.log(keyJson);

			switch (keyword) {
				case "!수정": {
					for (key in keyJson) {
						let json = storage.getItem(keyJson[key]);
						console.log("수정대상: " + json);
						processJsonQueryData.push({
							role: "system",
							content:
								"수정할 일정은, " +
								json +
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
				case "!탐색": {
					console.log("탐색 시작");
					for (key in keyJson) {
						let json = storage.getItem(keyJson[key]);
						console.log("탐색 대상 : " + json);
						answeringGPT.push({
							role: "system",
							content:
								"user의 요청으로 찾은 일정은, " +
								json +
								" 이다. 이후, user로부터 일정 요청을 assistant가 받으면 이 일정을 return한다.",
						});
						findCtn++;
					}
					console.log("answering에 넣는: " + message);
					answeringPost(message);
					findCtn++;
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

	while (findCtn > 0) {
		answeringGPT.pop;
		findCtn--;
	}
}

$inputForm.addEventListener("submit", (e) => {
	e.preventDefault();
	$chat.value = null;
	questionData.push(question);
	sendQuestion(preprocessQueryData, question);
	messagePost();
	printChatlog(question, true);
});

// ====================================================
// chat-log 조작부분

let chatLogOpened = false; // chat-log toggle용
const $chatLog = document.querySelector("#chat-log");
$chatLog.addEventListener("click", (e) => {
	const $chatLogView = document.querySelector("#chat-log-view");
	if (!chatLogOpened) {
		$chatLogView.style.display = "flex";
		chatLogOpened = !chatLogOpened;
		console.log(chatLogOpened);

		// animation
		$chatLogView.classList.add("animate__animated", "animate__bounceIn");
		$chatLogView.style.setProperty("--animation-duration", "1s");
	} else {
		console.log($chatLogView);
		$chatLogView.style.display = "none";
		chatLogOpened = !chatLogOpened;
	}
});

// ====================================================
// 일정 수동 조작 부분

let manualKey; // 일정 수동 조작시 수정/삭제 조작을 위해 필요한 storage key 값
let editMenuClosed = true; // 일정 수정 메뉴를 위한 toggle

// 할 일 목록 메뉴 영역 이벤트 지정
const $contentsAreaMenuArea = document.querySelector(".contents-area").querySelector(".menu-area");
$contentsAreaMenuArea.addEventListener("click", (e) => {
	const $targetElement = e.target;

	$targetElement.classList.forEach((className) => {
		// 일정 생성 popup form 열기
		if (className == "open-form") {
			openPopup(manualKey);
		}
		// 각 일정 수정 메뉴 visible toggle
		else if (className == "edit-menu") {
			editMenuClosed = openMenu(editMenuClosed);
		}
	});
});

function openPopup(manualKey) {
	const $popupContents = document
		.getElementById("popup-container")
		.getElementsByClassName("contents-container")
		.item(0);

	if (!manualKey) {
		document.getElementById("popup-title").innerHTML = "일정을 추가합니다.";
	} else {
		document.getElementById("popup-title").innerHTML = "일정을 수정합니다.";

		// local storage에 저장된 값을 불러와 popup form에 채워넣기 시작
		const json = JSON.parse(storage.getItem(manualKey));

		let title = json["title"];
		let start = jsonTimeParser(json["start"]);
		let end = jsonTimeParser(json["end"]);
		let note = json["note"];

		const $title = document.getElementById("title");
		const $start = document.getElementById("start");
		const $end = document.getElementById("end");
		const $note = document.getElementById("note");

		$title.value = title;
		$start.value = start;
		$end.value = end;
		$note.value = note;
		// 끝
	}

	const $popupEventContainer = document.getElementById("popup-event-container");
	$popupEventContainer.style.display = "flex";
	const $popupContainer = document.getElementById("popup-container");
	$popupContainer.style.display = "flex";
	$popupContainer.style.justifyContent = "center";
	$popupContainer.style.alignItems = "center";
	$popupContents.style.display = "flex";

	// animation
	$popupContainer.classList.add("animate__animated", "animate__bounceIn");
	$popupContainer.style.setProperty("--animation-duration", "1s");
}
function closePopup(eventTarget) {
	const $popupEventContainer = document.getElementById("popup-event-container");
	const $popupContainer = document.getElementById("popup-container");
	const $contensContainer = document.getElementById("popup-container").children.item(0);

	$popupEventContainer.style.display = "none";
	$popupContainer.style.display = "none";
	$contensContainer.style.display = "none";

	document.getElementById("title").value = "";
	document.getElementById("start").value = "";
	document.getElementById("end").value = "";
	document.getElementById("note").value = "";
	manualKey = null;
}

// 일정 수정/삭제
const $editMenuContent = document.querySelector(".contents-list-event-container");
$editMenuContent.addEventListener("click", (e) => {
	let targetElement;
	if (e.target.id == "edit" || e.target.id == "delete") {
		targetElement = e.target;
		manualKey = targetElement.children.item(0).innerHTML;

		if (targetElement.id == "edit") {
			openPopup(manualKey);
		} else if (targetElement.id == "delete") {
			storage.removeItem(manualKey);
			createList();
			openMenu(true);
			manualKey = null;
		}
	}
});

// popup에서 일어나는 event 제어
const $popupEventContainer = document.getElementById("popup-event-container");
$popupEventContainer.addEventListener("click", (e) => {
	if (e.target.className == "close-button") {
		// 팝업 창 닫기
		closePopup();
	} else if (e.target.id == "popup-submit") {
		submitPopupFormData(manualKey);
		closePopup();
	}
});

// popup에 작성한 데이터 저장
function submitPopupFormData(manualKey) {
	const $title = document.getElementById("title").value;
	const $start = datetimeParser(document.getElementById("start").value);
	const $end = datetimeParser(document.getElementById("end").value);
	const $note = document.getElementById("note").value;

	const scheduleJson = makeScheduleJSON($title, $start, $end, $note);

	if (!manualKey) {
		saveScheduleInStorage("", scheduleJson);
	} else {
		saveScheduleInStorage(manualKey, scheduleJson);
	}
	createList();

	document.getElementById("title").value = "";
	document.getElementById("start").value = "";
	document.getElementById("end").value = "";
	document.getElementById("note").value = "";
	manualKey = null;
}

function openMenu(menuClosed) {
	const $editMenuContents = document.querySelectorAll("#edit-menu-content");
	if (menuClosed) {
		Array.prototype.forEach.call($editMenuContents, (content) => {
			content.style.display = "flex";
		});
		menuClosed = !menuClosed;
		return menuClosed;
	} else {
		Array.prototype.forEach.call($editMenuContents, (content) => {
			content.style.display = "none";
		});
		menuClosed = !menuClosed;
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

function jsonTimeParser(jsonTime) {
	// jsonTime 형식: 2023-09-13 12:33:00
	let parsed = "";
	if (jsonTime) {
		const jsonTimeArr = jsonTime.split(" ");
		const time = jsonTimeArr[1].slice(0, 5);
		parsed = jsonTimeArr[0] + "T" + time;
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

function saveScheduleInStorage(_key, json) {
	let key;
	if (_key) {
		key = _key;
	} else {
		key = "json_" + Date.now();
	}

	if (json == typeof JSON) {
		json = JSON.stringify(json);
	}

	storage.setItem(key, json);
	key = null;
}

function printChatlog(message, user) {
	const $chatLogViewInnerWrap = document
		.querySelector("#chat-log-view")
		.getElementsByClassName("inner-wrap")
		.item(0);

	console.log($chatLogViewInnerWrap);

	const $chat = document.createElement("div");
	const $chatMessage = document.createElement("div");
	if (user) {
		$chat.id = "user-chat";
	} else {
		$chat.id = "assistant-chat";
	}
	$chatMessage.classList.add("chat-message", "transparent-bg");
	$chatMessage.innerHTML = message;
	$chat.appendChild($chatMessage);
	$chatLogViewInnerWrap.appendChild($chat);
}

// widget
// sticky-note start
const $stickyNoteTextarea = document.getElementById("sticky-note").children.item(0);
$stickyNoteTextarea.addEventListener("input", (e) => {
	let note = e.target.value;
	console.log(note);
	storage.setItem("note", note);
});

function initializeStickyNote() {
	let initialText = storage.getItem("note");
	if (initialText) {
		$stickyNoteTextarea.innerHTML = initialText;
	} else {
		$stickyNoteTextarea.innerHTML = "";
	}
}
initializeStickyNote();
// sticky-note end

// clock-local start

function startClock() {
	const d = new Date();

	let today = setToday("");
	document.getElementById("date-face").innerText = today;
	document.getElementById("hour").innerText = String(d.getHours()).padStart(2, "0");
	document.getElementById("minutes").innerText = String(d.getMinutes()).padStart(2, "0");
	document.getElementById("seconds").innerText = String(d.getSeconds()).padStart(2, "0");
}
startClock();
setInterval(startClock, 1000);
// clock-local end
