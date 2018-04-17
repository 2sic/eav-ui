function myFunction() {
    // var x = document.getElementById("frm1");
    // var text = "";
    // var i;
    // for (i = 0; i < x.length; i++) {
    //     text += x.elements[i].value + "<br>";
    // }
    document.getElementById("demo").innerHTML = 'anteeee';
    console.log('myFunction áaaaaaaaaaaaaaaaaaaaa')
}

function DivBox(col, row) {
    console.log('bbbbbbbbbbbbbbbbbbbbbbbbbbbbb')
    var ret = "";
    for (var r = 0; r < row; r++) {
        ret += '<div id="Column' + (r + 1) + '" style="float:left">';
        for (var c = 0; c < col; c++) {
            ret += '<div id="sq' + (r * col + c + 1) + '" style="width:40px; height:40px;">';
            ret += (r * col + c + 1); //just for showing
            ret += '</div>';

        }
        ret += '</div>';
    }
    return ret;
}



