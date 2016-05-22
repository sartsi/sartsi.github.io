var localStorageFreeLearningDataHolderName = "freeLearningDataHolder";
var localStorageSpecialDataHoldersNameStub = "specialDataHolder_";
// currently selected special learning group.
var speziellesLernenSelectedGroup = 0;

var currentQuestionPositionsName = "currentQuestionPositions";
var specialLearningGroupsLearnModeName = "storeSpecialLearningGroupsLearnMode";

var examDomains = ["pruefungssimulation-fragebogen-allgemeine-fischkunde", "pruefungssimulation-fragebogen-spezielle-fischkunde", "pruefungssimulation-fragebogen-gewaesserkunde",
    "pruefungssimulation-fragebogen-geraetekunde", "pruefungssimulation-fragebogen-gesetzeskunde"];

function ScoreDataHolder(labelStub, destinationLabelId, localStorageId, hrefBased) {
  this.labelStub = labelStub;
  this.hrefBased = hrefBased;
  this.id = destinationLabelId;
  this.localStorageId = localStorageId;
  this.rightAnswers = 0;
  this.totalAnswers = 0;
}
/**
 * score data holders.
 */
var freiesLernenDataHolder = new ScoreDataHolder("Freies Lernen ", "my-tabs-1", localStorageFreeLearningDataHolderName, true);

var specialDataHolder0 = new ScoreDataHolder("Allgemeine Fischkunde ", "spezielles-lernen-radio-label-1", localStorageSpecialDataHoldersNameStub + "1", false);
var specialDataHolder3 = new ScoreDataHolder("Geraetekunde ", "spezielles-lernen-radio-label-4", localStorageSpecialDataHoldersNameStub + "2", false);
var specialDataHolder4 = new ScoreDataHolder("Gesetzeskunde ", "spezielles-lernen-radio-label-5", localStorageSpecialDataHoldersNameStub + "3", false);
var specialDataHolder2 = new ScoreDataHolder("Gewaesserkunde ", "spezielles-lernen-radio-label-3", localStorageSpecialDataHoldersNameStub + "4", false);
var specialDataHolder1 = new ScoreDataHolder("Spezielle Fischkunde ", "spezielles-lernen-radio-label-2", localStorageSpecialDataHoldersNameStub + "5", false);
var specialDataHolders = [specialDataHolder0, specialDataHolder1, specialDataHolder2, specialDataHolder3, specialDataHolder4];

// stores current chronological question positions.
var currentQuestionPositions = [0, 0, 0, 0, 0];
// true means random, false means chronological.
var speziellesLernenGroupsLearnMode = [true, true, true, true, true];

/**
 * generates random value between 0 and given max argument.
 * 
 * @param max
 * @returns random value between 0 and max
 */
function randomValueFromZeroToMax(max) {
  return Math.floor(Math.random() * max);
}

/**
 * gets the course data from server. course date is entire knowledge base of fishing data we know we read date into the course var.
 */
