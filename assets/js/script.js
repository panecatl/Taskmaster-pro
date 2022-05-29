var tasks = {};

var createTask = function(taskText, taskDate, taskList) {
  // create elements that make up a task item
  var taskLi = $("<li>").addClass("list-group-item");

  var taskSpan = $("<span>").addClass("badge badge-primary badge-pill").text(taskDate);

  var taskP = $("<p>").addClass("m-1").text(taskText);

  // append span and p element to parent li
  taskLi.append(taskSpan, taskP);

  // check due date
  auditTask(taskLi);

  // append to ul list on the page
  $("#list-" + taskList).append(taskLi);
};

var loadTasks = function() {
  tasks = JSON.parse(localStorage.getItem("tasks"));

  // if nothing in localStorage, create a new object to track all task status arrays
  if (!tasks) {
    tasks = {
      toDo: [],
      inProgress: [],
      inReview: [],
      done: []
    };
  }

  // loop over object properties
  $.each(tasks, function(list, arr) {
    // then loop over sub-array
    arr.forEach(function(task) {
      createTask(task.text, task.date, list);
    });
  });
};

var saveTasks = function() {
  localStorage.setItem("tasks", JSON.stringify(tasks));
};

// modal was triggered
$("#task-form-modal").on("show.bs.modal", function() {
  // clear values
  $("#modalTaskDescription, #modalDueDate").val("");
});

// modal is fully visible
$("#task-form-modal").on("shown.bs.modal", function() {
  // highlight textarea
  $("#modalTaskDescription").trigger("focus");
});

// save button in modal was clicked
$("#task-form-modal .btn-primary").click(function() {
  // get form values
  var taskText = $("#modalTaskDescription").val();
  var taskDate = $("#modalDueDate").val();

  if (taskText && taskDate) {
    createTask(taskText, taskDate, "toDo");

    // close modal
    $("#task-form-modal").modal("hide");

    // save in tasks array
    tasks.toDo.push({
      text: taskText,
      date: taskDate
    });

    saveTasks();
  }
});

// tast text was clicked 
$(".list-group").on("click", "p", function() {
  var text = $(this)
    .text()
    .trim();
  
    // using Jquery to edit task by createing textarea (text box)
    var textInput = $("<textarea>")
      .addClass("form-control")
      .val(text);

    // once text area has been changed, this will save it into the task
    $(this).replaceWith(textInput);
    // will highlight text area once clicked
    textInput.trigger("focus");
});

 // will revert text box back to what it used to look like
$(".list-group").on("blur", "textarea", function() {
  // get the textarea'scurrent value/text
  var text = $(this)
    .val()
    

  // get the parent ul's id attribute
  var status = $(this)
    .closest(".list-group")
    .attr("id")
    .replace("list-", "");

  // get the task's position in the list of other li elements
  var index = $(this)
    .closest(".list-group-item")
    .index();

  // updating tasks object with the new data
  tasks[status][index].text = text;
  saveTasks();

  // recreate p element 
  var taskP = $("<p>")
  .addClass("m-1")
  .text(text);

    // replace textarea with p element 
    $(this).replaceWith(taskP);
});

// due date was clicked to edit
$(".list-group").on("click", "span", function() {
  // get current text 
  var date = $(this)
    .text()
    .trim();

  // create new input element 
  var dateInput = $("<input>")
    .attr("type", "text")
    .addClass("form-control")
    .val(date);

  // swap out elements
  $(this).replaceWith(dateInput);

  // adding calendar widget to update task section
  dateInput.datepicker({
    minDate: 1,
    onClose: function(){
      // when calendar is closed, force a "change" event on the dateInput
      // turns the date selected back into the pill shape
      $(this).trigger("change");
    }
  });

  // automatically focus on new element
  dateInput.trigger("focus");
});

// value of due date was changed, how we convert it back to what it looked like
// "blur" lets browser know we were done editing by typing
// "change" tells browser we are done editing by selecting new date 
$(".list-group").on("change", "input[type='text']", function() {
  // get current edited text
  var date = $(this).val()
    
  // get the parent ul's id attribute 
  var status = $(this).closest(".list-group").attr("id").replace("list-", "");

  // get the task's position in the list of other li elements
  var index = $(this).closest(".list-group-item").index();

  // update task in array and re-save to localStorage
  tasks[status][index].date = date;
  saveTasks();

  // recreate span element with bootstrap classes
  var taskSpan = $("<span>").addClass("badge badge-primary badge-pill").text(date);

  // replace input with a span element
  $(this).replaceWith(taskSpan);

  // pass task's <li> element into auditTask() to check new due date
  auditTask($(taskSpan).closest(".list-group-item"));
});


// remove all tasks
$("#remove-tasks").on("click", function() {
  for (var key in tasks) {
    tasks[key].length = 0;
    $("#list-" + key).empty();
  }
  saveTasks();
});

// make the draggable happen
$(".card .list-group").sortable({
  // connectWith links these sortable lists with any other lists that have the same class
  connectWith: $(".card .list-group"),
  scroll: false,
  tolerance: "pointer",
  // creates a copy of the dragged element and move the copy
  helper: "clone",
  activate: function(event) {
    // console.log("activate", this);
  },
  deactivate: function(event) {
    // console.log("deactivate", this);
  },
  over: function(event) {
    // console.log("out", event.target);
  },
  update: function(event) {
    // array to store the task data in
    var tempArr = [];

    // loop over current set of children in sortable list
    $(this).children().each(function() {
      var text = $(this)
      .find("p")
      .text()
      .trim();

      var date = $(this)
      .find("span")
      .text()
      .trim();

      // add task data to the temp array as an object
      tempArr.push({
        text: text,
        date: date
      });
    });

    // trim down list's ID to match object property
    var arrName = $(this)
    .attr("id")
    .replace("list-", "");

    // update array on tasks object and save
    tasks[arrName] = tempArr;
    saveTasks();
    
    console.log(tempArr);
  }
});

// drag down to trash
$("#trash").droppable({
  // class we are looking for
  accept: ".card .list-group-item",
  tolerance: "touch",
  drop: function(event, ui) {
    // the jquery ui that allows it to be dragged and dropped
    ui.draggable.remove();
  },
  over: function(event, ui) {
    console.log("over");
  },
  out: function(event, ui) {
    console.log("out");
  }
});

// adding the pop up calendar 
$("#modalDueDate").datepicker({
  // minDate: 1 means that we minimum date to be one day from the current date. Cannot go backwards
  minDate: 1
});

// editing task due date
var auditTask = function(taskEl) {
  // get date from task element
  var date = $(taskEl).find("span").text().trim();

  // convert to moment object at 5:00pm
  var time = moment(date, "L").set("hour", 17);

  // remove any old classes from the element
  $(taskEl).removeClass("list-group-item-warning list-group-item-danger");

  // apply new class if task is near/over due date
  // isAfter lwts us check if it is true or flase on the date
  // also when read, lets us see if moment() comes later than the value of time or past due date
  if (moment().isAfter(time)) {
    $(taskEl).addClass("list-group-item-danger");
  }
  // checking to see if due date is coming
  else if (Math.abs(moment().diff(time, "days")) <= 2) {
    $(taskEl).addClass("list-group-item-warning");
  }
};

// load tasks for the first time
loadTasks();


