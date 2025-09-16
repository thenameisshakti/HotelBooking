let a =[{id: 23, name: 'vinay'}, {id: 25, name: 'shail'}]
let b =[{id: 25, age: 34} , {id: 88, age:34}]
const result = []

for (let i of a){
    for (let j of b){
        if (i.id === j.id){
            const answer =  {
                id : i.id,
                name: i.name,
                age: j.age
            }
            result.push(answer)
        }
        
    }
}
console.log(result)