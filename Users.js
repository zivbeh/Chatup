// Use Json in the ToDoList app 
// migrate - Json and UserId and BelongsToOtherJson
 /*
[{ Name: { kynde: text, value: Ziv } }]
 */


function Transformer(Rows){
    var rows = Rows;
    var html = '<table>';
    html += '<tr>';
    for( var j in rows[0] ) {
     html += '<th>' + j + '</th>';
    }
    html += '</tr>';
    for( var i = 0; i < rows.length; i++) {
     html += '<tr>';
     for( var j in rows[i] ) {
       html += '<td>' + rows[i][j] + '</td>';
     }
     html += '</tr>';
    }
    html += '</table>';
    document.getElementById('container').innerHTML = html;
}

function Coder(){
    
}

var row = [{ Name: { kynde: 'text', value: 'Ziv' }}]
console.log(row)
//Transformer(row)