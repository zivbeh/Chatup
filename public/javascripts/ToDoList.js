function Transformerr(Rows){
    var rows = Rows;
    var html = '<table id="table">';
    html += '<thead><tr class="table100-head">';

    for( var j in rows[0] ) {
    html += '<th>' + j + '</th>';
    }
    html += '</tr></thead><tbody>';

    for( var i = 0; i < rows.length; i++) {
      html += `<tr id="${i}">`;
      for( var j in rows[i] ) {
        if(rows[i][j].kynde == 'number'){
          html += '<td><input maxlength="2" type="number" value="' + rows[i][j].value + '" min="1" max="99"></td>';
        } else if (rows[i][j].kynde == 'text'){
          html += '<td><input value="' + rows[i][j].value + '" ></td>';
        }
        if(rows[i][j] == true){
            html+='<td><input type="checkbox" value="Done" checked></td>'
          } else if(rows[i][j] == false){
            html+='<td><input type="checkbox" value="Done"></td>'
          }
      }
      html += '</tr>';
    }

    html += '</tbody></table>';
    document.getElementById('tableParent').innerHTML = html;
    console.log('transformerr Donnnne')
}

var object = {};
function Coder(Name, kynde, value){
  if(kynde==null){
    object[Name] = value;
  } else {
    object[Name] = { kynde: kynde, value: value };
  }
  console.log(object)
}

//document.getElementById('h').addEventListener('click', Transformerr(row));

var row = [{ Name: { kynde: 'text', value: 'Eggs' }, folder: { kynde: 'number', value: '3' }, Quality: { kynde: 'number', value: '12' }, Done: false },
{ Name: { kynde: 'text', value: 'Eggs' }, folder: { kynde: 'number', value: '4' }, Quality: { kynde: 'number', value: '12' }, Done: true }]
console.log(row)
Coder('Name', 'text', 'hamburger');
Coder('folder', 'number', '2');
Coder('Quality', 'number', '1');
Coder('Done', null, true);
row.push(object)
console.log(row, object)
Transformerr(row)

const $input = $('table');
$input.on('input propertychange', 'td', function (e) {
    console.log('change')
    var $th = $('table').find('th').eq($(this).index());
    var ThValue = $th.get()[0].firstChild.textContent;
    var kynde = this.firstChild.type;
    console.log(ThValue, this.firstChild.type, this.parentNode.id, kynde)
    // object = {};
    // Coder(`${ThValue}`, kynde, this.firstChild.value);
    //make the changes in the object be changed in the row
    var trPlace = this.parentNode.id;
    var pl = row[trPlace];
    console.log('-fsd', pl, pl[ThValue], '-----12-----', this.firstChild.value, pl[ThValue]) // <--fix this
    if (typeof pl[ThValue] === "boolean"){
        console.log('bbb')
        if(this.firstChild.checked){
            pl[ThValue] = true;
        } else {
            pl[ThValue] = false;
        }
    } else {
        pl[ThValue].value = this.firstChild.value;
    }
    console.log(row, pl[ThValue])
});

$(':input[type="number"]').on('input propertychange', function (e) {
    if(e.target.value>99){
        e.target.value = 99;
    }
    if(e.target.value<1){
        e.target.value = 1;
    }
});

document.getElementById("myBtn").addEventListener("click", function() {
    console.log('transformerr', row)
    var element = document.getElementById("table");
    element.parentNode.removeChild(element);
    console.log('Done')
    Transformerr(row);
}); 