$(document).ready(function() {

  // init logging
  $.clientSideLogging();
  $("#my-tabs").tabs();
  $("#freies-lernen-naechste-frage-button").button();
  /**
   * special learning
   */
  $("#spezielles-lernen-radio-set").buttonset();

  $("#settings-clear-localstorage").button();

  var tooltip = $('<button id="special-learning-question-slider-tooltip" />').css({
    position : 'absolute',
    top : -25,
    left : -0
  }).hide();

  $("#special-learning-question-spinner").spinner();

  $("#special-learning-question-slider").slider({
    slide : function(event, ui) {
      tooltip.text(ui.value);
    },
    create : function(event, ui) {
      tooltip.text(ui.value);
    }
  });
  $("#special-learning-question-slider").find(".ui-slider-handle").append(tooltip);
  $("#special-learning-question-slider").find(".ui-slider-handle").hover(function() {
    tooltip.show();
  }, function() {
    tooltip.hide();
  });

  $("#special-learning-question-slider-tooltip").button();

  $("#special-learning-question-slider").on("slidechange", function(event, ui) {
    $.error("special-learning-question-slider became value: " + ui.value);
    currentQuestionPositions[speziellesLernenSelectedGroup] = ui.value - 1;
    fillNextQuestionForGroup(speziellesLernenSelectedGroup, speziellesLernenGroupsLearnMode[speziellesLernenSelectedGroup]);
    updateSpecialLearningSpinner(speziellesLernenSelectedGroup);
  });

  $("#special-learning-question-spinner").on("spin", function(event, ui) {
    specialLearningSpinnerOnChange(event, ui);
  });
  $("#special-learning-question-spinner").on("keyup", function() {
    var value;
    try {
      value = eval($("#special-learning-question-spinner").val());
    } catch (e) {
      $.error("entered value is invalid");
      $("#special-learning-question-spinner").spinner("value", 1);
      specialLearningSpinnerUpdate(1);
    }
    if (value !== undefined) {
      var questionGroup = course.questionGroup[speziellesLernenSelectedGroup];
      var questionGroupLength = questionGroup.question.length;
      if (1 <= value && value <= questionGroupLength) {
        $("#special-learning-question-spinner").spinner("value", value);
        specialLearningSpinnerUpdate(value);
      } else {
        if (1 > value) {
          $("#special-learning-question-spinner").spinner("value", 1);
          specialLearningSpinnerUpdate(1);
        }
        if (value > questionGroupLength) {
          $("#special-learning-question-spinner").spinner("value", questionGroupLength);
          specialLearningSpinnerUpdate(questionGroupLength);
        }
      }
    }
  });

  $("#settings-clear-localstorage").click(function() {
    localStorage.clear();
  });
  $("#settings-random-chronologic-1").click(function() {
    speziellesLernenGroupsLearnMode = [true,true, true, true, true];
    storeSpecialLearningGroupsLearnMode();
  });
  $("#settings-random-chronologic-2").click(function() {
    speziellesLernenGroupsLearnMode = [false, false, false, false, false];
    storeSpecialLearningGroupsLearnMode();
  });

  $("#spezielles-lernen-naechste-frage-button").button();

  // XXX do it better e.g. one function for all this stuff.
  $("#spezielles-lernen-radio-1").click(function() {
    speziellesLernenSelectedGroup = 0;
    fillNextQuestionForGroup(speziellesLernenSelectedGroup, speziellesLernenGroupsLearnMode[speziellesLernenSelectedGroup]);
    updateSpecialLearningSlider(speziellesLernenSelectedGroup);
  });
  $("#spezielles-lernen-radio-2").click(function() {
    speziellesLernenSelectedGroup = 1;
    fillNextQuestionForGroup(speziellesLernenSelectedGroup, speziellesLernenGroupsLearnMode[speziellesLernenSelectedGroup]);
    updateSpecialLearningSlider(speziellesLernenSelectedGroup);
  });
  $("#spezielles-lernen-radio-3").click(function() {
    speziellesLernenSelectedGroup = 2;
    fillNextQuestionForGroup(speziellesLernenSelectedGroup, speziellesLernenGroupsLearnMode[speziellesLernenSelectedGroup]);
    updateSpecialLearningSlider(speziellesLernenSelectedGroup);
  });
  $("#spezielles-lernen-radio-4").click(function() {
    speziellesLernenSelectedGroup = 3;
    fillNextQuestionForGroup(speziellesLernenSelectedGroup, speziellesLernenGroupsLearnMode[speziellesLernenSelectedGroup]);
    updateSpecialLearningSlider(speziellesLernenSelectedGroup);
  });
  $("#spezielles-lernen-radio-5").click(function() {
    speziellesLernenSelectedGroup = 4;
    fillNextQuestionForGroup(speziellesLernenSelectedGroup, speziellesLernenGroupsLearnMode[speziellesLernenSelectedGroup]);
    updateSpecialLearningSlider(speziellesLernenSelectedGroup);
  });

  /**
   * exam simulation
   */
  $("#pruefungssimulation-fragebogen").accordion({
    collapsible : true,
    active : 'none',
    autoHeight : false,
    navigation : true
  });

  // adjust height of all exam domains.
  for (var i = 0; i < examDomains.length; i++) {
    $("#" + examDomains[i]).css("height", "auto");
  }

  /**
   * fill exam
   */
  fillExam();

  /**
   * adds click listener to 'freies lernen' next question button. generates next question and fills certain area.
   */
  $("#freies-lernen-naechste-frage-button").click(function() {
    fillNextQuestion();
  });

  /**
   * adds click listener to 'spezielles lernen' next question button. generates next question and fills certain area.
   */
  $("#spezielles-lernen-naechste-frage-button").click(function() {
    fillNextQuestionForGroup(speziellesLernenSelectedGroup, speziellesLernenGroupsLearnMode[speziellesLernenSelectedGroup]);
    updateSpecialLearningSlider(speziellesLernenSelectedGroup);
  });

  fillNextQuestionForGroup(speziellesLernenSelectedGroup, speziellesLernenGroupsLearnMode[speziellesLernenSelectedGroup]);
  fillNextQuestion();

  /**
   * restoring score stuff.
   */
  var tempFreeLearningDataHolder = localStorage.getItem(localStorageFreeLearningDataHolderName);
  if (tempFreeLearningDataHolder !== 'undefined' && tempFreeLearningDataHolder !== null) {
    var tempParsedFreiesLernenDataHolder = JSON.parse(tempFreeLearningDataHolder);
    freiesLernenDataHolder.rightAnswers = tempParsedFreiesLernenDataHolder.rightAnswers;
    freiesLernenDataHolder.totalAnswers = tempParsedFreiesLernenDataHolder.totalAnswers;
  }
  /**
   * the same with specialDataHolders
   */

  for (var courseLoop = 1; courseLoop <= 5; courseLoop++) {
    var tempSpecialDataHolder = localStorage.getItem(localStorageSpecialDataHoldersNameStub + courseLoop.toString());
    if (tempSpecialDataHolder !== 'undefined' && tempSpecialDataHolder !== null) {
      var parsedSpecialDataHolder = JSON.parse(tempSpecialDataHolder);
      specialDataHolders[courseLoop].rightAnswers = parsedSpecialDataHolder.rightAnswers;
      specialDataHolders[courseLoop].totalAnswers = parsedSpecialDataHolder.totalAnswers;
    }
  }
  // restore current question positions.
  restoreCurrentQuestionPositions();
  // restore settings.
  restoreSpecialLearningGroupsLearnMode();
  // update slider
  updateSpecialLearningSlider(speziellesLernenSelectedGroup);

  $("#settings-random-chronologic-set").buttonset();
  // set ui states. XXX do it better
  if (speziellesLernenGroupsLearnMode[0] === true) {
    $("#settings-random-chronologic-1").click();
  } else {
    $("#settings-random-chronologic-2").click();
  }
});

