function Transformerr(Rows){
    var rows = Rows;
    var html = '<table id="table">';
    html += '<thead class="thead" id="thead"><tr id="tableH" class="table100-head">';

    var num = 0;
    for( var j in rows[0] ) {
        html += '<th id="Th'+num+'" >' + j + '</th>';
        num+=1;
    }
    html += '</tr></thead><tbody class="tbody" id="tbody">';

    for( var i = 0; i < rows.length; i++) {
      html += `<tr id="Tr${i}">`;
      var TF = false;
      for( var j in rows[i] ) {
        if(rows[i][j].kynde == 'number'){
          html += '<td><input maxlength="2" type="number" value="' + rows[i][j].value + '" min="1" max="99"></td>';
        } else if (rows[i][j].kynde == 'text'){
          html += '<td><input value="' + rows[i][j].value + '" ></td>';
        }
        if(rows[i][j] == true){
            TF = true;
            //html+='<td><input type="checkbox" value="Done" checked></td>';
        } else if(rows[i][j] == false){
            //html+='<td><input type="checkbox" value="Done"></td>';
        }
      }
      if(TF == true){
        html+='<td><input type="checkbox" value="Done" checked></td>';
      } else {
        html+='<td><input type="checkbox" value="Done"></td>';
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

var row = [{ Name: { kynde: 'text', value: 'Eggs' }, Done: false }]
// console.log(row)
// Coder('Name', 'text', 'hamburger');
// Coder('folder', 'number', '2');
// Coder('Quality', 'number', '1');
// Coder('Done', null, true);
// row.push(object)
console.log(row, object)
Transformerr(row)

const $input = $('table');
$input.on('input propertychange', 'td', function (e) {
    console.log('change')
    var $th = $('table').find('th').eq($(this).index());
    var ThValue;
    if($th.get()[0].firstChild.tagName == 'INPUT'){
        ThValue = $th.get()[0].firstChild.value;
    } else {
        ThValue = $th.get()[0].firstChild.textContent;
    }
    console.log($th.get()[0].firstChild.tagName, ThValue, this.parentNode.id)
    //make the changes in the object be changed in the row
    var trPlace = this.parentNode.id;
    trPlace = trPlace.replace(/\D/g,'');
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

var width = $(window).width();
function sizer(){
    if(width<=740){
        $('td').each(function (e) {
            console.log(e)
        });
    }
}
sizer();
$(window).on('resize', function() {
    sizer();
});

document.getElementById("plus").addEventListener("click", function() {
    console.log('plus')
    var rowId = $('.tbody')[0].children.length;
    var html = `<tr id="Tr${rowId}">`;
    var object = {};
    for( var j in row[0] ) {
        if(row[0][j].kynde == 'number'){
            html += '<td><input maxlength="2" type="number" value="1" min="1" max="99"></td>';
            object[j] = { kynde: row[0][j].kynde, value: '1'};
        } else if (row[0][j].kynde == 'text'){
            html += '<td><input placeholder="your ToDo here"></td>';
            object[j] = { kynde: row[0][j].kynde, value: ''};
        }
        if(typeof row[0][j] == 'boolean'){
            var a = Object.keys(row[0]).find(key => row[0][key] === row[0][j]);
            console.log(a)
            if(a != 'Done'){
                html+='<td><input type="checkbox" value="Done"></td>';
                object[j] = false;
            }
        }
    }
    html+='<td><input type="checkbox" value="Done"></td>';
    object['Done'] = false;
    console.log(object, html)
    html += '</tr>';
    row.push(object);
    document.getElementById('tbody').innerHTML += html;
    console.log('Donnnne', row)
}); 

document.getElementById("textSel").addEventListener("click", function() {
    var tableH = document.getElementById('tableH');
    const value = '<input type="text" value="NewHead">';
    var number = parseInt(document.getElementById('numberr').value);
    console.log(tableH)
    makeHtmlDelete(tableH, 'th', number, value)

    //tableH.childNodes.insertBefore('<th id="'+number+'">' + value + '</th>', sp4);

    $('table > tbody  > tr').each(function(index, tr) { 
        //parentDiv.childNodes.insertBefore("<td><input value='NewCell'></td>", sp1);
        valuen = '<input value="NewCell">';
        makeHtmlDelete(tr, 'td', number, valuen)
        console.log(index, tr.id)
        row[index]['NewHead'] = { value: 'NewCell', kynde: 'text'}; // make this work
        console.log(index, tr, $("tbody tr").eq(index)[0].children);
    });

    // search in all the tr and add value and kynde + to the Json and then make all this function to each select
}); 

document.getElementById("numSel").addEventListener("click", function() {
    var tableH = document.getElementById('tableH');
    const value = '<input type="text" value="NewHead">';
    var number = parseInt(document.getElementById('numberr').value);
    console.log(tableH)
    makeHtmlDelete(tableH, 'th', number, value)

    //tableH.childNodes.insertBefore('<th id="'+number+'">' + value + '</th>', sp4);

    $('table > tbody  > tr').each(function(index, tr) { 
        //parentDiv.childNodes.insertBefore("<td><input value='NewCell'></td>", sp1);
        valuen = '<input type="number" value="1">';
        makeHtmlDelete(tr, 'td', number, valuen)
        console.log(index, tr.id)
        row[index]['NewHead'] = { value: '1', kynde: 'number'}; // make this work
        console.log(index, tr, $("tbody tr").eq(index)[0].children);
    });

    // search in all the tr and add value and kynde + to the Json and then make all this function to each select
}); 
document.getElementById("checkSel").addEventListener("click", function() {
    var tableH = document.getElementById('tableH');
    const value = '<input type="text" value="NewHead">';
    var number = parseInt(document.getElementById('numberr').value);
    console.log(tableH)
    makeHtmlDelete(tableH, 'th', number, value)

    //tableH.childNodes.insertBefore('<th id="'+number+'">' + value + '</th>', sp4);

    $('table > tbody  > tr').each(function(index, tr) { 
        //parentDiv.childNodes.insertBefore("<td><input value='NewCell'></td>", sp1);
        valuen = '<input type="checkbox" value="NewCell">';
        makeHtmlDelete(tr, 'td', number, valuen)
        console.log(index, tr.id)
        row[index]['NewHead'] = false; // make this work
        console.log(index, tr, $("tbody tr").eq(index)[0].children);
    });

    // search in all the tr and add value and kynde + to the Json and then make all this function to each select
});

function makeHtmlDelete(tableH, t, number, value){
    var html = '';
    var numi = 0;
    for( var j in tableH.childNodes ) {
        if(tableH.childNodes[j] == undefined || tableH.childNodes[j].innerHTML == undefined){
            continue;
        } else if(numi == number) {
            if (t == 'th'){
                html += '<'+t+' id="Th'+number+'">' + value + '</'+t+'>';
                html += '<'+t+' id="Th'+(number+1)+'">' + tableH.childNodes[j].innerHTML + '</'+t+'>';
            } else {
                html += '<'+t+'>' + value + '</'+t+'>';
                html += '<'+t+'>' + tableH.childNodes[j].innerHTML + '</'+t+'>';
            }
            numi += 2;
        } else {
            if (t == 'th'){
                html += '<'+t+' id="Th'+numi+'">' + tableH.childNodes[j].innerHTML + '</'+t+'>';
            } else {
                html += '<'+t+'>' + tableH.childNodes[j].innerHTML + '</'+t+'>';
            }
            numi += 1;
        }
    }
    while (tableH.firstChild) {
        tableH.removeChild(tableH.lastChild);
    }
    tableH.innerHTML += html;
}