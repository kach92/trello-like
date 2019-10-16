# Trello-Like


![Trello-like](https://user-images.githubusercontent.com/50238797/66843823-e148e480-ef9f-11e9-87df-057d15dff5cd.PNG)


An Front-end 2-days assessment from Maltem Consulting 

## Installation Instructions
1. Fork and clone the project
2. Installs all the dependencies of the project using
```
npm install
````
2. Start the app by running
```
npm start
````
## Technologies Used
- Web Components (HTML Template)
- HTML, CSS, Vanilla JavaScript
- HTML Drag and Drop
- [JSON Server](https://github.com/typicode/json-server) as fake API
 
## Functions
1. The fake API "db.json" is used by utilizing [JSON Server](https://github.com/typicode/json-server).
2. A single page that lists all columns with their respective cards.
   - Each column is defined by a title and the cards it contains,
   - Each card is defined by a mandatory title, an optional description and the column that it belongs to.
3. User is able to:
   - display all columns with all cards
   - create a new card (click "Add new card.." prompt)
   - modify a card (click on pencil icon)
   - delete a card (click on bin icon)
   - add a column 
   - modify a column (click on title to edit, press "enter" to submit)
   - delete a column (click on bin icon)
   - drag and drop a card from one column to another
   - click on a card to see its description (toggle)

## Unfinished task
- Testing
- Search for any keywords presents on one or multiple cards
- Unique cards and columns

## Disclaimer
This project is just an assessment project and it is meant to look similar to Trello as much as possible.