function updateSpecialLearningSlider(questionGroupNumber) {
  $("#special-learning-question-slider").slider("option", "min", 1);
  var questionGroup = course.questionGroup[questionGroupNumber];
  var questionGroupLength = questionGroup.question.length;
  $.error("updateSpecialLearningSlider>>> questionGroupLength :" + questionGroupLength);
  $("#special-learning-question-slider").slider("option", "max", questionGroupLength);
  // set last known value
  var currentValue = currentQuestionPositions[questionGroupNumber];
  $.error("updateSpecialLearningSlider>>> currentValue :" + currentValue);
  $("#special-learning-question-slider").slider("value", currentValue);
  $("#special-learning-question-slider").find("#special-learning-question-slider-tooltip").text(currentValue);
}

function specialLearningSpinnerOnChange(event, ui) {
  specialLearningSpinnerUpdate(ui.value);
}

function specialLearningSpinnerUpdate(value) {
  $.error("special-learning-question-slider became value: " + value);
  currentQuestionPositions[speziellesLernenSelectedGroup] = value - 1;
  fillNextQuestionForGroup(speziellesLernenSelectedGroup, speziellesLernenGroupsLearnMode[speziellesLernenSelectedGroup]);
  updateSpecialLearningSlider(speziellesLernenSelectedGroup);
}

