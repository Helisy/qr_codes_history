// var A = {
//     mog: "daw",
//     dog: "a",
//     cat: "a",
//     car: "b"
//   };
  
//   var B = {

//     dog: "acorn",
//     car: "barbie",
//     cat: "cav"
//   };
  
//   var C = {};
  
//   // Adicionando propriedades do objeto B que estão presentes em A
//   for (var key in A) {
//     if (B.hasOwnProperty(key)) {
//       C[key] = B[key];
//     }
//   }
  
//   // Adicionando propriedades do objeto B que não estão presentes em A
//   for (var key in B) {
//     if (!A.hasOwnProperty(key)) {
//       C[key] = B[key];
//     }
//   }
  
//   console.log(C);

// arry_1 = [];
// arry_2 = [];

// for (let i = 0; i < 101; i++) {
//   var dog = [i + 1, randomIntFromInterval(1, 100)]
//   arry_1.push(dog)
// }
// // console.log(arry_1)
// console.log(arry_1[arry_1.length - 1])

// arry_1.pop();
// console.log(arry_1)

// arry_1.forEach(el => {
//     if(el[1] > arry_1[arry_1.length - 1][1]){
//         arry_2.push(1)
//     }else{
//         arry_2.push(0)
//     }
// })

// console.log(arry_2)




// function randomIntFromInterval(min, max) {
//     return Math.floor(Math.random() * (max - min + 1) + min)
// }


const arrayA = [
    {value: 1},
    {value: 2},
    {value: 3},
];

// Função de comparação para ordenar em ordem decrescente
function compararValores(a, b) {
    if (a.value < b.value) {
        return 1;
    } else if (a.value > b.value) {
        return -1;
    }
    return 0;
}

// Ordenar o arrayA em ordem decrescente com base no valor da chave "value"
const arrayB = arrayA.sort(compararValores);

console.log(arrayB);
