const main = document.getElementById("main");
const colElement = document.getElementById("trello-col");
const todoElement = document.getElementById("todo-item");
const cardInputElement = document.getElementById("card-input");
const addPromptElement = document.getElementById("add-prompt");
const addColElement = document.getElementById("create-col");
const colTitleChangeElement = document.getElementById("col-title-change-input");
const colTitleElement = document.getElementById("col-title-temp");

//do a fetch all data when window finish loading
window.addEventListener('load',()=>{
    fetchColumns();
})

/////////////////////////////////////////////////////////
//////////                                     //////////
//////////            DRAG & DROP              //////////
//////////                                     //////////
/////////////////////////////////////////////////////////

function onDragStart(event) {
  event
    .dataTransfer
    .setData('text/plain', event.target.id);
}
function onDragOver(event) {
  event.preventDefault();
}

async function onDrop(event) {
    const id = event
        .dataTransfer
        .getData('text');

    const draggableElement = document.getElementById(id);

    var dropzone = null;

    //For different cases where item is dropped on any part of the column, and make it still works
    if(event.target.classList.contains("title")){
        dropzone = event.target.parentElement.parentElement;
    }else if(event.target.classList.contains("todo-item")){
        dropzone = event.target.parentElement;
    }else if(event.target.classList.contains("createInput")){
        dropzone = event.target.parentElement.children[1];
    }else if(event.target.classList.contains("trello-col")){
        dropzone = event.target.children[1];
    }else{
        dropzone = event.target;
    }

    //do a POST to db to change card's columnId
    dropzone.appendChild(draggableElement);
    const targetCol = dropzone.parentElement;
    const colId = targetCol.getAttribute("column-id");
    const cardId = draggableElement.getAttribute("card-id");
    const resGetCard = await fetch(new Request("http://localhost:3000/cards/"+cardId));
    const card = await resGetCard.json();
    card["columnId"] = colId;
    const updateCard = await fetch('http://localhost:3000/cards/'+cardId, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(card)
    }).then(function(response) {
        return response.json();
    }).then(function(data) {
        return data;
    });

    event
        .dataTransfer
        .clearData();
}


/////////////////////////////////////////////////////////
//////////                                     //////////
//////////            CRUD                     //////////
//////////                                     //////////
/////////////////////////////////////////////////////////

//Fetch All columns and cards when page is loaded
async function fetchColumns(){
    const resCol = await fetch(new Request("http://localhost:3000/columns"));
    const columns = await resCol.json();

    const resItems = await fetch(new Request("http://localhost:3000/cards"));
    const todoItems = await resItems.json();
    columns.forEach(column=>{
        const colInstance = document.importNode(colElement.content,true);
        newColInitialise(colInstance,column);
        const colTodoList = colInstance.querySelector(".todo-list");

        todoItems.filter(x=>x.columnId == column.id).forEach(x=>{
            const todoInstance = document.importNode(todoElement.content,true);
            handleNewCardInitialization(todoInstance,x,column.id);
            colTodoList.appendChild(todoInstance);
        })

        main.appendChild(colInstance);


    })
    const addNewColInstance = document.importNode(addColElement.content,true);
    addNewColInstance.querySelector(".save-button").addEventListener("click",addNewColToTrello);
    main.appendChild(addNewColInstance);

}

//Initialize event listeners/attributes when new card is created;
const handleNewCardInitialization = function(instance,obj,colId){
    instance.querySelector(".title").innerHTML = obj.title;
    instance.querySelector(".description").innerHTML = obj.description;
    instance.querySelector(".todo-item").addEventListener("click",toggleDescription);
    instance.querySelector(".todo-item").setAttribute("card-id",obj.id);
    instance.querySelector(".todo-item").id = `card-${obj.id}`;
    instance.querySelector(".todo-item").addEventListener("dragstart",onDragStart);

    instance.querySelector(".edit-button").addEventListener("click",createEditInput);
    instance.querySelector(".edit-button").setAttribute("column-id",colId);
    instance.querySelector(".delete-button").addEventListener("click",deleteCard(obj.id,colId));
}

//Initialize event listeners/attributes when new column is created;
const newColInitialise = function(instance,col){
    let className = "col-"+col.id;
    instance.querySelector(".trello-col").classList.add(className);
    instance.querySelector(".trello-col").setAttribute("column-id",col.id);
    instance.querySelector(".trello-col").addEventListener("dragover",onDragOver);
    instance.querySelector(".trello-col").addEventListener("drop",onDrop);
    instance.querySelector(".title").innerHTML = col.title;
    instance.querySelector(".title").addEventListener("click",changeColTitle);
    instance.querySelector(".delete-col-button").addEventListener("click",deleteCol);
    const createInputPrompt = instance.querySelector(".createInput");
    createInputPrompt.addEventListener("click",createInput);
    createInputPrompt.setAttribute("column-id",col.id);
}