function updateSpecialLearningSpinner(questionGroupNumber) {
  $("special-learning-question-spinner").off();
  $("#special-learning-question-spinner").spinner("option", "min", 1);
  var questionGroup = course.questionGroup[questionGroupNumber];
  var questionGroupLength = questionGroup.question.length;
  $.error("updateSpecialLearningSpinner>>> questionGroupLength :" + questionGroupLength);
  $("#special-learning-question-spinner").spinner("option", "max", questionGroupLength);
  // set last known value
  var currentValue = currentQuestionPositions[questionGroupNumber];
  $.error("updateSpecialLearningSlider>>> currentValue :" + currentValue);
  $("#special-learning-question-spinner").spinner("value", currentValue);
  // and enable spinners change function.
  $("special-learning-question-spinner").on("spin", function(event, ui) {
    specialLearningSpinnerOnChange(event, ui);
  });
}

/**
 * gets random question from random group from given course
 */
function getRandomQuestionFromCourse(currentCourse) {
  var randomGroup = getRandomGroup(currentCourse);
  return getRandomQuestionFromGroup(randomGroup);
}
/**
 * gets random question from group n from given course
 */
function getRandomQuestionFromCourseForGroup(currentCourse, n) {
  var groupN = getGroup(currentCourse, n);
  return getRandomQuestionFromGroup(groupN);
}

function getNextQuestionFromCourseForGroup(currentCourse, n) {
  var groupN = getGroup(currentCourse, n);
  return getNextQuestionFromGroup(groupN, n);
}

/**
 * gets random group from given course
 */
function getRandomGroup(currentCourse) {
  var groupLength = currentCourse.questionGroup.length;
  var randomGroupNumber = randomValueFromZeroToMax(groupLength);
  return currentCourse.questionGroup[randomGroupNumber];
}
/**
 * gets group n from given course, 0 <= n <= 4
 */
function getGroup(currentCourse, n) {
  var position = 0;
  var groupLength = currentCourse.questionGroup.length;
  if (n >= 0 && n < groupLength) {
    position = n;
  }
  return currentCourse.questionGroup[position];
}
/**
 * gets random question from given group
 */
function getRandomQuestionFromGroup(currentGroup) {
  var questionLength = currentGroup.question.length;
  var randomQuestionNumber = randomValueFromZeroToMax(questionLength);
  return currentGroup.question[randomQuestionNumber];
}
function getNextQuestionFromGroup(currentGroup, n) {
  var questionLength = currentGroup.question.length;
  var currentQuestionNumber = currentQuestionPositions[n];
  var question;
  if (currentQuestionNumber < questionLength) {
    question = currentGroup.question[currentQuestionNumber];
    currentQuestionPositions[n] = currentQuestionPositions[n] + 1;
  } else {
    currentQuestionPositions[n] = 0;
    question = currentGroup.question[0];
  }
  // store current question positions before return.
  storeCurrentQuestionPositions();

  return question;
}

function storeCurrentQuestionPositions() {
  localStorage.setItem(currentQuestionPositionsName, JSON.stringify(currentQuestionPositions));
}

function restoreCurrentQuestionPositions() {
  var dataHolder = localStorage.getItem(currentQuestionPositionsName);
  if (dataHolder !== 'undefined' && dataHolder !== null) {
    currentQuestionPositions = JSON.parse(dataHolder);
  }
}

function storeSpecialLearningGroupsLearnMode() {
  localStorage.setItem(specialLearningGroupsLearnModeName, JSON.stringify(speziellesLernenGroupsLearnMode));
}
function restoreSpecialLearningGroupsLearnMode() {
  var dataHolder = localStorage.getItem(specialLearningGroupsLearnModeName);
  if (dataHolder !== 'undefined' && dataHolder !== null) {
    speziellesLernenGroupsLearnMode = JSON.parse(dataHolder);
  }
}

/**
 * generates new random question and fills it to certain area with certain id.
 */
