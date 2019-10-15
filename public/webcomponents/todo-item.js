class TodoItem extends HTMLElement{

    constructor(){
        super();
        /*this.root = this.attachShadow({mode:'open'})*/
    }

    set item(item){
        this.innerHTML = `
                <p>${item.description}</p>
        `
    }
}

customElements.define('todo-item',TodoItem);