//Create Input for new card
const createInput = function(event){
    const targetCol = event.target.parentElement;
    const colId = event.target.getAttribute("column-id");
    targetCol.removeChild(event.target);
    const cardInputInstance = document.importNode(cardInputElement.content,true);
    cardInputInstance.querySelector(".card-input").classList.add("add-new-card-input");
    cardInputInstance.querySelector(".add-button").addEventListener("click",postInput);
    cardInputInstance.querySelector(".add-button").setAttribute("column-id",colId);
    cardInputInstance.querySelector(".x-button").setAttribute("column-id",colId);
    cardInputInstance.querySelector(".x-button").addEventListener("click",closeInput);
    targetCol.appendChild(cardInputInstance);
}

//do POST to db for new card
async function postInput(event){
    const colId = event.target.getAttribute("column-id");
    const textArea = main.querySelector(".col-"+colId).querySelector(".card-description-input");
    const titleInput = main.querySelector(".col-"+colId).querySelector(".card-title-input");
    const obj = {
        "title": titleInput.value,
        "description": textArea.value,
        "columnId":colId
    };
    const addNewCard = await fetch('http://localhost:3000/cards', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(obj)
    }).then(function(response) {
        return response.json();
    }).then(function(data) {
        return data;
    });
    addCardIntoList(colId,addNewCard);
    textArea.value="";
    titleInput.value="";

}

//Do DOM Manipulation to add new card into column list
const addCardIntoList = function(colId,obj){
    const todoList = main.querySelector(".col-"+colId).querySelector(".todo-list");
    const todoInstance = document.importNode(todoElement.content,true);
    handleNewCardInitialization(todoInstance,obj,colId);
    todoList.appendChild(todoInstance);

}

//create input for editing card
const createEditInput = function(event){
    const colId = event.target.getAttribute("column-id");

    const eventTodoItem = event.target.parentElement;
    const cardId = eventTodoItem.getAttribute("card-id");
    const targetTodoList = main.querySelector(".col-"+colId).querySelector(".todo-list");
    const cardInputInstance = document.importNode(cardInputElement.content,true);
    cardInputInstance.querySelector(".card-input").classList.add("edit-input")
    cardInputInstance.querySelector(".add-button").innerText = "Edit";
    cardInputInstance.querySelector(".add-button").setAttribute("card-id",cardId);
    cardInputInstance.querySelector(".add-button").addEventListener("click", postEdit(cardId,colId));
    cardInputInstance.querySelector(".card-title-input").value = eventTodoItem.querySelector(".title").innerText;
    cardInputInstance.querySelector(".card-description-input").value = eventTodoItem.querySelector(".description").innerText;
    cardInputInstance.querySelector(".x-button").setAttribute("column-id",colId);
    cardInputInstance.querySelector(".x-button").addEventListener("click",closeEditInput(cardId,colId));
    targetTodoList.insertBefore(cardInputInstance,eventTodoItem);
    targetTodoList.removeChild(event.target.parentElement);
}

//do PUT to db to update card info
function postEdit(cardId,colId){
    return async function(event){
        const inputContainer = event.target.parentElement.parentElement;
        const obj = {
            title : inputContainer.querySelector(".card-title-input").value,
            description : inputContainer.querySelector(".card-description-input").value,
            columnId : colId,
        };
        const updateCard = await fetch('http://localhost:3000/cards/'+cardId, {
            method: 'PUT',
            headers: {
              'Content-Type': 'application/json'
            },
            body: JSON.stringify(obj)
        }).then(function(response) {
            return response.json();
        }).then(function(data) {
            return data;
        });
        addEditedCardIntoList(colId,updateCard,inputContainer);
    }
}

//do DOM Manipulation to show updated card
const addEditedCardIntoList = function(colId,obj,inputContainer){
    const todoList = main.querySelector(".col-"+colId).querySelector(".todo-list");
    const todoInstance = document.importNode(todoElement.content,true);
    handleNewCardInitialization(todoInstance,obj,colId);
    todoList.insertBefore(todoInstance,inputContainer);
    todoList.removeChild(inputContainer);
}