function fillNextQuestion() {
  var question = getRandomQuestionFromCourse(course);
  insertSingleQuestion("freies-lernen-frage-bereich", "nextQuestion", question, freiesLernenDataHolder, -1);
}

/**
 * generates new random question and fills it to certain area with certain id. 1<=n<=5 bullshit.
 */
function fillNextQuestionForGroup(n, showRandomQuestion) {
  if (showRandomQuestion) {
    var question = getRandomQuestionFromCourseForGroup(course, n);
    insertSingleQuestion("spezielles-lernen-frage-bereich", "nextSpecialQuestion", question, specialDataHolders[n], -1);
  } else {
    var aQuestion = getNextQuestionFromCourseForGroup(course, n);
    var questionNumber = currentQuestionPositions[n];
    insertSingleQuestion("spezielles-lernen-frage-bereich", "nextSpecialQuestion", aQuestion, specialDataHolders[n], questionNumber);
  }
}

/**
 * insert single question to given container id
 */
function insertExamQuestion(destionationContainerId, containerId, question, questionNumber) {
  // first, unbind and remove previous question, if any already there.
  $("#" + containerId + "-1").unbind();
  $("#" + containerId + "-2").unbind();
  $("#" + containerId + "-3").unbind();
  $("#" + containerId + '-container').remove();

  var questionPrefix = "Frage";
  if (questionNumber === -1) {
    questionPrefix += ": ";
  } else {
    questionPrefix += " " + questionNumber + ": ";
  }

  var questionHtmlData = '<div id="' + containerId + '-container" style="font-size:16px;">' + // 
  '<p id="' + containerId + '-Name">' + questionPrefix + question.name + '</p>' // 
      + '<input type="radio" id="' + containerId + '-1" name="radio"><label id="' + containerId + '-1-Label-1" for="' + containerId + '-1">' + question.answer[0] + '</label><br/>'
      + '<input type="radio" id="' + containerId + '-2" name="radio"><label id="' + containerId + '-2-Label-2" for="' + containerId + '-2">' + question.answer[1] + '</label><br/>'// 
      + '<input type="radio" id="' + containerId + '-3" name="radio"><label id="' + containerId + '-3-Label-3" for="' + containerId + '-3">' + question.answer[2] + '</label>' + '</div>';

  $("#" + destionationContainerId).append(questionHtmlData);
  var rightAnswer = question.rightanswer;

  $("#" + containerId + "-1").click(function() {
    solveCurrentExamAnswerNew(containerId, 1, rightAnswer);
  });
  $("#" + containerId + "-2").click(function() {
    solveCurrentExamAnswerNew(containerId, 2, rightAnswer);
  });
  $("#" + containerId + "-3").click(function() {
    solveCurrentExamAnswerNew(containerId, 3, rightAnswer);
  });
}
/**
 * fils new exam.
 */
function fillExam() {
  for (var i = 0; i < 5; i++) {
    var domainId = examDomains[i];
    clearExamDomain(domainId);
    for (var j = 0; j < 12; j++) {
      var question = getRandomQuestionFromCourseForGroup(course, j);
      insertExamQuestion(domainId, "examQuestion-" + i + "-" + j, question, j + 1);
    }
  }
}
function clearExamDomain(domainId) {
  $("#" + domainId).text("");
}

/**
 * insert single question to given container id
 */
