import './webcomponents/trello-col.js';
import './webcomponents/todo-item.js';
import './webcomponents/add-item-prompt.js';

const main = document.getElementById("main");
const colElement = document.getElementById("trello-col");
const todoElement = document.getElementById("todo-item");
const cardInputElement = document.getElementById("card-input");
const addPromptElement = document.getElementById("add-prompt");


window.addEventListener('load',()=>{

    fetchColumns();
})


const addCardIntoList = function(colId,obj){
    const todoList = main.querySelector(".col-"+colId).querySelector(".todo-list");
    const todoInstance = document.importNode(todoElement.content,true);
    todoInstance.querySelector(".title").innerHTML = obj.title;
    todoInstance.querySelector(".description").innerHTML = obj.description;
    todoInstance.querySelector(".todo-item").addEventListener("click",toggleDescription)
    todoList.appendChild(todoInstance);

}

async function postInput(event){
    const colId = event.target.getAttribute("column-id");
    const textArea = main.querySelector(".col-"+colId).querySelector(".card-description-input");
    const titleInput = main.querySelector(".col-"+colId).querySelector(".card-title-input");
    const obj = {
        "title": titleInput.value,
        "description": textArea.value,
        "columnId": colId
    };
    // console.log(obj)
    const addNewCard = await fetch('http://localhost:3000/cards', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(obj)
    }).then(function(response) {
        return response.json();
    }).then(function(data) {
        return data
    });
    addCardIntoList(colId,obj);
    textArea.value="";
    titleInput.value="";

}

const closeInput = function(event){
    const colId = event.target.getAttribute("column-id");
    const targetCol = main.querySelector(".col-"+colId);
    targetCol.removeChild(targetCol.querySelector(".card-input"));
    const addPromptInstance = document.importNode(addPromptElement.content,true);
    addPromptInstance.querySelector(".createInput").addEventListener("click",createInput);
    addPromptInstance.querySelector(".createInput").setAttribute("column-id",colId);
    targetCol.appendChild(addPromptInstance);
}

const createInput = function(event){
    const targetCol = event.target.parentElement;
    const colId = event.target.getAttribute("column-id")
    targetCol.removeChild(event.target);
    const cardInputInstance = document.importNode(cardInputElement.content,true);
    cardInputInstance.querySelector(".add-button").addEventListener("click",postInput);
    cardInputInstance.querySelector(".add-button").setAttribute("column-id",colId);
    cardInputInstance.querySelector(".x-button").setAttribute("column-id",colId);
    cardInputInstance.querySelector(".x-button").addEventListener("click",closeInput)
    targetCol.appendChild(cardInputInstance);
}

const addItem = function(){
    console.log("ADDING")
}

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

async function fetchColumns(){
    const resCol = await fetch(new Request("http://localhost:3000/columns"));
    const columns = await resCol.json();

    const resItems = await fetch(new Request("http://localhost:3000/cards"));
    const todoItems = await resItems.json();
    // columns.forEach(column=>{
    //     const el = document.createElement('trello-col');
    //     el.classList = "trello-col"
    //     el.column = column;
    //     todoItems.forEach(x=>{
    //         if(x.columnId === column.id){
    //             const item = document.createElement('todo-item');
    //             item.classList = "todo-item"
    //             item.item = {title:x.title,description:x.description}
    //             el.appendChild(item);
    //         }
    //     })
    //     const addItemEl = document.createElement('add-item-prompt');
    //     addItemEl.item=null;
    //     el.appendChild(addItemEl);
    //     main.appendChild(el);
    // })
    columns.forEach(column=>{
        const colInstance = document.importNode(colElement.content,true);
        let className = "col-"+column.id
        colInstance.querySelector(".trello-col").classList.add(className)
        colInstance.querySelector(".title").innerHTML = column.title;
        const createInputPrompt = colInstance.querySelector(".createInput");
        createInputPrompt.addEventListener("click",createInput);
        createInputPrompt.setAttribute("column-id",column.id)
        const colTodoList = colInstance.querySelector(".todo-list");

        todoItems.filter(x=>x.columnId == column.id).forEach(x=>{
            const todoInstance = document.importNode(todoElement.content,true);
            todoInstance.querySelector(".title").innerHTML = x.title;
            todoInstance.querySelector(".description").innerHTML = x.description;
            todoInstance.querySelector(".todo-item").addEventListener("click",toggleDescription)

            colTodoList.appendChild(todoInstance);
        })

        main.appendChild(colInstance);
    })

}
