import './webcomponents/trello-col.js';
import './webcomponents/todo-item.js';
import './webcomponents/add-item-prompt.js';

const main = document.getElementById("main");
const colElement = document.getElementById("trello-col");
const todoElement = document.getElementById("todo-item");
const cardInputElement = document.getElementById("card-input");
const idTracker = {
    card:0,
}


window.addEventListener('load',()=>{

    fetchColumns();
})


const addCardIntoList = function(colId,obj){
    const todoList = main.querySelector(".col-"+colId).querySelector(".todo-list");
    const todoInstance = document.importNode(todoElement.content,true);
    todoInstance.querySelector(".description").innerHTML = obj.description;
    todoList.appendChild(todoInstance);

}

async function postInput(event){
    const colId = event.target.getAttribute("column-id");
    const textArea = main.querySelector(".col-"+colId).querySelector(".card-description-input");
    const obj = {
        "title": `Card ${idTracker.card}`,
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
    idTracker.card++;

}
const createInput = function(event){
    const targetCol = event.target.parentElement;
    const colId = event.target.getAttribute("column-id")
    targetCol.removeChild(event.target);
    const cardInputInstance = document.importNode(cardInputElement.content,true);
    cardInputInstance.querySelector(".add-button").addEventListener("click",postInput);
    cardInputInstance.querySelector(".add-button").setAttribute("column-id",colId);
    targetCol.appendChild(cardInputInstance);
}

const addItem = function(){
    console.log("ADDING")
}

async function fetchColumns(){
    const resCol = await fetch(new Request("http://localhost:3000/columns"));
    const columns = await resCol.json();

    const resItems = await fetch(new Request("http://localhost:3000/cards"));
    const todoItems = await resItems.json();
    idTracker.card = todoItems[todoItems.length-1].id+1;
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
            todoInstance.querySelector(".description").innerHTML = x.description;
            colTodoList.appendChild(todoInstance);
        })

        main.appendChild(colInstance);
    })

}