//do DELETE to db and remove card using DOM
const deleteCard = function (cardId,colId){
    return async function (event){
        const deleteCard = await fetch('http://localhost:3000/cards/'+cardId, {
            method: 'DELETE',
            headers: {
              'Content-Type': 'application/json'
            }
            }).then(function(response) {
                return response.json();
            }).then(function(data) {
                return data;
        });
        const todoList = main.querySelector(".col-"+colId).querySelector(".todo-list");
        todoList.removeChild(event.target.parentElement);

    }

}

//close input when "X" button is clicked
const closeInput = function(event){
    const colId = event.target.getAttribute("column-id");
    const targetCol = main.querySelector(".col-"+colId);
    targetCol.removeChild(targetCol.querySelector(".add-new-card-input"));
    const addPromptInstance = document.importNode(addPromptElement.content,true);
    addPromptInstance.querySelector(".createInput").addEventListener("click",createInput);
    addPromptInstance.querySelector(".createInput").setAttribute("column-id",colId);
    targetCol.appendChild(addPromptInstance);
}

//close editing when "X" button is clicked
const closeEditInput = function(cardId,colId){
    return async function(event){
        const resCard = await fetch(new Request("http://localhost:3000/cards/"+cardId));
        const card = await resCard.json();
        const inputContainer = event.target.parentElement.parentElement;
        const targetTodoList = main.querySelector(".col-"+colId).querySelector(".todo-list");
        const todoInstance = document.importNode(todoElement.content,true);
        handleNewCardInitialization(todoInstance,card,colId);
        targetTodoList.insertBefore(todoInstance,inputContainer);
        targetTodoList.removeChild(inputContainer);

    }

}


//Allow description to be toggled when clicked on an item to show/hide description
const toggleDescription = function(event){
    let description = null;
    if(event.target.classList.contains("todo-item")){
        description = event.target.querySelector(".description");
    }else{
        description = event.target.parentElement.querySelector(".description");
    }
    if(description.style.display == 'block')
        description.style.display = 'none';
    else
        description.style.display = 'block';
}

//POST to db to add new column
async function addNewColToTrello(event){
    const addNewColInput = document.querySelector(".col-name-input");
    const obj = {
        title:addNewColInput.value
    };
    const newCol = await fetch('http://localhost:3000/columns', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(obj)
    }).then(function(response) {
        return response.json();
    }).then(function(data) {
        return data;
    });
    createInsertNewCol(newCol);

    addNewColInput.value="";
}

//add new col into page using DOM
const createInsertNewCol = function(col){
    const addNewColContainer = document.querySelector(".add-new-col-container");
    const colInstance = document.importNode(colElement.content,true);
    newColInitialise(colInstance,col);
    main.insertBefore(colInstance,addNewColContainer);

}

//click on column title to change it into an input tag to change its title
const changeColTitle = function(event){
    const targetCol = event.target.parentElement;
    const colId = targetCol.getAttribute("column-id");
    const colTitleInputInstance = document.importNode(colTitleChangeElement.content,true);
    colTitleInputInstance.querySelector(".col-title-change-input").value=event.target.innerText;
    colTitleInputInstance.querySelector(".col-title-change-input").addEventListener("keypress",updateColTitle(colId));
    targetCol.insertBefore(colTitleInputInstance,event.target);
    targetCol.removeChild(event.target);

}

//do PUT to db to update new column title
const updateColTitle = function(colId){
    return async function (event){
        if(event.keyCode === 13){
            event.preventDefault(); // Ensure it is only this code that rusn
            const targetCol = event.target.parentElement;
            const obj = {
                title:event.target.value
            };
            const updateColTitle = await fetch('http://localhost:3000/columns/'+colId, {
                method: 'PUT',
                headers: {
                  'Content-Type': 'application/json'
                },
                body: JSON.stringify(obj)
            }).then(function(response) {
                return response.json();
            }).then(function(data) {
                return data;
            });

            const colTitleInstance = document.importNode(colTitleElement.content,true);
            colTitleInstance.querySelector(".title").innerHTML = updateColTitle.title;
            colTitleInstance.querySelector(".title").addEventListener("click",changeColTitle);
            targetCol.insertBefore(colTitleInstance,event.target);
            targetCol.removeChild(event.target);

        }
    }
}

//do DELETE and DOM to delete column;
async function deleteCol(event){
    const targetCol = event.target.parentElement;
    const colId = targetCol.getAttribute("column-id");
    const deleteCard = await fetch('http://localhost:3000/columns/'+colId, {
        method: 'DELETE',
        headers: {
          'Content-Type': 'application/json'
        }
        }).then(function(response) {
            return response.json();
        }).then(function(data) {
            return data;
    });
    main.removeChild(targetCol);
}













