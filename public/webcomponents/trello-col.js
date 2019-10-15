

class TrelloCol extends HTMLElement{

    constructor(){
        super();
        /*this.root = this.attachShadow({mode:'open'})*/
    }

    set column(column){
        console.log(column)
        this.innerHTML = `
                <h2>${column.title}</h2>
        `
    }
}

customElements.define('trello-col',TrelloCol);