class AddItemPrompt extends HTMLElement{

    constructor(){
        super();
        /*this.root = this.attachShadow({mode:'open'})*/
    }
    addItem(){
        console.log("test")
    }

    set item(item){
        this.innerHTML = `
                <p onclick="this.parentElement.parentElement.addItem()">Add a card..</p>
        `
    }
}

customElements.define('add-item-prompt',AddItemPrompt);