function insertSingleQuestion(destionationContainerId, containerId, question, dataHolder, questionNumber) {
  // first, unbind and remove previous question, if any already there.
  $("#" + containerId + "1").unbind();
  $("#" + containerId + "2").unbind();
  $("#" + containerId + "3").unbind();
  $("#" + containerId).remove();

  var questionPrefix = "Frage";
  if (questionNumber === -1) {
    questionPrefix += ": ";
  } else {
    questionPrefix += " " + questionNumber + ": ";
  }

  var questionHtmlData = '<div id="' + containerId + '" style="font-size:16px;">' + '<p id="' + containerId + 'Name">' + questionPrefix + question.name + '</p>' + '<input type="radio" id="'
      + containerId + '1" name="radio"><label id="' + containerId + 'Label1" for="' + containerId + '1">' + question.answer[0] + '</label><br/><br/>' + '<input type="radio" id="' + containerId
      + '2" name="radio"><label id="' + containerId + 'Label2" for="' + containerId + '2">' + question.answer[1] + '</label><br/><br/>' + '<input type="radio" id="' + containerId
      + '3" name="radio"><label id="' + containerId + 'Label3" for="' + containerId + '3">' + question.answer[2] + '</label><br/><br/>' + '</div>';

  $("#" + destionationContainerId).append(questionHtmlData);
  var rightAnswer = question.rightanswer;

  $("#" + containerId + "1").click(function() {
    solveCurrentAnswer(containerId, 1, rightAnswer, dataHolder);
  });
  $("#" + containerId + "2").click(function() {
    solveCurrentAnswer(containerId, 2, rightAnswer, dataHolder);
  });
  $("#" + containerId + "3").click(function() {
    solveCurrentAnswer(containerId, 3, rightAnswer, dataHolder);
  });
}

function solveCurrentAnswer(containerId, currentAnswer, rightAnswer, dataHolder) {
  if (currentAnswer === rightAnswer) {
    dataHolder.rightAnswers++;
    $("#" + containerId + "Label" + (currentAnswer)).css("color", "lightgreen");
  } else {
    $("#" + containerId + "Label" + (currentAnswer)).css("color", "red");
    $("#" + containerId + "Label" + (rightAnswer)).css("color", "lightgreen");
  }
  dataHolder.totalAnswers++;
  $("#" + containerId + "1").attr("disabled", true);
  $("#" + containerId + "2").attr("disabled", true);
  $("#" + containerId + "3").attr("disabled", true);
  updateLabelScore(dataHolder);
  writeLabelScoreToLocalStorage(dataHolder);
}
// XXX do it better, unifiy with function solveCurrentAnswer(containerId,
// currentAnswer, rightAnswer, dataHolder)
function solveCurrentExamAnswer(containerId, currentAnswer, rightAnswer) {
  if (currentAnswer === rightAnswer) {
    $("#" + containerId + "Label" + (currentAnswer)).css("color", "lightgreen");
  } else {
    $("#" + containerId + "Label" + (currentAnswer)).css("color", "red");
    $("#" + containerId + "Label" + (rightAnswer)).css("color", "lightgreen");
  }
  $("#" + containerId + "1").attr("disabled", true);
  $("#" + containerId + "2").attr("disabled", true);
  $("#" + containerId + "3").attr("disabled", true);
}

function solveCurrentExamAnswerNew(containerId, currentAnswer, rightAnswer) {
  if (currentAnswer === rightAnswer) {
    $("#" + containerId + "-" + currentAnswer + "-Label-" + (currentAnswer)).css("color", "lightgreen");
  } else {
    $("#" + containerId + "-" + currentAnswer + "-Label-" + (currentAnswer)).css("color", "red");
    $("#" + containerId + "-" + rightAnswer + "-Label-" + (rightAnswer)).css("color", "lightgreen");
  }
  $("#" + containerId + "-1").attr("disabled", true);
  $("#" + containerId + "-2").attr("disabled", true);
  $("#" + containerId + "-3").attr("disabled", true);
}

function updateLabelScore(dataHolder) {
  if (dataHolder.hrefBased) {
    var percents = 0;
    if(dataHolder.totalAnswers !== 0) {
      percents = dataHolder.rightAnswers * 100 / dataHolder.totalAnswers; 
    }
    $("a[href='#my-tabs-1']").text(dataHolder.labelStub + dataHolder.rightAnswers + " / " + dataHolder.totalAnswers + " ("+ percents + "%)");
  } else {
    // what the fuck @ jquery UI...
    $("#" + dataHolder.id + " .ui-button-text").text(dataHolder.labelStub + dataHolder.rightAnswers + " / " + dataHolder.totalAnswers);
  }
}
function writeLabelScoreToLocalStorage(dataHolder) {
  localStorage.setItem(dataHolder.localStorageId, JSON.stringify(dataHolder));
}