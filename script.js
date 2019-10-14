window.addEventListener('load',()=>{
    fetchColumns();
    console.log("TESTESTEST")
})

async function fetchColumns(){
    let url = "http://localhost:3000/columns"
    let request = new Request(url)
    const res = await fetch(request);
    const json = await res.json();
    console.log("TESTESTESTSE")
    console.log(json)
}