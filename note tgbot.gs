// configuration
var apiToken = "";
var appUrl   = "";
var apiUrl   = "https://api.telegram.org/bot" + apiToken;

// set webhook
function setWebhook() {
  var url = apiUrl + "/setwebhook?url=" + appUrl;
  var res = UrlFetchApp.fetch(url).getContentText();
  Logger.log(res);
}

// handle webhook
function doPost(e) {
  try {
    var webhookData = JSON.parse(e.postData.contents);
    var from = webhookData.message.from.id;
    var text = webhookData.message.text;
    var sendText = "";

    if (text.startsWith("/add")) {
      saveInfoInTable(text.substring(5));
      sendText = "Your note has been saved.";
    } else if (text.startsWith("/get")) {
      sendText = loadInfo(text.substring(5));
    //} else if (text == "/start") {
      //sendText = "Hi! I'm The Note Bot.";
    } else if (text.startsWith("/delete")) {
      sendText = deleteNote(text.substring(8));
    } else {
      sendText = "I don't understand you.";
    }

    var url = apiUrl + "/sendmessage?parse_mode=HTML&chat_id=" + from + "&text=" + encodeURIComponent(sendText);
    var opts = { "muteHttpExceptions": true };
    UrlFetchApp.fetch(url, opts).getContentText();
  } catch (error) {
    console.error("Error handling command:", error);
    var errorMessage = "An error occurred while processing your request.";
    var url = apiUrl + "/sendmessage?parse_mode=HTML&chat_id=" + from + "&text=" + encodeURIComponent(errorMessage);
    var opts = { "muteHttpExceptions": true };
    UrlFetchApp.fetch(url, opts).getContentText();
  }
}

// save note to table
function saveInfoInTable(text) {
  try {
    var ss = SpreadsheetApp.getActiveSpreadsheet();
    var lastRow = ss.getActiveSheet().getLastRow() + 1;
    ss.getActiveSheet().getRange("A" + lastRow).setValue(text);
  } catch (error) {
    console.error("Error saving note:", error);
  }
}

// load info from table
function loadInfo(noteNumber) {
  try {
    var ss = SpreadsheetApp.getActiveSpreadsheet();
    var cell = ss.getActiveSheet().getRange("A" + noteNumber);
    var note = cell.getValue();
    return note || "Note not found.";
  } catch (error) {
    console.error("Error loading note:", error);
    return "An error occurred while loading the note. Details: " + error;
  }
}

// delete note from table
function deleteNote(noteNumber) {
  try {
    var deletionResult = deleteSingleNote(noteNumber);
    return deletionResult || "Note deleted.";
  } catch (error) {
    console.error("Error deleting note:", error);
    return "An error occurred while deleting the note.";
  }
}

// delete single note from table
function deleteSingleNote(noteNumber) {
  try {
    var ss = SpreadsheetApp.getActiveSpreadsheet();
    var cell = ss.getActiveSheet().getRange("A" + noteNumber);
    var note = cell.getValue();

    if (note) {
      cell.setValue("");
      return "Note " + noteNumber + " deleted.";
    } else {
      return "Note " + noteNumber + " not found.";
    }
  } catch (error) {
    console.error("Error deleting single note:", error);
    return "An error occurred while deleting the note.";
  }
}

function doGet(e) {
  return ContentService.createTextOutput("Method GET not allowed");
}
